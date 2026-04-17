"""Batch-process a list of TikTok URLs: download, transcribe, extract overlay.

Input: a text file with one URL per line (scripts/tiktok_urls.txt by default).
Output: CSV with columns: url, uploader, caption, transcript, overlay_text,
        fused_text, duration_seconds, likes, views, comments, platform.

Designed to be re-run safely: skips URLs already present in the output CSV.

Run: python -m scripts.scrape_tiktok --urls scripts/tiktok_urls.txt
"""

from __future__ import annotations

import argparse
import csv
import logging
from pathlib import Path

from dotenv import load_dotenv

from backend.pipeline import tiktok, transcribe, vision
from backend.pipeline.analyze import _fuse_text

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"

logger = logging.getLogger(__name__)


FIELDS = [
    "url",
    "uploader",
    "caption",
    "transcript",
    "overlay_text",
    "fused_text",
    "duration_seconds",
    "likes",
    "views",
    "comments",
    "platform",
]


def _already_processed(output_path: Path) -> set[str]:
    """Load URLs already in the output CSV to make re-runs idempotent."""
    if not output_path.exists():
        return set()
    seen: set[str] = set()
    with output_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("url"):
                seen.add(row["url"])
    return seen


def process_url(url: str) -> dict:
    """Run download + transcribe + vision on a single URL, return a flat dict."""
    downloaded = tiktok.download(url)
    try:
        transcript = transcribe.transcribe(downloaded.video_path)
        overlay = vision.extract_overlay_text(downloaded.video_path)
    finally:
        pass
    try:
        fused = _fuse_text(downloaded.caption, transcript, overlay)
        return {
            "url": url,
            "uploader": downloaded.uploader,
            "caption": downloaded.caption,
            "transcript": transcript,
            "overlay_text": overlay,
            "fused_text": fused,
            "duration_seconds": downloaded.duration_seconds,
            "likes": downloaded.like_count or "",
            "views": downloaded.view_count or "",
            "comments": downloaded.comment_count or "",
            "platform": downloaded.platform,
        }
    finally:
        downloaded.cleanup()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--urls", type=Path, default=Path("scripts/tiktok_urls.txt"))
    parser.add_argument("--output", type=Path, default=RAW_DIR / "tiktok_posts.csv")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_dotenv(REPO_ROOT / ".env")

    if not args.urls.exists():
        raise SystemExit(
            f"URL file not found: {args.urls}. Create a text file with one "
            "TikTok URL per line."
        )
    urls = [u.strip() for u in args.urls.read_text().splitlines() if u.strip() and not u.startswith("#")]
    if args.limit:
        urls = urls[: args.limit]

    already = _already_processed(args.output)
    to_process = [u for u in urls if u not in already]
    logger.info("%d URLs total, %d already done, processing %d", len(urls), len(already), len(to_process))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    mode = "a" if args.output.exists() else "w"
    with args.output.open(mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if mode == "w":
            writer.writeheader()
        for i, url in enumerate(to_process, 1):
            try:
                row = process_url(url)
                writer.writerow(row)
                f.flush()
                logger.info("[%d/%d] ok: %s", i, len(to_process), url)
            except tiktok.DownloadError as exc:
                logger.warning("[%d/%d] download failed: %s — %s", i, len(to_process), url, exc)
            except Exception as exc:  # noqa: BLE001
                logger.exception("[%d/%d] failed: %s", i, len(to_process), url)


if __name__ == "__main__":
    main()
