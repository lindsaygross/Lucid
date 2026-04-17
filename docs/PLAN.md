# LUCID — Project Plan & Handoff Doc

> **Purpose:** single source of truth for every locked decision on this project. When starting a new Claude Code session (web or local terminal), read this file first.

---

## Product

**Tagline:** "You're not addicted. You're being engineered. See how."

**One-liner:** LUCID analyzes short-form video manipulation. Paste a TikTok URL, get a Scroll Trap Score (0–100) + breakdown across 6 psychological manipulation dimensions + a "See Through It" rewrite showing the same content stripped of manipulation.

**Positioning:** TikTok-first (most reliable yt-dlp support + strongest narrative). YouTube Shorts supported as bonus. Instagram Reels out of scope (hostile to yt-dlp) — mentioned in report's Future Work as a platform-transparency limitation.

**Target user (voice):** digitally-aware Gen Z / millennial who feels "TikTok brain" and wants to understand the mechanism.

## Deadline
**April 21, 2026** (hard). Today is April 17, 2026. 5 days.

## Author
Lindsay Gross — Trust & Safety background (Beyond the Screen / Frances Haugen connection). Career target: Anthropic, Meta, Netflix.

---

## The 6 dimensions (rubric detail lives in docs/RUBRIC.md)

1. **Outrage Bait** — Crockett 2017, Brady et al. 2017/2021
2. **FOMO Trigger** — Przybylski et al. 2013, Cialdini
3. **Engagement Bait** — Meta 2017 policy, Munger 2020, Mathur et al. 2019
4. **Emotional Manipulation** — Cialdini 1987, Small/Loewenstein/Slovic 2007, Kramer 2014
5. **Curiosity Gap** — Loewenstein 1994, Blom & Hansen 2015, Scott 2021
6. **Dopamine Design** — Skinner 1953, Alter 2017, Montag et al. 2019

Each scored 0 (absent) / 1 (moderate) / 2 (severe). Composite Scroll Trap Score = normalized 0–100.

---

## Models (3 required by assignment)

| Model | Role | Location |
|---|---|---|
| **Naive baseline** | Keyword-matching on curated trigger dictionary | `backend/inference/naive.py` |
| **Classical ML** | TF-IDF + handcrafted features → XGBoost multi-output | `backend/inference/classical.py` |
| **Deep learning** | Fine-tuned DistilBERT with multi-output head (1 regression for 0–100 composite + 6 binary classifiers for dimension tags) | `backend/inference/deep.py` |

**Final deployed model:** DistilBERT (deep). Classical + naive kept in repo for report comparison.

**Model simplification (locked):** 0–100 composite regression + 6 binary "present/not" per dimension. Do NOT do ordinal 3-class per dimension — insufficient data, harder to evaluate.

---

## Data pipeline

### Corpus (mixed, ~4,000 total)

| Source | Size | Purpose |
|---|---|---|
| Webis Clickbait Corpus 2017 | ~2,000 tweets | Pretraining (continuous severity, closest to our task) |
| Stop Clickbait 2016 | ~1,500 headlines | Weak supervision (binary clickbait) |
| Reddit (PRAW scrape) | ~500 posts | In-domain social manipulation + engagement metrics |
| TikTok (yt-dlp scrape) | ~200 TikToks | In-domain evaluation + pre-cached gallery |

### Labeling methodology: **LLM-as-judge with human validation**

1. **Bulk labeling:** Claude Sonnet 4.5 labels entire corpus on all 6 dimensions using the rubric + 8 few-shot examples
2. **Gold set:** Lindsay hand-labels 100 randomly sampled items via Gradio app (`scripts/gold_set_labeler.py`)
3. **Agreement:** Spearman correlation + Krippendorff's α per dimension between Lindsay and Claude
4. **Sanity check:** GPT-4 labels same 100; report Claude vs GPT agreement as task-inherent noise bound

