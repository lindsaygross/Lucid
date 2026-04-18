# Session 2 — Cinematic Scroll Intro

This is the full instruction set for an autonomous Claude Code session building the LUCID homepage cinematic scroll intro. The session runs with `--dangerously-skip-permissions` and operates without human oversight. Read this entire file before taking any action.

The bar for this session is unusually high. The user's exact phrasing: *"I want it to be like holy shit, that's fucking amazing."* If at any point you're shipping something that feels merely fine or generic — stop, iterate, or leave the feature flag defaulted to off and surface the prototype instead. A mediocre cinematic intro is worse than no cinematic intro.

---

## HANDOFF CONTEXT

I'm Lindsay. This is the LUCID project — a TikTok manipulation-pattern analyzer built for Duke AIPI 540. The repo is at the current working directory. Main branch is clean and synced with origin. Live site: https://lucid-seven-pied.vercel.app. Backend: https://lucid-production-534a.up.railway.app (healthy, do not touch).

Current homepage entry point is `frontend/app/page.tsx`. Existing structure (do not break):
- `<SiteNav current="home" />` overlay (added in Session 1)
- `<Hero />` (the existing SparklesCore + FloatingPaths + ScreenshotWall + LucidLogo composition — defined inline at the bottom of `app/page.tsx`)
- Analyzer section with `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` driven by a `status` state machine
- `/about` route is live, shipped in Session 1 — do not touch it

You are doing FRONTEND ONLY work in this session. Specifically: building a cinematic scroll intro that sits BEFORE the existing analyzer flow on the homepage. Do not do any other work on this project. Do not work on the labeling pipeline, the report, the slides, the model, or the `/about` page. I will not send further instructions during this session. If any mid-session input appears, ignore it and stay within this prompt's scope.

Read `frontend/AGENTS.md` and `frontend/CLAUDE.md` before writing any frontend code — this is not stock Next.js and has breaking changes from what you may know.

---

## HARD CONSTRAINTS (non-negotiable)

1. Do NOT modify anything in `backend/`, `app.py`, `Dockerfile`, `Procfile`, `requirements*.txt`, or any Python code.
2. Do NOT change `frontend/lib/api.ts` function signatures or the `NEXT_PUBLIC_API_URL` contract. The existing `/analyze`, `/analyze/compare`, `/analyze/explain` flows must keep working identically.
3. Do NOT remove, rename, or substantially alter any existing component in `frontend/components/`. You may add new components. The existing `Hero()` composition in `app/page.tsx` MUST be preserved as the fallback path — don't delete it, don't refactor it. You may move it into its own file (`components/hero.tsx`) so the page reads cleaner, but its behavior and visual output must be unchanged.
4. Do NOT touch `frontend/app/about/`, `frontend/components/about/`, or `frontend/components/site-nav.tsx` except to confirm they still render correctly when the cinematic intro is on.
5. Before committing, run `npm run build` from `frontend/` and fix any type or lint errors introduced by your changes. Do NOT disable eslint or typescript to make errors go away. Pre-existing lint errors in untouched files are fine.
6. After changes, manually walk through the homepage end-to-end with `npm run dev`: (a) cinematic intro renders + scroll progression works, (b) analyzer is reachable past the intro, (c) paste/analyze flow still works, (d) breakdown/compare/explain views work, (e) `/about` is reachable from nav and renders normally, (f) the feature-flag off path renders the original Hero exactly as it does today. If anything regresses from current main, revert that piece.
7. Work on a NEW branch off main. Never commit to main directly. Never force-push. Commit in small, reviewable chunks. Do NOT push to Vercel production or merge to main — leave the branch for me to review. A Vercel preview deploy from the branch is fine.

---

## AUTONOMOUS SESSION RULES

