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
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.config import get_settings
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

_default_origins = [
    "https://lucid-seven-pied.vercel.app",
    "https://lucid-git-main-lindsay-gross-projects.vercel.app",
]
_extra = os.getenv("LUCID_CORS_EXTRA_ORIGINS", "")
if _extra:
    _default_origins.extend([o.strip() for o in _extra.split(",") if o.strip()])
_allow_origins: list[str] | str
if os.getenv("LUCID_CORS_ALLOW_ALL") == "1":
    _allow_origins = ["*"]
else:
    _allow_origins = _default_origins + [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_origin_regex=r"https://lucid-[a-z0-9]+-lindsay-gross-projects\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


_router: InferenceRouter | None = None


def get_router() -> InferenceRouter:
    """Lazy-initialize the InferenceRouter on first request.

    `LUCID_PREFERRED_MODEL` picks the head of the fallback chain
    (deep -> classical -> naive). `LUCID_HF_REPO` overrides the default
    HuggingFace repo used by the deep predictor when local weights aren't
    bundled (which is the normal prod case).
    """
    global _router
    if _router is None:
        settings = get_settings()
        preferred = os.getenv("LUCID_PREFERRED_MODEL", "deep")
        _router = InferenceRouter(
            preferred=preferred,
            model_dir=str(REPO_ROOT / "models"),
            hf_repo=settings.hf_repo,
        )
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


class CompareRequest(BaseModel):
    """Input for POST /analyze/compare — scores one text across all 3 models."""

    text: str = Field(..., min_length=1, description="Text to score across all 3 models")


@app.post("/analyze/compare")
def analyze_compare(req: CompareRequest) -> dict:
    """Score the same text with naive + classical + deep and return all three.

    Used by the frontend's live-compare mode to demonstrate the F1 / MAE /
    calibration differences at inference time. Deep model pulls from HF Hub
    on first call, then stays warm in memory.
    """
    from backend.inference.naive import NaivePredictor

    text = req.text.strip()
    settings = get_settings()
    out: dict[str, dict] = {"text": text, "predictions": {}}

    # Naive — always available
    try:
        naive = NaivePredictor()
        p = naive.predict(text)
        out["predictions"]["naive"] = {
            "scroll_trap_score": p.scroll_trap_score,
            "dimension_scores": p.dimension_scores,
            "dimension_present": p.dimension_present,
        }
    except Exception as exc:  # noqa: BLE001
        out["predictions"]["naive"] = {"error": str(exc)}

    # Classical
    try:
        from backend.inference.classical import ClassicalPredictor
        classical = ClassicalPredictor(REPO_ROOT / "models" / "classical.pkl")
        p = classical.predict(text)
        out["predictions"]["classical"] = {
            "scroll_trap_score": p.scroll_trap_score,
            "dimension_scores": p.dimension_scores,
            "dimension_present": p.dimension_present,
        }
    except Exception as exc:  # noqa: BLE001
        out["predictions"]["classical"] = {"error": str(exc)}

    # Deep
    try:
        from backend.inference.deep import DeepPredictor
        deep = DeepPredictor(
            model_dir=str(REPO_ROOT / "models" / "distilbert"),
            hf_repo=settings.hf_repo,
        )
        p = deep.predict(text)
        out["predictions"]["deep"] = {
            "scroll_trap_score": p.scroll_trap_score,
            "dimension_scores": p.dimension_scores,
            "dimension_present": p.dimension_present,
        }
    except Exception as exc:  # noqa: BLE001
        out["predictions"]["deep"] = {"error": str(exc)}

    return out


class ExplainRequest(BaseModel):
    """Input for POST /analyze/explain — per-dimension token attributions."""

    text: str = Field(..., min_length=1)
    top_k: int = Field(default=8, ge=1, le=30)


@app.post("/analyze/explain")
def analyze_explain(req: ExplainRequest) -> dict:
    """Per-dimension Integrated Gradients attributions over input tokens.

    For each of the 6 manipulation dimensions, returns the top-k tokens that
    most push the model's pre-sigmoid logit toward (positive attribution) or
    away from (negative) "this tactic is present." Uses a PAD-token baseline
    with 24-step midpoint Riemann sum (Sundararajan, Taly, Yan 2017).

    Response:
      {
        "text": "...",
        "scroll_trap_score": int,
        "dimension_scores": {dim: float, ...},
        "dimension_tokens": {dim: [{"token", "position", "attribution"}], ...}
      }
    """
    from backend.inference.deep import DeepPredictor

    settings = get_settings()
    try:
        deep = DeepPredictor(
            model_dir=str(REPO_ROOT / "models" / "distilbert"),
            hf_repo=settings.hf_repo,
        )
        pred, per_dim = deep.explain(req.text.strip(), top_k=req.top_k)
        return {
            "text": req.text.strip(),
            "scroll_trap_score": pred.scroll_trap_score,
            "dimension_scores": pred.dimension_scores,
            "dimension_present": pred.dimension_present,
            "dimension_tokens": per_dim,
        }
    except Exception as exc:  # noqa: BLE001
        logger.exception("explain failed")
        raise HTTPException(500, f"Explain failed: {exc}") from exc


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
