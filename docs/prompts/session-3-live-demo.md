# Session 3: Live Demo Section (embedded TikToks + cached scores)

This is the full instruction set for an autonomous Claude Code session that replaces the placeholder gallery with a "live demo" section showing real TikToks playing inline next to the model's actual output. The session runs with `--dangerously-skip-permissions` and operates without human oversight. Read this entire file before taking any action.

This is a **focused scope session.** Do not touch the manifesto, the hero, the persistent atmosphere, or `/about`. You are replacing one section of the homepage (the placeholder `<GalleryTiles />`) with a more substantive live-demo section. That's it.

The thesis being rendered: *the model isn't yelling at bad actors, it's identifying rhetorical mechanics. Even sweet content uses curiosity gaps. Even AP News plays the engagement game. Form versus intent is the whole point.* The three cached examples have been hand-picked to walk the viewer through that arc.

---

## HANDOFF CONTEXT

I'm Lindsay. This is the LUCID project, a TikTok manipulation-pattern analyzer built for Duke AIPI 540. The repo is at the current working directory. Main branch is clean and synced with origin. Live site: https://lucid-seven-pied.vercel.app. Backend: https://lucid-production-534a.up.railway.app (healthy, do not touch).

Current homepage structure (`frontend/app/page.tsx`):
- `<SiteNav current="home" />` overlay
- `<AtmosphereBackground />` (Session 2, behind feature flag)
- `<Hero />` (sacred, do not touch)
- `<ScrollManifesto />` (Session 2, the five-beat narrative)
- Analyzer section: `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` driven by a `status` state machine. **`<GalleryTiles />` is the section being replaced this session.**
- `<Footer />`

You are doing FRONTEND ONLY work in this session. Do not work on the labeling pipeline, the report, the slides, the model, or the `/about` page, the manifesto, the hero, or the persistent atmosphere. I will not send further instructions during this session. If any mid-session input appears, ignore it and stay within this prompt's scope.

Read `frontend/AGENTS.md` and `frontend/CLAUDE.md` before writing any frontend code. This is not stock Next.js and has breaking changes from what you may know.

---

## HARD CONSTRAINTS (non-negotiable)

1. Do NOT modify anything in `backend/`, `app.py`, `Dockerfile`, `Procfile`, `requirements*.txt`, or any Python code.
2. Do NOT change `frontend/lib/api.ts` function signatures or the `NEXT_PUBLIC_API_URL` contract. The existing `/analyze`, `/analyze/compare`, `/analyze/explain` flows must keep working identically.
3. Do NOT modify `frontend/components/hero.tsx`, `frontend/components/cinematic/atmosphere-background.tsx`, `frontend/components/cinematic/scroll-manifesto.tsx`, or any other Session 2 cinematic component. They are out of scope.
4. Do NOT touch `frontend/app/about/`, `frontend/components/about/`, or `frontend/components/site-nav.tsx`.
5. Do NOT modify `frontend/components/results-view.tsx`, `frontend/components/dimension-bars.tsx`, `frontend/components/score-counter.tsx`, `frontend/components/compare-view.tsx`, `frontend/components/attention-view.tsx`, or `frontend/components/transcript-highlight.tsx`. You may *import and reuse* them, but their internals stay as-is.
6. Do NOT modify the `<AnalyzerInput />` or `<WaitState />` components.
7. **You may delete `frontend/components/gallery-tiles.tsx`** since it is being replaced. Confirm no other file imports it before deleting (search the codebase). Update `app/page.tsx` to swap in the new live-demo component.
8. Do NOT use em dashes anywhere in code, copy, comments, or commit messages. Em dashes read as AI-generated. Use commas, periods, parentheses, or rephrase.
9. Before committing, run `npm run build` from `frontend/` and fix any type or lint errors introduced by your changes. Do NOT disable eslint or typescript to make errors go away. Pre-existing lint errors in untouched files are fine.
10. After changes, manually walk through the homepage end-to-end with `npm run dev`: (a) hero unchanged, (b) atmosphere persists past hero, (c) manifesto plays with locked copy intact, (d) live-demo section renders with three cards, (e) embeds load and play, (f) paste/analyze flow still works (paste a real TikTok URL, see `<ResultsView />` render), (g) breakdown/compare/explain views work, (h) `/about` reachable, (i) feature flag off path renders the original gallery (or a simple fallback, see below).
11. Work on a NEW branch off main. Name it `feat/live-demo`. Never commit to main directly. Never force-push. Commit in small, reviewable chunks. Do NOT push to Vercel production or merge to main. Leave the branch for me to review. A Vercel preview from the branch is fine.

