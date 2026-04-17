"""Train the classical model: TF-IDF + handcrafted features → XGBoost × 6.

One XGBoost binary classifier per dimension. Trained in parallel, serialized
as a single pickle bundle at models/classical.pkl.

Run: python -m scripts.train_classical
"""

from __future__ import annotations

import argparse
import logging
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBClassifier

from backend.inference.classical import ClassicalBundle
from backend.inference.schemas import DIMENSIONS
from scripts.build_features import HANDCRAFTED_FEATURE_NAMES, compute_handcrafted_features
from scripts.eval_common import evaluate_predictor, plot_confusion_matrices, save_metrics
from scripts.splits import load_split

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
MODELS_DIR = REPO_ROOT / "models"
OUTPUTS_DIR = REPO_ROOT / "data" / "outputs"

logger = logging.getLogger(__name__)


def _labels_binary(df: pd.DataFrame, dim: str) -> np.ndarray:
    """Convert ordinal 0/1/2 labels to binary at threshold 1."""
    return (df[dim].to_numpy(dtype=int) >= 1).astype(int)


def _build_feature_matrix(
    vectorizer: TfidfVectorizer,
    df: pd.DataFrame,
    fit: bool = False,
) -> np.ndarray:
    texts = df["text"].fillna("").tolist()
    tfidf = vectorizer.fit_transform(texts) if fit else vectorizer.transform(texts)
    handcrafted = np.array([compute_handcrafted_features(t) for t in texts])
    return np.hstack([tfidf.toarray(), handcrafted])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labeled", type=Path, default=PROCESSED_DIR / "labeled.csv")
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--splits", type=Path, default=PROCESSED_DIR / "splits.json")
    parser.add_argument("--bundle-out", type=Path, default=MODELS_DIR / "classical.pkl")
    parser.add_argument("--metrics-out", type=Path, default=OUTPUTS_DIR / "metrics" / "classical.json")
    parser.add_argument("--max-features", type=int, default=5000)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    train, val, test = load_split(args.labeled, args.corpus, args.splits)
    logger.info("train=%d val=%d test=%d", len(train), len(val), len(test))

    vectorizer = TfidfVectorizer(
        max_features=args.max_features,
        ngram_range=(1, 3),
        min_df=2,
        sublinear_tf=True,
    )
    x_train = _build_feature_matrix(vectorizer, train, fit=True)

    models: dict[str, XGBClassifier] = {}
    for dim in DIMENSIONS:
        y_train = _labels_binary(train, dim)
        pos_rate = y_train.mean() or 1e-6
        scale_pos_weight = (1 - pos_rate) / pos_rate
        model = XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.9,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            eval_metric="logloss",
            tree_method="hist",
            random_state=42,
        )
        model.fit(x_train, y_train, verbose=False)
        models[dim] = model
        logger.info("trained %s (pos_rate=%.2f)", dim, pos_rate)

    # Serialize bundle
    feature_names = list(vectorizer.get_feature_names_out()) + HANDCRAFTED_FEATURE_NAMES
    bundle = ClassicalBundle(
        vectorizer=vectorizer,
        feature_fn_name="compute_handcrafted_features",
        models=models,
        feature_names=feature_names,
    )
    args.bundle_out.parent.mkdir(parents=True, exist_ok=True)
    with args.bundle_out.open("wb") as f:
        pickle.dump(bundle, f)
    logger.info("wrote bundle → %s", args.bundle_out)

    # Evaluate on test set
    from backend.inference.classical import ClassicalPredictor
    predictor = ClassicalPredictor(args.bundle_out)
    metrics = evaluate_predictor(predictor, test)
    save_metrics(metrics, args.metrics_out)
    plot_confusion_matrices(
        metrics,
        OUTPUTS_DIR / "figures" / "classical",
        title_prefix="classical · ",
    )


if __name__ == "__main__":
    main()
