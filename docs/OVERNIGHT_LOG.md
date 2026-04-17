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

