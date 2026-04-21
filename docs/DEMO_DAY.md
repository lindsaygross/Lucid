# LUCID — Demo Day deck outline

> 4-minute pitch, startup-accelerator style. Hard stop at 4:00.

**How to use this doc:** each section below is one slide. Under each slide you'll find (a) the **visual guidance** for Canva, (b) the **spoken script** — the exact words to say, timed so the whole deck fits in 5 minutes — and (c) any **asset references** to pull from the repo.

**Aesthetic:** Observatory. Background `#000000`. Primary text `#FFFFFF`, secondary `#A1A1AA`. Dimension colors (use sparingly, one per dimension):

| Dimension | Hex |
|---|---|
| Outrage Bait | `#EF4444` |
| FOMO Trigger | `#F59E0B` |
| Engagement Bait | `#14B8A6` |
| Emotional Manipulation | `#EC4899` |
| Curiosity Gap | `#A855F7` |
| Dopamine Design | `#06B6D4` |

**Fonts:** heading in Inter / Geist (or Canva default sans-bold); mono accents in JetBrains Mono / Geist Mono.

---

## Slide 1 — Title (≈ 10 s)

**Visual:** Full-bleed black. LUCID wordmark centered (letter-by-letter drop if your slide tool supports; static is fine). Tagline one line below in secondary gray. Small mono subline at bottom: `duke aipi 590 · spring 2026 · lindsay gross`.

**Script:**

> "LUCID. You're not addicted — you're engineered. I'm Lindsay Gross, I come out of trust and safety, and this is a tool for scoring that engineering one post at a time."

**Assets:**
- Wordmark: use the `LUCID` letter style from `frontend/components/lucid-logo.tsx` (font-heading, black weight, tracking-tight) — or just set it in Canva directly, it's simple type.

---

## Slide 2 — Problem & Motivation (≈ 40 s)

**Visual:** Left two-thirds: a muted, desaturated grid of ~15 TikTok screenshots at 15% opacity (like the hero on your site). Right third: three stacked stats, each with a tiny colored dot the color of the relevant dimension. Each bullet is a complete claim so it reads without the audio:
- **42 state AGs are suing Meta over engineered engagement.** *MDL 3047, N.D. Cal. — active.*
- **1 in 3 teenage girls reported worsened body image on Instagram — in Meta's own research.** *Facebook Files, WSJ 2021.*
- **LUCID scores 6 peer-reviewed manipulation tactics on any post.** *Per-video, not per-platform.*

**Script:**

> "The claim that engagement is designed, not incidental, is now the operative theory of MDL 3047 — forty-two state attorneys general suing Meta over product mechanics built to maximize time-on-app. The factual record is the Facebook Files, which include Meta's own internal research finding that Instagram worsens body-image outcomes for one in three teenage girls.
> That scrutiny exists at the platform level. At the post level, it does not. An individual TikTok carries no disclosure of the tactics it uses, and most viewers lack the vocabulary to name the mechanism. LUCID provides that vocabulary: six peer-reviewed manipulation dimensions, scored automatically on any short-form post."

**Assets:**
- Screenshot grid: `frontend/components/hero.tsx` or the on-site hero — take a screenshot of the live site's top fold.
- Citations are in `docs/REPORT.md` §References and §2 if you need exact.

---

## Slide 3 — Approach (≈ 1 min 5 s)

**Visual:** One-line pipeline across the full slide width, five boxes connected by arrows:
```
[ TikTok URL ]  →  [ caption + Whisper transcript + Claude Vision overlay OCR ]
                →  [ fused text with [CAPTION] [TRANSCRIPT] [OVERLAY] tags ]
                →  [ DistilBERT + 2 heads (composite + 6 dims) ]
                →  [ 0–100 Scroll Trap Score + 6 per-dim scores ]
```
Under the DistilBERT box, three footnote-style rows in mono gray: `distilbert-base-uncased · 66M params`, `trained on Claude-labeled corpus (n ≈ 3.5k)`, `human gold-set validated (n = 100)`.

**Script:**

