"""Root-level FastAPI entrypoint.

Run with:
    uvicorn app:app --reload --port 8000

Delegates to backend.main:app per repository-layout spec.
"""

from backend.main import app

__all__ = ["app"]
