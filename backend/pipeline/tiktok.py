"""TikTok / short-form video download via yt-dlp.

Returns the downloaded media path plus metadata (caption, uploader, duration).
yt-dlp reference: https://github.com/yt-dlp/yt-dlp
"""

from __future__ import annotations

import logging
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path

import yt_dlp

logger = logging.getLogger(__name__)


@dataclass
class DownloadedVideo:
    """Result of a successful TikTok / short-video download."""

    video_path: Path
    caption: str
    uploader: str
    duration_seconds: float
    like_count: int | None
    view_count: int | None
    comment_count: int | None
    source_url: str
    platform: str  # 'tiktok', 'youtube', 'instagram', etc.

    def cleanup(self) -> None:
        """Delete the downloaded media file and parent temp dir."""
        try:
            if self.video_path.exists():
                parent = self.video_path.parent
                shutil.rmtree(parent, ignore_errors=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("failed to cleanup %s: %s", self.video_path, exc)


class DownloadError(Exception):
    """Raised when yt-dlp can't retrieve a URL (404, blocked, private, etc)."""


def download(url: str, max_duration_seconds: int = 180) -> DownloadedVideo:
    """Download a single video to a temporary directory.

    Args:
        url: Public TikTok, YouTube Shorts, or Instagram Reel URL.
        max_duration_seconds: Reject videos longer than this (guardrail against
            accidentally downloading full YouTube videos via a Shorts URL).

    Raises:
        DownloadError: If yt-dlp fails or the video exceeds duration limit.
    """
    tmpdir = Path(tempfile.mkdtemp(prefix="lucid_"))
    output_template = str(tmpdir / "%(id)s.%(ext)s")

    ydl_opts = {
        "format": "best[ext=mp4]/best",
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "merge_output_format": "mp4",
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as exc:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise DownloadError(f"yt-dlp could not download {url}: {exc}") from exc

    duration = float(info.get("duration") or 0)
    if duration > max_duration_seconds:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise DownloadError(
            f"video too long: {duration:.0f}s exceeds limit of {max_duration_seconds}s"
        )

    video_files = list(tmpdir.glob("*.mp4")) + list(tmpdir.glob("*.webm"))
    if not video_files:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise DownloadError(f"yt-dlp reported success but no video file found at {url}")

    return DownloadedVideo(
        video_path=video_files[0],
        caption=(info.get("description") or info.get("title") or "").strip(),
        uploader=(info.get("uploader") or info.get("channel") or "unknown").strip(),
        duration_seconds=duration,
        like_count=info.get("like_count"),
        view_count=info.get("view_count"),
        comment_count=info.get("comment_count"),
        source_url=url,
        platform=_platform_from_url(url),
    )


def _platform_from_url(url: str) -> str:
    """Infer the source platform from the URL for display/analytics."""
    host = url.lower()
    if "tiktok.com" in host:
        return "tiktok"
    if "youtube.com/shorts" in host or "youtu.be" in host:
        return "youtube_shorts"
    if "instagram.com" in host:
        return "instagram"
    return "unknown"