---

## AUTONOMOUS SESSION RULES

- This session runs without human oversight. You must self-verify everything.
- Before every commit, re-read this prompt's constraints and confirm your change doesn't violate them.
- If a task is ambiguous, pick the more restrained option. Typography over flourish. Simpler over clever.
- Never use destructive git commands (`reset --hard`, `push --force`, `checkout .`, `branch -D`) on any branch.
- Never touch main. Never touch origin/main.
- Never run deploy commands (`vercel`, `vercel --prod`, `railway up`, etc.).
- If you find yourself about to do something not explicitly described in this prompt, stop that action and note it in the handoff file instead.

### Allowed dependency additions

You may install **one** new dependency if needed: a small lazy-load helper for the TikTok embeds (e.g., `react-intersection-observer`) so the embeds initialize only when scrolled into view. If you can do lazy loading with the standard browser `IntersectionObserver` API or a custom hook, prefer that and skip the dependency.

No other new dependencies.

---

## THE CACHED DATA

Three pre-analyzed TikToks live at `scripts/cached/`. Each is a full `AnalysisResult` JSON matching the `AnalysisResult` type in `frontend/lib/api.ts`. Drop them into the page at build time as static imports.

The three picks have been chosen deliberately to walk the viewer through a specific arc. The card framing copy below is locked. Render it exactly. No paraphrasing.

### Card 1: "the textbook example"
- File: `scripts/cached/high_donotfind.json`
- Source: `@donotfindthisaccountever`
- Score: 53
- Top dims: engagement bait 0.63, curiosity gap 0.70, dopamine design 0.69
- Narrative role: This is what manipulation looks like at its most obvious. Stacked engagement bait + curiosity gap + dopamine design in a single post.

**Locked card framing:**
> **The textbook example.**
>
> A teenager doing maximum-engagement storytime: caps-locked overlay text, an emotional hook in the caption, a payoff that never quite arrives. Curiosity, dopamine, and engagement bait stacked in a single post.

### Card 2: "form, not intent"
- File: `scripts/cached/med_rossjenna3.json`
- Source: `@rossjenna3`
- Score: 44
- Top dims: curiosity gap 0.84 (highest single dimension in the entire batch), dopamine design 0.66
- Narrative role: A genuinely sweet moment. The model still flags the rhetorical move (the curiosity-gap caption construction), regardless of intent. This is the "form versus intent" beat from the manifesto, made tangible.

**Locked card framing:**
> **Form, not intent.**
>
> A genuinely wholesome moment, a 26-year-old realizing the high school refs they used to swear at were just dads volunteering. The caption still uses curiosity-gap construction. The model catches the rhetorical move, not the creator's intent. That distinction is the whole point.

### Card 3: "even the news plays the game"
- File: `scripts/cached/low_apnews.json`
- Source: `@apnews`
- Score: 36
- Top dims: curiosity gap 0.60, dopamine design 0.41
- Narrative role: Lowest score in the batch, but not zero. Even Associated Press structures its TikTok captions to compete on the platform. The thesis extends: this isn't just bad actors, it's the system. Everyone playing the engagement game uses some of the same mechanics.

**Locked card framing:**
> **Even the news plays the game.**
>
> A straight news post about jet fuel shortages in Europe. Lowest score in the demo. But it's not zero. Even Associated Press structures its TikTok captions to compete on the platform. The system shapes everyone, not just bad actors.

---

## FEATURE: live demo section

Replace the existing `<GalleryTiles />` invocation in `app/page.tsx` with a new `<LiveDemo />` component. The new section sits in the same position (between `<AnalyzerInput />` and the rest of the analyzer state machine) when the page is in `idle` status.

Component file: `frontend/components/live-demo/live-demo.tsx` (or split into smaller files under `frontend/components/live-demo/` if it gets large).

Each of the three cards renders:

**Left side (or top, on mobile): the embedded TikTok player.**
- Use TikTok's official oEmbed format. The embed snippet looks approximately like:
  ```html
  <blockquote class="tiktok-embed" cite="VIDEO_URL" data-video-id="VIDEO_ID">
    <section><a target="_blank" href="VIDEO_URL"></a></section>
  </blockquote>
  <script async src="https://www.tiktok.com/embed.js"></script>
  ```
