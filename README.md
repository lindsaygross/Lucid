# LUCID

> You're not addicted. You're being engineered. See how.

LUCID analyzes short-form video manipulation. Paste a TikTok URL, get a **Scroll Trap Score** (0–100) + a breakdown across 6 psychological manipulation dimensions (Outrage Bait, FOMO Trigger, Engagement Bait, Emotional Manipulation, Curiosity Gap, Dopamine Design) + a "See Through It" rewrite that shows the same information stripped of manipulation.

Final project for Duke AIPI 590 Deep Learning, Spring 2026. Author: Lindsay Gross.

## Quick links
- **Rubric with citations:** [`docs/RUBRIC.md`](docs/RUBRIC.md)
- **Dataset survey:** [`docs/DATASETS.md`](docs/DATASETS.md)
- **Project plan (handoff doc):** [`docs/PLAN.md`](docs/PLAN.md)

## Project structure

```
Lucid/
├── app.py                     # FastAPI entrypoint
├── backend/                   # inference server + pipelines
│   ├── main.py                # FastAPI app
│   ├── pipeline/              # video → text extraction
│   └── inference/             # naive, classical, deep models
├── frontend/                  # Next.js app (Observatory UI)
├── scripts/                   # data collection, labeling, training
├── notebooks/                 # Colab training notebook
├── models/                    # trained artifacts
├── data/{raw,processed,outputs}
└── docs/
```

## Three modeling approaches (assignment requirement)

| Approach | File | Notes |
|---|---|---|
| **Naive baseline** | `backend/inference/naive.py` | Keyword match against curated trigger dictionary |
| **Classical ML** | `backend/inference/classical.py` | TF-IDF + handcrafted features → XGBoost |
| **Deep learning** (final) | `backend/inference/deep.py` | Fine-tuned DistilBERT, multi-output head |

Final deployed model is DistilBERT. All three evaluated in the technical report.

## Setup (local)

### Prerequisites
- Python 3.11+
- Node 20+
- `ffmpeg` (required by yt-dlp + Whisper)

```bash
# macOS
brew install ffmpeg
```

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
# edit .env: paste your Anthropic API key as ANTHROPIC_API_KEY=...
```

### Frontend
```bash
cd frontend
npm install
```

### Run dev servers
```bash
# backend (from repo root)
uvicorn app:app --reload --port 8000

# frontend (in a second terminal)
cd frontend && npm run dev
```

Open http://localhost:3000.

## Data pipeline

```bash
make data          # pull Webis + Stop Clickbait + Reddit + TikTok samples
make label         # run Claude labeling on full corpus
make gold-set      # launch Gradio labeler for 100-post human validation
make features      # build features for classical model
```

## Training

Deep learning training is GPU-heavy. Canonical path is Colab:

1. Upload `notebooks/train_lucid.ipynb` to Colab (Duke credits)
2. Run all cells
3. Download trained artifact, commit to `models/` (or push to HuggingFace Hub)

```bash
# CPU-fallback (slower, for testing)
make train-naive
make train-classical
make train-deep
```

## Evaluation

```bash
make evaluate       # all 3 models on test set, generates confusion matrices + metrics
make experiment     # runs engagement correlation + noise robustness experiments
```

## Deployment

- **Frontend:** Vercel (auto-deploys from `main`)
- **Backend:** Railway (auto-deploys from `main`)
- **Model artifacts:** HuggingFace Hub (`lindsaygross/lucid-distilbert`)

## Citations

The 6 manipulation dimensions are grounded in peer-reviewed research. Full citations in [`docs/RUBRIC.md`](docs/RUBRIC.md). Key sources include:

- Crockett, M. J. (2017). *Nature Human Behaviour*
- Brady et al. (2017). *PNAS* / (2021). *Science Advances*
- Przybylski et al. (2013). *Computers in Human Behavior*
- Loewenstein, G. (1994). *Psychological Bulletin*
- Meta Newsroom (2017). *Fighting Engagement Bait on Facebook*
- Skinner, B. F. (1953); Alter, A. (2017)

Aceternity UI components (SparklesCore, FloatingPaths, FallingPattern) are used under MIT license and attributed in their respective files.

## License

MIT. See [LICENSE](LICENSE).
