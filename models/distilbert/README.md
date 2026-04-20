# DistilBERT weights

The fine-tuned DistilBERT model (the deployed model for LUCID) is hosted on the Hugging Face Hub at:

**https://huggingface.co/lindsaygross32/lucid-distilbert**

## What's on the Hub

- `pytorch_model.bin` (~266 MB) — fine-tuned weights for DistilBERT + 6-output classification head
- `tokenizer.json`, `tokenizer_config.json` — the base DistilBERT tokenizer
- `README.md` — full model card with training data, evaluation metrics, intended use, and limitations
- 67 MB-parameter backbone (`distilbert-base-uncased`) + custom multi-output head (6 sigmoid dimensions)

## Why the weights aren't committed here

GitHub soft-blocks individual files over 100 MB. Committing a 266 MB `pytorch_model.bin` requires Git LFS, which adds bandwidth cost and complicates local clones. The Hugging Face Hub is the canonical location for trained model artifacts in the ML ecosystem, provides proper versioning, and is what production pulls from.

## How the backend loads the weights

`backend/inference/deep.py::DeepPredictor` resolves weights in this order:

1. If `models/distilbert/pytorch_model.bin` exists locally (e.g., you cloned after training), use the local copy.
2. Otherwise, `huggingface_hub.snapshot_download("lindsaygross32/lucid-distilbert")` pulls the weights once and caches them in `~/.cache/huggingface/`.

Both the Railway production backend and local development use the same resolution logic. The weights download once per environment, then stay cached.

## Training source of truth

The canonical training path is [`notebooks/train_lucid.ipynb`](../../notebooks/train_lucid.ipynb), run on Colab with GPU. A CPU fallback lives at [`scripts/train_deep.py`](../../scripts/train_deep.py).

## Related files in the repo

- Inference wrapper: [`backend/inference/deep.py`](../../backend/inference/deep.py)
- Training script (CPU fallback): [`scripts/train_deep.py`](../../scripts/train_deep.py)
- Colab training notebook: [`notebooks/train_lucid.ipynb`](../../notebooks/train_lucid.ipynb)
- Evaluation script: [`scripts/evaluate.py`](../../scripts/evaluate.py) and [`scripts/evaluate_gold_set.py`](../../scripts/evaluate_gold_set.py)
- Technical report: [`docs/REPORT.md`](../../docs/REPORT.md) §§5.4, 8.3, 9, 9.1
- Hugging Face model card (mirrored): [`docs/HF_MODEL_CARD.md`](../../docs/HF_MODEL_CARD.md)