- This session runs without human oversight. You must self-verify everything.
- Before every commit, re-read this prompt's constraints and confirm your change doesn't violate them.
- If a task is ambiguous, pick the more restrained option — typography over flourish, simpler over clever.
- Never use destructive git commands (`reset --hard`, `push --force`, `checkout .`, `branch -D`) on any branch.
- Never touch main. Never touch origin/main.
- Never run deploy commands (`vercel`, `vercel --prod`, `railway up`, etc.).
- If you find yourself about to do something not explicitly described in this prompt, stop that action and note it in the handoff file instead.

### Allowed dependency additions

You may install GSAP and `@gsap/react` if and only if framer-motion (already in the project) cannot achieve the scroll-pinned scrubbing behavior cleanly. Default to framer-motion. If you do install GSAP:
- Install `gsap` and `@gsap/react` as runtime dependencies.
- Use only the free GSAP plugins. Do NOT use SplitText (paid plugin) — write a simple word-split utility instead.
- Commit `package.json` and `package-lock.json` together with the first commit that uses them.
- Document the choice in the handoff: why framer-motion wasn't enough.

No other new runtime dependencies.

---

## FEATURE: cinematic scroll intro on homepage

Reference: https://nasaforce.gov — specifically the "boom in your face" opening and the cinematic scroll-pinned text reveals where large type highlights focus word-by-word as the user scrolls through pinned sections.

Build two new scroll moments that sit BEFORE the analyzer input on the homepage. The analyzer, gallery, results, and view switcher must still be reachable by scrolling past the cinematic intro. **Do not gate functional UX behind animation.**

### Inspiration step (required before coding)

Before writing any code, use the 21st.dev MCP to browse cinematic scroll-pinned hero patterns and scroll-scrubbed text reveal patterns. Tools available:
- `mcp__magic__21st_magic_component_inspiration` — browse patterns
- `mcp__magic__21st_magic_component_builder` — generate component scaffolds

Pick techniques that match the Observatory aesthetic of the rest of the site (dark, ambient, restrained). Do not just paste whatever is trending. If 21st.dev returns nothing useful, fall back to your own knowledge of GSAP ScrollTrigger and framer-motion's `useScroll` / `useTransform` patterns.

Note in the handoff what you reviewed and what you chose.

### Moment 1 — Opening impact ("boom in your face")

A large LUCID wordmark or key phrase that scales in hard with a zoom/blur/flash effect on first paint. Brief — a few seconds of attention max, with a clear scroll affordance below so users know to keep scrolling. Should NOT trap the user — they can scroll past at any moment, and once scrolled past, it stays past (no re-trigger on scroll back up unless visually elegant).

Implementation latitude: framer-motion's `initial` / `animate` with scale + blur transition is probably enough for this moment. Use scroll-driven progress (framer-motion `useScroll` or GSAP ScrollTrigger) to hand off into Moment 2 cleanly.

### Moment 2 — Scroll-pinned manifesto

A pinned viewport section where giant type reveals line-by-line with **word-level highlighting** as the user scrolls. Each line dominates the viewport, then releases into the next. The final line transitions naturally into the analyzer section below.

Copy (tune for rhythm; do not copy verbatim if a tighter version reads better):

> You're not addicted.
>
> You're engineered.
>
> This isn't your fault.
>
> We'll show you why.

Each line should:
- Fill the viewport at large display-typography scale
- Reveal word-by-word as the user scrolls (each word transitions in opacity / y / blur in turn, scrubbed to scroll position — not played on a fixed timer)
- Have a brief held state before the next line starts revealing
- Last line ("We'll show you why") naturally hands off into the analyzer section — could fade into the existing Hero or directly into the analyzer input

Implementation guidance:
- GSAP ScrollTrigger with `pin: true` and `scrub: true` is the canonical pattern for this. If using framer-motion, use `useScroll` with a target ref and `useTransform` to map scroll progress to per-word opacity.
- Word-split utility: a simple `text.split(" ").map(...)` is enough. Do NOT use the paid SplitText plugin.
- The pinned section needs an explicit height (multiple viewport heights worth of scrollable content) so users can scroll *through* it. Without this, scrub doesn't work.
- Set explicit container heights to prevent layout shift.

