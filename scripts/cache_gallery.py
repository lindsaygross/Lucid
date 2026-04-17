"""Pre-run the full analysis pipeline on each gallery TikTok and cache results.

Reads scripts/gallery_picks.json, runs analyze_url for each, and writes
JSON to data/processed/gallery/{slug}.json. The backend's /gallery endpoint
reads from this directory.

Run after models are trained and gallery_picks.json has real URLs:
    python -m scripts.cache_gallery
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

from dotenv import load_dotenv

from backend.inference.router import InferenceRouter
from backend.pipeline import tiktok
from backend.pipeline.analyze import analyze_url

REPO_ROOT = Path(__file__).resolve().parent.parent
GALLERY_PICKS = REPO_ROOT / "scripts" / "gallery_picks.json"
GALLERY_CACHE_DIR = REPO_ROOT / "data" / "processed" / "gallery"

logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--picks", type=Path, default=GALLERY_PICKS)
    parser.add_argument("--out-dir", type=Path, default=GALLERY_CACHE_DIR)
    parser.add_argument("--model", default="deep", choices=["deep", "classical", "naive"])
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_dotenv(REPO_ROOT / ".env")

    with args.picks.open("r", encoding="utf-8") as f:
        config = json.load(f)

    router = InferenceRouter(preferred=args.model, model_dir=str(REPO_ROOT / "models"))
    args.out_dir.mkdir(parents=True, exist_ok=True)

    for pick in config["picks"]:
        slug = pick["slug"]
        url = pick.get("url")
        out_path = args.out_dir / f"{slug}.json"
        if not url or url == "TBD":
            logger.warning("skipping %s — URL not set yet in gallery_picks.json", slug)
            continue
        if out_path.exists():
            logger.info("skipping %s — already cached", slug)
            continue
        try:
            result = analyze_url(url, router)
            payload = result.to_dict()
            payload["_meta"] = {
                "slug": slug,
                "profile": pick.get("profile"),
                "primary_dimension": pick.get("primary_dimension"),
                "description": pick.get("description"),
            }
            with out_path.open("w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            logger.info("cached %s (score=%d)", slug, result.scroll_trap_score)
        except tiktok.DownloadError as exc:
            logger.warning("could not download %s: %s", slug, exc)
        except Exception as exc:  # noqa: BLE001
            logger.exception("failed caching %s: %s", slug, exc)


if __name__ == "__main__":
    main()
