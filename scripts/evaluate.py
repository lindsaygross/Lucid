"""Evaluate all 3 models (naive, classical, deep) on the test set.

Produces a consolidated comparison table at data/outputs/comparison.json
+ confusion-matrix PNGs per model.

Run: python -m scripts.evaluate
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

from scripts.eval_common import evaluate_predictor, plot_confusion_matrices, save_metrics
from scripts.splits import load_split

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"
MODELS_DIR = REPO_ROOT / "models"

logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--splits", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--output", type=Path, default=OUTPUTS_DIR / "comparison.json")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    _, _, test = load_split(args.labeled, args.corpus, args.splits)
    logger.info("evaluating on %d test items", len(test))

    comparison: dict[str, dict] = {}

    # Naive (always works, rule-based)
    try:
        from backend.inference.naive import NaivePredictor
        naive_metrics = evaluate_predictor(NaivePredictor(), test)
        save_metrics(naive_metrics, OUTPUTS_DIR / "metrics" / "naive.json")
        plot_confusion_matrices(naive_metrics, OUTPUTS_DIR / "figures" / "naive", title_prefix="naive · ")
        comparison["naive"] = naive_metrics
    except Exception as exc:  # noqa: BLE001
        logger.exception("naive evaluation failed: %s", exc)

    # Classical
    try:
        from backend.inference.classical import ClassicalPredictor
        classical_metrics = evaluate_predictor(ClassicalPredictor(MODELS_DIR / "classical.pkl"), test)
        save_metrics(classical_metrics, OUTPUTS_DIR / "metrics" / "classical.json")
        plot_confusion_matrices(classical_metrics, OUTPUTS_DIR / "figures" / "classical", title_prefix="classical · ")
        comparison["classical"] = classical_metrics
    except FileNotFoundError as exc:
        logger.warning("classical model not trained yet: %s", exc)

    # Deep
    try:
        from backend.inference.deep import DeepPredictor
        deep_metrics = evaluate_predictor(DeepPredictor(MODELS_DIR / "distilbert"), test)
        save_metrics(deep_metrics, OUTPUTS_DIR / "metrics" / "deep.json")
        plot_confusion_matrices(deep_metrics, OUTPUTS_DIR / "figures" / "deep", title_prefix="deep · ")
        comparison["deep"] = deep_metrics
    except FileNotFoundError as exc:
        logger.warning("deep model not trained yet: %s", exc)

    # Summary table
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

    print("\n=== Model comparison (test set) ===")
    print(f"{'model':<12} {'macro_f1':>10} {'macro_acc':>10} {'comp_MAE':>10} {'comp_RMSE':>10} {'comp_R2':>9}")
    for name, s in summary.items():
        print(
            f"{name:<12} {s['macro_f1']:>10.3f} {s['macro_accuracy']:>10.3f} "
            f"{s['composite_mae']:>10.2f} {s['composite_rmse']:>10.2f} {s['composite_r2']:>+9.3f}"
        )


if __name__ == "__main__":
    main()