**Frame in report:** this connects to scalable oversight (Anthropic's Constitutional AI / RLAIF lineage) — strength, not compromise.

### TikTok text extraction (per URL)
- **Audio → Whisper API** for transcript
- **Keyframes → Claude Vision** for on-screen text overlays
- **Caption** via yt-dlp metadata
- Fuse all three into single text input for the model

---

## Experiment (at least 1 required)

**Running both, pick cleaner for report centerpiece:**

1. **"Does the algorithm reward manipulation?"** — Scroll Trap Score vs. engagement rate (normalized by follower count). Pearson + Spearman correlations per platform + per dimension. Interpret as observational correlation (NOT causal).
2. **Noise robustness** — inject character-level noise + paraphrase via LLM at increasing rates, measure score stability. Shows whether the model is learning surface patterns or semantic manipulation.

If #1 shows r > 0.3, it's the centerpiece. If weaker, lead with #2.

---

## Tech stack

### Backend (Python)
- **FastAPI** — API server
- **yt-dlp** — TikTok/Shorts download
- **openai-whisper** — transcription (local, not API, to keep costs low; can switch to API if needed)
- **anthropic** Python SDK — Claude Vision OCR + "See Through It" rewrite
- **transformers** + **torch** — DistilBERT inference
- **xgboost**, **scikit-learn** — classical model
- **praw** — Reddit scraper
- **ffmpeg** — keyframe extraction (system binary)

### Frontend (TypeScript)
- **Next.js 14** (App Router) — React framework
- **Tailwind CSS** + **shadcn/ui** — base components
- **Aceternity UI** components (SparklesCore, FloatingPaths, FallingPattern) — visual aesthetic
- **Framer Motion** — animations
- **@tsparticles/react** — particle system

### Infra
- **GitHub** — repo at github.com/lindsaygross/Lucid
- **Railway** — backend deploy (has $5/mo free credit)
- **Vercel** — frontend deploy (free)
- **HuggingFace Hub** — trained model artifacts (free hosting for 66M-param DistilBERT)
- **Colab (Duke GCP credits)** — GPU training

### Dev
- Local development on Lindsay's Mac using Claude Code terminal with `--dangerously-skip-permissions`
- Python 3.11+, Node 20+
- `uv` for Python package management

---

## UX

### Aesthetic: "The Observatory"
Dark / ambient / motion-rich / retro-game energy. Aceternity components as base.

### Landing
- Full-screen black hero
- **Hero asset:** TikTok screenshot wall — 20–30 real screenshots from pre-cached gallery, tiled grid, dimmed to ~15% opacity + desaturated, breathing animation (staggered scale 1.00 → 1.02), SparklesCore particles floating on top
- Animated "LUCID" text logo (letter-by-letter drop animation)
- Tagline fades in below
- Primary CTA: URL paste input with soft pulse glow
- Below: carousel of 8 pre-cached gallery TikToks ("Try these")

### Color system (I'll tune when building — subject to iteration)

| Dimension | Glow |
|---|---|
| Outrage Bait | `#EF4444` (red) |
| FOMO Trigger | `#F59E0B` (amber) |
| Engagement Bait | `#14B8A6` (teal) |
| Emotional Manipulation | `#EC4899` (pink) |
| Curiosity Gap | `#A855F7` (purple) |
| Dopamine Design | `#06B6D4` (cyan) |

Background: `#000000`. Primary text: `#FFFFFF`. Secondary: `#A1A1AA`.

### Wait state (~10–20s while download + transcribe + analyze)
- FallingPattern intensifies
- Narrative progress text cycles:
  - *"Downloading TikTok…"*
  - *"Transcribing what they said…"*
  - *"Reading the overlays…"*
  - *"Finding the tactics…"*
  - *"Measuring the trap…"*

### Results page
- Big Scroll Trap Score (0 → final, counter animation)
- 6 dimension bars slide in sequentially, each with its own color glow
- Transcript below with inline highlighted phrases (color-coded by dimension)
- **"See Through It"** button morphs transcript in-place → clean rewritten version
- Expandable "Why This Works On Your Brain" psychology panel per dimension with citations

### Mobile-first, desktop-polished
Demo Day will be on a projector but audience should be able to try on their phones.

---

## Repo structure

```
Lucid/
├── README.md
├── requirements.txt           # backend Python deps
├── Makefile                   # common commands
├── setup.py                   # package install (for scripts)
├── app.py                     # FastAPI entrypoint (root-level, per assignment spec)
├── .env.example               # env var template
├── .gitignore
├── LICENSE
│
├── backend/                   # FastAPI server + inference
│   ├── main.py                # FastAPI app with /analyze, /health
│   ├── config.py              # settings (env vars)
│   ├── pipeline/
│   │   ├── tiktok.py          # yt-dlp download + metadata
│   │   ├── transcribe.py      # Whisper transcription
│   │   ├── vision.py          # Claude Vision OCR on keyframes
│   │   ├── rewriter.py        # "See Through It" Claude rewrite
│   │   └── analyze.py         # orchestrator
│   └── inference/
│       ├── naive.py           # keyword baseline
│       ├── classical.py       # XGBoost
│       ├── deep.py            # DistilBERT
│       └── router.py          # routes request to final model
│
├── frontend/                  # Next.js app
│   └── (local Claude Code scaffolds tomorrow)
│
├── scripts/
│   ├── scrape_reddit.py       # PRAW-based
│   ├── scrape_tiktok.py       # yt-dlp batch
│   ├── fetch_datasets.py      # Webis 2017 + Stop Clickbait
│   ├── label_with_claude.py   # bulk Claude labeling
│   ├── gold_set_labeler.py    # Gradio app for Lindsay's 100-post validation
│   ├── agreement_stats.py     # Spearman + Krippendorff's α
│   ├── build_features.py      # TF-IDF + handcrafted features for classical
│   ├── train_naive.py
│   ├── train_classical.py
│   ├── train_deep.py          # CPU-fallback version; Colab notebook is canonical
│   ├── evaluate.py            # all 3 models on test set
│   └── run_experiment.py      # engagement correlation + noise robustness
│
├── notebooks/
│   └── train_lucid.ipynb      # Colab-ready GPU training notebook
│
├── models/                    # trained artifacts (gitignored for large files)
├── data/
│   ├── raw/                   # scraped + downloaded datasets
│   ├── processed/             # labeled + featurized
│   └── outputs/               # metrics, figures, predictions
│
└── docs/
    ├── PLAN.md                # this file
    ├── RUBRIC.md              # 6-dim rubric with citations
    └── DATASETS.md            # dataset survey
```

---

## 5-day timeline

| Day | Date | Tasks |
|---|---|---|
| 1 | Apr 17 (tonight) | **I do:** repo scaffold, backend, pipelines, labeling pipeline, training scripts, Colab notebook, PLAN.md |
| 2 | Apr 18 | Lindsay: creates Railway + Vercel accounts (done ✅). Runs scrapers. **Local Claude Code:** Next.js frontend scaffold with Observatory aesthetic, hero screenshot wall, analyzer UI. Deploy hello-world to Vercel + Railway. |
| 2 (evening) | Apr 18 | Lindsay runs Claude labeling pipeline (~$15 cost). Lindsay labels 100 gold posts via Gradio (~2–3 hrs). Lindsay uploads notebook to Duke Colab, runs training. |
| 3 | Apr 19 | All models evaluated. Experiment run. Error analysis. Frontend finalized + polished. Pre-cached gallery populated. |
| 4 | Apr 20 | End-to-end integration tested. Deploy final version. Start writing technical report. |
| 5 | Apr 21 | Finish report. Demo Day slides (5 min). Rehearse. Submit. |

---

## Decisions locked

- [x] TikTok-only (YouTube Shorts bonus, Reels out)
- [x] URL paste input, pre-cached gallery fallback
- [x] LLM-as-judge labeling + 100-post human gold validation
- [x] Model head: 0–100 composite + 6 binary tags
- [x] Stack: Next.js + FastAPI, Railway + Vercel, Colab training
- [x] Aesthetic: "The Observatory" (dark, ambient, Aceternity)
- [x] Hero: TikTok screenshot wall + SparklesCore overlay
- [x] Color-per-dimension glow (see palette above)
- [x] Animated "LUCID" text logo, no separate mark
- [x] Report format: technical report (~8–12 pages)
- [x] Primary experiment: engagement correlation; fallback noise robustness
- [x] Budget: $30–40 Anthropic API total

## Decisions pending (non-blocking)

- [ ] Report voice/tone (Lindsay sending prior examples)
- [ ] Pre-cached gallery picks (I'll pick in `scripts/gallery_picks.json`)
- [ ] Domain name (skippable; default to `lucid.vercel.app`)

## Lindsay's todos

- [x] Add $40 to Anthropic API key (named `anthropic` lowercase)
- [x] Create Railway account
- [x] Create Vercel account
- [ ] Pull branch locally, launch `claude --dangerously-skip-permissions` from the Lucid dir
- [ ] When prompted: paste API key into `.env` (template in `.env.example`)
- [ ] When prompted: run Claude labeling pipeline locally (cheap, ~20 min)
- [ ] When prompted: label 100 posts in Gradio (~2–3 hrs)
- [ ] When prompted: upload Colab notebook to Duke Colab and run
- [ ] Review `docs/RUBRIC.md` and edit in your T&S voice
- [ ] Send a prior technical report example for voice reference

---

## Assignment-rubric checklist (from professor's spec)

- [x] Three modeling approaches (naive + classical + DL) — planned
- [x] One focused experiment — planned (engagement correlation + noise robustness)
- [ ] Interactive web app, publicly accessible, live ≥ 1 week — in progress (Vercel + Railway)
- [ ] Written report with all required sections — in progress
- [ ] Demo Day pitch (5 min) — last day
- [x] GitHub repo following structure spec — in progress (matches)
- [x] Git hygiene: branching, PRs, no commits to main — followed (dev branch `claude/plan-dl-project-1Reh0`)
- [x] Code modularized, no loose executable code — enforced in scaffold
- [x] External code attributed — will attribute Aceternity components in file headers

---

## Safety notes for `--dangerously-skip-permissions`

1. Only run from within the `Lucid/` repo directory, never from `~` or system dirs
2. `.env` must be in `.gitignore` (it is) — never commit the API key
3. `git push` every few hours as recovery points
4. If anything looks wrong, `git reset --hard origin/claude/plan-dl-project-1Reh0` to restore
