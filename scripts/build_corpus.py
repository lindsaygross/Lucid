"""Merge Webis + Stop Clickbait + Reddit + TikTok into a single corpus.

Output: data/processed/corpus.csv with columns: id, text, source, extra_json.

Notes:
  - We deliberately keep all sources even though Webis has its own labels
    (continuous clickbait_score). At training time, only Claude's labels
    (from scripts/label_with_claude.py) are used as ground truth. Webis's
    clickbait_score is retained in extra_json for weak-supervision experiments.
  - Text is normalized (whitespace collapsed, surrounding quotes stripped).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import logging
import re
from pathlib import Path
from typing import Iterator

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"

logger = logging.getLogger(__name__)


def _norm(text: str) -> str:
    """Normalize whitespace and strip surrounding quotes."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    text = text.strip("\"'")
    return text


def _row_id(text: str, source: str) -> str:
    """Deterministic per-row ID so re-runs produce the same IDs."""
    return f"{source}_{hashlib.sha1(text.encode('utf-8')).hexdigest()[:12]}"


def iter_webis(csv_path: Path) -> Iterator[dict]:
    if not csv_path.exists():
        logger.warning("skipping webis (file not found: %s)", csv_path)
        return
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        text = _norm(row.get("text", ""))
        if not text:
            continue
        yield {
            "id": _row_id(text, "webis"),
            "text": text,
            "source": "webis_2017",
            "extra_json": json.dumps({"weak_clickbait_score": float(row.get("clickbait_score", 0))}),
        }


def iter_stop_clickbait(csv_path: Path) -> Iterator[dict]:
    if not csv_path.exists():
        logger.warning("skipping stop_clickbait (file not found: %s)", csv_path)
        return
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        text = _norm(row.get("text", ""))
        if not text:
            continue
        yield {
            "id": _row_id(text, "stop"),
            "text": text,
            "source": "stop_clickbait_2016",
            "extra_json": json.dumps({"weak_clickbait_binary": int(row.get("clickbait_score", 0))}),
        }


def iter_reddit(csv_path: Path) -> Iterator[dict]:
    if not csv_path.exists():
        logger.warning("skipping reddit (file not found: %s)", csv_path)
        return
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        # Combine title + selftext; many posts are title-only
        title = _norm(row.get("title", ""))
        body = _norm(row.get("selftext", ""))
        text = f"{title}\n\n{body}".strip() if body else title
        if not text:
            continue
        extra = {
            "subreddit": row.get("subreddit"),
            "score": int(row.get("score", 0) or 0),
            "num_comments": int(row.get("num_comments", 0) or 0),
            "upvote_ratio": float(row.get("upvote_ratio", 0) or 0),
            "author_karma": row.get("author_karma"),
            "permalink": row.get("permalink"),
        }
        yield {
            "id": _row_id(text, "reddit"),
            "text": text,
            "source": "reddit",
            "extra_json": json.dumps(extra, default=str),
        }


def iter_tiktok(csv_path: Path) -> Iterator[dict]:
    if not csv_path.exists():
        logger.warning("skipping tiktok (file not found: %s)", csv_path)
        return
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        text = _norm(row.get("fused_text", ""))
        if not text:
            continue
        extra = {
            "url": row.get("url"),
            "platform": row.get("platform"),
            "uploader": row.get("uploader"),
            "likes": row.get("likes"),
            "views": row.get("views"),
            "comments": row.get("comments"),
            "duration_seconds": row.get("duration_seconds"),
        }
        yield {
            "id": _row_id(text, "tiktok"),
            "text": text,
            "source": "tiktok",
            "extra_json": json.dumps(extra, default=str),
        }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--max-webis", type=int, default=2000)
    parser.add_argument("--max-stop", type=int, default=1500)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    rows: list[dict] = []
    rows.extend(list(iter_webis(RAW_DIR / "webis_clickbait_2017.csv"))[: args.max_webis])
    rows.extend(list(iter_stop_clickbait(RAW_DIR / "stop_clickbait.csv"))[: args.max_stop])
    rows.extend(iter_reddit(RAW_DIR / "reddit_posts.csv"))
    rows.extend(iter_tiktok(RAW_DIR / "tiktok_posts.csv"))

    # Dedupe by id (text hash)
    seen: set[str] = set()
    unique_rows: list[dict] = []
    for r in rows:
        if r["id"] in seen:
            continue
        seen.add(r["id"])
        unique_rows.append(r)

    with args.output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "text", "source", "extra_json"])
        writer.writeheader()
        writer.writerows(unique_rows)

    breakdown = {}
    for r in unique_rows:
        breakdown[r["source"]] = breakdown.get(r["source"], 0) + 1
    logger.info("wrote %d unique rows → %s", len(unique_rows), args.output)
    for source, n in sorted(breakdown.items(), key=lambda kv: -kv[1]):
        logger.info("  %s: %d", source, n)


if __name__ == "__main__":
    main()
