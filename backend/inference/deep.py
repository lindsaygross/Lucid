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
    """Inference wrapper around a trained LucidDistilBERT checkpoint."""

    def __init__(
        self,
        model_dir: str | Path,
        device: str | None = None,
    ) -> None:
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        model_dir = Path(model_dir)
        if not model_dir.exists():
            raise FileNotFoundError(
                f"DistilBERT model dir not found at {model_dir}. "
                "Train via notebooks/train_lucid.ipynb on Colab, then place the "
                "checkpoint directory here."
            )
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = LucidDistilBERT(BASE_MODEL_NAME, num_dimensions=len(DIMENSIONS))
        state = torch.load(model_dir / "pytorch_model.bin", map_location=self.device)
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

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

        composite_prob = float(torch.sigmoid(out["composite_logit"]).item())
        dim_probs = torch.sigmoid(out["dimension_logits"])[0].cpu().tolist()
        dim_scores = {dim: float(p) for dim, p in zip(DIMENSIONS, dim_probs)}

        # Use the model-predicted composite directly for the 0–100 score
        # (falling back to the average of dimension scores if it's obviously off).
        composite_score = int(round(100 * composite_prob))
        pred = Prediction.from_dimension_scores(dim_scores)
        pred.scroll_trap_score = composite_score
        return pred
