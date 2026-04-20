"""Evaluate all 3 models on the 100-item human gold set.

This is a secondary evaluation that uses Lindsay's hand-labeled
`data/processed/gold_labels.csv` as ground truth (n = 100). It is
complementary to the primary Claude-labeled 529-item test split reported
in §9 Table 3 of the technical report. Because the test items here are
human-labeled, agreement with these matrices is a tighter test of the
models than agreement with the Claude-labeled test split.

Produces:
  - data/outputs/metrics/gold/{naive,classical,deep}.json
  - data/outputs/figures/gold/{naive,classical,deep}/{dimension}_confusion.png

Run:
    python -m scripts.evaluate_gold_set
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import pandas as pd

from backend.inference.schemas import DIMENSIONS
from scripts.eval_common import (
    evaluate_predictor,
    plot_confusion_matrices,
    save_metrics,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"
MODELS_DIR = REPO_ROOT / "models"
DISTILBERT_DIR = REPO_ROOT / "models" / "distilbert"

logger = logging.getLogger(__name__)


def _with_composite(gold: pd.DataFrame) -> pd.DataFrame:
    """Add a `composite_score` column computed from per-dimension ordinals.

    Matches the convention in `scripts.label_with_claude.composite_from_labels`:
    composite = round(100 * sum(dims) / (2 * n_dims)).
    """
    max_total = 2 * len(DIMENSIONS)
    totals = gold[list(DIMENSIONS)].sum(axis=1)
    gold = gold.copy()
    gold["composite_score"] = (100.0 * totals / max_total).round().astype(int)
    return gold


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gold", type=Path, default=PROCESSED_DIR / "gold_labels.csv")
    parser.add_argument("--output", type=Path, default=OUTPUTS_DIR / "comparison_gold.json")
    parser.add_argument("--distilbert-dir", type=Path, default=DISTILBERT_DIR)
    parser.add_argument("--classical-bundle", type=Path, default=MODELS_DIR / "classical.pkl")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if not args.gold.exists():
        raise SystemExit(f"Gold-set labels not found at {args.gold}. Run scripts.gold_set_labeler first.")

    gold = _with_composite(pd.read_csv(args.gold))
    logger.info("evaluating on %d gold-set items", len(gold))

    metrics_dir = OUTPUTS_DIR / "metrics" / "gold"
    figures_dir = OUTPUTS_DIR / "figures" / "gold"
    comparison: dict[str, dict] = {}

    try:
        from backend.inference.naive import NaivePredictor
        m = evaluate_predictor(NaivePredictor(), gold)
        save_metrics(m, metrics_dir / "naive.json")
        plot_confusion_matrices(m, figures_dir / "naive", title_prefix="naive · ")
        comparison["naive"] = m
    except Exception as exc:  # noqa: BLE001
        logger.exception("naive evaluation failed: %s", exc)

    try:
        from backend.inference.classical import ClassicalPredictor
        m = evaluate_predictor(ClassicalPredictor(args.classical_bundle), gold)
        save_metrics(m, metrics_dir / "classical.json")
        plot_confusion_matrices(m, figures_dir / "classical", title_prefix="classical · ")
        comparison["classical"] = m
    except FileNotFoundError as exc:
        logger.warning("classical bundle not found: %s", exc)

    try:
        from backend.inference.deep import DeepPredictor
        m = evaluate_predictor(DeepPredictor(model_dir=args.distilbert_dir), gold)
        save_metrics(m, metrics_dir / "deep.json")
        plot_confusion_matrices(m, figures_dir / "deep", title_prefix="deep · ")
        comparison["deep"] = m
    except FileNotFoundError as exc:
        logger.warning("deep weights not found at %s: %s", args.distilbert_dir, exc)

    summary = {
        name: {
            "macro_f1": m["macro_f1"],
            "macro_accuracy": m["macro_accuracy"],
            "composite_mae": m["composite"]["mae"],
            "composite_rmse": m["composite"]["rmse"],
            "composite_r2": m["composite"]["r2"],
        }
        for name, m in comparison.items()
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        json.dump({"summary": summary, "detailed": comparison}, f, indent=2)

    print("\n=== Gold-set model comparison (n=100 human-labeled) ===")
    print(f"{'model':<12} {'macro_f1':>10} {'macro_acc':>10} {'comp_MAE':>10} {'comp_RMSE':>10} {'comp_R2':>9}")
    for name, s in summary.items():
        print(
            f"{name:<12} {s['macro_f1']:>10.3f} {s['macro_accuracy']:>10.3f} "
            f"{s['composite_mae']:>10.2f} {s['composite_rmse']:>10.2f} {s['composite_r2']:>+9.3f}"
        )


if __name__ == "__main__":
    main()
