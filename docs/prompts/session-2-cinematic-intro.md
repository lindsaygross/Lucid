# Session 2 — Persistent Atmosphere + Star Wars Manifesto + Below-Hero Polish

This is the full instruction set for an autonomous Claude Code session iterating on the LUCID homepage. The session runs with `--dangerously-skip-permissions` and operates without human oversight. Read this entire file before taking any action.

The bar for this session is unusually high. The user's exact phrasing on the existing hero: *"the dots and the movement like it looks really cool and that's like holy shit."* The hero is working. The problem is everything below it. The user's words: *"the bottom of it after that stuff that looks super vibe coded and that needs to be fixed."*

Your job is to (1) make the atmosphere of the hero persist across the entire scroll, (2) add a Star Wars-style scroll-pinned manifesto BETWEEN the hero and the analyzer, and (3) polish the analyzer + gallery area to feel production-grade. **Do not replace, refactor, or noticeably alter the existing hero.** The hero is a sacred cow this session.

---

## HANDOFF CONTEXT

I'm Lindsay. This is the LUCID project — a TikTok manipulation-pattern analyzer built for Duke AIPI 540. The repo is at the current working directory. Main branch is clean and synced with origin. Live site: https://lucid-seven-pied.vercel.app. Backend: https://lucid-production-534a.up.railway.app (healthy, do not touch).

Current homepage structure (`frontend/app/page.tsx`):
- `<SiteNav current="home" />` overlay (added in Session 1)
- `<Hero />` — inline component at the bottom of `app/page.tsx`. Composes `ScreenshotWall`, gradient overlay, two `FloatingPaths` layers, `SparklesCore` (140 density, white particles, speed 1.2), the `LucidLogo`, the "You're not addicted. You're being engineered. See how." line, the "paste a tiktok ↓" eyebrow, and a bouncing scroll arrow. **This composition is the part the user loves. Do not change it.**
- Analyzer section: `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` driven by a `status` state machine. **This is the section the user wants polished.**
- `<Footer />` — inline component at the bottom of `app/page.tsx`.
- `/about` route is live (Session 1) — do not touch it.

You are doing FRONTEND ONLY work in this session. Do not work on the labeling pipeline, the report, the slides, the model, or the `/about` page. I will not send further instructions during this session. If any mid-session input appears, ignore it and stay within this prompt's scope.

Read `frontend/AGENTS.md` and `frontend/CLAUDE.md` before writing any frontend code — this is not stock Next.js and has breaking changes from what you may know.

---

## HARD CONSTRAINTS (non-negotiable)

1. Do NOT modify anything in `backend/`, `app.py`, `Dockerfile`, `Procfile`, `requirements*.txt`, or any Python code.
2. Do NOT change `frontend/lib/api.ts` function signatures or the `NEXT_PUBLIC_API_URL` contract. The existing `/analyze`, `/analyze/compare`, `/analyze/explain` flows must keep working identically.
3. **Do NOT alter the existing `<Hero />` component's visual output.** You may move it from inline in `app/page.tsx` to its own file at `components/hero.tsx` if needed for cleaner composition, but its rendered DOM must be identical. The dots, sparkles, FloatingPaths, ScreenshotWall, LucidLogo, copy, and the bouncing scroll arrow all stay exactly as they are.
4. Do NOT remove or rename any existing component in `frontend/components/`. You may add new components and refactor `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` styling/layout, but their props and behavior must remain compatible. The state machine in `app/page.tsx` (idle/loading/done/error) must still drive them correctly.
5. Do NOT touch `frontend/app/about/`, `frontend/components/about/`, or `frontend/components/site-nav.tsx` except to confirm they still render correctly.
6. Before committing, run `npm run build` from `frontend/` and fix any type or lint errors introduced by your changes. Do NOT disable eslint or typescript to make errors go away. Pre-existing lint errors in untouched files are fine.
7. After changes, manually walk through the homepage end-to-end with `npm run dev`: (a) hero renders identically to current main, (b) atmosphere persists past hero on scroll, (c) manifesto plays between hero and analyzer, (d) analyzer area looks polished, (e) paste/analyze flow still works, (f) breakdown/compare/explain views work, (g) `/about` is reachable from nav and renders normally, (h) the feature-flag off path renders the original page exactly as it does today.
8. Work on a NEW branch off main. Never commit to main directly. Never force-push. Commit in small, reviewable chunks. Do NOT push to Vercel production or merge to main — leave the branch for me to review. A Vercel preview deploy from the branch is fine.

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

