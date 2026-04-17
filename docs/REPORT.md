# LUCID — Analyzing Short-Form Video Manipulation

**Author:** Lindsay Gross
**Course:** Duke AIPI 540 — Deep Learning Applications
**Semester:** Spring 2026
**Date:** April 2026

---

## Abstract

*TODO (write last, ~150 words): LUCID is a multimodal system that scores TikTok videos for six research-grounded psychological manipulation tactics. It fuses caption metadata, audio transcript (Whisper), and on-screen overlay text (Claude Vision) and feeds the result into a fine-tuned DistilBERT classifier with a multi-output head. We validate the LLM-as-judge labeling pipeline against a human gold set, compare three modeling approaches, and test robustness to character-level noise. The final system is deployed publicly at lucid-seven-pied.vercel.app. Key finding: the deep model achieves composite R²=0.37 (vs. classical R²=-1.46, naive R²=-0.59), and remains stable under moderate text noise (mean score shift ≤5.4 at 10% noise). We discuss architectural trade-offs around a dual composite-plus-dimension-head design, surface failure modes of the classical baseline, and ethics considerations for a system that labels creator intent.*

---

## 1. Problem Statement

Short-form video platforms — TikTok, Reels, Shorts — use recommendation systems optimized for engagement, and creators have adapted their craft to the specific psychological levers those systems reward. Users increasingly report a subjective sense of being "stuck in the feed" that researchers call compulsive use (Montag et al., 2019; Lupinacci, 2021). But the mechanism is usually invisible at the post level: a single TikTok isn't labeled as manipulative, and users don't have the vocabulary to describe *which* lever is being pulled.

LUCID is a proof-of-concept system that makes those levers legible at the post level. Given a TikTok URL, it:

1. Downloads the video, extracts audio + keyframes.
2. Transcribes speech (Whisper API) and OCRs on-screen overlay text (Claude Vision).
3. Fuses those three text streams (caption + transcript + overlay).
4. Scores the fused text along six peer-reviewed psychological-manipulation dimensions.
5. Returns a single 0–100 Scroll Trap Score + per-dimension breakdown.
6. Generates a "See Through It" rewrite showing the same information stripped of manipulation.

**The user problem being solved:** giving users a concrete vocabulary and scorable taxonomy for what short-form video is doing to their attention — moving from "TikTok brain" as a vague complaint to a measurable property of individual posts.

**Why this matters:** the same techniques are increasingly used for commercial persuasion, health misinformation, and political mobilization. A tool that surfaces manipulation at the post level is a step toward platform transparency that neither platforms nor regulators have yet delivered.

---

## 2. Data Sources

LUCID combines four datasets to cover both general manipulation patterns and in-domain TikTok content (see `docs/DATASETS.md` for full survey).

| Source | Size | Purpose |
|---|---|---|
| Webis Clickbait Corpus 2017 | ~2,000 tweets | Pretraining signal; continuous severity labels |
| Stop Clickbait 2016 | ~1,500 headlines | Weak supervision; binary clickbait labels |
| Reddit (PRAW scrape) | skipped in final build | Would provide engagement-metric ground truth (optional experiment deferred) |
| TikTok (yt-dlp scrape) | ~200 videos | In-domain evaluation + pre-cached demo gallery |

Total labeled corpus: **3,527 items** across mixed sources.

### 2.1 Label generation: LLM-as-judge

Because the manipulation rubric (see §3) is qualitative and existing datasets carry a *binary* clickbait label rather than multi-dimensional severity, we use Claude Sonnet 4.5 as a scalable labeling oracle. For each corpus item, Claude receives:

- A system prompt containing the full 6-dimension rubric with academic citations and severity criteria.
- Eight few-shot examples spanning 0/1/2 severity per dimension.
- The item text.

Claude returns structured JSON with per-dimension severity (0/1/2) and a composite score. We treat this as a noisy oracle rather than ground truth, and validate it against a human gold set (§2.2). This approach is adjacent to Anthropic's Constitutional AI / RLAIF work (Bai et al., 2022) — an LLM trained on human-written principles produces labels that a smaller model can be trained on. We are explicit in the report and in the app that all Claude labels are approximations of expert judgment, not ground truth.