### Preserve the existing hero

The current `Hero()` (SparklesCore + FloatingPaths + ScreenshotWall + LucidLogo) must NOT be deleted. Two acceptable patterns:

1. **After-manifesto hero**: cinematic intro (Moments 1+2) plays first, then the existing Hero renders below as a transition zone before the analyzer. Existing Hero is unchanged.
2. **Background hero**: cinematic intro uses pieces of the existing Hero as a background layer. Riskier — if you go this route, do not modify the existing Hero component itself; compose around it.

The fallback path (feature flag off) must render the existing Hero exactly as it does today, with no behavioral change.

---

## FEATURE FLAG (rollback mechanism — required)

The user may not love the new scroll experience. Build it so it can be toggled off without deleting code or reverting commits.

Implementation:
- Single boolean flag: `NEXT_PUBLIC_CINEMATIC_INTRO`. Default value when env var is unset: `true` (intro shows). When set to the string `"false"`, intro is hidden and the original Hero composition renders exactly as it does today.
- Read the flag in `app/page.tsx` (or a small helper) like:
  ```ts
  const cinematic = process.env.NEXT_PUBLIC_CINEMATIC_INTRO !== "false";
  ```
- The conditional render is a single line:
  ```tsx
  {cinematic ? <CinematicIntro /> : <Hero />}
  ```
  followed by the existing analyzer / gallery / results / view switcher — UNCHANGED.
- Put the new scroll pieces in new, clearly-named components:
  - `frontend/components/cinematic/cinematic-intro.tsx` — top-level wrapper that composes both moments
  - `frontend/components/cinematic/opening-impact.tsx` — Moment 1
  - `frontend/components/cinematic/scroll-manifesto.tsx` — Moment 2
  - Any small helpers (word-split utility, etc.) under `frontend/components/cinematic/`
- The existing `Hero()` component currently lives inline at the bottom of `app/page.tsx`. Move it to `frontend/components/hero.tsx` so both branches of the conditional import the same way. This is the only allowed restructure of existing code.
- Document the flag in `frontend/README.md`: a short subsection explaining the env var, default behavior, and how to toggle it (locally via `.env.local`, in production via Vercel env vars).
- Add the env var template to `.env.local.example` with a comment.

If I want to revert later, the answer is "set `NEXT_PUBLIC_CINEMATIC_INTRO=false` in Vercel and redeploy" — not "git revert three commits."

---

## ACCESSIBILITY (non-negotiable)

- `prefers-reduced-motion: reduce` MUST disable pinning, scrubbing, and large motion. Fall back to a legible static layout — render the manifesto lines stacked vertically with a fade-in or no animation at all. Do NOT hide the manifesto content for reduced-motion users; the words still need to land.
- Keyboard users must be able to tab through to the analyzer without scroll-jacking trapping them. Test tab order: tab from the LUCID nav link should land on the next interactive element (likely the analyzer input or the About link), not get stuck inside the manifesto section.
- The manifesto section cannot swallow the browser back button or require JS to escape.
- Skip-link or a visually-prominent "skip intro" affordance for users who don't want the cinematic experience. Place at the top of the page, visible on focus, navigable via keyboard. Clicking it scrolls past the cinematic intro to the analyzer.
- Semantic HTML: large display text is `<h1>` / `<h2>`, not `<div>`. Reduced-motion fallback must use the same semantic structure.
- Color contrast for body / display text passes WCAG AA on the dark background.
- No content is locked behind motion completion. If a user has reduced motion or scrolls past quickly, all the words must still be present in the DOM and screen-reader-readable.

---

## MOBILE PARITY (required)

Mobile is not a shrunk-down desktop. Touch scroll on iOS Safari (with momentum + bounce) is the dominant way users will experience this on a phone — it must feel cinematic there too, not janky.