## FEATURE 1: persistent atmosphere across the full scroll

The user's specific feedback: *"when you scroll then the dots and the motion goes away but I think that should stay there."*

Right now `SparklesCore` and `FloatingPaths` are scoped to the hero `<section>` and disappear once you scroll past. Make the atmospheric layer continue across the entire page — subtler than in the hero, but always present.

Implementation:
- Add a fixed-position background layer in `app/page.tsx` (or a new `components/cinematic/atmosphere-background.tsx`) that renders behind everything else on the page (`fixed inset-0 -z-10` or similar, with `pointer-events: none`).
- The persistent layer should be a *quieter* version of the hero atmosphere — lower particle density, slower motion, lower opacity. The hero version is `density={140}, speed={1.2}`. Try something like `density={40-60}, speed={0.6-0.8}` for the persistent layer, but tune to taste.
- The hero retains its full-strength sparkles + FloatingPaths INSIDE the hero section (do not remove them). The persistent layer is in addition, behind the hero, and visible everywhere else once you scroll past.
- The transition between the dense hero atmosphere and the quieter persistent layer should not be jarring. As the hero scrolls out of view, the persistent layer is what remains. If the hero's particles overlap with the persistent layer, the visual stack should still read cleanly — no muddy double-density.
- The footer ("LUCID is a research / education tool…") should sit above the atmosphere layer and remain readable. Add a subtle dark gradient at the bottom if needed for legibility.

Performance:
- The persistent layer must not regress mobile performance. Particle counts should be lower on mobile via responsive density (or a lower fixed value). Test on real touch devices.
- `SparklesCore` is canvas-based — confirm it doesn't choke on long scroll sessions. If frame rate drops noticeably past the hero, lower density further.

---

## FEATURE 2: Star Wars scroll-pinned manifesto (between hero and analyzer)

A new section that sits BETWEEN the hero and the analyzer. As the user scrolls past the hero, they enter a pinned section where giant type reveals line-by-line with **word-level highlighting** scrubbed to scroll position. After the manifesto plays out, the user lands in the analyzer section.

Copy (tune for rhythm; do not copy verbatim if a tighter version reads better):

> You're not addicted.
>
> You're engineered.
>
> This isn't your fault.
>
> We'll show you why.

Each line should:
- Fill the viewport at large display-typography scale (responsive — bigger on desktop, still dominant on mobile)
- Reveal word-by-word as the user scrolls (each word transitions in opacity / y / blur in turn, scrubbed to scroll position — not played on a fixed timer)
- Have a brief held state at full opacity before the next line starts revealing
- The final line ("We'll show you why") should fade or transition naturally into the analyzer section below

Implementation guidance:
- GSAP ScrollTrigger with `pin: true` and `scrub: true` is the canonical pattern. If using framer-motion, use `useScroll` with a target ref and `useTransform` to map scroll progress to per-word opacity.
- Word-split utility: a simple `text.split(" ").map(...)` is enough. Do NOT use the paid SplitText plugin.
- The pinned section needs an explicit height (multiple viewport heights worth of scrollable content) so users can scroll *through* it. Without this, scrub doesn't work.
- Use `100svh` / `100dvh` instead of `100vh` for pinned heights — iOS Safari's address-bar collapse breaks `100vh`-based pinning.
- Set explicit container heights on every section to prevent layout shift.

Don't gate the analyzer behind animation completion. A user who skips the manifesto by scrolling fast must still arrive cleanly at the analyzer.

The persistent atmosphere from Feature 1 should be visible behind the manifesto — the words sit on top, but the dots/motion continue underneath. This is part of what ties the page together.

---

## FEATURE 3: polish the analyzer + gallery area (the "vibe-coded" part)

This is the most subjective feature and the one with the highest leverage on the user's "holy shit" reaction. Right now the analyzer section is:

- Flat centered content on plain black background
- Basic text input with a button
- 8 gallery cards with placeholder samples
- No connection to the visual language of the hero
- No motion, no progressive disclosure

Make this section feel as intentional as the hero. Reference points: Apple product pages, Linear marketing pages, Stripe homepage — typographic restraint at scale, surgical use of color, intentional negative space.