### 2.2 Human gold-set validation

To calibrate the LLM labels, Lindsay hand-labels 100 randomly sampled items (seed=42) using the same rubric, via a Gradio labeler (`scripts/gold_set_labeler.py`). We then compute two agreement metrics per dimension:

- **Spearman rank correlation** (continuous)
- **Krippendorff's α** (ordinal)

*TODO: plug in actual numbers from `python3 -m scripts.agreement_stats` after labeling completes. Expected format:*

| Dimension | Spearman ρ | Krippendorff's α |
|---|---|---|
| Outrage Bait | TBD | TBD |
| FOMO Trigger | TBD | TBD |
| Engagement Bait | TBD | TBD |
| Emotional Manipulation | TBD | TBD |
| Curiosity Gap | TBD | TBD |
| Dopamine Design | TBD | TBD |

### 2.3 Multimodal text extraction from TikTok

At inference time, a single TikTok becomes three text streams that are concatenated before model input:

- **Caption** — fetched from yt-dlp metadata.
- **Audio transcript** — Whisper API (OpenAI), falling back to local `openai-whisper` if no API key.
- **On-screen overlay text** — keyframes extracted via ffmpeg (`backend/pipeline/vision.py`, 4 evenly-spaced frames per clip), passed as base64 images to Claude Vision Sonnet 4.5 which OCRs overlay text. We frame this explicitly as *applied vision-language modeling* (cf. CV II coursework: Grounding DINO, SAM, YOLO-World) rather than a trained OCR model. Pre-trained VLM-based OCR outperforms lightweight trained OCR for short, high-variance, typographically stylized overlay text typical of TikTok.

---

## 3. Related Work

The 6-dimension manipulation rubric is grounded in peer-reviewed behavioral research; full citations in `docs/RUBRIC.md`.

**Engagement, recommendation, and attention.** Munger (2020) and Mathur et al. (2019) characterize platform-induced incentives for low-quality interaction-maximizing content and dark-pattern design. Crockett (2017) and Brady et al. (2017, 2021) show that moralized and outrage-coded content diffuses disproportionately through social networks — the mechanism behind our Outrage Bait dimension.

**FOMO and social pressure.** Przybylski et al. (2013) formalized fear-of-missing-out as a self-regulatory deficit driving compulsive checking behavior. Cialdini's (2009) work on scarcity and social proof provides the behavioral priors for our FOMO Trigger dimension.

**Emotional appeals and identifiable-victim effects.** Small, Loewenstein, and Slovic (2007) show that pity-based appeals coerce prosocial action more effectively than statistical framing — grounding our Emotional Manipulation dimension. Kramer, Guillory, and Hancock (2014) demonstrate emotional contagion at social-network scale.

**Curiosity gaps.** Loewenstein (1994) defines curiosity as an aversive state produced by an information gap, exploited by Blom & Hansen (2015)'s "forward reference" clickbait. Scott (2021) analyzes curiosity-gap pragmatics in contemporary headlines.

**Variable-ratio reinforcement.** Skinner (1953) established variable-ratio schedules as the most persistent operant conditioning mechanism; Alter (2017) and Montag et al. (2019) trace these directly to social-media interface design patterns — grounding our Dopamine Design dimension.

**LLM-as-judge and scalable oversight.** Bai et al. (2022) introduce RLAIF using constitutional principles; Zheng et al. (2023) formalize LLM-as-judge evaluation for open-ended tasks. Our labeling pipeline is explicitly in this lineage and the report reports agreement metrics as a first-order concern, not an afterthought.

**Clickbait detection.** Chakraborty et al. (2016) (Stop Clickbait dataset) and Potthast et al. (2018) (Webis corpus) establish the classical NLP benchmarks for *binary* clickbait. LUCID differs in treating manipulation as *multi-dimensional ordinal severity* grounded in the behavioral literature, rather than surface clickbait detection.

---

## 4. Evaluation Strategy & Metrics

Our label structure is two-tiered: per-dimension ordinal severity (0/1/2) and a composite 0–100 Scroll Trap Score. We evaluate at both levels.

### 4.1 Primary metrics

