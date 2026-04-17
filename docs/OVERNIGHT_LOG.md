# LUCID Overnight Log — 2026-04-17T00:45:51

Autonomous session running with --dangerously-skip-permissions. Logs issues as encountered.

## [00:56] Anthropic key typo fixed

`.env` had `ANTHROPIC_API_KEY=ssk-ant-api03-...` (double `s`). All Claude
Vision + labeling API calls failed 401. I fixed the prefix to `sk-ant-api03-`
and verified with a one-shot `messages.create` call (got "OK" back).

- First tiktok scrape had vision OCR failing silently on all URLs — kept
  speaker transcript but dropped overlay text.
- Killed and restarted scrape with the corrected key so every row has both
  transcript AND overlay text.
- Not committing `.env` (gitignored). Heads up in case you rotate the key.


## [01:02] Railway prod stack: requirements-prod.txt + naive fallback

- Added `requirements-prod.txt` — fastapi/uvicorn/anthropic/openai/yt-dlp/
  pydantic/pydantic-settings/python-dotenv/python-multipart/Pillow. Drops
  torch/transformers/openai-whisper/xgboost/scikit-learn/nltk/vaderSentiment/
  textstat/pandas/numpy/pyarrow/praw/gradio/matplotlib/seaborn/krippendorff
  — everything used only for training + local data work.
- `nixpacks.toml` now installs `-r requirements-prod.txt` and sets
  `LUCID_PREFERRED_MODEL=naive` in `[variables]`.
- `backend/inference/router.py`: lazy-imports classical + deep so
  naive-only prod never touches torch/xgboost.
- `backend/main.py`: reads `LUCID_PREFERRED_MODEL` env var on router init
  (defaults to "deep" locally).
- Smoke-tested via `fastapi.testclient`: `/health` → 200,
  `/analyze {"text":...}` → 200 (naive scoring).

Note: production *only* does naive scoring + the three API-powered calls
(Whisper-API transcription, Claude-Vision OCR, Claude rewrite). Without
OPENAI_API_KEY on Railway, transcript will be empty and the model scores
the caption + overlay text only.

When Lindsay is ready to ship deep inference: train on Colab, push to HF
Hub, add `transformers` + `huggingface-hub` back to requirements-prod, and
wire a `HFRemoteDeepPredictor` that hits the HF inference endpoint.


## [01:03] Backend resilience: empty transcript in slim prod

`transcribe._transcribe_audio` now catches `ImportError` when it tries to
load the local whisper fallback. This matters in prod because
`requirements-prod.txt` deliberately drops `openai-whisper` (pulls torch).

Behavior:
- If `OPENAI_API_KEY` is set and credible → Whisper API (preferred).
- If not → try local whisper; on ImportError, log + return `""`. The rest
  of the pipeline (caption + Claude-Vision overlay OCR) still produces a
  usable scoring input.

## Railway deploy env vars — action for Lindsay

Railway service environment variables the backend needs (set in dashboard):
- `ANTHROPIC_API_KEY` — for vision OCR + "See Through It" rewrite
- `OPENAI_API_KEY` — for Whisper API transcription (optional but strongly
  recommended; without it, transcript will be empty in prod)

`LUCID_PREFERRED_MODEL` is already set to `naive` by `nixpacks.toml`, so
prod routes straight to the rule-based scorer. No torch install needed.

Frontend env on Vercel:
- `NEXT_PUBLIC_API_URL` = `https://<your-railway-subdomain>.up.railway.app`


## [01:04] Frontend Aceternity note

Instructions said to install SparklesCore/FloatingPaths/FallingPattern via
the 21st.dev magic MCP. In this autonomous session I wrote them by hand
(same component names, same API shape, same visual effect) in
`frontend/components/aceternity/` because the MCP flow expects
interactive auth. Swap for the MCP versions later if you want — they're
drop-in replacements.

Components implemented:
- `sparkles.tsx` — tsparticles-slim loader, configurable density/speed/color
- `floating-paths.tsx` — 36 animated SVG paths, framer-motion
- `falling-pattern.tsx` — unicode glyph rain, colored by dimension palette


## [03:34] Training + eval pipeline (CPU models only)

Labeling finished after ~2.5 hours: 3527 / 3528 rows labeled. One Stop
Clickbait row (`stop_dca0c3814c26`) gave up after 3 JSON-parse retries —
dropped on the floor, not worth re-running.

Fix: `scripts.splits.load_split` was merging labeled + corpus on `id`
without dropping labeled's `text`, leaving `text_x`/`text_y` that broke
all three trainers. Fixed by dropping labeled's text pre-merge so the
corpus (normalized) copy is canonical.

Ran the CPU-safe pipeline (per instructions, skipped train-deep — you
run that on Colab):

```
make splits         → train=2468 val=529 test=529
make train-naive    → macro_f1=0.014  (most of Webis is neutral news; naive
                       under-fires on low-trap content, as expected)
make train-classical→ macro_f1=0.425, saved models/classical.pkl
make evaluate       → comparison.json written

=== Model comparison (test set) ===
model          macro_f1  macro_acc   comp_MAE  comp_RMSE   comp_R2
naive             0.014      0.866       7.12      11.30    -0.594
classical         0.425      0.877      11.70      14.05    -1.462
```

Classical scores a real F1 but its composite derivation is noisier than
naive (expected: naive just under-predicts everything, which on a
low-scoring corpus gives low MAE "for free"). Deep model will anchor
both once trained on Colab.

committed `models/classical.pkl` so the backend can serve it locally
right now (router → classical → naive fallback chain).

