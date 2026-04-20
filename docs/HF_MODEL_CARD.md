---
language:
- en
license: mit
library_name: transformers
tags:
- distilbert
- text-classification
- multi-task
- interpretability
- trust-and-safety
- content-moderation
- tiktok
- manipulation-detection
datasets:
- custom
metrics:
- f1
- mae
- r2
base_model: distilbert-base-uncased
pipeline_tag: text-classification
model-index:
- name: lucid-distilbert
  results:
  - task:
      type: text-classification
      name: Multi-label manipulation tactic classification
    metrics:
      - type: f1
        value: 0.334
        name: Macro F1
      - type: accuracy
        value: 0.904
        name: Macro accuracy
  - task:
      type: text-regression
      name: Composite manipulation severity
    metrics:
      - type: mae
        value: 5.90
        name: Composite MAE (0–100 scale)
      - type: r_squared
        value: 0.368
        name: Composite R²
---

# LUCID — DistilBERT for Short-Form Video Manipulation Detection

> *"You're not addicted. You're being engineered. See how."*

`lucid-distilbert` is a fine-tuned DistilBERT classifier that scores short-form social video text (TikTok captions + transcripts + on-screen overlay OCR) along **six research-grounded psychological manipulation dimensions**:

| Dimension | Academic grounding |
|---|---|
| Outrage Bait | Crockett 2017; Brady et al. 2017, 2021 |
| FOMO Trigger | Przybylski et al. 2013; Cialdini 2009 |
| Engagement Bait | Meta 2017; Munger 2020; Mathur et al. 2019 |
| Emotional Manipulation | Cialdini et al. 1987; Small et al. 2007; Kramer et al. 2014 |
| Curiosity Gap | Loewenstein 1994; Blom & Hansen 2015; Scott 2021 |
| Dopamine Design | Skinner 1953; Alter 2017; Montag et al. 2019 |

The model has two parallel output heads on a shared `[CLS]` representation:
- A **regression head** predicting the 0–100 composite Scroll Trap Score (sigmoid × 100).
- A **multi-label head** with 6 binary classifiers — one per dimension — each returning `P(tactic present)`.

Per-dimension probabilities are trained with binary cross-entropy against rubric severity labels binarized at severity ≥ 1. The composite regression head is trained with MSE against rubric-derived ground truth.

---

## Intended use

**Primary use case.** Research / educational tool for analyzing short-form video content at the post level. Given a fused text stream from a single TikTok-style post (caption + audio transcript + on-screen text), return a severity score per manipulation dimension and an aggregate 0–100 composite.

**Users this was built for.** Trust & Safety practitioners, platform policy researchers, media literacy educators, and end users who want vocabulary for what a specific post is doing to their attention.

**Not intended for.**
- Individual creator moderation or takedowns. The model scores *posts*, not *intent*; using it to judge whether a specific creator is acting in bad faith would misread the labels.
- Demographic profiling of creators or audiences.
- Any high-stakes automated decision without human review.
- Content in languages or cultural contexts other than English-language, predominantly US/UK social-media discourse. Manipulation norms are culturally situated; applying the model outside its training distribution requires rubric reconstruction.

---

## Training data

**Total labeled corpus: 3,491 items.**

| Source | Approx. size | Purpose |
|---|---|---|
| Webis Clickbait Corpus 2017 | ~2,000 | Pretraining-style signal; continuous severity |
| Stop Clickbait 2016 | ~1,500 | Weak supervision; binary clickbait |
| TikTok (yt-dlp scrape) | ~200 | In-domain evaluation + demo gallery |

### Labeling — LLM-as-judge with human validation

