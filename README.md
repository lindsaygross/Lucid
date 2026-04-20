# LUCID

> You're not addicted. You're being engineered. See how.

LUCID analyzes short-form video manipulation. Paste a TikTok URL, get a **Scroll Trap Score** (0–100) plus a per-dimension breakdown across six psychological manipulation dimensions (Outrage Bait, FOMO Trigger, Engagement Bait, Emotional Manipulation, Curiosity Gap, Dopamine Design) plus a "See Through It" rewrite that shows the same information stripped of manipulation.

Final project for Duke AIPI 590 Deep Learning, Spring 2026. Author: Lindsay Gross.

## Live demo

- **Web app:** https://lucid-seven-pied.vercel.app
- **Backend API:** https://lucid-production-534a.up.railway.app (FastAPI; `/health`, `/analyze`, `/analyze/explain`, `/gallery`)
- **Model weights:** https://huggingface.co/lindsaygross32/lucid-distilbert (266 MB, 66M-param DistilBERT)

## Quick links

- **Technical report (all required sections):** [Google Doc (submission version)](https://docs.google.com/document/d/1axuEqQcHfddCP46WX3QiKmGu9tZhekkwA1Yl2FtKs4c/edit?usp=sharing) · Markdown source in repo at [`docs/REPORT.md`](docs/REPORT.md)
- **Rubric with citations:** [`docs/RUBRIC.md`](docs/RUBRIC.md)
- **Dataset survey:** [`docs/DATASETS.md`](docs/DATASETS.md)
- **Project plan / handoff doc:** [`docs/PLAN.md`](docs/PLAN.md)
- **HF model card:** [`docs/HF_MODEL_CARD.md`](docs/HF_MODEL_CARD.md)

## Three modeling approaches (assignment requirement)

| Approach | Implementation | Role |
|---|---|---|
| **Naive baseline** | [`backend/inference/naive.py`](backend/inference/naive.py) | Keyword match against a curated trigger-word dictionary per dimension. |
| **Classical ML** | [`backend/inference/classical.py`](backend/inference/classical.py) + [`models/classical.pkl`](models/) | TF-IDF + handcrafted stylometry features, one XGBoost head per dimension. |
| **Deep learning** (deployed) | [`backend/inference/deep.py`](backend/inference/deep.py) + `models/distilbert/` (downloaded from HF Hub on first use) | Fine-tuned DistilBERT with a 6-output multi-label head plus Integrated-Gradients token attributions. |

All three are implemented, evaluated, and reported on. DistilBERT is the deployed model. See [`docs/REPORT.md`](docs/REPORT.md) §9 (primary 529-item test split) and §9.1 (gold-set eval on 100 hand-labeled items) for results and confusion matrices.

## Project structure

```
Lucid/
├── README.md                     # this file
├── LICENSE                       # MIT
├── Makefile                      # common commands (make help)
├── requirements.txt              # runtime deps (server container)
├── requirements-dev.txt          # full dev deps (training, labeling, eval)
├── setup.py                      # packaging so backend/ + scripts/ are importable
├── app.py                        # FastAPI entrypoint (imports backend.main:app)
├── Dockerfile, Procfile, .railwayignore   # Railway deploy
├── .env.example                  # required env vars template
│
├── backend/                      # FastAPI server + inference
│   ├── main.py                   # routes: /health, /analyze, /analyze/explain, /gallery
│   ├── config.py                 # settings
│   ├── pipeline/                 # yt-dlp → Whisper → Claude Vision → fused text
│   └── inference/                # naive, classical, deep, router, schemas
│
├── frontend/                     # Next.js 14 (App Router) + Tailwind + Aceternity
│   ├── app/                      # routes: /, /about
│   ├── components/               # hero, analyzer, results, attribution view, etc.
│   └── lib/                      # API client
│
├── scripts/                      # data + eval + training pipelines
│   ├── fetch_datasets.py         # Webis Clickbait 2017 + Stop Clickbait 2016
│   ├── scrape_reddit.py          # PRAW-based
│   ├── scrape_tiktok.py          # yt-dlp batch
│   ├── build_corpus.py           # merge sources → data/processed/corpus.csv
│   ├── label_with_claude.py      # bulk LLM-as-judge labeling (Claude Sonnet 4.5)
│   ├── gold_set_labeler.py       # Gradio app for human gold-set labeling
│   ├── agreement_stats.py        # Spearman ρ + Krippendorff α (Claude vs human)
│   ├── build_features.py         # TF-IDF + stylometry for classical model
│   ├── splits.py                 # stratified 70/15/15 train/val/test
│   ├── train_naive.py / train_classical.py / train_deep.py
│   ├── evaluate.py               # primary test-set eval (all 3 models)
│   ├── evaluate_gold_set.py      # gold-set eval (all 3 models, human labels)
│   ├── error_analysis.py         # §10: worst-5 mispredictions
│   ├── run_experiment.py         # §11: noise-robustness experiment
│   └── cache_gallery.py          # prewarm gallery analyses for the UI
│
├── notebooks/                    # exploration + canonical Colab training notebook
│   └── train_lucid.ipynb
│
├── models/                       # trained artifacts
│   ├── classical.pkl             # XGBoost + TF-IDF bundle
│   └── distilbert/               # fine-tuned DistilBERT (266 MB; gitignored — pulled from HF)
│
├── data/
│   ├── raw/                      # source datasets (gitignored)
│   ├── processed/                # merged corpus + labels + splits (gitignored)
│   └── outputs/                  # evaluation artifacts (tracked)
│       ├── agreement.json                 # §2.6 labeler-agreement JSON
│       ├── comparison_gold.json           # §9.1 gold-set summary
│       ├── figures/gold/{model}/*.png     # confusion matrices per model × dimension
│       └── metrics/gold/{model}.json      # per-model gold-set metrics
│
└── docs/
    ├── REPORT.md                 # technical report (all required sections)
    ├── RUBRIC.md                 # 6-dimension rubric with citations
    ├── DATASETS.md               # dataset survey
    ├── PLAN.md                   # locked project plan
    └── HF_MODEL_CARD.md          # Hugging Face model card (mirrored on Hub)
```

## Setup (local)

### Prerequisites

- Python 3.11+ (tested on 3.11 and 3.13)
- Node 20+ (frontend only)
- `ffmpeg` (required by yt-dlp + Whisper)

```bash
brew install ffmpeg                   # macOS
# or: sudo apt-get install ffmpeg     # Debian/Ubuntu
```

### Install

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt   # training + labeling deps
pip install -e .                      # makes backend/ and scripts/ importable
cp .env.example .env                  # then edit: ANTHROPIC_API_KEY=...
```

### Run dev servers

```bash
make dev-backend                      # uvicorn app:app --reload --port 8000
# in a second terminal:
make dev-frontend                     # cd frontend && npm install && npm run dev
```

Open http://localhost:3000.

## Data + labeling pipeline

```bash
make data            # fetch Webis + Stop Clickbait, scrape Reddit + TikTok
make corpus          # merge sources → data/processed/corpus.csv
make label           # Claude Sonnet 4.5 labels the full corpus (LLM-as-judge)
make gold-set        # Gradio app for the 100-post human validation set
make agreement       # Spearman ρ + Krippendorff α — Claude vs human
make splits          # stratified train/val/test split
```

## Training

```bash
make train-naive     # rule-based; regenerates trigger compiled cache
make train-classical # XGBoost + TF-IDF + stylometry → models/classical.pkl
make train-deep      # DistilBERT CPU fallback — use the Colab notebook for GPU
```

The canonical DistilBERT training path is `notebooks/train_lucid.ipynb` on Colab. After training, upload weights to Hugging Face Hub (`lindsaygross32/lucid-distilbert`); production pulls from the Hub on first request, and local evaluation pulls into `models/distilbert/` automatically.

## Evaluation

```bash
make evaluate                            # primary test split (n = 529 Claude labels)
python -m scripts.evaluate_gold_set      # secondary (n = 100 human labels, §9.1)
make experiment                          # §11 noise-robustness
```

Both eval scripts produce:
- Summary JSON at `data/outputs/comparison*.json`
- Per-model metrics at `data/outputs/metrics/**/*.json`
- Per-dimension confusion-matrix PNGs at `data/outputs/figures/**/*.png`

See [`docs/REPORT.md`](docs/REPORT.md) Tables 3–5 for the headline numbers and Figures 1–6 (§9.1) for the deep-model confusion matrices.

## Deployment

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel (auto-deploy from `main`) | https://lucid-seven-pied.vercel.app |
| Backend | Railway (auto-deploy from `main`) | https://lucid-production-534a.up.railway.app |
| DistilBERT weights | Hugging Face Hub | https://huggingface.co/lindsaygross32/lucid-distilbert |

`Dockerfile` + `Procfile` define the Railway container. `frontend/` auto-detects as a Next.js app on Vercel. Set `NEXT_PUBLIC_API_URL` on Vercel to the Railway URL.

## Citations

The six manipulation dimensions are grounded in peer-reviewed research. Full citations in [`docs/REPORT.md`](docs/REPORT.md) §References. Key sources:

- Crockett (2017), *Nature Human Behaviour* — Outrage Bait
- Brady et al. (2017), *PNAS*; (2021), *Science Advances* — moral-emotional diffusion
- Przybylski et al. (2013), *Computers in Human Behavior* — FOMO
- Loewenstein (1994), *Psychological Bulletin* — Curiosity Gap
- Small, Loewenstein, & Slovic (2007), *OBHDP* — Emotional Manipulation
- Skinner (1953); Alter (2017) — variable-ratio reinforcement / Dopamine Design
- Meta Newsroom (2017) — Engagement Bait policy
- Bai et al. (2022), *arXiv:2212.08073* — Constitutional AI / RLAIF lineage (§2.6)
- Zheng et al. (2023), NeurIPS — LLM-as-a-judge formalization
- Sanh et al. (2019) — DistilBERT architecture

Aceternity UI components (SparklesCore, FloatingPaths, FallingPattern) are used under MIT license and attributed in their respective component files.

## License

MIT. See [LICENSE](LICENSE).
