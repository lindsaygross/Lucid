"""On-screen text extraction from video keyframes via Claude Vision.

TikToks and Reels often contain text overlays ("WAIT FOR IT", "POV:", etc.)
that carry manipulation tactics distinct from the spoken transcript.
We extract N evenly-spaced keyframes and pass them to Claude Vision to
read any on-screen text.
"""

from __future__ import annotations

import base64
import logging
import subprocess
import tempfile
from pathlib import Path

import anthropic

from backend.config import get_settings

logger = logging.getLogger(__name__)


_OCR_PROMPT = (
    "Read any on-screen text overlays, captions burned into the video, "
    "or stylized text that appears in this video keyframe. Ignore logos, "
    "usernames, app UI, and timestamps. Return ONLY the on-screen text, "
    "verbatim, preserving line breaks. If there is no on-screen text, "
    "return an empty string."
)


def extract_overlay_text(video_path: Path, num_keyframes: int | None = None) -> str:
    """Extract on-screen text from `num_keyframes` frames sampled across the video.

    Returns the deduplicated union of all text found, joined by newlines.
    Empty string if nothing is detected or if an error occurs.
    """
    settings = get_settings()
    n = num_keyframes or settings.num_vision_keyframes

    frames = _extract_keyframes(video_path, n=n)
    if not frames:
        return ""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    all_text: list[str] = []
    for frame_path in frames:
        try:
            text = _read_frame(client, frame_path, model=settings.claude_vision_model)
        except Exception as exc:  # noqa: BLE001
            logger.warning("vision OCR failed on %s: %s", frame_path, exc)
            text = ""
        if text:
            all_text.append(text)
        frame_path.unlink(missing_ok=True)

    return _dedupe_lines(all_text)


def _extract_keyframes(video_path: Path, n: int) -> list[Path]:
    """Sample `n` evenly-spaced frames from the video via ffmpeg."""
    duration = _video_duration_seconds(video_path)
    if duration <= 0:
        return []

    tmpdir = Path(tempfile.mkdtemp(prefix="lucid_frames_"))
    frames: list[Path] = []
    for i in range(n):
        timestamp = duration * (i + 0.5) / n
        out = tmpdir / f"frame_{i:02d}.jpg"
        cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            f"{timestamp:.2f}",
            "-i",
            str(video_path),
            "-vframes",
            "1",
            "-q:v",
            "3",
            str(out),
        ]
        result = subprocess.run(cmd, capture_output=True)  # noqa: S603
        if result.returncode == 0 and out.exists():
            frames.append(out)
    return frames


def _video_duration_seconds(video_path: Path) -> float:
    """Probe video duration via ffprobe."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(video_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)  # noqa: S603
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def _read_frame(
    client: anthropic.Anthropic,
    frame_path: Path,
    model: str,
) -> str:
    """Send a single frame to Claude Vision and return extracted text."""
    image_b64 = base64.standard_b64encode(frame_path.read_bytes()).decode("ascii")
    message = client.messages.create(
        model=model,
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_b64,
                        },
                    },
                    {"type": "text", "text": _OCR_PROMPT},
                ],
            }
        ],
    )
    text_blocks = [b.text for b in message.content if b.type == "text"]
    return "\n".join(text_blocks).strip()


def _dedupe_lines(texts: list[str]) -> str:
    """Dedupe lines across frames while preserving order of first occurrence."""
    seen: set[str] = set()
    out: list[str] = []
    for t in texts:
        for line in t.split("\n"):
            normalized = line.strip().lower()
            if normalized and normalized not in seen:
                seen.add(normalized)
                out.append(line.strip())
    return "\n".join(out)
