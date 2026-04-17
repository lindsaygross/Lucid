"""Naive baseline: keyword matching on a curated trigger-word dictionary.

Per-dimension score is the fraction of trigger patterns found in the text,
capped at 1.0. No learning, no training — purely rule-based. Serves as the
mandatory naive baseline for assignment rubric comparison.

Trigger patterns are grounded in the manipulation literature (see
docs/RUBRIC.md) but are intentionally surface-level; the point is to show
how much signal you can extract with 50 lines of rules vs. a classifier.
"""

from __future__ import annotations

import re

from backend.inference.schemas import DIMENSIONS, Prediction


# Patterns per dimension. Keep regex simple; case-insensitive matching at apply time.
TRIGGER_PATTERNS: dict[str, list[str]] = {
    "outrage_bait": [
        r"\bdisgusting\b", r"\bevil\b", r"\bshameful\b", r"\bbetrayal\b",
        r"\boutrageous\b", r"\bunbelievable\b", r"\bcan'?t believe\b",
        r"\binfuriating\b", r"\bhow dare\b", r"\byou won'?t believe what\b",
    ],
    "fomo_trigger": [
        r"\bonly \d+ (left|spots|remaining)\b", r"\blast chance\b",
        r"\beveryone is (doing|switching|using)\b", r"\bmost people don'?t know\b",
        r"\bhurry\b", r"\bdon'?t be (left|the last)\b", r"\bmissing out\b",
        r"\bwhile supplies last\b", r"\bbefore it'?s too late\b",
    ],
    "engagement_bait": [
        r"\btag (a|someone|your) (friend|person)\b", r"\bcomment (yes|below|if)\b",
        r"\bshare (if|this|to)\b", r"\bfollow for (part|more)\b",
        r"\bdouble tap if\b", r"\blike if\b", r"\bsave this\b",
        r"\bduet this\b", r"\bstitch this\b",
    ],
    "emotional_manipulation": [
        r"\bif you scroll past\b", r"\b99% (of people|will)\b",
        r"\byou don'?t (care|have a heart)\b", r"\bwhat kind of person\b",
        r"\bprove you\b", r"\bonly real ones\b", r"\bprove me wrong\b",
        r"\bshare to (your story|honor)\b",
    ],
    "curiosity_gap": [
        r"\bwait (for it|till the end|until)\b", r"\byou won'?t believe\b",
        r"\bthe reason (why|is|will)\b", r"\bthis is why\b",
        r"\bshook\b", r"\bshocking\b", r"\bthe one thing\b",
        r"\bnumber \d+ (will|is)\b", r"\b\.\.\.and then\b",
        r"\bwhat happens next\b",
    ],
    "dopamine_design": [
        r"!{2,}", r"\?{2,}", r"\.{3,}",
        # heavy emoji clusters (crude approximation — real check is in the feature)
    ],
}


MAX_TRIGGERS_FOR_FULL_SCORE: dict[str, int] = {
    "outrage_bait": 2,
    "fomo_trigger": 2,
    "engagement_bait": 2,
    "emotional_manipulation": 2,
    "curiosity_gap": 2,
    "dopamine_design": 3,
}


class NaivePredictor:
    """Rule-based keyword predictor for the assignment's naive baseline."""

    def __init__(self) -> None:
        self._compiled = {
            dim: [re.compile(p, re.IGNORECASE) for p in patterns]
            for dim, patterns in TRIGGER_PATTERNS.items()
        }

    def predict(self, text: str) -> Prediction:
        """Return per-dimension soft scores in [0, 1] + derived composite."""
        dim_scores: dict[str, float] = {}
        for dim in DIMENSIONS:
            patterns = self._compiled.get(dim, [])
            hits = sum(1 for p in patterns if p.search(text))
            if dim == "dopamine_design":
                hits += self._dopamine_surface_score(text)
            max_hits = MAX_TRIGGERS_FOR_FULL_SCORE[dim]
            dim_scores[dim] = min(1.0, hits / max_hits)
        return Prediction.from_dimension_scores(dim_scores)

    @staticmethod
    def _dopamine_surface_score(text: str) -> int:
        """Additional surface-feature hits for dopamine design dimension.

        Counts CAPS density and emoji density as extra trigger-equivalents.
        """
        bonus = 0
        # Caps ratio: > 30% uppercase letters among letters
        letters = [c for c in text if c.isalpha()]
        if letters:
            caps_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
            if caps_ratio > 0.3:
                bonus += 1
            if caps_ratio > 0.6:
                bonus += 1
        # Emoji density heuristic: any character outside BMP is likely an emoji
        emoji_count = sum(1 for c in text if ord(c) > 0x1F000)
        if emoji_count >= 3:
            bonus += 1
        if emoji_count >= 6:
            bonus += 1
        return bonus
