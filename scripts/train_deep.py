"""Fine-tune DistilBERT with multi-output head on labeled corpus.

This is a CPU-capable script for local sanity-checking — the canonical
training run happens in the Colab notebook (notebooks/train_lucid.ipynb)
on your Duke Colab GPU. Output checkpoint directory is compatible with
backend/inference/deep.py.

Run: python -m scripts.train_deep --epochs 3
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, get_linear_schedule_with_warmup

from backend.inference.deep import BASE_MODEL_NAME, LucidDistilBERT
from backend.inference.schemas import DIMENSIONS
from scripts.splits import load_split

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
MODELS_DIR = REPO_ROOT / "models"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"

logger = logging.getLogger(__name__)


class LucidDataset(Dataset):
    """Tokenizes text + builds composite and dimension targets."""

    def __init__(self, df: pd.DataFrame, tokenizer, max_length: int = 256):
        self.texts = df["text"].fillna("").tolist()
        self.composite = (df["composite_score"].to_numpy(dtype=float) / 100.0).tolist()
        self.dim_targets = np.stack(
            [(df[d].to_numpy(dtype=int) >= 1).astype(float) for d in DIMENSIONS],
            axis=1,
        ).tolist()
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, idx: int) -> dict[str, torch.Tensor]:
        enc = self.tokenizer(
            self.texts[idx],
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt",
        )
        return {
            "input_ids": enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "composite": torch.tensor(self.composite[idx], dtype=torch.float),
            "dim_targets": torch.tensor(self.dim_targets[idx], dtype=torch.float),
        }


def train_one_epoch(
    model: LucidDistilBERT,
    loader: DataLoader,
    optimizer,
    scheduler,
    device: str,
    dim_loss_weight: float = 1.0,
) -> float:
    model.train()
    bce = torch.nn.BCEWithLogitsLoss()
    mse = torch.nn.MSELoss()
    total = 0.0
    for batch in loader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        composite = batch["composite"].to(device)
        dim_targets = batch["dim_targets"].to(device)

        out = model(input_ids, attention_mask)
        comp_loss = mse(torch.sigmoid(out["composite_logit"]), composite)
        dim_loss = bce(out["dimension_logits"], dim_targets)
        loss = comp_loss + dim_loss_weight * dim_loss

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        total += float(loss.item())
    return total / max(len(loader), 1)


@torch.inference_mode()
def eval_composite_mae(model: LucidDistilBERT, loader: DataLoader, device: str) -> float:
    model.eval()
    errs: list[float] = []
    for batch in loader:
        out = model(batch["input_ids"].to(device), batch["attention_mask"].to(device))
        pred = torch.sigmoid(out["composite_logit"]).cpu().numpy()
        true = batch["composite"].numpy()
        errs.extend((np.abs(pred - true) * 100).tolist())
    return float(np.mean(errs))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--splits", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--output-dir", type=Path, default=MODELS_DIR / "distilbert")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--dim-loss-weight", type=float, default=1.0)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info("device: %s", device)

    train, val, test = load_split(args.labeled, args.corpus, args.splits)
    logger.info("train=%d val=%d test=%d", len(train), len(val), len(test))

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
    train_ds = LucidDataset(train, tokenizer, max_length=args.max_length)
    val_ds = LucidDataset(val, tokenizer, max_length=args.max_length)
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False)

    model = LucidDistilBERT(base_model_name=BASE_MODEL_NAME, num_dimensions=len(DIMENSIONS)).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    total_steps = len(train_loader) * args.epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(args.warmup_ratio * total_steps),
        num_training_steps=total_steps,
    )

    best_val = float("inf")
    for epoch in range(args.epochs):
        train_loss = train_one_epoch(
            model, train_loader, optimizer, scheduler, device, dim_loss_weight=args.dim_loss_weight,
        )
        val_mae = eval_composite_mae(model, val_loader, device)
        logger.info("epoch %d  train_loss=%.4f  val_composite_mae=%.2f", epoch + 1, train_loss, val_mae)
        if val_mae < best_val:
            best_val = val_mae
            args.output_dir.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), args.output_dir / "pytorch_model.bin")
            tokenizer.save_pretrained(args.output_dir)
            logger.info("saved best checkpoint → %s (val_mae=%.2f)", args.output_dir, val_mae)

    # Final eval on test set
    from backend.inference.deep import DeepPredictor
    from scripts.eval_common import evaluate_predictor, plot_confusion_matrices, save_metrics

    predictor = DeepPredictor(args.output_dir)
    metrics = evaluate_predictor(predictor, test)
    save_metrics(metrics, OUTPUTS_DIR / "metrics" / "deep.json")
    plot_confusion_matrices(
        metrics,
        OUTPUTS_DIR / "figures" / "deep",
        title_prefix="deep · ",
    )


if __name__ == "__main__":
    main()