- Load `https://www.tiktok.com/embed.js` once, lazily, only when the live demo section is about to enter the viewport. Use `IntersectionObserver` (or `react-intersection-observer` if necessary). Do NOT load the embed script in the document head; that would slow down LCP for everyone, including users who never scroll to the demo.
- Each `<blockquote>` references the `source_url` from the cached JSON (already present in every JSON file).
- The embeds will render at TikTok's default dimensions (typically 605px max width, video at 9:16 aspect ratio). Wrap them in a container that constrains the width and keeps the layout stable.
- If an embed fails to load (creator deletes the video, network blocks the embed script, etc.), show a fallback card with a screenshot placeholder or a simple "video unavailable" state, plus the score breakdown still visible. Do not let one broken embed break the whole page.

**Right side (or below, on mobile): the analyzer's actual output for that TikTok.**
- The cached JSON matches the `AnalysisResult` type exactly. You can either:
  - **Option A (preferred):** import the JSON files directly and pass them to a slim card-sized version of the results display. Reuse `<DimensionBars />` and `<ScoreCounter />` if they fit; otherwise build a smaller `<DemoScoreCard />` variant in the live-demo folder.
  - **Option B (fallback if A is too much work):** import the JSON and render directly to `<ResultsView />` itself. Less polished but functional.
- Display: the score (large, prominent), the six dimension bars (use the existing color-per-dimension palette), and the rewrite text ("See Through It"). Caption text is optional. Transcript is too long to show inline; skip it.
- Card framing copy (the locked text above) renders above each card's score breakdown as the section heading, in the same eyebrow + heading typography pattern used elsewhere on the site.

**Section structure:**
- A short framing line above the three cards. Locked: *"Three real TikToks. Three real scores. Watch the model show its work."*
- Three cards, vertically stacked on mobile, side-by-side or vertically arranged on desktop based on what reads cleaner. Don't try to fit three side-by-side; that crushes the embeds. Two-up + one-below on desktop, or single column on desktop is fine. Pick what looks best.
- Subtle scroll-driven fade-in for the section when it enters view (framer-motion `whileInView` is sufficient, already in the project).
- The embed players have audio. Do not autoplay. The viewer taps play if they want to watch.

**Bridge into the analyzer input.**
Below the three cards, before the analyzer input renders, add a single locked line:
> Now try one of yours.
This bridges the demo (passive watching) into the analyzer (active participation). Small, prominent, single sentence. Treat it as the eyebrow/section label for the analyzer input directly below.

**Important: the live demo replaces the gallery's purpose, not just its visual.**
The previous `<GalleryTiles />` had clickable sample tiles that sent placeholder text into the analyzer. **Do not graft that behavior onto the new cards.** The new cards are not clickable analyzer triggers. They are demonstrations of real product output. Watching them *is* the interaction. Anyone who wants to actually run an analysis pastes a URL into the analyzer input below. Do not add "click to analyze this sample" affordances anywhere on the new cards.

---

## FEATURE FLAG

The same `NEXT_PUBLIC_CINEMATIC_INTRO` flag from Session 2 governs whether the polished homepage shows. For Session 3:

- When `NEXT_PUBLIC_CINEMATIC_INTRO !== "false"` (default), the new `<LiveDemo />` section renders in place of `<GalleryTiles />`.
- When `NEXT_PUBLIC_CINEMATIC_INTRO === "false"`, fall back to either:
  - The original `<GalleryTiles />` placeholder (if you keep it), OR
  - A minimal placeholder with the same height that says nothing (cleaner if you delete `gallery-tiles.tsx`)
- Document the behavior in the handoff. The flag is not a Session 3 invention; you are extending its reach.

---

## ACCESSIBILITY

- Each TikTok embed must have a meaningful surrounding `<figure>` and `<figcaption>` (or aria-labelledby pattern) that describes what the video is. The embed's iframe content is not screen-readable; the surrounding context is what matters.
- Each card's score and dimension breakdown must be keyboard-focusable in a logical order.
- Color contrast for body and display text passes WCAG AA on the dark background.
- Respect `prefers-reduced-motion: reduce`: skip the scroll-driven fade-in, just show the section.
- The TikTok embeds themselves run TikTok's own player; you cannot control their accessibility. Add a fallback link beneath each embed: "Watch on TikTok" (opens in new tab). This gives screen-reader users and users who can't load the embed a path to the video.

