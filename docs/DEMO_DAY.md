# LUCID — Demo Day deck outline

> 5-minute pitch, startup-accelerator style. Hard stop at 5:00.

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

## Slide 1 — Title (≈ 15 s)

**Visual:** Full-bleed black. LUCID wordmark centered (letter-by-letter drop if your slide tool supports; static is fine). Tagline one line below in secondary gray. Small mono subline at bottom: `duke aipi 590 · spring 2026 · lindsay gross`.

**Script:**

> "LUCID. You're not addicted. You're being engineered. See how.
> I'm Lindsay Gross. I come out of trust and safety, and this is a tool I built to make the scroll legible."

**Assets:**
- Wordmark: use the `LUCID` letter style from `frontend/components/lucid-logo.tsx` (font-heading, black weight, tracking-tight) — or just set it in Canva directly, it's simple type.

---

## Slide 2 — Problem & Motivation (≈ 55 s)

**Visual:** Left two-thirds: a muted, desaturated grid of ~15 TikTok screenshots at 15% opacity (like the hero on your site). Right third: three stacked stats, each with a tiny colored dot the color of the relevant dimension:
- **MDL No. 3047** — "42 state AGs vs Meta, active in N.D. Cal"
- **"1 in 3 teen girls"** — Facebook Files, WSJ 2021
- **6 dimensions** — each grounded in peer-reviewed research

**Script:**

> "The 'you've been engineered' claim isn't a vibe anymore. It's the operative theory of MDL 3047 — forty-two state attorneys general suing Meta right now over product mechanics that were designed to maximize engagement. The internal research that case draws on is the Facebook Files: Meta's own slide that said we make body-image issues worse for one in three teen girls.
> The problem is that all of that lives at the platform level. At the post level, manipulation is still invisible. A single TikTok isn't labeled. Most viewers don't have a vocabulary to describe which lever is being pulled on them.
> LUCID is a small attempt at that vocabulary. It scores short-form video on six specific manipulation tactics, each grounded in peer-reviewed behavioral research."

**Assets:**
- Screenshot grid: `frontend/components/hero.tsx` or the on-site hero — take a screenshot of the live site's top fold.
- Citations are in `docs/REPORT.md` §References and §2 if you need exact.

---

## Slide 3 — Approach (≈ 50 s)

**Visual:** One-line pipeline across the full slide width, five boxes connected by arrows:
```
[ TikTok URL ]  →  [ caption + Whisper transcript + Claude Vision overlay OCR ]
                →  [ fused text ]
                →  [ DistilBERT multi-output head ]
                →  [ 0–100 Scroll Trap Score + 6 per-dim scores ]
```
Under the DistilBERT box, two footnote-style rows in mono gray: `trained on Claude-labeled corpus (n ≈ 3.5k)` and `human gold-set validated (n = 100)`.

**Script:**

> "Here's how it works. Paste a TikTok. We pull the caption, transcribe the audio, and run keyframes through Claude Vision to grab the on-screen overlay text. The three streams get fused into one text blob. That blob goes into a fine-tuned DistilBERT with a multi-output head — one sigmoid per dimension, plus a zero-to-a-hundred composite.
> The model was trained on roughly thirty-five hundred items from public clickbait corpora and a TikTok scrape, all relabeled by Claude Sonnet against a rubric I designed. Then I hand-labeled a hundred of them myself as a validation set."

**Assets:**
- Pipeline description matches `docs/REPORT.md` §6 (Data Processing Pipeline) and the ordered list in `frontend/app/about/page.tsx` § 05.

---

## Slide 4 — Live Demo (≈ 90 s)

**Visual:** A full-screen slide that just says **LIVE DEMO** in the Observatory aesthetic, with the URL in mono at the bottom: `lucid-seven-pied.vercel.app`. You click away from the deck and into the browser.

**Script** (while on the site):

> "This is live. lucid-seven-pied dot vercel dot app.
> I'm going to paste a TikTok URL." *(paste a pre-cached high-trap URL from the gallery so latency is near-zero — don't pick a cold URL that needs a Whisper run)*
> "Scroll Trap Score of *[value]*. You can see the per-dimension breakdown here — Curiosity Gap and Engagement Bait are the highest, which makes sense for this format.
> And this is the piece I like. I can switch to the token-attribution view, and it'll tell me which specific words in the transcript drove each score. These aren't attention weights — they're Integrated Gradients, so they reflect actual causal contribution to the prediction."

