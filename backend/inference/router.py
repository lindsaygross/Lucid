"""Routes an inference request to one of the three models.

Default routes to the deep model (DistilBERT). If the deep model isn't
available on disk (e.g., we haven't trained yet), falls back to classical,
then naive. Always returns a Prediction.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING

from backend.inference.naive import NaivePredictor
from backend.inference.schemas import Prediction

if TYPE_CHECKING:
    from backend.inference.classical import ClassicalPredictor
    from backend.inference.deep import DeepPredictor

logger = logging.getLogger(__name__)


class InferenceRouter:
    """Holds loaded models and routes predict() calls.

    Lazy-loads each model on first use. Heavy backends (classical = xgboost,
    deep = torch/transformers) are only imported when actually requested, so a
    minimal production deployment (e.g., naive-only) does not need those deps.
    """

    def __init__(self, preferred: str = "deep", model_dir: str = "models") -> None:
        self.preferred = preferred
        self.model_dir = Path(model_dir)
        self._naive: NaivePredictor | None = None
        self._classical: "ClassicalPredictor | None" = None
        self._deep: "DeepPredictor | None" = None

    def predict(self, text: str) -> Prediction:
        """Route to the preferred model with graceful fallbacks."""
        order = _fallback_order(self.preferred)
        last_exc: Exception | None = None
        for model_name in order:
            try:
                model = self._get(model_name)
                return model.predict(text)
            except FileNotFoundError as exc:
                logger.info("model %r not available, falling back: %s", model_name, exc)
                last_exc = exc
            except Exception as exc:  # noqa: BLE001
                logger.warning("model %r failed, falling back: %s", model_name, exc)
                last_exc = exc

        # All models failed — should never happen because naive is rule-based.
        raise RuntimeError(f"No inference model available: {last_exc}")

    def _get(self, name: str):  # noqa: ANN202
        if name == "naive":
            if self._naive is None:
                self._naive = NaivePredictor()
            return self._naive
        if name == "classical":
            if self._classical is None:
                from backend.inference.classical import ClassicalPredictor  # lazy import
                self._classical = ClassicalPredictor(self.model_dir / "classical.pkl")
            return self._classical
        if name == "deep":
            if self._deep is None:
                from backend.inference.deep import DeepPredictor  # lazy import
                self._deep = DeepPredictor(self.model_dir / "distilbert")
            return self._deep
        raise ValueError(f"unknown model: {name}")


def _fallback_order(preferred: str) -> list[str]:
    """Return the order of models to try, starting with the preferred one."""
    if preferred == "deep":
        return ["deep", "classical", "naive"]
    if preferred == "classical":
        return ["classical", "naive"]
    return ["naive"]
