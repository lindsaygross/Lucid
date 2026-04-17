"""Shared schemas for model predictions."""

from __future__ import annotations

from dataclasses import dataclass

DIMENSIONS: tuple[str, ...] = (
    "outrage_bait",
    "fomo_trigger",
    "engagement_bait",
    "emotional_manipulation",
    "curiosity_gap",
    "dopamine_design",
)


@dataclass
class Prediction:
    """Unified prediction output from any of the three models.

    Fields:
        scroll_trap_score: Composite 0–100 integer.
        dimension_scores: Per-dimension soft score in [0, 1].
            For the deep model this is a sigmoid output.
            For classical, a calibrated probability.
            For naive, a simple normalized count.
        dimension_present: Binary per-dimension flag, threshold=0.5 by default.
    """

    scroll_trap_score: int
    dimension_scores: dict[str, float]
    dimension_present: dict[str, bool]

    @classmethod
    def from_dimension_scores(cls, dim_scores: dict[str, float], threshold: float = 0.5) -> "Prediction":
        """Construct a Prediction from soft dimension scores, deriving the composite."""
        clamped = {d: max(0.0, min(1.0, dim_scores.get(d, 0.0))) for d in DIMENSIONS}
        composite = int(round(100 * sum(clamped.values()) / len(DIMENSIONS)))
        present = {d: v >= threshold for d, v in clamped.items()}
        return cls(
            scroll_trap_score=composite,
            dimension_scores=clamped,
            dimension_present=present,
        )
