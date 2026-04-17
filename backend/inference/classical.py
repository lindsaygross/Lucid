"""Classical ML: TF-IDF + handcrafted features → XGBoost multi-output.

Trains 6 separate XGBoost binary classifiers (one per dimension) on:
  - TF-IDF vectors over word 1-3-grams (top 5000 terms)
  - Handcrafted stylometric features (caps ratio, punctuation density,
    trigger-word counts, sentiment, readability, etc.)

At inference time loads the serialized model bundle and returns calibrated
probabilities per dimension.

Training lives in `scripts/train_classical.py`. This module is the runtime
inference path used by `backend/inference/router.py`.
"""

from __future__ import annotations

import pickle
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from backend.inference.schemas import DIMENSIONS, Prediction


@dataclass
class ClassicalBundle:
    """Everything needed at inference time, serialized with pickle."""

    vectorizer: object  # sklearn TfidfVectorizer
    feature_fn_name: str  # name of the handcrafted-feature function for reproducibility
    models: dict[str, object]  # dim -> trained xgboost.XGBClassifier
    feature_names: list[str]


class ClassicalPredictor:
    """Loads a serialized ClassicalBundle and runs inference."""

    def __init__(self, bundle_path: str | Path) -> None:
        path = Path(bundle_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Classical model bundle not found at {path}. "
                "Run `make train-classical` first."
            )
        with path.open("rb") as f:
            self.bundle: ClassicalBundle = pickle.load(f)  # noqa: S301

    def predict(self, text: str) -> Prediction:
        """Score a single text across all 6 dimensions."""
        from scripts.build_features import compute_handcrafted_features  # lazy import

        tfidf = self.bundle.vectorizer.transform([text])
        handcrafted = np.array([compute_handcrafted_features(text)])
        x = np.hstack([tfidf.toarray(), handcrafted])

        dim_scores: dict[str, float] = {}
        for dim in DIMENSIONS:
            model = self.bundle.models.get(dim)
            if model is None:
                dim_scores[dim] = 0.0
                continue
            prob = float(model.predict_proba(x)[0, 1])
            dim_scores[dim] = prob
        return Prediction.from_dimension_scores(dim_scores)
