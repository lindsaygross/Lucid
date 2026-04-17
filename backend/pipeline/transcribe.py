"""Audio transcription via OpenAI Whisper.

Uses the OpenAI API if `OPENAI_API_KEY` is set (faster, better accuracy),
otherwise falls back to the local openai-whisper package (free, slower).
"""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path

from backend.config import get_settings

logger = logging.getLogger(__name__)


def transcribe(video_path: Path) -> str:
    """Return the transcript of the audio track of a video file.

    Empty string if no speech is detected or the audio track is silent.
    """
    audio_path = _extract_audio(video_path)
    try:
        return _transcribe_audio(audio_path)
    finally:
        audio_path.unlink(missing_ok=True)


def _extract_audio(video_path: Path) -> Path:
    """Extract audio from video as mono 16kHz WAV using ffmpeg."""
    audio_path = video_path.with_suffix(".wav")
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        str(audio_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)  # noqa: S603
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.strip()[:500]}")
    return audio_path


def _transcribe_audio(audio_path: Path) -> str:
    """Dispatch to API or local Whisper based on config."""
    settings = get_settings()
    if settings.openai_api_key:
        return _transcribe_openai(audio_path, api_key=settings.openai_api_key)
    return _transcribe_local(audio_path, model_name=settings.whisper_local_model)


def _transcribe_openai(audio_path: Path, api_key: str) -> str:
    """OpenAI Whisper API — ~$0.006/minute. Fast, accurate."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    with audio_path.open("rb") as f:
        resp = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text",
        )
    return str(resp).strip()


def _transcribe_local(audio_path: Path, model_name: str = "base") -> str:
    """Local openai-whisper package. First call downloads ~140MB model."""
    import whisper  # imported lazily — model load is slow

    model = whisper.load_model(model_name)
    result = model.transcribe(str(audio_path), fp16=False)
    return str(result.get("text", "")).strip()
