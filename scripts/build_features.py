"""Feature engineering for the classical (XGBoost) model.

Combines TF-IDF vectors with handcrafted stylometric features:
  - caps_ratio, punctuation_density, exclamation_count, question_count
  - emoji_density, trigger_word_count, imperative_count
  - sentiment polarity + intensity (VADER)
  - post length (chars + words)
  - readability (Flesch-Kincaid grade level)

`compute_handcrafted_features(text)` is also imported at inference time
by backend/inference/classical.py so the feature pipeline is identical
across training and serving.
"""

from __future__ import annotations

import re

import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


IMPERATIVE_STARTERS = {
    "do", "don't", "stop", "tag", "comment", "share", "follow", "like",
    "watch", "wait", "see", "check", "look", "listen", "click", "save",
    "duet", "stitch", "buy", "get", "try", "learn", "know", "remember",
}

NAIVE_TRIGGER_WORDS = {
    "won't believe", "wait for it", "shocking", "insane", "wild",
    "disgusting", "evil", "shameful", "betrayal", "outrageous",
    "only", "last chance", "everyone", "nobody", "all of us",
    "tag a friend", "comment yes", "share this", "follow for",
    "if you scroll", "99%", "don't care", "kind of person",
}

HANDCRAFTED_FEATURE_NAMES: list[str] = [
    "caps_ratio",
    "exclamation_count",
    "question_count",
    "ellipsis_count",
    "punctuation_density",
    "emoji_density",
    "trigger_word_count",
    "imperative_count",
    "sentiment_compound",
    "sentiment_pos",
    "sentiment_neg",
    "char_length",
    "word_count",
    "avg_word_length",
    "flesch_grade",
]


_analyzer = SentimentIntensityAnalyzer()


def _caps_ratio(text: str) -> float:
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return 0.0
    return sum(1 for c in letters if c.isupper()) / len(letters)


def _punctuation_density(text: str) -> float:
    if not text:
        return 0.0
    return sum(1 for c in text if c in "!?.,;:") / len(text)


def _emoji_density(text: str) -> float:
    if not text:
        return 0.0
    emoji_count = sum(1 for c in text if ord(c) > 0x1F000)
    return emoji_count / max(len(text), 1)


def _count_any(text: str, patterns: set[str]) -> int:
    lower = text.lower()
    return sum(1 for p in patterns if p in lower)


def _imperative_count(text: str) -> int:
    count = 0
    for sentence in re.split(r"[.!?\n]", text):
        tokens = sentence.strip().split()
        if tokens and tokens[0].lower().strip(",!?.") in IMPERATIVE_STARTERS:
            count += 1
    return count


def _flesch_grade(text: str) -> float:
    try:
        import textstat
        return float(textstat.flesch_kincaid_grade(text)) if text.strip() else 0.0
    except Exception:  # noqa: BLE001
        return 0.0


def compute_handcrafted_features(text: str) -> list[float]:
    """Return a fixed-length vector of handcrafted features in HANDCRAFTED_FEATURE_NAMES order."""
    text = text or ""
    words = re.findall(r"\b\w+\b", text)
    char_len = len(text)

    sentiment = _analyzer.polarity_scores(text) if text.strip() else {"compound": 0.0, "pos": 0.0, "neg": 0.0}

    return [
        _caps_ratio(text),
        float(text.count("!")),
        float(text.count("?")),
        float(text.count("...") + text.count("…")),
        _punctuation_density(text),
        _emoji_density(text),
        float(_count_any(text, NAIVE_TRIGGER_WORDS)),
        float(_imperative_count(text)),
        sentiment["compound"],
        sentiment["pos"],
        sentiment["neg"],
        float(char_len),
        float(len(words)),
        float(np.mean([len(w) for w in words])) if words else 0.0,
        _flesch_grade(text),
    ]
