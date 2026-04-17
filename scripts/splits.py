"""Stratified train/val/test split over the labeled corpus.

Stratifies on the composite score (quantized into bins) and source, so
each split has comparable distributions of severity and platform.

Saves indices to data/processed/splits.json for reproducibility.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"

logger = logging.getLogger(__name__)


def make_splits(
    labeled_csv: Path,
    corpus_csv: Path,
    output_path: Path,
    val_size: float = 0.15,
    test_size: float = 0.15,
    seed: int = 42,
) -> None:
    """Build stratified train/val/test split and save indices as JSON."""
    labeled = pd.read_csv(labeled_csv)
    corpus = pd.read_csv(corpus_csv)[["id", "source"]]
    df = labeled.merge(corpus, on="id", how="left")

    # Stratification key: composite-score quartile + source
    df["score_bin"] = pd.qcut(df["composite_score"], q=4, labels=False, duplicates="drop")
    df["strat"] = df["source"].astype(str) + "_" + df["score_bin"].astype(str)

    # Merge rare strata into a single bucket so train_test_split accepts them
    counts = df["strat"].value_counts()
    rare = set(counts[counts < 2].index)
    df.loc[df["strat"].isin(rare), "strat"] = "rare"

    train_val, test = train_test_split(
        df, test_size=test_size, stratify=df["strat"], random_state=seed,
    )
    rel_val = val_size / (1.0 - test_size)
    train, val = train_test_split(
        train_val, test_size=rel_val, stratify=train_val["strat"], random_state=seed,
    )

    splits = {
        "train_ids": train["id"].tolist(),
        "val_ids": val["id"].tolist(),
        "test_ids": test["id"].tolist(),
        "seed": seed,
        "val_size": val_size,
        "test_size": test_size,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(splits, f, indent=2)

    logger.info(
        "train=%d  val=%d  test=%d  → %s",
        len(splits["train_ids"]),
        len(splits["val_ids"]),
        len(splits["test_ids"]),
        output_path,
    )


def load_split(
    labeled_csv: Path,
    corpus_csv: Path,
    splits_path: Path,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load the saved split as three DataFrames joined with corpus text."""
    labeled = pd.read_csv(labeled_csv)
    corpus = pd.read_csv(corpus_csv)[["id", "text", "source", "extra_json"]]
    # labeled also has a "text" column — keep the corpus copy as canonical
    # (normalized) and drop labeled's before the merge to avoid text_x/text_y.
    labeled = labeled.drop(columns=["text"], errors="ignore")
    df = labeled.merge(corpus, on="id", how="left")
    df = df[df["text"].notna()].reset_index(drop=True)

    with splits_path.open("r", encoding="utf-8") as f:
        splits = json.load(f)

    def _subset(ids: list[str]) -> pd.DataFrame:
        return df[df["id"].isin(set(ids))].reset_index(drop=True)

    return _subset(splits["train_ids"]), _subset(splits["val_ids"]), _subset(splits["test_ids"])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--output", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--val-size", type=float, default=0.15)
    parser.add_argument("--test-size", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    make_splits(
        labeled_csv=args.labeled,
        corpus_csv=args.corpus,
        output_path=args.output,
        val_size=args.val_size,
        test_size=args.test_size,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
