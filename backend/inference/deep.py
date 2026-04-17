"""Deep learning model: fine-tuned DistilBERT with multi-output head.

Architecture:
  - Base: distilbert-base-uncased (66M params)
  - Head: shared [CLS] pooling → 2 parallel heads:
      * Regression head (1 unit, sigmoid → composite score in [0, 1])
      * Multi-label head (6 units, sigmoid per dimension)

Loss at training time: regression (MSE on composite) + BCE on 6 dims.
See `scripts/train_deep.py` + `notebooks/train_lucid.ipynb`.
"""

from __future__ import annotations

import logging
from pathlib import Path

import torch
from torch import nn
from transformers import AutoModel, AutoTokenizer

from backend.inference.schemas import DIMENSIONS, Prediction

logger = logging.getLogger(__name__)

BASE_MODEL_NAME = "distilbert-base-uncased"


class LucidDistilBERT(nn.Module):
    """DistilBERT with two parallel output heads.

    `composite_head` predicts the 0–100 Scroll Trap Score (as a 0..1 regression).
    `dimension_head` predicts 6 independent binary labels.
    """

    def __init__(self, base_model_name: str = BASE_MODEL_NAME, num_dimensions: int = 6) -> None:
        super().__init__()
        self.encoder = AutoModel.from_pretrained(base_model_name)
        hidden = self.encoder.config.hidden_size
        self.dropout = nn.Dropout(0.1)
        self.composite_head = nn.Linear(hidden, 1)
        self.dimension_head = nn.Linear(hidden, num_dimensions)

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> dict[str, torch.Tensor]:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        cls = outputs.last_hidden_state[:, 0]  # [B, H]
        cls = self.dropout(cls)
        return {
            "composite_logit": self.composite_head(cls).squeeze(-1),  # [B]
            "dimension_logits": self.dimension_head(cls),  # [B, 6]
        }


class DeepPredictor:
    """Inference wrapper around a trained LucidDistilBERT checkpoint.

    Resolves weights from a local directory if it exists, otherwise
    `snapshot_download`s from a HuggingFace Hub repo id (e.g.
    "lindsaygross32/lucid-distilbert") and caches the result. This lets prod
    pull the ~266 MB checkpoint once on first request without bundling it
    into the container image.
    """

    def __init__(
        self,
        model_dir: str | Path | None = None,
        hf_repo: str | None = None,
        device: str | None = None,
    ) -> None:
        if not model_dir and not hf_repo:
            raise ValueError("DeepPredictor needs either model_dir or hf_repo")

        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        resolved = self._resolve_weights_dir(model_dir, hf_repo)

        self.tokenizer = AutoTokenizer.from_pretrained(resolved)
        self.model = LucidDistilBERT(BASE_MODEL_NAME, num_dimensions=len(DIMENSIONS))
        state = torch.load(resolved / "pytorch_model.bin", map_location=self.device)
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

    @staticmethod
    def _resolve_weights_dir(
        model_dir: str | Path | None, hf_repo: str | None
    ) -> Path:
        """Return a directory that has both pytorch_model.bin + tokenizer files."""
        if model_dir:
            local = Path(model_dir)
            if local.exists() and (local / "pytorch_model.bin").exists():
                logger.info("deep model: using local weights at %s", local)
                return local

        if not hf_repo:
            raise FileNotFoundError(
                f"DistilBERT weights not found at {model_dir} and no hf_repo set. "
                "Train via notebooks/train_lucid.ipynb or set LUCID_HF_REPO."
            )

        from huggingface_hub import snapshot_download  # lazy import

        logger.info("deep model: downloading from HuggingFace Hub repo %s", hf_repo)
        cached = snapshot_download(repo_id=hf_repo)
        return Path(cached)

    @torch.inference_mode()
    def predict(self, text: str, max_length: int = 256) -> Prediction:
        """Score a single text."""
        enc = self.tokenizer(
            text,
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
            padding=True,
        )
        enc = {k: v.to(self.device) for k, v in enc.items()}
        out = self.model(enc["input_ids"], enc["attention_mask"])

        dim_probs = torch.sigmoid(out["dimension_logits"])[0].cpu().tolist()
        dim_scores = {dim: float(p) for dim, p in zip(DIMENSIONS, dim_probs)}

        # We deliberately ignore the composite regression head and derive the
        # 0-100 Scroll Trap Score as the mean of the 6 dimension probabilities.
        # Reason: the composite head was trained on labels whose distribution
        # skews low-severity (Webis news tweets + Stop Clickbait headlines),
        # so it under-fires on real TikTok manipulation even when per-dimension
        # heads clearly detect the tactics. Mean-of-dimensions is consistent
        # with the per-dimension bars users see and matches the rubric-based
        # severity intuition. The trained composite head's metrics still live
        # in the report as an honest accounting of what the model learned.
        return Prediction.from_dimension_scores(dim_scores)