---

## MOBILE PARITY

- Test at 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Pro Max), and 768px (iPad portrait).
- Cards stack vertically on mobile. Embed on top, score breakdown below. The video should fill the viewport width minus generous padding.
- Embeds load lazily so mobile users on slow connections don't block on the TikTok script.
- No horizontal scroll. The TikTok embed has a default min-width that can cause overflow on small viewports; use CSS to constrain it (`max-width: 100%`, `width: 100%`).
- Tap targets for "Watch on TikTok" links and any interactive elements meet 44x44px.
- Performance: lazy-load embeds so first paint is unaffected. The hero must paint as fast as it does today.

Before you summarize, do a mobile pass: walk the homepage at 375px width with the flag on, list anything that feels off, fix or flag explicitly in the handoff.

---

## DESIGN GUIDANCE

- Match the Observatory aesthetic. Dark background, restrained palette, large typography, surgical color accents (use the existing dimension palette in `lib/api.ts`).
- The TikTok embeds carry TikTok's own visual styling (white background by default, with TikTok branding). Do not try to override their styling. Just let them sit cleanly within a dark surrounding card frame. The contrast is fine.
- Each card has a clear visual hierarchy: card framing copy on top (eyebrow style), TikTok embed and score breakdown side-by-side (or stacked on mobile), no decoration competing with either.
- Negative space matters more than effects. Three cards is enough. Don't add particles, glow, gradients, or other ornamentation around the cards.
- The live demo section sits in the same scroll position as the old gallery, so it inherits the persistent atmosphere from Session 2 as its background.

### Inspiration step (encouraged)

Use the 21st.dev MCP for "case study" or "demo card" or "side-by-side video and stats" patterns. Tools available:
- `mcp__magic__21st_magic_component_inspiration`
- `mcp__magic__21st_magic_component_builder`

Pick techniques that match the Observatory aesthetic. Note in the handoff what you reviewed.

---

## EXECUTION ORDER

1. Create branch `feat/live-demo` off main.
2. Read `frontend/app/page.tsx` (especially the `idle` status branch where `<GalleryTiles />` renders), `frontend/lib/api.ts` (for the `AnalysisResult` type), `frontend/components/results-view.tsx` (to understand the existing rendering pattern), and the three JSON files in `scripts/cached/`. Note anything unclear in the handoff and proceed with the most conservative interpretation.
3. (Optional) Use the 21st.dev MCP to browse case study / demo card patterns.
4. Build a minimal `<LiveDemo />` component that imports the three JSONs and renders three cards with just the score breakdown (no embeds yet). Verify it renders cleanly. Commit.
5. Add the TikTok embed integration. Use lazy-loading via `IntersectionObserver`. Verify embeds load and play. Commit.
6. Wire the locked card framing copy above each card. Verify word-for-word. Commit.
7. Polish: section heading, fade-in, layout rhythm. Commit.
8. Mobile pass: test at 375/390/430/768. Fix issues. Commit.
9. Reduced-motion pass. Commit.
10. Run `npm run build`. Fix issues. Commit.
11. Verify no em dashes in any touched files: `grep -rn "—" frontend/app frontend/components scripts/cached`. Confirm zero. Same for commit messages and the handoff file.
12. Verify locked copy is intact word-for-word (the three card framings and the section heading).
13. Manual walk-through with both flag values: `cinematic=true` shows the live demo; `cinematic=false` falls back. `/about` reachable. `/analyze` flow works.
14. Write a handoff file at `docs/SESSION_3_HANDOFF.md` containing:
    - Branch name
    - 21st.dev patterns reviewed and which (if any) you adapted
    - Component file structure under `components/live-demo/`
    - Whether you reused `<DimensionBars />` and `<ScoreCounter />` or built new ones
    - Embed loading strategy (lazy load, fallback behavior)
    - Feature flag fallback behavior (what shows when flag is off)
    - Locked-copy audit results (confirm word-for-word match for all three card framings + section heading)
    - Em-dash audit results (zero in touched files)
    - Mobile pass results at 375/390/430/768
    - Build status and lint state
    - Test walk-throughs (including: did you actually load the page in dev and watch a TikTok embed play?)
    - Honest self-assessment: do the three cards walk the viewer through the intended arc (textbook → form vs intent → even news plays the game)? If not, what's missing?
    - Anything that didn't work that I should know about