Because existing datasets carry only binary clickbait labels, we used **Claude Sonnet 4.5** (Anthropic) as a scalable labeling oracle, prompted with the 6-dimension rubric above (full text in [repo `docs/RUBRIC.md`](https://github.com/lindsaygross/Lucid/blob/main/docs/RUBRIC.md)) and 8 few-shot examples per severity level. This approach is explicitly in the lineage of **Constitutional AI / RLAIF** (Bai et al. 2022) — an LLM prompted with human-written principles produces training labels for a smaller supervised model.

We validate Claude's labels against a **100-post human gold set** hand-labeled by the author, reporting per-dimension **Spearman rank correlation** and **Krippendorff's α (ordinal)** as agreement metrics.

*Agreement numbers appear in the companion technical report once gold-set labeling completes.*

---

## Training

- **Base model.** `distilbert-base-uncased` (Sanh et al. 2019), 66M parameters.
- **Fine-tuning.** Full fine-tune (no layer freezing). Dual heads attached to the `[CLS]` pooled representation.
- **Optimizer.** AdamW, `lr=2e-5`, `weight_decay=0.01`.
- **Schedule.** Linear LR with 10% warmup, 4 epochs.
- **Batch size.** 32.
- **Max sequence length.** 256 tokens.
- **Loss.** `MSE(composite) + 1.0 × BCEWithLogitsLoss(dimensions)`.
- **Hardware.** Single NVIDIA H100 via Duke Colab credits. Training completed in ~2 minutes.
- **Checkpoint selection.** Best epoch by validation composite MAE; saved state is from epoch 4 with val MAE=5.88.

### Reproducibility

- Full training notebook: [`notebooks/train_lucid.ipynb`](https://github.com/lindsaygross/Lucid/blob/main/notebooks/train_lucid.ipynb)
- Training script (CPU fallback): [`scripts/train_deep.py`](https://github.com/lindsaygross/Lucid/blob/main/scripts/train_deep.py)
- Random seed: 42
- Splits: 70/15/15 stratified on composite-score bins

---

## Evaluation

Held-out test split of **529 items** (stratified 15% of corpus).

### Test-set metrics

| Metric | Value |
|---|---|
| Macro F1 (per-dim binary, threshold ≥1) | **0.334** |
| Macro accuracy (per-dim binary) | **0.904** |
| Composite MAE (0–100 scale) | **5.90** |
| Composite RMSE | **7.12** |
| Composite R² | **+0.368** |

### How to interpret

- **Positive composite R²** (+0.368) means the model explains real variance in the composite score beyond a constant mean predictor. For comparison, the naive keyword-matching baseline has R²=−0.594 and the classical (TF-IDF + XGBoost) baseline has R²=−1.462. Deep is the only model that beats the mean.
- The macro F1 of 0.334 is lower than the classical baseline's 0.425. This reflects an intentional calibration difference: the deep model's per-dim probabilities are softer, producing fewer firings but better-calibrated confidences. See [the technical report](https://github.com/lindsaygross/Lucid/blob/main/docs/REPORT.md) §6 for the full per-dimension breakdown.

### Noise robustness

Character-level noise injection on 100 test items (seed=7), mean |Δ score| on the 0–100 composite:

| Noise rate | Mean Δ | Median Δ | Max Δ |
|---|---|---|---|
| 5% | 4.2 | 2.0 | 26 |
| 10% | 5.4 | 4.0 | 27 |
| 20% | 7.7 | 5.5 | 37 |
| 35% | 10.2 | 9.0 | 32 |

At realistic OCR / transcription noise levels (5–10%), the composite Scroll Trap Score shifts ~4–5 points on a 0–100 scale — *graceful degradation*, suggesting the model has learned semantic rather than surface-lexical features.

---

## Usage

### Via HuggingFace `transformers`

This model has a custom multi-output head (`composite_head` + `dimension_head`), so it cannot be loaded with `AutoModelForSequenceClassification`. Use the repo's inference module:

```python
from backend.inference.deep import DeepPredictor

predictor = DeepPredictor(hf_repo="lindsaygross32/lucid-distilbert")
pred = predictor.predict("DON'T SCROLL! HANG ON! HANG ON!! I have one question...")

print(pred.scroll_trap_score)
# 28
print(pred.dimension_scores)
# {'outrage_bait': 0.11, 'fomo_trigger': 0.23, 'engagement_bait': 0.29,
#  'emotional_manipulation': 0.04, 'curiosity_gap': 0.68, 'dopamine_design': 0.25}
```

### Per-dimension token attribution (Integrated Gradients)

```python
pred, per_dim_tokens = predictor.explain(
    "DON'T SCROLL! HANG ON! Will you be my friend?",
    top_k=8,
)
# per_dim_tokens["engagement_bait"] -> [
#   {"token": "you", "position": 9, "attribution": +0.34},
#   {"token": "question", "position": 14, "attribution": +0.26},
#   ...
# ]
```

Integrated Gradients (Sundararajan, Taly, Yan 2017) produces signed per-token attributions. Positive attribution → token pushes the head toward "tactic present," negative → toward absent.

### Live demo

https://lucid-seven-pied.vercel.app

---

## Limitations and ethical considerations

1. **Intent vs. effect.** The model measures tactic *presence*, not creator *intent*. A post using emotional appeals to raise money for a sick family member scores higher on Emotional Manipulation — but that is not a judgment of bad faith. Any downstream tooling built on top of this model must preserve that distinction.

2. **Cultural and linguistic scope.** Training data is English-language, predominantly US-origin social content. Manipulation norms vary across cultures; the model should not be used on non-English content or in cultures with meaningfully different rhetorical conventions without rubric reconstruction.

3. **Labeling source bias.** Our labels come from a single LLM judge (Claude Sonnet 4.5) validated against a single human annotator. A world where many systems use the same LLM as judge risks *correlated labeling errors*. Multi-model, multi-annotator labeling would be the right long-term direction.

4. **Small corpus.** 3,491 total items is modest for a 6-way multi-label task. Expect higher variance than reported on new distributions.

5. **Format–content confounds.** The classical baseline over-fires on listicle-format text because training data (Stop Clickbait) conflates listicle *format* with clickbait *manipulation*. The deep model is more robust but the underlying confound is not fully eliminated.

6. **Creator-level aggregation risk.** This model scores *posts*. Rolling scores up to the creator level (e.g., "creator X's average Scroll Trap Score") creates harassment vectors and should not be done without additional review.

7. **Not a safety classifier.** This is an *educational* tool for surfacing rhetorical moves, not a hate-speech / harm detector. It explicitly says nothing about whether content is harmful or false.

---

## Citation

If you use `lucid-distilbert` in academic work, please cite:

```bibtex
@misc{gross2026lucid,
  title        = {LUCID: Multimodal Detection of Short-Form Video Manipulation Tactics},
  author       = {Lindsay Gross},
  year         = {2026},
  howpublished = {\url{https://github.com/lindsaygross/Lucid}},
  note         = {Duke AIPI 540 final project},
}
```

Academic grounding for the 6-dimension rubric is documented in full in [`docs/RUBRIC.md`](https://github.com/lindsaygross/Lucid/blob/main/docs/RUBRIC.md).

---

## License

MIT. See the [LICENSE](https://github.com/lindsaygross/Lucid/blob/main/LICENSE) in the repo.

---

## Contact

Lindsay Gross — Duke AIPI, Spring 2026 — background in Trust & Safety.

Issues / collaboration: [github.com/lindsaygross/Lucid/issues](https://github.com/lindsaygross/Lucid/issues).