Things to consider (not all required — pick what serves the moment):
- A framing eyebrow or section header that ties the analyzer into the manifesto's emotional thread (e.g., "Try one." "Paste a TikTok." — something that reads as a deliberate beat, not a form)
- Reconsider the analyzer input visual — is it a giant cinematic input field with a generous tap target, or a tight glass-morph card? Pick the one that feels more confident.
- The 8 gallery tiles currently have inconsistent visual weight against the hero. Consider: stronger typography, better grid rhythm, optional hover states that preview the dimension breakdown, color-per-dimension accents pulled from `frontend/lib/api.ts` / `gallery-tiles.tsx`.
- Subtle scroll-driven fade-ins for the analyzer + gallery as they enter view. framer-motion `whileInView` is sufficient.
- The gallery's placeholder copy ("These are placeholders — the gallery wires up to pre-cached TikTok analyses once the backend finishes caching them.") at `gallery-tiles.tsx:54-57` reads as a TODO. Either remove it, rephrase it as confident framing, or visually treat it as intentional research-tool transparency rather than a builder's note. The user's instinct is correct that it reads as low-effort right now.
- The footer disclaimer is text-on-black with no visual hierarchy. Doesn't need much, but consider giving it a top border or a subtle treatment so it doesn't feel like an afterthought.

What polish does NOT mean here:
- Don't add gradients that don't already exist on the site
- Don't add glassmorphism or 3D effects that fight the Observatory aesthetic
- Don't add particles ON TOP of the analyzer — the persistent atmosphere from Feature 1 is the only motion this section should carry
- Don't redesign the results view (`<ResultsView />`) — that's a working part of the product, leave it alone

The bar: when a user scrolls past the manifesto into the analyzer, the visual quality should not drop. Right now it does. Fix that.

---

## FEATURE FLAG (rollback mechanism — required)

The user may not love these changes. Build them so they can be toggled off without deleting code or reverting commits.

Implementation:
- Single boolean flag: `NEXT_PUBLIC_CINEMATIC_INTRO`. Default value when env var is unset: `true` (new experience shows). When set to the string `"false"`, the page renders exactly as it does on current main:
  - No persistent atmosphere layer
  - No manifesto section
  - Analyzer area renders in its current (un-polished) form
- Read the flag in `app/page.tsx` (or a small helper):
  ```ts
  const cinematic = process.env.NEXT_PUBLIC_CINEMATIC_INTRO !== "false";
  ```
- The hero is rendered identically in both branches (it's not behind the flag).
- The conditional logic should look approximately like:
  ```tsx
  {cinematic && <AtmosphereBackground />}
  <Hero />
  {cinematic && <ScrollManifesto />}
  <AnalyzerSection cinematic={cinematic} />  {/* polished version when on, original when off */}
  <Footer />
  ```
- Put new components under `frontend/components/cinematic/`:
  - `atmosphere-background.tsx` — persistent fixed-position particles layer
  - `scroll-manifesto.tsx` — the Star Wars section
  - `analyzer-frame.tsx` (or similar) — the polished wrapper around the existing analyzer + gallery
- The existing `<AnalyzerInput />` and `<GalleryTiles />` components stay exactly as they are at the component level. Polish via composition, layout, surrounding chrome — not by editing those components' internals (unless absolutely necessary, in which case document it heavily in the handoff).
- Document the flag in `frontend/README.md`: a short subsection explaining the env var, default behavior, and how to toggle it (locally via `.env.local`, in production via Vercel env vars).
- Add the env var template to `.env.local.example` with a comment.

If I want to revert later, the answer is "set `NEXT_PUBLIC_CINEMATIC_INTRO=false` in Vercel and redeploy" — not "git revert three commits."

---

## ACCESSIBILITY (non-negotiable)

- `prefers-reduced-motion: reduce` MUST disable manifesto pinning, scrubbing, and the persistent particle motion. Static fallback for the manifesto: render the four lines stacked vertically with a fade-in or no animation. For the persistent atmosphere: render a static SVG/CSS gradient fallback, or omit the layer entirely. Do NOT hide the manifesto content for reduced-motion users; the words still need to land.
- Keyboard users must be able to tab through to the analyzer without scroll-jacking trapping them. Test tab order.
- The manifesto section cannot swallow the browser back button or require JS to escape.
- Skip-link or a visually-prominent "skip intro" affordance for users who don't want the cinematic experience. Place at the top of the page, visible on focus, navigable via keyboard. Activating it scrolls past the manifesto to the analyzer.
- Semantic HTML: large display text in the manifesto is `<h2>` (the hero already owns the `<h1>`).
- Color contrast for body / display text passes WCAG AA on the dark background.
- No content is locked behind motion completion. All manifesto words must be present in the DOM and screen-reader-readable regardless of scroll position.

---

## MOBILE PARITY (required)

Mobile is not a shrunk-down desktop. Touch scroll on iOS Safari (with momentum + bounce) is the dominant way users will experience this on a phone — it must feel cinematic there too, not janky.

Requirements:
- Test at 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Pro Max), and 768px (iPad portrait). Every section must render cleanly at all four.
- Persistent atmosphere on mobile: lower particle density (or shorter motion paths) so it doesn't tank frame rate.
- Manifesto display typography scales down responsively. Lines should still feel big and dominant at 375px — but readable, not overflowing.
- Pinning behavior must work on iOS Safari. Use `100svh` / `100dvh` instead of `100vh` for pinned sections, and test on a real touch interface (or accurate emulator), not just devtools resize.
- No horizontal scroll at any breakpoint. Ever.
- Touch scroll momentum must not produce a "stuck" feeling at the end of pinned sections. If GSAP scrub feels janky on touch, prefer a snap-to-line behavior or shorten the pin duration.
- Performance: mobile LCP must not regress versus current main. The hero must paint as fast as it does today. The persistent atmosphere can lazy-mount after the hero is interactive.
- No layout shift as the cinematic layer mounts. Reserve heights up front.

