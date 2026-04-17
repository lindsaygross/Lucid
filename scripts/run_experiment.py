"""Run the two focused experiments for the technical report.

Experiment 1 — Algorithmic reward of manipulation
  Correlation between Scroll Trap Score and engagement rate across the
  scraped Reddit corpus (since we have engagement metrics there).
  Reports Pearson + Spearman, overall and per dimension.
  Frames as OBSERVATIONAL, not causal.

Experiment 2 — Noise robustness
  Inject character-level noise (random substitutions) at increasing rates
  and measure how much the composite score changes. Tells us whether the
  model is learning surface patterns vs. deeper semantics.

Writes results + figures to data/outputs/experiments/.

Run: python -m scripts.run_experiment
"""

from __future__ import annotations

import argparse
import json
import logging
import random
import string
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr

from backend.inference.schemas import DIMENSIONS

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs" / "experiments"

logger = logging.getLogger(__name__)


def load_predictor(preferred: str):
    """Load the same InferenceRouter used in production."""
    from backend.inference.router import InferenceRouter
    return InferenceRouter(preferred=preferred, model_dir=str(REPO_ROOT / "models"))


def engagement_rate(row: dict) -> float | None:
    """Per-post engagement rate, normalized against author karma if available."""
    extra = json.loads(row.get("extra_json", "{}") or "{}")
    score = extra.get("score")
    num_comments = extra.get("num_comments")
    karma = extra.get("author_karma")
    if score is None or karma is None:
        return None
    try:
        karma = float(karma)
    except (TypeError, ValueError):
        return None
    if karma <= 0:
        return None
    total_engagement = float(score or 0) + float(num_comments or 0)
    return total_engagement / (karma + 1)


def experiment_engagement(labeled_csv: Path, corpus_csv: Path, out_dir: Path) -> dict:
    """Run engagement-correlation experiment on Reddit subset."""
    labeled = pd.read_csv(labeled_csv)
    corpus = pd.read_csv(corpus_csv)
    df = labeled.merge(corpus[["id", "source", "extra_json"]], on="id", how="left")
    df = df[df["source"] == "reddit"].reset_index(drop=True)
    if len(df) < 30:
        logger.warning("not enough reddit data (%d rows); experiment may be noisy", len(df))

    df["engagement_rate"] = df.apply(lambda r: engagement_rate(r.to_dict()), axis=1)
    df = df[df["engagement_rate"].notna()].reset_index(drop=True)
    logger.info("engagement experiment: %d rows with valid engagement", len(df))

    results: dict = {"n": int(len(df))}
    # Overall composite correlation
    pear_r, pear_p = pearsonr(df["composite_score"], df["engagement_rate"])
    spear_r, spear_p = spearmanr(df["composite_score"], df["engagement_rate"])
    results["composite"] = {
        "pearson_r": float(pear_r), "pearson_p": float(pear_p),
        "spearman_r": float(spear_r), "spearman_p": float(spear_p),
    }
    # Per-dimension
    results["per_dimension"] = {}
    for dim in DIMENSIONS:
        pear_r, pear_p = pearsonr(df[dim], df["engagement_rate"])
        spear_r, spear_p = spearmanr(df[dim], df["engagement_rate"])
        results["per_dimension"][dim] = {
            "pearson_r": float(pear_r), "pearson_p": float(pear_p),
            "spearman_r": float(spear_r), "spearman_p": float(spear_p),
        }

    # Scatter plot
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.scatter(df["composite_score"], df["engagement_rate"], alpha=0.4, s=18)
    ax.set_xlabel("Scroll Trap Score (0–100)")
    ax.set_ylabel("Engagement rate (score+comments / karma+1)")
    ax.set_title(f"Engagement vs manipulation  |  ρ={spear_r:+.2f}  n={len(df)}")
    ax.set_yscale("symlog", linthresh=1)
    fig.tight_layout()
    out_dir.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_dir / "engagement_scatter.png", dpi=130)
    plt.close(fig)

    return results


def _inject_char_noise(text: str, p: float, rng: random.Random) -> str:
    """Replace each character with a random printable char with probability p."""
    out = []
    pool = string.ascii_letters + string.digits + string.punctuation + " "
    for c in text:
        if rng.random() < p:
            out.append(rng.choice(pool))
        else:
            out.append(c)
    return "".join(out)


def experiment_noise(labeled_csv: Path, corpus_csv: Path, out_dir: Path, sample_n: int = 100) -> dict:
    """Measure score stability under character-level noise injection."""
    rng = random.Random(7)

    labeled = pd.read_csv(labeled_csv)
    if "text" in labeled.columns:
        labeled = labeled.drop(columns=["text"])
    corpus = pd.read_csv(corpus_csv)[["id", "text"]]
    df = labeled.merge(corpus, on="id", how="left").dropna(subset=["text"])
    df = df.sample(n=min(sample_n, len(df)), random_state=7).reset_index(drop=True)

    router = load_predictor("deep")  # falls back to classical / naive

    noise_levels = [0.0, 0.05, 0.10, 0.20, 0.35]
    results: dict = {"sample_n": len(df), "noise_levels": noise_levels, "per_level": {}}

    baseline_scores: list[int] = []
    for _, row in df.iterrows():
        baseline_scores.append(router.predict(row["text"]).scroll_trap_score)

    for p in noise_levels:
        deltas: list[float] = []
        for (_, row), baseline in zip(df.iterrows(), baseline_scores):
            noisy = _inject_char_noise(row["text"], p, rng)
            pred = router.predict(noisy).scroll_trap_score
            deltas.append(abs(pred - baseline))
        results["per_level"][str(p)] = {
            "mean_abs_delta": float(np.mean(deltas)),
            "median_abs_delta": float(np.median(deltas)),
            "max_abs_delta": float(np.max(deltas)),
        }

    # Plot
    import matplotlib.pyplot as plt
    means = [results["per_level"][str(p)]["mean_abs_delta"] for p in noise_levels]
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(noise_levels, means, marker="o")
    ax.set_xlabel("character noise rate")
    ax.set_ylabel("mean |Δ Scroll Trap Score|")
    ax.set_title("Model stability under character-level noise")
    fig.tight_layout()
    out_dir.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_dir / "noise_stability.png", dpi=130)
    plt.close(fig)

    return results


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--out-dir", type=Path, default=OUTPUTS_DIR)
    parser.add_argument("--skip-engagement", action="store_true")
    parser.add_argument("--skip-noise", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    combined: dict = {}
    if not args.skip_engagement:
        combined["engagement"] = experiment_engagement(args.labeled, args.corpus, args.out_dir)
    if not args.skip_noise:
        combined["noise"] = experiment_noise(args.labeled, args.corpus, args.out_dir)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    with (args.out_dir / "experiment_results.json").open("w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2)

    logger.info("experiment results → %s", args.out_dir / "experiment_results.json")


if __name__ == "__main__":
    main()
