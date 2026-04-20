# Trained models

This directory holds the model artifacts the LUCID backend loads at inference time.

## What's here

| Artifact | File | Size | Notes |
|---|---|---|---|
| Classical XGBoost + TF-IDF + stylometry | `classical.pkl` | ~50 KB | Committed. Loaded by `backend/inference/classical.py`. |
| Fine-tuned DistilBERT (deployed model) | `distilbert/` | ~266 MB | **Not committed.** Pulled from the Hugging Face Hub on first use. |

## Where the DistilBERT weights live

The fine-tuned DistilBERT is hosted on the Hugging Face Hub, not in this repo:

- **Model repo:** [`lindsaygross32/lucid-distilbert`](https://huggingface.co/lindsaygross32/lucid-distilbert)
- **Files there:** `pytorch_model.bin` (~266 MB), `tokenizer.json`, `tokenizer_config.json`, plus a detailed model card
- **Version control:** handled by the Hub, not by git

The backend's `DeepPredictor` (`backend/inference/deep.py`) resolves weights as follows:
1. If `models/distilbert/pytorch_model.bin` exists locally, use it.
2. Otherwise, `snapshot_download` from the Hub repo and cache it.

This means the repo builds and runs without the weights being committed. On Railway, the first request triggers a one-time ~266 MB download; subsequent requests hit the local cache.

## Why not commit the DistilBERT weights here

1. **Size.** GitHub soft-blocks individual files over 100 MB. Committing would require Git LFS, which adds bandwidth cost and complexity.
2. **Canonical location.** Model cards, version history, and download stats belong on the Hub.
3. **Convention.** Standard ML practice is to track code that loads models, not the model artifacts themselves. Small classical bundles are a fine exception.

## Regenerating the models locally

See the top-level [`README.md`](../README.md) for the full pipeline. In brief:

```bash
make train-naive        # rule-based; regenerates trigger cache
make train-classical    # writes models/classical.pkl
make train-deep         # CPU fallback; canonical GPU path is notebooks/train_lucid.ipynb on Colab
```

After training DistilBERT, upload to the Hub (the repo's canonical model URL) rather than committing the weights here.
