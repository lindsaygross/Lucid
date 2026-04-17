"""Surface the top-N most informative model mispredictions for the report.

Runs the classical predictor (or whichever predictor the router selects) on
the test split, ranks errors, and prints the top examples grouped by two
failure modes:

  1. Composite-score errors — largest |predicted - ground-truth|
  2. Per-dimension FP/FN — where the model disagrees with the binary
     present/not ground truth

For each example we print the text, ground truth, prediction, and a hint
about the likely root cause (surface-feature false-fire, semantic miss,
etc.) so the report's Error Analysis section can be filled in fast.

Run:
    python -m scripts.error_analysis
Or:
    python -m scripts.error_analysis --n 8 --model classical
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import pandas as pd

from backend.inference.schemas import DIMENSIONS
from scripts.splits import load_split

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs" / "error_analysis"

logger = logging.getLogger(__name__)


def load_predictor(model: str):
    """Load a single predictor directly (not via router, to force a specific model)."""
    if model == "naive":
        from backend.inference.naive import NaivePredictor
        return NaivePredictor()
    if model == "classical":
        from backend.inference.classical import ClassicalPredictor
        return ClassicalPredictor(REPO_ROOT / "models" / "classical.pkl")
    if model == "deep":
        from backend.inference.deep import DeepPredictor
        local = REPO_ROOT / "models" / "distilbert"
        return DeepPredictor(
            model_dir=str(local) if local.exists() else None,
            hf_repo="lindsaygross32/lucid-distilbert",
        )
    raise ValueError(f"unknown model: {model}")


def classify_error(text: str, gold_dim: dict[str, int], pred_dim: dict[str, float]) -> str:
    """Rough heuristic label for the likely root cause of the error."""
    text_l = text.lower()
    caps_ratio = sum(1 for c in text if c.isupper()) / max(1, sum(1 for c in text if c.isalpha()))
    has_bang = "!!" in text or "??" in text
    has_ellipsis = "..." in text

    # Heuristic checks — this is for the REPORT section, so err on the side
    # of being suggestive rather than definitive.
    if caps_ratio > 0.3 and any(pred_dim[d] > 0.5 and gold_dim[d] == 0 for d in DIMENSIONS):
        return "surface-feature false fire (heavy caps/punct likely triggered classifier)"
    if has_bang and pred_dim.get("dopamine_design", 0) > 0.5 and gold_dim.get("dopamine_design", 0) == 0:
        return "dopamine-design over-fire on typography without semantic manipulation"
    if len(text) < 60 and any(abs(pred_dim[d] - (1 if gold_dim[d] >= 1 else 0)) > 0.5 for d in DIMENSIONS):
        return "short-text under-context (too little signal to classify reliably)"
    if has_ellipsis and pred_dim.get("curiosity_gap", 0) > 0.6 and gold_dim.get("curiosity_gap", 0) == 0:
        return "curiosity-gap over-fire on ellipsis-style suspense that isn't manipulative"
    if any(pred_dim[d] < 0.3 and gold_dim[d] >= 1 for d in DIMENSIONS):
        return "semantic miss — manipulation present but phrased without surface cues"
    return "unclear / mixed — requires manual inspection"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--splits", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--model", default="classical", choices=["naive", "classical", "deep"])
    parser.add_argument("--n", type=int, default=5, help="number of worst composite errors to print")
    parser.add_argument("--out-dir", type=Path, default=OUTPUTS_DIR)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    _, _, test = load_split(args.labeled, args.corpus, args.splits)
    predictor = load_predictor(args.model)
    logger.info("scoring %d test-set items with model=%s", len(test), args.model)

    rows: list[dict] = []
    for _, row in test.iterrows():
        pred = predictor.predict(row["text"])
        gold_dim = {d: int(row[d]) for d in DIMENSIONS}
        pred_dim_prob = pred.dimension_scores
        rows.append({
            "id": row["id"],
            "text": row["text"],
            "gold_composite": int(row["composite_score"]),
            "pred_composite": int(pred.scroll_trap_score),
            "composite_error": abs(int(row["composite_score"]) - int(pred.scroll_trap_score)),
            "gold_dim": gold_dim,
            "pred_dim": pred_dim_prob,
            "likely_cause": classify_error(row["text"], gold_dim, pred_dim_prob),
        })

    rows.sort(key=lambda r: r["composite_error"], reverse=True)
    topn = rows[: args.n]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    out_file = args.out_dir / f"worst_{args.model}.json"
    with out_file.open("w", encoding="utf-8") as f:
        json.dump(topn, f, indent=2)

    print(f"\n=== Top {args.n} composite-score errors (model={args.model}) ===\n")
    for i, r in enumerate(topn, 1):
        print(f"--- #{i}  id={r['id']}  gold={r['gold_composite']}  pred={r['pred_composite']}  error={r['composite_error']} ---")
        print(f"TEXT: {r['text'][:350]}{'...' if len(r['text']) > 350 else ''}")
        print("GOLD dims:", {d: r["gold_dim"][d] for d in DIMENSIONS})
        print("PRED dims:", {d: round(r["pred_dim"][d], 2) for d in DIMENSIONS})
        print(f"LIKELY CAUSE: {r['likely_cause']}")
        print()

    print(f"(wrote {out_file})")


if __name__ == "__main__":
    main()