> "At inference, the pipeline has three stages. First, extraction. The caption is pulled from TikTok metadata. The audio is transcribed by Whisper — the OpenAI API if a key is set, a local fallback otherwise. Four evenly-spaced keyframes go to Claude Vision, which reads the on-screen overlay text — things like 'POV' or 'wait for it' — and explicitly ignores logos, usernames, and app UI.
> Second, fusion. The three streams — caption, transcript, overlay — are concatenated into one document with labeled sections, so the model can learn that overlay text, which is usually where the hook lives, carries different signal from spoken audio.
> Third, scoring. A fine-tuned DistilBERT — sixty-six million parameters — reads the fused document and emits six per-dimension probabilities. The zero-to-hundred Scroll Trap Score is their mean. And for the explanation view, I compute Integrated Gradients per dimension against an all-padding baseline — that yields per-token causal attributions for each dimension's score, rather than a single global attention rollout."

**Assets:**
- Pipeline description matches `docs/REPORT.md` §6 (Data Processing Pipeline) and the ordered list in `frontend/app/about/page.tsx` § 05.
- Code anchors if asked: `backend/pipeline/tiktok.py`, `transcribe.py`, `vision.py`, `analyze.py`, `backend/inference/deep.py`.

---

## Slide 4 — Live Demo (≈ 1 min)

**Visual:** A full-screen slide that just says **LIVE DEMO** in the Observatory aesthetic, with the URL in mono at the bottom: `lucid-seven-pied.vercel.app`. You click away from the deck and into the browser.

**Script** (while on the site):

> "Live, at lucid-seven-pied dot vercel dot app. I'll paste a pre-cached URL so we skip the Whisper round-trip." *(paste from the gallery — do not pick a cold URL)*
> "Scroll Trap Score of *[value]*. The six bars underneath show which dimensions fired — on this clip, Curiosity Gap and Engagement Bait are highest, which is what you'd expect for a 'wait for it' format.
> Now the attribution view. Each highlighted token is a per-dimension Integrated Gradients attribution, so I can show you which specific words drove Curiosity Gap, independently of what drove Engagement Bait. Two things worth noting. One, these are causal contributions to the dimension logit — not attention weights, which are often mistaken for explanations. Two, per-dimension attribution is what makes the view diagnostic: a viewer can see not just that manipulation is present, but which sentence triggered which mechanism."

**Demo checklist (do before the deck):**
- Verify `lucid-seven-pied.vercel.app` loads in an incognito window. No laggy first paint.
- Confirm the gallery has at least **three** pre-cached TikToks at different Scroll Trap Score levels (low / medium / high). Files: `scripts/cached/{low,med,high}_*.json`, frontend mirror: `frontend/components/live-demo/cached/`.
- Pick your demo URL now, not live. Pre-run it once so the cache is warm.
- Have a **fallback**: if the live site fails, have a local `npm run dev` running on the second monitor and a cached response ready.

---

## Slide 5 — Results & Key Findings (≈ 50 s)

**Visual:** Split layout. Left half: the three-model comparison, styled like your Compare 3 Models UI — a row of three cards (Naive / Classical / Deep), each with its composite score and a one-line metric. Right half: **two** confusion-matrix PNGs stacked vertically — Curiosity Gap and Engagement Bait from `data/outputs/figures/gold/deep/`. These are the two dimensions where the deployed model performs best on the human gold set.

**Headline numbers to include** (all from `docs/REPORT.md` §9 and §2.6):

- Deployed model (DistilBERT): **Composite MAE 5.90, R² +0.368** on the 529-item test split
- Within-1 human-Claude labeling agreement: **0.95** (gold set, n=100)
- Macro F1 by model: Naive **0.014**, Classical **0.425**, Deep **0.334**

**Script:**

> "Three results. One: on the held-out test set of five-hundred-twenty-nine clips, DistilBERT posts a composite mean absolute error of five-point-nine on the zero-to-hundred scale, with an R-squared of point-three-seven — roughly thirty-seven percent of variance explained on unseen clips.
> Two: on a hundred-item human gold set I labeled blind against the same rubric, Claude and I agreed within one severity step ninety-five percent of the time. The disagreements were almost entirely moderate-versus-severe on rare dimensions — not whether the tactic was present.
> Three: classical beats deep on macro F1, point-four-two to point-three-three, but classical's composite overshoots. Deep is calibrated — slower to fire, more correct when it does. For a user-facing zero-to-hundred score, calibration beats firing rate. Deep ships."

