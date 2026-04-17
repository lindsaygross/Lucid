"""Runtime configuration loaded from environment variables."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Typed settings loaded from `.env` and process environment."""

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    anthropic_api_key: str = Field(..., alias="ANTHROPIC_API_KEY")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")

    reddit_client_id: str | None = Field(default=None, alias="REDDIT_CLIENT_ID")
    reddit_client_secret: str | None = Field(default=None, alias="REDDIT_CLIENT_SECRET")
    reddit_user_agent: str = Field(default="lucid-research/0.1", alias="REDDIT_USER_AGENT")

    hf_token: str | None = Field(default=None, alias="HF_TOKEN")

    model_path: str = Field(default="models/distilbert", alias="LUCID_MODEL_PATH")
    log_level: str = Field(default="INFO", alias="LUCID_LOG_LEVEL")

    # Claude model selection
    claude_labeling_model: str = "claude-sonnet-4-5"
    claude_rewrite_model: str = "claude-sonnet-4-5"
    claude_vision_model: str = "claude-sonnet-4-5"

    # Whisper: use OpenAI API if OPENAI_API_KEY set, else local model
    whisper_local_model: str = "base"

    # Pipeline limits
    max_video_duration_seconds: int = 600
    num_vision_keyframes: int = 4


_settings: Settings | None = None


def get_settings() -> Settings:
    """Cached settings accessor."""
    global _settings
    if _settings is None:
        _settings = Settings()  # type: ignore[call-arg]
    return _settings