**Demo checklist (do before the deck):**
- Verify `lucid-seven-pied.vercel.app` loads in an incognito window. No laggy first paint.
- Confirm the gallery has at least **three** pre-cached TikToks at different Scroll Trap Score levels (low / medium / high). Files: `scripts/cached/{low,med,high}_*.json`, frontend mirror: `frontend/components/live-demo/cached/`.
- Pick your demo URL now, not live. Pre-run it once so the cache is warm.
- Have a **fallback**: if the live site fails, have a local `npm run dev` running on the second monitor and a cached response ready.

---

## Slide 5 — Results & Key Findings (≈ 55 s)

**Visual:** Split layout. Left half: the three-model comparison, styled like your Compare 3 Models UI — a row of three cards (Naive / Classical / Deep), each with its composite score and a one-line metric. Right half: **two** confusion-matrix PNGs stacked vertically — Curiosity Gap and Engagement Bait from `data/outputs/figures/gold/deep/`. These are the two dimensions where the deployed model performs best on the human gold set.

**Headline numbers to include** (all from `docs/REPORT.md` §9 and §2.6):

- Deployed model (DistilBERT): **Composite MAE 5.90, R² +0.368** on the 529-item test split
- Within-1 human-Claude labeling agreement: **0.95** (gold set, n=100)
- Macro F1 by model: Naive **0.014**, Classical **0.425**, Deep **0.334**

**Script:**

> "Three results. One. On the primary test split, the deployed DistilBERT is the strongest composite predictor — mean absolute error of five-point-nine on the zero-to-a-hundred score, R-squared of plus-point-three-six.
> Two. On the hundred-item human gold set, Claude and I agreed within one severity step ninety-five percent of the time. The places we disagreed were the rare dimensions — Emotional Manipulation, FOMO — and the disagreement is mostly about where to draw the moderate-versus-severe line, not whether the tactic is present.
> Three. Classical beats deep on macro F1, but at a real cost: its composite predictions overshoot reality. Deep wins on composite because it's calibrated — softer, slower to fire, more correct when it does. That's the right trade-off for the Scroll Trap Score."

**Assets:**
- `data/outputs/figures/gold/deep/curiosity_gap_confusion.png`
- `data/outputs/figures/gold/deep/engagement_bait_confusion.png`
- Macro metrics: `docs/REPORT.md` §9 Table 3 (primary) and §9.1 Table 4 (gold set)

---

## Slide 6 — Close / scope & future work (≈ 20 s)

**Visual:** Three short lines stacked, each with a small dot:
- **Not ground truth.** The rubric is one defensible cut.
- **Not creator intent.** The score reads tactics, not motives.
- **Next.** Scale the labels, add Reels, partner with a platform for intervention testing.

Below that in mono: `github.com/lindsaygross/Lucid` and `lucid-seven-pied.vercel.app`.

**Script:**

> "Three things LUCID is not. It is not ground truth — it's a research tool. It does not read creator intent. It is not a finished product.
> What I'd do next is scale the labels past a thousand items, add YouTube Shorts and eventually Reels, and partner with a platform to see whether exposing a score changes behavior.
> Thanks. Code and report at github slash lindsaygross slash Lucid, app at lucid-seven-pied dot vercel dot app."

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

## Timing ledger (target 4:45, hard stop 5:00)

| Slide | Target | Running |
|---|---|---|
| 1. Title | 0:15 | 0:15 |
| 2. Problem | 0:55 | 1:10 |
| 3. Approach | 0:50 | 2:00 |
| 4. Live demo | 1:30 | 3:30 |
| 5. Results | 0:55 | 4:25 |
| 6. Close | 0:20 | 4:45 |

15 seconds of buffer. Rehearse once with a stopwatch.

---

## What to paste into desktop Claude / Canva

> "Build me a 6-slide Canva deck for a 5-minute Demo Day pitch. Dark theme, pure black background, Inter / Geist font family, mono accents. Per-dimension colors: Outrage `#EF4444`, FOMO `#F59E0B`, Engagement `#14B8A6`, Emotional `#EC4899`, Curiosity `#A855F7`, Dopamine `#06B6D4`.
>
> Use the slide content in `docs/DEMO_DAY.md` from my LUCID repo. One slide per `## Slide N` section. Include the scripts as speaker notes, not on the slide. Where I reference images from `data/outputs/figures/gold/deep/`, upload those two PNGs and place them on Slide 5.
>
> The aesthetic of the site at `lucid-seven-pied.vercel.app` is the design language I want mirrored — dark, ambient, mono labels in uppercase with wide tracking."