15. STOP. Do NOT merge to main. Push the feature branch to origin so I can see a Vercel preview. Then stop.

---

## QUALITY BAR

This section's job is to render the manifesto's thesis as product. Specifically the "form, not intent" beat (Card 2) is the moment the viewer realizes the model is doing something more interesting than yelling at bad content. If Card 2 doesn't read clearly, the whole demo flattens into "look at scores."

Card 2 is the load-bearing one. Spend extra care on its visual hierarchy. The score (44) needs to live alongside the rewrite (which describes a wholesome moment) in a way that makes the contradiction visible at a glance. That contradiction *is* the demo.

What "right" looks like:
- The viewer watches Card 1's embed and thinks "yeah, that's manipulative"
- The viewer watches Card 2's embed and thinks "wait, that was sweet" then sees the curiosity-gap score and thinks "oh, the model is scoring the construction, not the vibe"
- The viewer watches Card 3's embed and thinks "even AP News?"
- The viewer scrolls down to the analyzer input and *wants* to paste their own TikTok

What "wrong" looks like:
- Three cards that look like a generic case-study grid
- Embeds that don't load or take forever to initialize
- Embeds that auto-play and create audio chaos
- The card framing copy paraphrased, shortened, or dropped
- Anything that buries the score-versus-rewrite contradiction in Card 2

If the section feels generic after honest iteration, default to a minimal version (just the three cards, no fade-in, no flourish) rather than overdesigning. Restraint beats decoration.

---

## AUTONOMOUS OPERATION DEFAULTS

- 21st.dev MCP returns nothing useful → fall back to your own knowledge. Note in handoff.
- TikTok embed script blocked or unreliable in dev → confirm it's a dev-only issue (try a manual page reload), document, and continue. The embed should work on production / preview Vercel.
- One embed renders at a different size than expected → contain it with CSS, do not rewrite TikTok's HTML.
- A cached JSON has a field you don't expect → the JSON is canonical. Adapt the rendering to match the JSON, not vice versa.
- Build error you can't fix in 3 attempts → revert the last commit that introduced it, note in the handoff, continue.
- Tempted to "improve" or paraphrase the locked copy → don't. Render it exactly.
- Tempted to use an em dash → don't. Em dashes are banned.
- Two layout options both look fine → pick the one with more negative space.

When in doubt: cut, don't add.

---

## FINAL CHECK BEFORE STOPPING

Before you write the handoff file and stop, re-read this entire prompt top-to-bottom one time. For each section, ask: did I actually do this? In particular verify:

- [ ] Hero, persistent atmosphere, manifesto, `/about` are all visually unchanged (verified by manual page load with flag on)
- [ ] Three cached JSONs imported and rendered, in the order: high_donotfind, med_rossjenna3, low_apnews
- [ ] Each card displays the score, dimension bars, and rewrite text from the cached JSON
- [ ] Each card has a TikTok embed that lazy-loads and plays on tap (no autoplay)
- [ ] All three locked card framings are rendered word-for-word (no paraphrase)
- [ ] Section heading "Three real TikToks. Three real scores. Watch the model show its work." is rendered word-for-word
- [ ] Bridge line "Now try one of yours." rendered word-for-word between the three cards and the analyzer input
- [ ] Cards are NOT clickable analyzer triggers (no "click to analyze this sample" behavior)
- [ ] Card 2 (form vs intent) makes the score-versus-rewrite contradiction visible at a glance
- [ ] Embed fallback exists for broken videos (graceful degradation, not page break)
- [ ] "Watch on TikTok" link beneath each embed (accessibility + redundancy)
- [ ] Feature flag: `cinematic=true` shows live demo, `cinematic=false` shows fallback (original gallery or empty placeholder)
- [ ] All four mobile breakpoints walked, embeds and cards look right at each
- [ ] Reduced-motion respected
- [ ] No em dashes in touched files (manifesto copy stays untouched, but verify no new em dashes in your code/comments/copy/commit messages/handoff file)
- [ ] No new lint errors introduced
- [ ] `npm run build` passes
- [ ] `/analyze` flow still works end-to-end (paste a real TikTok URL, see results render)
- [ ] Handoff file written with honest self-assessment
- [ ] No deploy commands run, no merge to main, no force-push

If you skipped or softened anything, either go back and do it, or note the skip explicitly in the handoff. Do not skip this step.