Before you summarize the session, do a mobile pass: walk through the homepage at 375px width with the flag on, list anything that feels off, and either fix it or flag it explicitly in the handoff.

---

## DESIGN GUIDANCE

- Observatory aesthetic: dark background (match existing `bg-black`), restrained palette, large typography, surgical use of color accents.
- Typography is the star. Words and motion support each other; neither competes with the content.
- Color: pull from the existing dimension palette in `frontend/lib/api.ts` only if it serves the moment. Monochrome white-on-black with one accent color is usually stronger than a rainbow.
- Negative space matters more than effects. The persistent atmosphere is intentionally subtle; don't over-densify it to compensate.
- Movement principle: every animation should feel intentional. If a movement is in the scene because "it looks cool" rather than because it serves the line, cut it.
- The handoff between the hero, the manifesto, and the analyzer must feel like one continuous scene. The persistent atmosphere is the connective tissue. Don't introduce visual styles in the analyzer section that don't appear elsewhere.

### Inspiration step (encouraged before coding)

Use the 21st.dev MCP to browse cinematic scroll-pinned manifesto patterns and polished analyzer / form treatments. Tools available:
- `mcp__magic__21st_magic_component_inspiration` — browse patterns
- `mcp__magic__21st_magic_component_builder` — generate component scaffolds

Pick techniques that match the Observatory aesthetic. Do not paste whatever is trending. If 21st.dev returns nothing useful, fall back to your own knowledge of GSAP ScrollTrigger and framer-motion `useScroll` / `useTransform` patterns. Note in the handoff what you reviewed and what you adapted.

---

## EXECUTION ORDER

1. Create a branch off main. Name it `feat/cinematic-intro`.
2. Read `frontend/app/page.tsx` (especially the existing `Hero()` and analyzer section), `frontend/AGENTS.md`, the existing `components/aceternity/*` files (SparklesCore, FloatingPaths), and `components/gallery-tiles.tsx`. Note anything unclear in the handoff and proceed with the most conservative interpretation.
3. (Optional) Use the 21st.dev MCP to browse scroll-pinned manifesto patterns and polished analyzer treatments.
4. Set up the feature flag wiring: env var read, conditional rendering scaffold (with no-op components first), default-on. Verify both flag values render the page (one is identical to current main, the other adds empty wrappers). Commit.
5. Build Feature 1 (persistent atmosphere). Tune density/speed until it feels right behind the hero AND below the hero. Verify hero is visually unchanged. Commit.
6. Build Feature 2 (Star Wars manifesto). Get word-level reveal working at scrub. Tune timing so the lines breathe. Commit.
7. Build Feature 3 (analyzer area polish). Wrap the existing AnalyzerInput + GalleryTiles in the polished frame. Iterate until the visual quality matches the hero. Commit.
8. Polish the handoff between hero → manifesto → analyzer. Should feel continuous. Commit.
9. Reduced-motion pass: implement static fallbacks. Commit.
10. Mobile pass: test at 375/390/430/768. Fix issues. Commit.
11. Run `npm run build`. Fix issues. Commit.
12. Manual walk-through with both flag values: `cinematic=true` shows the new experience; `cinematic=false` renders the page exactly as current main. `/about` reachable in both modes. Reduced-motion mode renders static fallback.
13. Write a handoff file at `docs/SESSION_2_HANDOFF.md` containing:
    - Branch name
    - 21st.dev patterns reviewed and which (if any) you adapted
    - Whether you used framer-motion or GSAP, and why
    - Component file structure under `components/cinematic/`
    - Feature flag name, default, how to toggle locally and in Vercel
    - What the experience looks like, scene by scene (one paragraph each: persistent atmosphere, manifesto, polished analyzer)
    - What you did to "polish" the analyzer section specifically — list every change
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

