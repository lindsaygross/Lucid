"""Scrape ~500 Reddit posts via PRAW across a curated set of subreddits.

We sample from subreddits known for manipulative framing (for positive
signal) and from neutral/informational subs (for negative signal).
Engagement metrics (score, comments, upvote_ratio) are retained for the
"does the algorithm reward manipulation?" experiment.

Run: python -m scripts.scrape_reddit
Requires REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT in .env.
"""

from __future__ import annotations

import argparse
import csv
import logging
import os
from dataclasses import asdict, dataclass
from pathlib import Path

import praw
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"

logger = logging.getLogger(__name__)


# Mix of "high manipulation density" subs and neutral subs for label balance.
MANIPULATION_HEAVY = [
    "AITAH",
    "AmItheAsshole",
    "relationship_advice",
    "antiwork",
    "entitledparents",
    "ChoosingBeggars",
    "LifeProTips",
    "GetMotivated",
]

NEUTRAL = [
    "AskHistorians",
    "explainlikeimfive",
    "science",
    "technology",
    "books",
    "philosophy",
]


@dataclass
class RedditPost:
    """Flat record for a single scraped Reddit post."""

    id: str
    subreddit: str
    title: str
    selftext: str
    score: int
    num_comments: int
    upvote_ratio: float
    created_utc: float
    author: str
    author_karma: int | None
    permalink: str
    source: str = "reddit"


def _reddit_client() -> praw.Reddit:
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT", "lucid-research/0.1")
    if not client_id or not client_secret:
        raise SystemExit(
            "REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set in .env. "
            "Create an app at https://www.reddit.com/prefs/apps (select 'script')."
        )
    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )


def scrape_subreddit(
    reddit: praw.Reddit,
    subreddit_name: str,
    limit: int,
    time_filter: str = "month",
) -> list[RedditPost]:
    """Pull `limit` hot posts from `subreddit_name`, skipping stickied/deleted."""
    subreddit = reddit.subreddit(subreddit_name)
    out: list[RedditPost] = []
    for submission in subreddit.top(time_filter=time_filter, limit=limit * 2):
        if submission.stickied or submission.over_18:
            continue
        if not (submission.selftext or submission.title):
            continue
        try:
            author_karma = (
                submission.author.link_karma + submission.author.comment_karma
                if submission.author
                else None
            )
        except Exception:  # noqa: BLE001
            author_karma = None
        out.append(
            RedditPost(
                id=submission.id,
                subreddit=subreddit_name,
                title=submission.title,
                selftext=submission.selftext or "",
                score=int(submission.score),
                num_comments=int(submission.num_comments),
                upvote_ratio=float(submission.upvote_ratio),
                created_utc=float(submission.created_utc),
                author=str(submission.author) if submission.author else "[deleted]",
                author_karma=author_karma,
                permalink=f"https://reddit.com{submission.permalink}",
            )
        )
        if len(out) >= limit:
            break
    logger.info("scraped %d posts from r/%s", len(out), subreddit_name)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--per-subreddit", type=int, default=35)
    parser.add_argument("--time-filter", default="month", choices=["week", "month", "year", "all"])
    parser.add_argument("--output", type=Path, default=RAW_DIR / "reddit_posts.csv")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_dotenv(REPO_ROOT / ".env")

    reddit = _reddit_client()

    all_posts: list[RedditPost] = []
    for sub in MANIPULATION_HEAVY + NEUTRAL:
        try:
            all_posts.extend(
                scrape_subreddit(reddit, sub, limit=args.per_subreddit, time_filter=args.time_filter)
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("failed to scrape r/%s: %s", sub, exc)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(asdict(all_posts[0]).keys()))
        writer.writeheader()
        writer.writerows(asdict(p) for p in all_posts)
    logger.info("wrote %d rows → %s", len(all_posts), args.output)


if __name__ == "__main__":
    main()