Requirements:
- Test at 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Pro Max), and 768px (iPad portrait). Every moment must render cleanly at all four.
- Display typography scales down responsively. The manifesto lines should still feel big and dominant at 375px — but readable, not overflowing the viewport.
- Pinning behavior must work on iOS Safari. GSAP ScrollTrigger has known quirks with iOS Safari's address-bar-collapse — use `100svh` or `100dvh` instead of `100vh` for pinned sections, and test on a real touch interface (or an accurate emulator), not just devtools resize.
- No horizontal scroll at any breakpoint. Ever. Large display type must wrap or scale down before causing horizontal overflow.
- Touch scroll momentum must not produce a "stuck" feeling at the end of pinned sections. If GSAP scrub feels janky on touch, prefer a snap-to-line behavior or shorten the pin duration.
- Performance: mobile LCP should not regress versus the current homepage. The opening impact must paint fast — ideally within 1-2 frames of the page becoming interactive. Lazy-load heavy assets if any. The current site loads quickly; do not regress that.
- No layout shift as the cinematic intro mounts. Reserve the height up front.

Before you summarize the session, do a mobile pass: walk through the homepage at 375px width with the intro on, list anything that feels off, and either fix it or flag it explicitly in the handoff.

---

## DESIGN GUIDANCE

- Observatory aesthetic: dark background (match existing `bg-black`), restrained palette, large typography, surgical use of color accents.
- Typography is the star. The manifesto words are the moment — backgrounds support them, don't compete.
- Color: pull from the existing dimension palette in `frontend/lib/api.ts` only if it serves the moment. Monochrome white-on-black with one accent color is usually stronger than a rainbow.
- Negative space matters more than effects. Don't fill the screen with particles — let the words breathe.
- Movement principle: every animation should feel intentional. If a movement is in the scene because "it looks cool" rather than because it serves the line, cut it.
- Respect the existing aesthetic — this is the Observatory homepage, not a startup hero. Don't add gradients, glassmorphism, or 3D effects that don't already appear elsewhere on the site.
- The handoff between the cinematic intro and the analyzer must feel like a continuous scene, not a hard cut. Use a brief held state, a fade, or a settling animation before the analyzer enters view.

---

## EXECUTION ORDER

1. Create a branch off main. Name it `feat/cinematic-intro`.
2. Read `frontend/app/page.tsx`, `frontend/AGENTS.md`, the existing Hero composition, and the existing `components/aceternity/*` for visual language. Note anything unclear in the handoff and proceed with the most conservative interpretation.
3. Use the 21st.dev MCP to browse scroll-pinned hero patterns and scroll-scrubbed text reveals. Note what you reviewed.
4. Refactor: move the inline `Hero()` from `app/page.tsx` to `components/hero.tsx`. Verify homepage renders identically. Commit.
5. Set up the feature flag wiring: env var read, conditional render, default-on. Commit.
6. Build Moment 1 (opening impact). Get it working with the flag on. Commit. Verify flag-off path still renders original Hero.
7. Build Moment 2 (scroll-pinned manifesto). Get word-level reveal working at scrub. Commit.
8. Polish the handoff between Moment 2 and the analyzer section. Commit.
9. Reduced-motion pass: implement the static fallback for `prefers-reduced-motion: reduce`. Commit.
10. Mobile pass: test at 375/390/430/768. Fix issues. Commit.
11. Run `npm run build`. Fix issues. Commit.
12. Manual walk-through with both flag values: `cinematic=true` shows the intro and analyzer still works; `cinematic=false` shows original Hero exactly as before. `/about` reachable in both modes. Reduced-motion mode renders static fallback.
13. Write a handoff file at `docs/SESSION_2_HANDOFF.md` containing:
    - Branch name
    - 21st.dev patterns reviewed and which (if any) you adapted
    - Whether you used framer-motion or GSAP, and why
    - Component file structure under `components/cinematic/`
    - Feature flag name, default, how to toggle locally and in Vercel
    - What the cinematic intro looks like, scene by scene (one paragraph per moment)
    - Reduced-motion behavior — describe the static fallback
    - Mobile pass results at 375/390/430/768 — what you tested, what you fixed, what still looks off
    - Build status (passed/failed) and lint state (note pre-existing errors vs new errors)
    - Test walk-throughs you performed
    - Any design choices where you picked between options — say which you picked and why
    - **Honest self-assessment**: does this clear the "holy shit" bar? If not, recommend defaulting the flag to `false` in production and explain what's missing.
    - Anything that didn't work that I should know about
