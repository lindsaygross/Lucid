# Raw datasets

This directory holds the pretraining corpora LUCID ingests before rubric labeling. Files here are **not committed to the repo** — they are gitignored because they are large, regenerable, and available from their original public sources.

## What belongs here after running the pipeline

| File | Source | Size | How to fetch |
|---|---|---|---|
| `webis_clickbait_2017.csv` | [Webis Clickbait Corpus 2017](https://webis.de/data/webis-clickbait-17.html) | ~600 KB | `scripts.fetch_datasets` downloads `clickbait17-train-170630.zip` from the official [Zenodo mirror](https://zenodo.org/records/5530410), parses the per-item JSONL labels, and writes a normalized CSV. License: CC-BY 4.0. |
| `stop_clickbait.csv` | [Stop Clickbait 2016](https://github.com/bhargaviparanjape/clickbait) | ~100 KB | `scripts.fetch_datasets` downloads the gzipped `clickbait_data.gz` and `non_clickbait_data.gz` from the public GitHub release, decompresses inline, labels each line, and writes a combined CSV. |

`scripts.scrape_reddit` and `scripts.scrape_tiktok` additionally populate Reddit and TikTok samples under this directory when run. These are not part of the default merged corpus. The deployed DistilBERT was trained on Webis + Stop Clickbait only, and the TikTok scrape is used for the pre-cached demo gallery rather than training.

## Regenerating

From the repo root:

```bash
make data          # runs all three: fetch_datasets, scrape_reddit, scrape_tiktok
# or individually:
python -m scripts.fetch_datasets
python -m scripts.scrape_reddit
python -m scripts.scrape_tiktok
```

After `make data`, run `make corpus` to merge the raw sources into `data/processed/corpus.csv`. The merged corpus is 3,491 items in the current build. The next stage is `make label` to run Claude Sonnet 4.5 over that merged corpus, producing the labels DistilBERT trains on.

## Why the raw data isn't committed

1. **Regenerable.** Every file here can be reproduced by running `scripts.fetch_datasets`. There is no value in tracking byte-identical copies of publicly hosted datasets in git.
2. **Licensing.** Webis-Clickbait-17 is CC-BY 4.0; redistribution via this repo would require mirroring the license notice and attribution next to the data. The simpler path is to link upstream and let the fetch script pull canonical copies.
3. **Size.** The Webis ZIP archive is ~50 MB. Committing it would bloat the repo and slow clones without adding reproducibility beyond what the fetch script already provides.

## Related files in the repo

- Fetch script: [`scripts/fetch_datasets.py`](../../scripts/fetch_datasets.py)
- Corpus merge script: [`scripts/build_corpus.py`](../../scripts/build_corpus.py)
- Technical report: [`docs/REPORT.md`](../../docs/REPORT.md) §§2.1–2.3
- Dataset survey: [`docs/DATASETS.md`](../../docs/DATASETS.md)