The user's words on the existing hero: *"the dots and the movement like it looks really cool and that's like holy shit."* That's the bar. The hero is the bar. The rest of the page must rise to meet it.

The analyzer section currently fails this bar. The user said: *"the bottom of it after that stuff that looks super vibe coded and that needs to be fixed."* Take that seriously. If after iteration the analyzer section still feels generic, **default the flag to `false`** in production env config and surface the prototype on the branch for review.

Reference points for the bar:
- Apple product launch pages — typographic restraint at scale
- Stripe homepage — gradient + typography minimalism
- Linear marketing pages — confident large display type
- The existing LUCID hero — the in-house bar already set by this project

What "holy shit" does NOT look like:
- Particles everywhere at full density (the persistent layer is subtle)
- Multiple competing color gradients
- Animation for animation's sake
- Auto-playing video backgrounds
- Anything that looks like a stock template

---

## AUTONOMOUS OPERATION DEFAULTS

I am not watching this session. You will not get live answers from me. Do not wait for input. Do not write questions to a file expecting a response. When a decision point comes up, follow these defaults:

- 21st.dev MCP returns nothing useful → fall back to your own knowledge. Note in the handoff.
- framer-motion can technically do the manifesto but feels rough vs GSAP → install GSAP. Document why.
- Two visual approaches both feel viable → pick the more restrained option (Apple-style monochrome over rainbow gradients).
- Build error you can't fix in 3 attempts → revert the last commit that introduced it, note the failure in the handoff, and continue with the rest of the work.
- Reduced-motion fallback feels too plain → that's correct, leave it plain.
- Mobile pinning feels janky on touch and you can't fix it in 30 minutes → shorten the pin section or replace scrub with a stepped reveal. Note in handoff.
- Persistent atmosphere tanks frame rate on mobile → lower density further or disable the layer below a viewport-width threshold. Document.
- Polished analyzer area still feels generic after iteration → set the Vercel-side flag default recommendation to `false` in the handoff. The fallback path is non-negotiable; the flag must work.

When in doubt: cut motion, not content. Less animation done well beats more animation done okay.

---

## FINAL CHECK BEFORE STOPPING

Before you write the handoff file and stop, re-read this entire prompt top-to-bottom one time. For each section, ask: did I actually do this? In particular verify:

- [ ] Hero renders **byte-for-byte identical DOM** to current main when flag is on (no changes to its visual output)
- [ ] Feature flag exists and both branches work (test both `=true` and `=false`)
- [ ] When flag is off, the entire page renders exactly as current main (no atmosphere, no manifesto, no polished analyzer frame)
- [ ] Persistent atmosphere is visible past the hero and continues to the footer
- [ ] Manifesto plays between hero and analyzer with word-level scrub reveal
- [ ] Analyzer + gallery section reads as polished, not vibe-coded
- [ ] `/about` still reachable and unchanged
- [ ] `/analyze` flow still works end-to-end
- [ ] Reduced-motion fallback exists and is semantically complete
- [ ] All four mobile breakpoints walked
- [ ] No new lint errors introduced (pre-existing errors are OK)
- [ ] `npm run build` passes
- [ ] Handoff file written with honest self-assessment of the "holy shit" bar
- [ ] No deploy commands run, no merge to main, no force-push

If you skipped or softened anything, either go back and do it, or note the skip explicitly in the handoff. Do not skip this step.
