"""Full-analysis orchestrator.

Takes a URL, runs download → transcribe → vision → model → rewrite,
and returns a structured result for the frontend.
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass
from typing import Any

from backend.config import get_settings
from backend.inference.router import InferenceRouter
from backend.pipeline import rewriter, tiktok, transcribe, vision

logger = logging.getLogger(__name__)

DIMENSIONS = [
    "outrage_bait",
    "fomo_trigger",
    "engagement_bait",
    "emotional_manipulation",
    "curiosity_gap",
    "dopamine_design",
]


@dataclass
class AnalysisResult:
    """End-to-end analysis of a single URL, serialized to JSON for the frontend."""

    source_url: str
    platform: str
    uploader: str
    duration_seconds: float
    caption: str
    transcript: str
    overlay_text: str
    fused_text: str
    scroll_trap_score: int  # 0–100
    dimension_scores: dict[str, float]  # dim -> 0..1
    dimension_present: dict[str, bool]
    rewrite: str
    engagement: dict[str, int | None]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def analyze_url(url: str, router: InferenceRouter) -> AnalysisResult:
    """Run the full pipeline on a single URL.

    Raises:
        tiktok.DownloadError: If the URL can't be downloaded.
    """
    settings = get_settings()
    downloaded = tiktok.download(url, max_duration_seconds=settings.max_video_duration_seconds)

    try:
        logger.info("transcribing %s (%.1fs)", downloaded.source_url, downloaded.duration_seconds)
        transcript = transcribe.transcribe(downloaded.video_path)

        logger.info("extracting overlay text for %s", downloaded.source_url)
        overlay_text = vision.extract_overlay_text(downloaded.video_path)

        fused = _fuse_text(downloaded.caption, transcript, overlay_text)

        logger.info("scoring %s (%d chars)", downloaded.source_url, len(fused))
        prediction = router.predict(fused)

        logger.info("rewriting %s", downloaded.source_url)
        clean_rewrite = rewriter.rewrite(fused)

        return AnalysisResult(
            source_url=downloaded.source_url,
            platform=downloaded.platform,
            uploader=downloaded.uploader,
            duration_seconds=downloaded.duration_seconds,
            caption=downloaded.caption,
            transcript=transcript,
            overlay_text=overlay_text,
            fused_text=fused,
            scroll_trap_score=prediction.scroll_trap_score,
            dimension_scores=prediction.dimension_scores,
            dimension_present=prediction.dimension_present,
            rewrite=clean_rewrite,
            engagement={
                "likes": downloaded.like_count,
                "views": downloaded.view_count,
                "comments": downloaded.comment_count,
            },
        )
    finally:
        downloaded.cleanup()


def analyze_text(text: str, router: InferenceRouter) -> AnalysisResult:
    """Fast path for the text-paste fallback (no URL, no video).

    Skips download + transcribe + vision; just scores the pasted text.
    """
    text = text.strip()
    prediction = router.predict(text)
    clean_rewrite = rewriter.rewrite(text)

    return AnalysisResult(
        source_url="",
        platform="text",
        uploader="",
        duration_seconds=0.0,
        caption=text,
        transcript="",
        overlay_text="",
        fused_text=text,
        scroll_trap_score=prediction.scroll_trap_score,
        dimension_scores=prediction.dimension_scores,
        dimension_present=prediction.dimension_present,
        rewrite=clean_rewrite,
        engagement={"likes": None, "views": None, "comments": None},
    )


def _fuse_text(caption: str, transcript: str, overlay: str) -> str:
    """Combine the three text streams into a single labeled block for the model.

    Labels preserved so the model can learn that overlay text behaves
    differently from spoken transcript.
    """
    parts: list[str] = []
    if caption:
        parts.append(f"[CAPTION] {caption.strip()}")
    if transcript:
        parts.append(f"[TRANSCRIPT] {transcript.strip()}")
    if overlay:
        parts.append(f"[OVERLAY] {overlay.strip()}")
    return "\n\n".join(parts)
