"""Compute inter-annotator agreement between Claude labels and Lindsay's gold set.

Metrics reported per dimension and averaged:
  - Spearman rank correlation
  - Krippendorff's alpha (ordinal distance metric)
  - Exact-match accuracy (3-class)
  - Within-1 accuracy (|score difference| <= 1)

Writes metrics table to data/outputs/agreement.json and prints a summary.

Run: python -m scripts.agreement_stats
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import krippendorff
import numpy as np
import pandas as pd
from scipy.stats import spearmanr

from backend.inference.schemas import DIMENSIONS

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"

logger = logging.getLogger(__name__)


def compute_agreement(
    gold_df: pd.DataFrame,
    claude_df: pd.DataFrame,
) -> dict[str, dict[str, float]]:
    """Per-dimension agreement stats on the joined subset."""
    merged = gold_df.merge(
        claude_df, on="id", how="inner", suffixes=("_gold", "_claude")
    )
    if merged.empty:
        raise SystemExit(
            "No overlap between gold set and Claude labels. "
            "Make sure both files reference the same corpus IDs."
        )
    logger.info("merged on %d rows", len(merged))

    results: dict[str, dict[str, float]] = {}
    for dim in DIMENSIONS:
        g = merged[f"{dim}_gold"].to_numpy(dtype=float)
        c = merged[f"{dim}_claude"].to_numpy(dtype=float)
        rho, pval = spearmanr(g, c)
        alpha = krippendorff.alpha(
            reliability_data=[g.tolist(), c.tolist()],
            level_of_measurement="ordinal",
        )
        exact = float(np.mean(g == c))
        within_one = float(np.mean(np.abs(g - c) <= 1))
        results[dim] = {
            "spearman_rho": float(rho) if not np.isnan(rho) else 0.0,
            "spearman_pvalue": float(pval) if not np.isnan(pval) else 1.0,
            "krippendorff_alpha_ordinal": float(alpha),
            "exact_match_accuracy": exact,
            "within_one_accuracy": within_one,
            "n": int(len(merged)),
        }
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gold", type=Path, default=PROCESSED_DIR / "gold_labels.csv")
    parser.add_argument("--claude", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--output", type=Path, default=OUTPUTS_DIR / "agreement.json")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    if not args.gold.exists():
        raise SystemExit(f"Gold labels not found: {args.gold}. Run the gold_set_labeler first.")
    if not args.claude.exists():
        raise SystemExit(f"Claude labels not found: {args.claude}. Run label_with_claude first.")

    gold = pd.read_csv(args.gold)
    claude = pd.read_csv(args.claude)
    results = compute_agreement(gold, claude)

    # Summary: macro-average across dimensions
    macro = {
        "mean_spearman": float(np.mean([r["spearman_rho"] for r in results.values()])),
        "mean_krippendorff_alpha": float(np.mean([r["krippendorff_alpha_ordinal"] for r in results.values()])),
        "mean_exact_match": float(np.mean([r["exact_match_accuracy"] for r in results.values()])),
        "mean_within_one": float(np.mean([r["within_one_accuracy"] for r in results.values()])),
    }
    results["_macro"] = macro  # type: ignore[assignment]

    with args.output.open("w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n=== Claude vs Lindsay gold-set agreement ===")
    for dim in DIMENSIONS:
        r = results[dim]
        print(
            f"  {dim:<24}  ρ={r['spearman_rho']:+.3f}  α={r['krippendorff_alpha_ordinal']:+.3f}  "
            f"exact={r['exact_match_accuracy']:.2f}  within1={r['within_one_accuracy']:.2f}"
        )
    print("\n=== Macro averages ===")
    for k, v in macro.items():
        print(f"  {k}: {v:+.3f}")
    print(f"\nWrote detailed results → {args.output}")


if __name__ == "__main__":
    main()
