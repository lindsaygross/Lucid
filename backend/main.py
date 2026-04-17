"""FastAPI application entrypoint.

Exposes:
  GET  /health              — liveness probe
  POST /analyze             — analyze a TikTok URL or pasted text
  GET  /gallery             — list pre-cached demo examples
  GET  /gallery/{slug}      — fetch a cached analysis by slug
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.inference.router import InferenceRouter
from backend.pipeline import tiktok
from backend.pipeline.analyze import analyze_text, analyze_url

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = REPO_ROOT / "data" / "processed" / "gallery"


app = FastAPI(
    title="LUCID API",
    description="Short-form video manipulation analyzer",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tightened via FRONTEND_URL in production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


_router: InferenceRouter | None = None


def get_router() -> InferenceRouter:
    """Lazy-initialize the InferenceRouter on first request."""
    global _router
    if _router is None:
        _router = InferenceRouter(preferred="deep", model_dir=str(REPO_ROOT / "models"))
    return _router


class AnalyzeRequest(BaseModel):
    """Input schema for POST /analyze."""

    url: str | None = Field(
        default=None,
        description="Public TikTok / YouTube Shorts URL",
        examples=["https://www.tiktok.com/@user/video/1234"],
    )
    text: str | None = Field(
        default=None,
        description="Pasted text fallback when no URL is available",
    )


@app.get("/health")
def health() -> dict[str, str]:
    """Kubernetes-style liveness probe."""
    return {"status": "ok"}


@app.post("/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    """Analyze a URL or pasted text.

    Exactly one of `url` or `text` must be provided.
    """
    if not req.url and not req.text:
        raise HTTPException(400, "Provide either 'url' or 'text'")
    if req.url and req.text:
        raise HTTPException(400, "Provide only one of 'url' or 'text'")

    router = get_router()
    try:
        if req.url:
            result = analyze_url(req.url, router)
        else:
            assert req.text is not None  # for type-checker
            result = analyze_text(req.text, router)
        return result.to_dict()
    except tiktok.DownloadError as exc:
        raise HTTPException(
            422,
            f"Could not fetch video: {exc}. Try a different URL or paste the caption instead.",
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("analyze failed")
        raise HTTPException(500, f"Analysis failed: {exc}") from exc


@app.get("/gallery")
def list_gallery() -> list[dict]:
    """List all pre-cached demo examples.

    Each example is a JSON file under data/processed/gallery/ with the same
    schema as POST /analyze responses.
    """
    if not GALLERY_DIR.exists():
        return []
    items: list[dict] = []
    for path in sorted(GALLERY_DIR.glob("*.json")):
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            items.append({
                "slug": path.stem,
                "uploader": data.get("uploader", ""),
                "caption": data.get("caption", "")[:120],
                "scroll_trap_score": data.get("scroll_trap_score"),
            })
        except Exception as exc:  # noqa: BLE001
            logger.warning("skipping malformed gallery file %s: %s", path, exc)
    return items


@app.get("/gallery/{slug}")
def fetch_gallery_item(slug: str) -> dict:
    """Fetch a pre-cached analysis by slug."""
    path = GALLERY_DIR / f"{slug}.json"
    if not path.exists():
        raise HTTPException(404, f"No gallery item named {slug!r}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)
