"""Train the naive baseline — which is really just "evaluate the rule set on test."

The naive model has no learned parameters; this script exists for parallel
structure with the classical and deep training entrypoints, and for
recording its test-set metrics in data/outputs/metrics/naive.json.

Run: python -m scripts.train_naive
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

from scripts.splits import load_split
from scripts.eval_common import evaluate_predictor, save_metrics

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"

logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--splits", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--output", type=Path, default=OUTPUTS_DIR / "metrics" / "naive.json")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    from backend.inference.naive import NaivePredictor  # local import so we see dep errors early
    _, _, test = load_split(args.labeled, args.corpus, args.splits)
    logger.info("naive baseline on %d test items", len(test))

    predictor = NaivePredictor()
    metrics = evaluate_predictor(predictor, test)
    save_metrics(metrics, args.output)


if __name__ == "__main__":
    main()
