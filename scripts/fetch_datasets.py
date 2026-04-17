"""Download Webis Clickbait Corpus 2017 + Stop Clickbait as pretraining data.

Webis: https://webis.de/data/webis-clickbait-17.html (Zenodo mirror)
Stop Clickbait: https://github.com/bhargaviparanjape/clickbait

Saves normalized CSVs under data/raw/ with columns: text, clickbait_score, source.
Run: python -m scripts.fetch_datasets
"""

from __future__ import annotations

import argparse
import gzip
import json
import logging
import zipfile
from pathlib import Path

import pandas as pd
import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"

logger = logging.getLogger(__name__)


STOP_CLICKBAIT_URLS = {
    "clickbait": (
        "https://raw.githubusercontent.com/bhargaviparanjape/clickbait/"
        "master/dataset/clickbait_data.gz"
    ),
    "non_clickbait": (
        "https://raw.githubusercontent.com/bhargaviparanjape/clickbait/"
        "master/dataset/non_clickbait_data.gz"
    ),
}


def fetch_stop_clickbait(output_path: Path) -> None:
    """Download Chakraborty et al. 2016 and save as one CSV."""
    rows: list[dict] = []
    for label, url in STOP_CLICKBAIT_URLS.items():
        logger.info("fetching %s", url)
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        score = 1.0 if label == "clickbait" else 0.0
        text = gzip.decompress(r.content).decode("utf-8", errors="replace")
        for line in text.splitlines():
            line = line.strip()
            if line:
                rows.append({"text": line, "clickbait_score": score, "source": "stop_clickbait_2016"})
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    logger.info("wrote %d rows → %s", len(df), output_path)


WEBIS_ZIP_URL = "https://zenodo.org/records/5530410/files/clickbait17-train-170630.zip"


def fetch_webis_clickbait(output_path: Path, cache_dir: Path) -> None:
    """Download Webis Clickbait Corpus 2017 train split and normalize to CSV."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    zip_path = cache_dir / "clickbait17-train.zip"

    if not zip_path.exists():
        logger.info("fetching %s (large — ~50MB)", WEBIS_ZIP_URL)
        with requests.get(WEBIS_ZIP_URL, stream=True, timeout=300) as r:
            r.raise_for_status()
            with zip_path.open("wb") as f:
                for chunk in r.iter_content(chunk_size=1 << 16):
                    f.write(chunk)

    # Webis ships two files: instances.jsonl (posts) and truth.jsonl (labels)
    with zipfile.ZipFile(zip_path) as z:
        names = z.namelist()
        instances_name = next(n for n in names if n.endswith("instances.jsonl"))
        truth_name = next(n for n in names if n.endswith("truth.jsonl"))
        with z.open(instances_name) as f:
            instances = {r["id"]: r for r in (json.loads(line) for line in f)}
        with z.open(truth_name) as f:
            truths = {r["id"]: r for r in (json.loads(line) for line in f)}

    rows: list[dict] = []
    for _id, inst in instances.items():
        truth = truths.get(_id)
        if truth is None:
            continue
        # `postText` is a list of post text fragments; join them
        post_text = " ".join(inst.get("postText") or []).strip()
        if not post_text:
            continue
        score = float(truth.get("truthMean", 0.0))  # continuous [0, 1]
        rows.append({"text": post_text, "clickbait_score": score, "source": "webis_2017"})

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    logger.info("wrote %d rows → %s", len(df), output_path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--skip-webis",
        action="store_true",
        help="Skip the Webis corpus download (it's ~50MB)",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    cache_dir = RAW_DIR / ".cache"

    fetch_stop_clickbait(RAW_DIR / "stop_clickbait.csv")
    if not args.skip_webis:
        fetch_webis_clickbait(RAW_DIR / "webis_clickbait_2017.csv", cache_dir)


if __name__ == "__main__":
    main()