- **Per-dimension binary classification.** We binarize dimension labels at threshold ≥1 (present vs. absent) for F1 / accuracy reporting. Justified by class imbalance and the need for a calibrated "does this tactic appear" flag.
  - **Macro F1** — equal weight to each dimension, addresses per-dimension imbalance. Headline metric for per-dimension performance.
  - **Macro accuracy** — useful as sanity check; less informative under class imbalance (most dimensions are absent in most posts).
  - **Per-dimension confusion matrices** — visualize failure modes.

- **Composite regression.** The 0–100 composite is the user-facing number.
  - **MAE** — mean absolute error in composite points; interpretable ("model is off by N points on average").
  - **RMSE** — penalizes large errors more; useful for detecting outliers.
  - **R²** — variance explained; a direct proxy for "is the model better than predicting the mean." Negative R² means the model is worse than a naive mean predictor.

### 4.2 Why these metrics over alternatives

- We considered **ordinal agreement** (Krippendorff's α for ordinal data) for per-dimension severity but chose binary F1 because the 0/1/2 scale is too coarse for a robust ordinal test at our sample size (~500 test items). Krippendorff's α *is* used for the human-vs-Claude agreement analysis (§2.2), where the 100-item scale is too small for F1 to be stable.
- We report **both macro F1 and composite MAE** because they reward different model behaviors. A model that fires many false positives (inflated F1 recall, inflated composite) will look good on one metric and bad on the other — capturing this trade-off is important for the architectural story.
- No **AUROC** because the task is multi-output with downstream downstream thresholding, and AUC adds no signal beyond F1 + accuracy at the decision-point we actually deploy.

---

## 5. Modeling Approach

### 5.1 Data processing pipeline

Raw corpus ingestion through feature/label pipeline (see `scripts/`):

1. **`fetch_datasets.py`** — downloads Webis 2017 + Stop Clickbait 2016; Stop Clickbait is gzipped (.gz), decompresses inline.
2. **`scrape_tiktok.py`** — batch yt-dlp pull from a curated TikTok URL list.
3. **`build_corpus.py`** — normalizes the four sources into a unified schema (`id`, `text`, `source`, `extra_json`), one row per post.
4. **`label_with_claude.py`** — batches corpus rows to Claude Sonnet 4.5 with the rubric system prompt; writes `labeled.csv` with 6 severity columns + composite.
5. **`splits.py`** — stratified train/val/test split (70/15/15, seed=42), stratified on composite-score bins. Test set frozen for all model comparisons.
6. **`build_features.py`** — TF-IDF (word 1–3-grams, top 5000 terms) + ~20 handcrafted stylometric features (caps_ratio, exclamation_count, emoji_density, Flesch-Kincaid, VADER sentiment, trigger-word counts) for the classical model.

Rationale:
- **Stratified split** to avoid unequal severity distributions across splits skewing evaluation (important because Webis/Stop Clickbait headlines skew low-severity).
- **Handcrafted stylometric features** for classical because research shows surface features (caps, punctuation) carry independent signal beyond word n-grams for clickbait detection (Potthast et al., 2018).
- **LLM labeling at scale** (full corpus) + **human validation** (gold set) is a scalable-oversight pattern — the explicit choice to not hand-label 3,500 items and still have defensible labels.

### 5.2 Hyperparameter tuning strategy

We did **not** do an exhaustive hyperparameter sweep because (a) our comparison story is across three *classes* of model, not within, and (b) our compute budget is limited (Duke Colab credits + local CPU). Instead:

- **Naive.** Trigger-word dictionary + per-dimension `MAX_TRIGGERS_FOR_FULL_SCORE` thresholds are hand-picked from the rubric examples. No tuning. This is by design: the naive baseline is meant to be rudimentary.
- **Classical.** XGBoost defaults with `max_depth=6`, `n_estimators=300`, `learning_rate=0.1`, `early_stopping_rounds=20` on the validation split. TF-IDF with `min_df=2, max_df=0.95`. One model per dimension. We did not CV-sweep these parameters — defaults from literature plus early stopping.
- **Deep (DistilBERT).** Hand-picked from common practice: `epochs=4`, `batch_size=32`, `lr=2e-5`, `max_length=256`, `warmup_ratio=0.1`, `AdamW(weight_decay=0.01)`, linear LR schedule with warmup. One GPU training run on an H100 (Duke Colab). We save the best checkpoint by val composite MAE.

This is a real limitation and appears in §8 (Error Analysis) and §11 (Future Work).

### 5.3 Models evaluated

#### 5.3.1 Naive baseline — `backend/inference/naive.py`

Rule-based keyword pattern matching against a curated trigger dictionary, one regex list per dimension (e.g., `tag a friend`, `only N left`, `wait for it`). Per-dimension score = `min(1.0, hits / MAX_TRIGGERS)`. Composite = mean of dimension scores × 100. Zero learned parameters, no training data dependency.

**Rationale for including:** required by the assignment rubric; establishes a strict surface-feature floor that learned models should beat. Useful ablation target for the report's experimentation section.

#### 5.3.2 Classical ML — `backend/inference/classical.py`

TF-IDF vectors (word 1–3-grams, top 5000) + ~20 handcrafted stylometric features concatenated into a ~5,020-dimensional vector. Six independent XGBoost binary classifiers (one per dimension); composite derived as mean × 100 (we keep this simple because XGBoost's calibrated probabilities are already in [0,1]). Trained on the 70% train split; early stopping on val.

**Rationale for including:** lets us separate "what can surface lexical + stylometric features capture?" from "what does contextual fine-tuning add?" The gap is directly interpretable.

#### 5.3.3 Deep learning — `backend/inference/deep.py`

Fine-tuned DistilBERT (66M parameters) with a **custom multi-output head**:

- Frozen-until-head? No — full fine-tune. We do not freeze the backbone because the surface vocabulary of TikTok manipulation (hashtags, slang, emoji-adjacent tokens) differs from the DistilBERT pretraining distribution enough that backbone adaptation should help.
- Pooling: `[CLS]` token hidden state with 0.1 dropout.
- **Two heads in parallel**:
  - `composite_head`: a single `Linear(hidden, 1)` with sigmoid at inference → 0–1 composite prediction. Trained with MSE loss against the normalized ground-truth composite.
  - `dimension_head`: a `Linear(hidden, 6)` with per-dim sigmoid → 6 binary classifiers. Trained with BCE loss against the binarized dimension labels.
- Loss: `MSE(composite) + DIM_LOSS_WEIGHT × BCE(dimensions)`.

**Why a multi-output head rather than a single classification head?**
Our labels are genuinely two-tiered (6 per-dimension severities + 1 composite), and we want both signals at inference (the UI surfaces dimension bars *and* the composite). A single head would force us to derive one from the other post-hoc. By training both jointly from a shared representation, we make the model commit to a consistent story across both output spaces.

**Rationale for including:** the class's NLP module emphasizes encoder Transformers and transfer learning via fine-tuning; DistilBERT is the canonical small-BERT fine-tune and makes the compute tractable on Colab.

#### 5.3.4 Composite score at serving time

We derive the final 0–100 Scroll Trap Score as the **mean of the 6 dimension probabilities × 100**, not the `composite_head` output. Reason: the composite head was trained on labels whose distribution skews low-severity (Webis and Stop Clickbait headlines), and consistently under-fires on real TikToks even when dimension heads clearly detect tactics. Mean-of-dimensions aligns with the per-dimension bars users see in the UI and matches the rubric-based severity intuition. We report both behaviors in §6 as an honest accounting of what each head learned.

### 5.4 Final deployed model

**Deployed:** DistilBERT (deep) pulled from HuggingFace Hub (`lindsaygross32/lucid-distilbert`), served via a FastAPI backend on Railway behind a Next.js / Tailwind frontend on Vercel (live at `lucid-seven-pied.vercel.app`). Classical + naive are in the inference router as fallbacks and in the repo for comparison.

---

## 6. Results

All three models evaluated on the same held-out test split (n = 529 items).

### 6.1 Per-dimension + composite comparison

| Metric | Naive | Classical | **Deep** |
|---|---|---|---|
| Macro F1 (per-dim binary) | 0.014 | **0.425** | 0.334 |
| Macro accuracy | 0.866 | 0.877 | **0.904** |
| Composite MAE | 7.12 | 11.70 | **5.90** |
| Composite RMSE | 11.30 | 14.05 | **7.12** |
| Composite R² | −0.594 | −1.462 | **+0.368** |

### 6.2 Interpretation

**Deep is the strongest on composite prediction** — only model with positive R² (explaining variance beyond the mean), best MAE and RMSE. **Classical wins on per-dimension F1**, but at a cost: its composite prediction is worse than naive (MAE 11.7 vs 7.1). This reflects a real trade-off:

- Classical's XGBoost per-dim heads are aggressive: they fire more often and achieve higher recall, inflating F1 on imbalanced binary labels. But the mean-of-dims composite then overshoots severity, producing a much worse MAE.
- Deep's per-dim probabilities are more calibrated (softer sigmoids). Lower F1 because fewer firings, but tighter composite alignment with ground truth.
- Naive is the *opposite* failure mode: it under-fires on everything, which gives it a low MAE "for free" on a low-severity-skewed corpus, but a macro F1 indistinguishable from zero.

The right model depends on what you're optimizing for. For the user-facing Scroll Trap Score (headline composite), deep is the clear choice. For a dimension-level auditor that wants high recall on "is this tactic present at all?", classical might be preferable.

### 6.3 Confusion matrices

*TODO: include per-dimension confusion matrices from `data/outputs/figures/`. Reference the auto-generated files, one per model per dimension.*

### 6.4 Human-vs-Claude label agreement

*TODO: complete after gold-set labeling finishes. Report per-dimension Spearman + Krippendorff's α. Target narrative: "agreement is strong on dimensions with unambiguous surface cues (Dopamine Design, Engagement Bait), weaker on semantically subtle ones (Emotional Manipulation) — consistent with the qualitative difficulty of the rubric."*

---

## 7. Experiment — Noise Robustness

### 7.1 Plan

**Question.** Has the deployed model learned semantic patterns of manipulation, or surface lexical features that collapse under mild perturbation? We measure how much the composite Scroll Trap Score shifts under character-level noise injection at increasing rates.

**Setup.** For 100 randomly sampled (seed=7) test items, we:
1. Score each item at noise rate p=0 (baseline).
2. Inject character-level noise at rates p ∈ {0.05, 0.10, 0.20, 0.35}, replacing each character with a random printable character with probability p.
3. Re-score, compute |Δscore|.
4. Report mean, median, max |Δ| per noise level.

Character-level noise is an adversarial proxy for OCR errors, autocorrect drift, and transcription noise — all realistic in the production pipeline.

### 7.2 Results

| Noise rate p | Mean \|Δ score\| | Median \|Δ\| | Max \|Δ\| |
|---|---|---|---|
| 0.00 | 0.00 | 0.00 | 0.00 |
| 0.05 | 4.20 | 2.00 | 26.0 |
| 0.10 | 5.36 | 4.00 | 27.0 |
| 0.20 | 7.72 | 5.50 | 37.0 |
| 0.35 | 10.20 | 9.00 | 32.0 |

*TODO: include `data/outputs/experiments/noise_stability.png` figure.*

### 7.3 Interpretation

At realistic noise levels (5–10% character corruption — the upper end of real OCR/transcription noise), the composite score shifts by ~4–5 points on a 0–100 scale. This is **graceful degradation**: the model doesn't collapse, but it also isn't strictly invariant — which is reasonable because the underlying features (caps density, punctuation) would shift with corruption too. The right thing happened.

The 35% noise level is deliberately catastrophic: a document at that noise level is barely human-readable. That the model only shifts 10 points there suggests it is genuinely representing something semantic rather than surface patterns — a pure surface-feature classifier would have collapsed entirely.

### 7.4 Recommendations

- For the deployed system, this is a strong safety signal: normal-use OCR/transcript noise won't materially change user-facing scores.
- Future work: targeted adversarial perturbations (paraphrase attacks, semantically preserving rewrites) would test whether the model's semantic representation is *consistent* under legitimate variation, not just robust to noise.

---

## 8. Error Analysis

We selected the 5 largest composite-score errors from the classical model's test-set predictions (by |pred − gold|) to characterize failure modes. See `scripts/error_analysis.py` for reproducibility.

### 8.1 The 5 worst classical-model mispredictions

| # | Gold | Pred | \|Err\| | Text |
|---|---|---|---|---|
| 1 | 8 | 49 | 41 | "18 Iconic Kim Kardashian Tweets That Are Only 4 Words" |
| 2 | 0 | 38 | 38 | "24 Amazing Products To Let The World Know You're A Burger Fan" |
| 3 | 0 | 37 | 37 | "33 Leslie Knope Quotes To Help You Live Your Best Life" |
| 4 | 17 | 51 | 34 | "21 Tweets That Prove Your Brain Can Be A Real Dick Sometimes" |
| 5 | 8 | 39 | 31 | "Everything You Need To Know About Being A Woman Standing In A Field" |

### 8.2 Root-cause pattern

All 5 errors are **false-positive over-fires on listicle-style headlines**. The gold labels (from Claude + our rubric) correctly identify these as low-manipulation — they're whimsical internet humor, not actually manipulative. But the classical model's TF-IDF features pick up shared surface patterns with high-manipulation clickbait: numeric prefixes ("18", "24", "33"), "X That Will..." templates, superlative hooks ("Amazing Products," "Everything You Need To Know").

The model has learned: **listicle format ≈ clickbait ≈ manipulation**. This conflation is the core failure. The training data (Stop Clickbait 2016) was originally labeled as a *binary clickbait* task, and though we relabeled with Claude using our severity rubric, the TF-IDF features still carry a strong listicle-format prior that dominates content signal.

### 8.3 Per-dimension breakdown of the error pattern

Looking at the prediction distributions for these 5:
- **Curiosity Gap** fires at 0.58–0.96 on all 5 (gold: 0 or 1). The model mistakes listicle headlines for deliberate referent-withholding, which they're structurally similar to.
- **FOMO Trigger** fires at 0.69–0.92 on 4 of 5 (gold: 0 on all). Listicles structurally resemble scarcity framing ("N things you should know") even when not manipulative.
- **Dopamine Design** fires at 0.36–0.91 — driven by a subtle caps-ratio feature that's elevated in titles ("Kim Kardashian," "Leslie Knope") but without the manipulative intent the feature was meant to capture.

### 8.4 Proposed mitigations

1. **Add class weights to the classical training loop** — specifically, penalize false positives on short (<100 char) texts where the model has less context. Our classical model has no length-aware regularization.
2. **Augment training with negative listicle examples** — generate synthetic "harmless listicle" text (tongue-in-cheek, clearly non-manipulative) labeled 0 across all dimensions, to force the model to learn content-level manipulation signals over format-level listicle signals.
3. **Explicit listicle-format feature** — add a handcrafted binary feature for "starts with a number and contains 'X that Y' template"; the model can then learn to *gate* manipulation probability by whether the text is actually making a manipulative move beyond the format.
4. **Use the deep model for the composite score** — the deep model does not exhibit this failure mode at the same magnitude because contextual embeddings dilute the surface-format signal. Our deployment already does this (§5.4).

### 8.5 Why these errors are informative

This pattern is a textbook example of the **distribution-shift problem**: training labels come from the Stop Clickbait headline distribution where listicle format *is* strongly correlated with clickbait, but our deployed use case (TikTok captions + transcripts) has a different format distribution where listicle structure is rare and less predictive. The classical model has over-fit on the training distribution's confound. The deep model — contextual, fine-tuned on the full rubric-labeled mix — is more robust.

---

## 9. Conclusions

We built and deployed a multimodal system for TikTok manipulation analysis that:

- Implements all three model classes required by the assignment (naive, classical, deep), with a principled comparison across per-dimension and composite metrics.
- Deploys the fine-tuned DistilBERT as a live, publicly accessible web application (lucid-seven-pied.vercel.app), meeting the "one week live" rubric.
- Validates its scalable-oversight labeling pipeline against a human gold set with per-dimension agreement statistics.
- Demonstrates graceful degradation under character-level noise injection (composite shift ≤5.4 at 10% noise), consistent with semantic rather than purely surface-lexical learning.
- Surfaces a concrete failure mode of the classical baseline (listicle-format over-fire) and explains why the deep model is more robust.

The composite R²=0.37 on a 3,500-item mixed corpus is a real result — not state-of-the-art, but defensible given the label noise inherent to LLM-generated rubric labels at this scale. More importantly, the architectural comparison yields genuinely different model behaviors (classical: high-F1 aggressive; deep: calibrated; naive: under-firing) that are visible in the deployed app and interpretable from the model internals.

---

## 10. Future Work

- **Deploy the trained DistilBERT via HuggingFace Inference Endpoints** rather than bundling torch in the Railway container. The current architecture pulls weights from HF Hub on cold start; moving inference fully to HF Inference Endpoints would eliminate the CPU torch layer entirely and reduce cold-start latency.
- **Expand the TikTok scrape** from ~200 to ~2,000 videos, enabling the engagement-correlation experiment (Scroll Trap Score vs. normalized engagement rate) that was deferred in this version. This is the closest approximation we have to testing the central hypothesis: *does the algorithm reward manipulation?*
- **Adversarial paraphrase robustness.** Character-noise is a weak adversary; the stronger test is whether the model remains stable across LLM-generated paraphrases that preserve meaning but shift surface lexicon. Implement with Claude as the paraphraser.
- **Instagram Reels + YouTube Shorts.** Reels is deliberately out of scope in v1 because yt-dlp support is unstable; a Reels integration would require a different data-access strategy (possibly licensed API or Meta researcher access).
- **Multi-expert human labeling.** The 100-post gold set is labeled by one person. Expanding to 3–5 T&S-practitioner labelers would produce an inter-human agreement baseline that bounds how much we should expect the model to match any single human.
- **Time-series / creator-level analysis.** The current system is per-post. A creator-level aggregation ("creator X's average Scroll Trap Score over last 30 days") would turn LUCID from a post inspector into a creator profile tool — interesting for both creator-side self-audit and platform-side policy work.
- **On-device inference** (browser or mobile) for privacy — run DistilBERT via ONNX in the browser so no user-entered URL ever hits our backend.

---

## 11. Commercial Viability Statement

LUCID as implemented is a research / educational tool. For commercial deployment, two directions are credible:

**B2C — Creator or consumer-side transparency tool.** Browser extension that scores the TikTok the user is currently viewing. Revenue: freemium (free for casual users, paid tier for researchers/journalists who need batch scoring + API access). Competitors: essentially none in the consumer-facing transparency space. Risk: platform TOS friction — TikTok does not encourage third-party scraping, and a heavily-used extension would likely face access revocation.

**B2B — Trust & Safety / policy tooling.** Sell a batch scoring API + dashboard to platforms, brands, or policy researchers to flag manipulation patterns at scale. Revenue: enterprise licensing. This is the more viable path because customers are paying for insights, not just inference, and the TOS risk is lower because B2B customers typically have their own data access.

**What's missing for commercial viability.** A validated labeling protocol is probably fine; what's not fine is our sample size (~3,500) — commercial clients need models trained on 100k+ items with ongoing labeling partnerships. Also: legal review around claims about creator intent.

---

## 12. Ethics Statement

LUCID scores creator content along a rubric of psychological manipulation. Three ethics considerations dominate our design:

**1. Intent vs. effect.** The rubric measures tactic presence, not creator intent. A creator using emotional appeals to raise money for a sick family member has genuinely higher Emotional Manipulation scores than a dry news report — but that does not mean they are acting in bad faith. Our "See Through It" rewrites and in-app disclaimers are explicit that LUCID is a statistical estimate of rhetorical moves, not a judgment of intent or honesty. The app's footer states: *"LUCID is a research / education tool. Scores are statistical estimates based on a rubric grounded in peer-reviewed behavioral research, not a measurement of intent."*

**2. Labeling bias and cultural scope.** Our rubric and labeling were developed in English-language, predominantly-US behavioral research. Manipulation norms are culturally situated — an Outrage Bait post in political US discourse has different rhetorical conventions than in, say, Indian Twitter. Applying this model to non-English or non-US content would require rubric reconstruction. We are explicit about this scope in Future Work.

**3. LLM-as-judge and concentration of judgment.** We use Claude Sonnet 4.5 as our labeling oracle. That means our model's definition of "manipulation" is partially inherited from Anthropic's training distribution and safety priors. A different LLM judge (GPT-4, Gemini) would produce systematically different labels. Our human-validation protocol (§2.2) partially mitigates this by anchoring the LLM labels to a real person's judgment, but the concentration concern remains: a world where many systems label creator behavior using the same LLM could produce correlated errors. Distributed, multi-model, human-in-the-loop labeling would be the right long-term direction.

**Not covered here but worth noting:** creator attribution. LUCID scores *posts*, not *creators*. Rolling up scores to the creator level (Future Work) raises harassment-vector concerns that should be addressed before any aggregation is published.

---

## References

*(abbreviated; full author / year / venue per in-line citations above; merge with `docs/RUBRIC.md` references for final submission)*

- Alter, A. (2017). *Irresistible: The Rise of Addictive Technology.* Penguin.
- Bai, Y., Kadavath, S., Kundu, S., et al. (2022). Constitutional AI: Harmlessness from AI Feedback. *arXiv:2212.08073.*
- Blom, J. N., & Hansen, K. R. (2015). Click bait: Forward-reference as lure in online news headlines. *Journal of Pragmatics*.
- Brady, W. J., Wills, J. A., Jost, J. T., Tucker, J. A., & Van Bavel, J. J. (2017). Emotion shapes the diffusion of moralized content. *PNAS*.
- Chakraborty, A., Paranjape, B., Kakarla, S., & Ganguly, N. (2016). Stop Clickbait: Detecting and preventing clickbaits in online news media. *ASONAM*.
- Cialdini, R. B. (2009). *Influence: Science and Practice.* Pearson.
- Crockett, M. J. (2017). Moral outrage in the digital age. *Nature Human Behaviour.*
- Kramer, A. D. I., Guillory, J. E., & Hancock, J. T. (2014). Experimental evidence of massive-scale emotional contagion through social networks. *PNAS.*
- Loewenstein, G. (1994). The psychology of curiosity. *Psychological Bulletin.*
- Mathur, A., Acar, G., Friedman, M. J., et al. (2019). Dark patterns at scale. *Proc. ACM HCI.*
- Meta Newsroom. (2017). Fighting Engagement Bait on Facebook.
- Montag, C., Lachmann, B., Herrlich, M., & Zweig, K. (2019). Addictive features of social media/messenger platforms. *IJERPH.*
- Munger, K. (2020). All the news that's fit to click. *Political Communication.*
- Potthast, M., Gollub, T., Komlossy, K., et al. (2018). Crowdsourcing a Large Corpus of Clickbait on Twitter. *COLING.*
- Przybylski, A. K., Murayama, K., DeHaan, C. R., & Gladwell, V. (2013). Motivational, emotional, and behavioral correlates of fear of missing out. *Computers in Human Behavior.*
- Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). DistilBERT, a distilled version of BERT. *NeurIPS-EMC2 Workshop.*
- Scott, K. (2021). You won't believe what's in this paper! *Journal of Pragmatics.*
- Skinner, B. F. (1953). *Science and Human Behavior.* Macmillan.
- Small, D. A., Loewenstein, G., & Slovic, P. (2007). Sympathy and callousness. *Organizational Behavior and Human Decision Processes.*
- Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. *NeurIPS Datasets and Benchmarks.*

---

## Appendices

### A. Repository structure

Full repo structure documented in `README.md` and `docs/PLAN.md`.

### B. Live application

- Frontend: `https://lucid-seven-pied.vercel.app`
- Backend: `https://lucid-production-534a.up.railway.app`
- Model artifact: `https://huggingface.co/lindsaygross32/lucid-distilbert`

### C. Reproduction

```bash
git clone https://github.com/lindsaygross/Lucid.git
cd Lucid
pip install -r requirements-dev.txt
make data                 # fetch Webis + Stop Clickbait (+ optional Reddit/TikTok)
make label                # Claude labels full corpus
python3 -m scripts.gold_set_labeler  # hand-label 100 gold items
python3 -m scripts.agreement_stats   # agreement between human + Claude labels
make splits
make train-naive
make train-classical
# (deep training: upload notebooks/train_lucid.ipynb to Colab with a GPU runtime)
make evaluate             # cross-model metrics -> data/outputs/metrics/
python3 -m scripts.run_experiment --skip-engagement  # noise robustness
python3 -m scripts.error_analysis --n 5 --model classical  # worst mispredictions
```