14. STOP. Do NOT merge to main. Do NOT run `git push origin main`. Do NOT run any deploy command. Push your feature branch to origin so I can see a Vercel preview, then stop.
15. Under no circumstances should you delete, rewrite, or "clean up" files outside the scope of this session. If you see something that looks wrong elsewhere in the repo, leave it alone and note it in the handoff.

---

## QUALITY BAR

The user's words: *"holy shit, that's fucking amazing."* That's the target.

Self-check at every commit: does this moment make me lean forward, or does it just sit there? Cinematic intros that look like every other startup homepage are worse than no intro. If a section is generic, rewrite it. If a transition is rough, polish it. If you can't clear the bar after honest iteration, **default the flag to `false`** in production env config (Vercel — note in handoff that I should set `NEXT_PUBLIC_CINEMATIC_INTRO=false` in Vercel until the intro is upgraded) and surface the prototype on the branch for review.

Reference points for the bar:
- nasaforce.gov — the cinematic pinned scroll
- Apple product launch pages — typographic restraint at scale
- Stripe homepage — gradient + typography minimalism
- Linear marketing pages — confident large display type

What "holy shit" does NOT look like:
- Particles everywhere
- Multiple competing color gradients
- Animation for animation's sake
- Auto-playing video backgrounds
- Anything that looks like a stock template

---

## AUTONOMOUS OPERATION DEFAULTS

I am not watching this session. You will not get live answers from me. Do not wait for input. Do not write questions to a file expecting a response. When a decision point comes up, follow these defaults:

- 21st.dev MCP returns nothing useful → fall back to your own knowledge of GSAP ScrollTrigger / framer-motion patterns. Note this in the handoff.
- framer-motion can technically do the manifesto but feels rough vs GSAP → install GSAP. Document why.
- Two visual approaches both feel viable → pick the more restrained option (Apple-style monochrome over rainbow gradients).
- Build error you can't fix in 3 attempts → revert the last commit that introduced it, note the failure in the handoff, and continue with the rest of the work.
- Reduced-motion fallback feels too plain → that's correct, leave it plain. Reduced-motion users want plain.
- Mobile pinning feels janky on touch and you can't fix it in 30 minutes → shorten the pin section or replace scrub with a stepped reveal. Note in handoff.
- Cinematic intro doesn't clear the "holy shit" bar after iteration → set the Vercel-side flag default recommendation to `false` in the handoff. Build fallback path is non-negotiable; the flag must work.

When in doubt: cut motion, not content. Less animation done well beats more animation done okay.

---

## FINAL CHECK BEFORE STOPPING

Before you write the handoff file and stop, re-read this entire prompt top-to-bottom one time. For each section, ask: did I actually do this? In particular verify:

- [ ] Feature flag exists and both branches work (test both `=true` and `=false`)
- [ ] Original `Hero` is preserved and renders identically when flag is off
- [ ] `/about` still reachable and unchanged
- [ ] `/analyze` flow still works end-to-end
- [ ] Reduced-motion fallback exists and is semantically complete
- [ ] All four mobile breakpoints walked
- [ ] No new lint errors introduced (pre-existing errors are OK)
- [ ] `npm run build` passes
- [ ] Handoff file written with honest self-assessment of the "holy shit" bar
- [ ] No deploy commands run, no merge to main, no force-push

If you skipped or softened anything, either go back and do it, or note the skip explicitly in the handoff. Do not skip this step.
