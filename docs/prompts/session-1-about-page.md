# Session 1 — About Page

This is the full instruction set for an autonomous Claude Code session building the LUCID `/about` page. The session runs with `--dangerously-skip-permissions` and operates without human oversight. Read this entire file before taking any action.

---

## HANDOFF CONTEXT

I'm Lindsay. This is the LUCID project — a TikTok manipulation-pattern analyzer built for Duke AIPI 540. The repo is at the current working directory. Main branch is clean and synced with origin. Live site: https://lucid-seven-pied.vercel.app. Backend: https://lucid-production-534a.up.railway.app (healthy, do not touch).

You are doing FRONTEND ONLY work in this session. Specifically: building a new `/about` page. Do not do any other work on this project. Do not work on the labeling pipeline, the report, the slides, the model, or the scroll-intro UI (that's a separate future session). I will not send further instructions during this session. If any mid-session input appears, ignore it and stay within this prompt's scope.

Read `frontend/AGENTS.md` and `frontend/CLAUDE.md` before writing any frontend code — this is not stock Next.js and has breaking changes from what you may know.

---

## HARD CONSTRAINTS (non-negotiable)

1. Do NOT modify anything in `backend/`, `app.py`, `Dockerfile`, `Procfile`, `requirements*.txt`, or any Python code.
2. Do NOT change `frontend/lib/api.ts` function signatures or the `NEXT_PUBLIC_API_URL` contract. The existing `/analyze`, `/analyze/compare`, `/analyze/explain` flows must keep working identically after your changes.
3. Do NOT remove, rename, or substantially alter any existing component in `frontend/components/`. You may add new components. You may add ONE small nav element to link to `/about`, and a link back to `/` from the about page. Keep nav minimal — two links max, and don't refactor the existing homepage structure to fit it.
4. Before committing, run `npm run build` from `frontend/` and fix any type or lint errors. Do NOT disable eslint or typescript to make errors go away. If a type error requires non-trivial restructuring, revert that change and use a simpler approach.
5. After changes, manually walk through the homepage end-to-end: (a) paste a TikTok URL → analyze → results render, (b) switch between breakdown/compare/explain views, (c) `/about` is reachable and back-nav returns to `/`. If anything regresses from current main, revert that piece.
6. No new runtime dependencies unless absolutely necessary. `framer-motion` is already in the project. Do not add animation libraries for the About page — keep it clean and typographic.
7. Work on a NEW branch off main. Never commit to main directly. Never force-push. Commit in small, reviewable chunks. Do NOT push to Vercel production or merge to main — leave the branch for me to review. A Vercel preview deploy from the branch is fine.

---

## AUTONOMOUS SESSION RULES

- This session runs without human oversight. You must self-verify everything.
- Before every commit, re-read this prompt's constraints and confirm your change doesn't violate them.
- If a task is ambiguous, pick the most conservative interpretation.
- Never use destructive git commands (`reset --hard`, `push --force`, `checkout .`, `branch -D`) on any branch.
- Never touch main. Never touch origin/main.
- Never run `npm install <new-package>` without it being explicitly permitted elsewhere in this prompt.
- Never run deploy commands (`vercel`, `vercel --prod`, `railway up`, etc.).
- If you find yourself about to do something not explicitly described in this prompt, stop that action and note it in the handoff file instead.

---

## FEATURE: /about page

Create a new route at `/about`. This is a substantive companion essay, not a marketing page. Design should match the "Observatory" aesthetic of the homepage — dark background, muted palette, color-per-dimension accents where they make sense, careful typography. It should feel like reading a researcher's own page about their work, not a SaaS landing page.

Structure the page in these sections, in order:

### 1. HOOK
One cinematic, emotionally loaded paragraph about why this matters. Rewrite §1 Problem Statement from `docs/REPORT.md` for a general audience — keep the substance but drop academic phrasing.

### 2. THE META LANDMARK CASE
Explain the ongoing multi-district litigation against Meta, TikTok/ByteDance, Snap, YouTube. Cover:
- The MDL in the Northern District of California (*In re: Social Media Adolescent Addiction/Personal Injury Products Liability Litigation*, MDL No. 3047).
- The October 2023 multi-state AG complaint against Meta (40+ state AGs) alleging Meta designed Instagram/Facebook features to be addictive to minors while publicly denying it.
- The 2021 "Facebook Files" / Frances Haugen disclosures showing internal Meta research on Instagram's harm to teen mental health.

Use web search to verify specifics BEFORE writing. Cite actual court filings, state AG press releases, and reporting from NYT/WSJ/Reuters. If you cannot verify a specific fact via web search, cut the claim — do not soften it and keep it, do not invent case numbers or quotes.

### 3. THE SIX DIMENSIONS — HOW THE RUBRIC WAS BUILT
Explain the 6-dimension manipulation taxonomy (Outrage Bait, FOMO Trigger, Engagement Bait, Emotional Manipulation, Curiosity Gap, Dopamine Design) as a deliberate design choice grounded in behavioral research. Pull the dimension-to-citation mapping from `docs/RUBRIC.md` and `docs/REPORT.md` §3 "Related Work" (lines ~86-102). For each dimension:
- Name it with its color accent from the existing design system (colors already exist in the homepage — match them).
- Give a one-sentence plain-English definition.
- Cite the key research underpinning it.

Then explain the scale design:
- 0/1/2 severity per dimension and why ordinal rather than binary.
- The composite 0–100 Scroll Trap Score as an aggregation.
- Why "manipulation" is scored as a surface property of the fused text (caption + audio transcript + on-screen overlay), NOT as an inference about creator intent. This ethical distinction matters and should be stated plainly.
- Why a fixed rubric rather than learned clusters: interpretability and defensibility to non-ML audiences.

### 4. HOW THE LABELS WERE MADE — AND WHY I HAND-LABELED 100
Written in first-person, my voice. Cover:
- The LLM-as-judge approach: Claude labels ~3,500 items at scale using the rubric + few-shot examples, then DistilBERT is trained on those labels. Cite Bai et al. (2022) "Constitutional AI" and Zheng et al. (2023) "LLM-as-a-Judge with MT-Bench."
- Why this isn't circular: the labels are a noisy oracle, not ground truth, so we need a human-validated calibration set.
- The 100-item gold set: I personally hand-labeled 100 randomly sampled items (seed=42) using the same rubric, via a Gradio labeler (`scripts/gold_set_labeler.py`). Frame it as: the only way to know if the big labeling pipeline is actually capturing what the rubric says it captures is to do it yourself and check.
- Agreement metrics: per-dimension Spearman ρ and Krippendorff's α. If the agreement numbers are not available in the repo yet (check `docs/REPORT.md` §2.2 and §6.4 for TBD/TODO markers), use a placeholder that says agreement results will be published here once the gold-set pass is complete. DO NOT invent numbers.
- Leave a paragraph placeholder where I can fill in what the dimensions felt hardest to label in practice, from my perspective. Mark it clearly as `[Lindsay to fill in: which dimensions felt hardest to label and why]` so I can find it later.

This section should read rough, human, and specific. Not marketing.

### 5. WHY A MODEL, NOT A LECTURE
Brief conceptual walkthrough of the pipeline at a non-technical level: TikTok URL → video downloaded → audio transcribed (Whisper) → on-screen text OCR'd (Claude Vision) → three text streams fused → scored by a fine-tuned DistilBERT classifier with a 6-dimension head + composite head. No equations. Link out to the GitHub repo for the technical report.

### 6. ETHICS & LIMITATIONS
Pull from §8 of `docs/REPORT.md`. Key points:
- Claude labels are approximations of expert judgment, not ground truth.
- The model scores surface features of the fused text, not creator intent or psychological impact on any specific viewer.
- Small sample size (~3,500 items) — not commercial-grade.
- Rubric is one defensible taxonomy, not the only one.

### 7. REFERENCES
Proper formatted citations for everything cited above, with DOI or stable URL links where available. Verify every link resolves before finalizing. Group by section or alphabetize — your call, whatever reads cleaner.

---

## SOURCE DISCIPLINE

Every factual claim on the About page must be backed by a citeable source. Rules:

- Every paragraph that makes an empirical claim cites at least one source inline (e.g., "Przybylski et al., 2013") and links to that source in the References section at the bottom with a DOI or stable URL.
- For the Meta/MDL section, cite actual court filings, state AG complaints, and reporting from NYT/WSJ/Reuters. Link to the MDL docket page on the N.D. Cal. public record or the court's public order list where possible. If you can't find a stable public link for a specific filing, cite the reporting that referenced it.
- If a claim doesn't have a source you can verify via web search, CUT THE CLAIM. Don't soften it and keep it.
- Do NOT cite Wikipedia as a source. Use it to find primary sources, then cite those.
- Before considering the page done, do one full pass where you walk every claim against its citation and confirm the cited source actually supports the claim being made. Flag anything shaky in the handoff file and cut it from the page.

Minimum citation coverage (these are the researchers already in the project's bibliography — use them where relevant, and add more as needed):
- Munger (2020), Mathur et al. (2019), Crockett (2017), Brady et al. (2017, 2021)
- Przybylski et al. (2013), Cialdini (2009)
- Small, Loewenstein, & Slovic (2007), Kramer, Guillory, & Hancock (2014)
- Loewenstein (1994), Blom & Hansen (2015), Scott (2021)
- Skinner (1953), Alter (2017), Montag et al. (2019)
- Bai et al. (2022), Zheng et al. (2023)
- Chakraborty et al. (2016), Potthast et al. (2018)
- Sanh et al. (2019) for DistilBERT

Full list and exact formatting in `docs/REPORT.md` references section — match that style.

---

## DESIGN GUIDANCE

- Observatory aesthetic: dark bg (match existing), restrained palette, generous white space, confident typography.
- Typography is the star. No busy backgrounds competing with long-form prose. If you use framer-motion on the About page, keep it subtle — fade-in on scroll at most.
- Color-per-dimension: when introducing each of the six dimensions in section 3, use the existing dimension color accents from the homepage (check `frontend/components` for where they're defined — likely `gallery-tiles.tsx` or a theme file).
- Reading width capped (~70ch). This is a text page; don't let lines run the full screen.
- Footnote/citation style: inline parenthetical with link to the References section anchor. Standard academic-adjacent web style.
- Add a minimal header with two links max: "LUCID" (back to `/`) and "About" (current page). On the homepage, add the "About" link to the existing header area without reorganizing the hero.

---

## ACCESSIBILITY

- Every link has a visible focus state.
- Every image (if any) has alt text.
- Semantic HTML: headings are `<h1>`/`<h2>`/`<h3>` in order, not styled `<div>`s.
- Respect `prefers-reduced-motion` if you add any animation.
- Color contrast passes WCAG AA for body text.

---

## MOBILE PARITY (required)

Mobile is not a shrunk-down desktop. It's a first-class target. The About page must be as polished on a phone as on a laptop — if you wouldn't read this comfortably on an iPhone at 2am, it's not done.

Requirements:
- Test at 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Pro Max), and 768px (iPad portrait). Every section must render cleanly at all four.
- Typography scales down responsively. Body text stays readable (min 16px on mobile, 1.55+ line-height). Headings shrink proportionally — no desktop-sized h1s overflowing the viewport.
- Reading width adapts: ~70ch on desktop, full width with generous padding (min 20px sides) on mobile.
- Touch targets are at least 44x44px (links in nav, citation footnote links, any interactive element).
- No horizontal scroll at any breakpoint. Ever. If a line of text or a code block would cause horizontal scroll on mobile, reflow it.
- Nav works on mobile. If two links still fit in a simple horizontal header at 375px, great — keep it simple. If not, use a minimal stacked layout, not a hamburger menu (two links doesn't warrant one).
- Citations and references: inline citation links must be tappable without zooming. The References section at the bottom must be scrollable and copy-pasteable on mobile.
- Color-per-dimension accents: make sure contrast still passes WCAG AA on smaller screens where accent colors may be visually denser.
- If you add any scroll-triggered fades or reveals, they must work on touch scroll (iOS Safari momentum scroll) — not just mouse-wheel scroll. Test on actual touch scroll behavior, not just devtools resize.
- Performance: mobile LCP should not regress versus the current homepage. No layout shift as sections load. Lazy-load anything heavy (if you embed any images/SVGs).

Before you summarize the session, do a mobile pass: walk through `/about` at 375px width, list anything that looks off, and either fix it or flag it explicitly in the handoff.

---

## EXECUTION ORDER

1. Create a branch off main. Name it something like `feat/about-page`.
2. Read `docs/REPORT.md` (especially §1, §2.1, §2.2, §3, §8), `docs/RUBRIC.md`, and `frontend/AGENTS.md`. Note anything unclear in the handoff file and proceed using the most conservative interpretation.
3. Scaffold the `/about` route and a stub nav link. Verify homepage still works. Commit.
4. Write one section at a time. Verify citations section-by-section (do the source walk as you go, not at the end). Commit per section.
5. After all sections written: do a full source-verification pass. Fix or cut anything shaky.
6. Run `npm run build`. Fix issues. Commit.
7. Manual walk-through: `/` works, `/about` works, nav works both directions, mobile viewport looks OK, reduced-motion honored if relevant.
8. Write a handoff file at `docs/SESSION_1_HANDOFF.md` containing:
   - Branch name
   - What's on the page (section by section, one line each)
   - Which sources you cited (full list with URLs)
   - Which claims you CUT because you couldn't verify a source (list them so I can decide later)
   - Any `[Lindsay to fill in]` placeholders and where they are
   - Any design choices where you picked between options — say which you picked and why
   - Build status (passed/failed) and any test walk-throughs you performed
   - Mobile pass results at 375/390/430/768px — what you tested, what you fixed, what still looks off
   - Anything that didn't work that you want me to know about
9. STOP. Do NOT merge to main. Do NOT run `git push origin main`. Do NOT run any deploy command. Do NOT run `vercel --prod`. Push your feature branch to origin so I can see a Vercel preview, then stop. The final state of the repo should be: main unchanged, feature branch pushed, handoff file committed on the branch.
10. Under no circumstances should you delete, rewrite, or "clean up" files outside the scope of this session. If you see something that looks wrong elsewhere in the repo, leave it alone and note it in the handoff.

---

## QUALITY BAR

I want this page to feel like a real researcher wrote it about work they care about. Not a course project. Not a marketing page. If a section reads generic, rewrite it. If a citation is padding, cut it. If the voice wobbles between academic and casual, pick one and commit (leaning toward clear and plainspoken over academic). When the page is done, it should be something I'd be proud to link to in a grad school application or a conference talk.

---

## AUTONOMOUS OPERATION DEFAULTS

I am not watching this session. You will not get live answers from me. Do not wait for input. Do not write questions to a file expecting a response. When a decision point comes up, follow these defaults:

- Meta case fact ambiguous after web search → CUT the specific claim. Keep the general framing, drop the unverifiable specific.
- Ethics framing unclear → lean plainspoken and conservative. Err on the side of understating.
- Design choice could go two ways → pick the more restrained option. Typography over flourish. Monochrome over color. Simple over clever.
- Section feels thin because source material is thin → write what you can defend, leave a clearly-marked `[Lindsay: this section needs more material — current sources are X, Y]` placeholder, and move on. Do not pad with unsourced material.
- Build error you can't fix in 3 attempts → revert the last commit that introduced it, note the failure in the handoff, and continue with the rest of the work.
- Type error requires non-trivial restructuring → revert the change that caused it, use a simpler approach, continue.

When in doubt: cut, don't invent. Less content with solid sources beats more content with shaky ones.

---

## FINAL CHECK BEFORE STOPPING

Before you write the handoff file and stop, re-read this entire prompt top-to-bottom one time. For each section, ask: did I actually do this? If you skipped or softened anything, either go back and do it, or note the skip explicitly in the handoff. Do not skip this step.