**Assets:**
- `data/outputs/figures/gold/deep/curiosity_gap_confusion.png`
- `data/outputs/figures/gold/deep/engagement_bait_confusion.png`
- Macro metrics: `docs/REPORT.md` §9 Table 3 (primary) and §9.1 Table 4 (gold set)

---

## Slide 6 — Close / scope & future work (≈ 15 s)

**Visual:** Three short lines stacked, each with a small dot:
- **Not ground truth.** The rubric is one defensible cut.
- **Not creator intent.** The score reads tactics, not motives.
- **Next.** Scale the labels, add Reels, partner with a platform for intervention testing.

Below that in mono: `github.com/lindsaygross/Lucid` and `lucid-seven-pied.vercel.app`.

**Script:**

> "Three caveats: not ground truth, not creator intent, not a finished product. Next: scale the labels, add Shorts and Reels, and partner with a platform to test whether surfacing the score changes user behavior. Thanks — code and report at github slash lindsaygross slash Lucid."

---

## Backup Q&A prep (don't use as slides — these are for you)

Likely hard questions + the one-sentence answer to each.

1. **"Isn't this just a clickbait detector?"** — No. Clickbait is binary and focuses on headline framing. LUCID is ordinal across six tactics grounded in distinct behavioral mechanisms, and it fuses caption, audio, and on-screen overlay, not just the headline.

2. **"Your labels come from Claude. Isn't the whole thing circular?"** — It would be, if I hadn't hand-labeled a hundred items blind against the same rubric. Spearman ρ in the 0.4 range on the high-variance dimensions is a typical one-human-vs-LLM agreement number, and within-one is 0.95.

3. **"Why does classical beat deep on F1?"** — Classical's XGBoost heads are aggressive, so they fire more often and win on recall, which inflates macro F1 under class imbalance. Deep's calibrated softer sigmoids produce fewer firings but tighter composite alignment — which is what the user-facing score actually needs.

4. **"What's the commercial application?"** — Not a moderation product — the 3.5k sample is far too small for that. Two realistic paths: a research-and-journalism tool for documenting platform patterns, and an in-app literacy feature where a platform surfaces the score next to trending content as a friction mechanic.

5. **"Why is naive macro F1 so close to zero?"** — It's a curated keyword dictionary, and most manipulative posts don't contain the exact phrases in the dictionary. That's the point of having it in the deck: it shows the ceiling of rule-based approaches and justifies the classical + deep investment.

6. **"What happens on a non-English TikTok?"** — The Whisper transcription handles many languages, but the rubric and the DistilBERT encoder are English-trained. Current scope is English-only; multilingual would be a natural next step.

---

## Timing ledger (target 4:00, hard stop 4:00)

| Slide | Target | Running |
|---|---|---|
| 1. Title | 0:10 | 0:10 |
| 2. Problem | 0:40 | 0:50 |
| 3. Approach | 1:05 | 1:55 |
| 4. Live demo | 1:00 | 2:55 |
| 5. Results | 0:50 | 3:45 |
| 6. Close | 0:15 | 4:00 |

Zero buffer — rehearse with a stopwatch and cut if you run long on the demo. The demo slide is the easiest place to save time (skip the token-attribution beat if you're behind; keep it if you're on pace).

---

## What to paste into desktop Claude / Canva

> "Build me a 6-slide Canva deck for a 4-minute Demo Day pitch. Dark theme, pure black background, Inter / Geist font family, mono accents. Per-dimension colors: Outrage `#EF4444`, FOMO `#F59E0B`, Engagement `#14B8A6`, Emotional `#EC4899`, Curiosity `#A855F7`, Dopamine `#06B6D4`.
>
> Use the slide content in `docs/DEMO_DAY.md` from my LUCID repo. One slide per `## Slide N` section. Include the scripts as speaker notes, not on the slide. Where I reference images from `data/outputs/figures/gold/deep/`, upload those two PNGs and place them on Slide 5.
>
> The aesthetic of the site at `lucid-seven-pied.vercel.app` is the design language I want mirrored — dark, ambient, mono labels in uppercase with wide tracking."
