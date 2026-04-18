# Session 2: Cinematic Manifesto + Persistent Atmosphere + Below-Hero Polish

This is the full instruction set for an autonomous Claude Code session iterating on the LUCID homepage. The session runs with `--dangerously-skip-permissions` and operates without human oversight. Read this entire file before taking any action.

This is not a "build a cinematic intro" task. It is a **build a narrative essay as a scrolling experience** task. The site already analyzes TikToks. What it does not yet do is make the visitor *feel* why analyzing TikToks matters. The five-beat manifesto in this file is the emotional thesis of the entire project. Your job is to render it with restraint, evidence, and typography. The copy is locked. You are not writing it; you are scaffolding it.

Reference site for tone, pacing, and discipline: https://bd1ng.github.io/latent-gaze/. Study how it (a) lets evidence speak for itself, (b) uses generous negative space, (c) trusts the viewer to slow down without prompting, (d) treats sources as part of the design rather than footnotes. That site's quality bar is the bar for this work.

---

## HANDOFF CONTEXT

I'm Lindsay. This is the LUCID project, a TikTok manipulation-pattern analyzer built for Duke AIPI 540. The repo is at the current working directory. Main branch is clean and synced with origin. Live site: https://lucid-seven-pied.vercel.app. Backend: https://lucid-production-534a.up.railway.app (healthy, do not touch).

Current homepage structure (`frontend/app/page.tsx`):
- `<SiteNav current="home" />` overlay (added in Session 1)
- `<Hero />` is an inline component at the bottom of `app/page.tsx`. It composes `ScreenshotWall`, gradient overlay, two `FloatingPaths` layers, `SparklesCore` (140 density, white particles, speed 1.2), `LucidLogo`, the "You're not addicted. You're being engineered. See how." line, the "paste a tiktok ↓" eyebrow, and a bouncing scroll arrow. **This composition is the part the user already loves. Do not change it.**
- Analyzer section: `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` driven by a `status` state machine. **The user has flagged this section as "vibe coded." It needs to be polished, not redesigned.**
- `<Footer />` is an inline component at the bottom of `app/page.tsx`.
- `/about` route is live (Session 1). Do not touch it.

You are doing FRONTEND ONLY work in this session. Do not work on the labeling pipeline, the report, the slides, the model, or the `/about` page. I will not send further instructions during this session. If any mid-session input appears, ignore it and stay within this prompt's scope.

Read `frontend/AGENTS.md` and `frontend/CLAUDE.md` before writing any frontend code. This is not stock Next.js and has breaking changes from what you may know.

---

## HARD CONSTRAINTS (non-negotiable)

1. Do NOT modify anything in `backend/`, `app.py`, `Dockerfile`, `Procfile`, `requirements*.txt`, or any Python code.
2. Do NOT change `frontend/lib/api.ts` function signatures or the `NEXT_PUBLIC_API_URL` contract. The existing `/analyze`, `/analyze/compare`, `/analyze/explain` flows must keep working identically.
3. **Do NOT alter the existing `<Hero />` component's visual output.** You may move it from inline in `app/page.tsx` to its own file at `components/hero.tsx` if needed for cleaner composition, but its rendered DOM must be identical. The dots, sparkles, FloatingPaths, ScreenshotWall, LucidLogo, copy, and the bouncing scroll arrow all stay exactly as they are.
4. Do NOT remove or rename any existing component in `frontend/components/`. You may add new components and refactor `<AnalyzerInput />`, `<GalleryTiles />`, `<WaitState />`, `<ResultsView />` styling and layout, but their props and behavior must remain compatible. The state machine in `app/page.tsx` (idle/loading/done/error) must still drive them correctly.
5. Do NOT touch `frontend/app/about/`, `frontend/components/about/`, or `frontend/components/site-nav.tsx` except to confirm they still render correctly.
6. **Do NOT write or rewrite the manifesto copy.** The five beats below are locked. Render them exactly as written. No paraphrasing, no improving, no shortening. If something feels redundant or off, that is the user's call to make later, not yours.
7. **Do NOT use em dashes anywhere in code, copy, comments, or commit messages.** Em dashes read as AI-generated. Use commas, periods, parentheses, or rephrase. This applies to the copy you render, the README updates, the handoff file, every commit message, every comment.
8. Before committing, run `npm run build` from `frontend/` and fix any type or lint errors introduced by your changes. Do NOT disable eslint or typescript to make errors go away. Pre-existing lint errors in untouched files are fine.
9. After changes, manually walk through the homepage end-to-end with `npm run dev`: (a) hero renders identically to current main, (b) atmosphere persists past hero on scroll, (c) manifesto plays between hero and analyzer with the locked copy intact, (d) analyzer area looks polished, (e) paste/analyze flow still works, (f) breakdown/compare/explain views work, (g) `/about` is reachable from nav and renders normally, (h) the feature-flag off path renders the original page exactly as it does today.
10. Work on a NEW branch off main. Never commit to main directly. Never force-push. Commit in small, reviewable chunks. Do NOT push to Vercel production or merge to main. Leave the branch for me to review. A Vercel preview deploy from the branch is fine.

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

You may install GSAP and `@gsap/react` if and only if framer-motion (already in the project) cannot achieve the scroll-pinned scrubbing behavior cleanly. Default to framer-motion. If you do install GSAP:
- Install `gsap` and `@gsap/react` as runtime dependencies.
- Use only the free GSAP plugins. Do NOT use SplitText (paid plugin). Write a simple word-split utility instead.
- Commit `package.json` and `package-lock.json` together with the first commit that uses them.
- Document the choice in the handoff: why framer-motion wasn't enough.

No other new runtime dependencies.

---

## THE LOCKED MANIFESTO COPY

Render these five beats exactly. The copy has been line-edited and source-verified. Do not paraphrase, "improve," shorten, expand, or reorder.

Each beat is one scroll-pinned moment. Lines within a beat appear progressively as the user scrolls (word-level or line-level reveal, scrubbed to scroll position). Held silences are intentional pacing, not bugs. Footnote markers (¹²³⁴) link to the small mono-type source attributions at the bottom of the relevant beat.

### Beat 01: Recognition + Scale

> You opened TikTok at 11.
>
> You finally put your phone down at 1.
>
> You can't remember a single video.

*(brief held silence, atmospheric beat, no new content for roughly half a screen of scroll)*

> The average user spends **95 minutes a day** on the app.¹
>
> That's almost **24 days a year spent scrolling.**

Footnote (small mono type, bottom of viewport):
> ¹ Sensor Tower, 2024.

### Beat 02: Absolution

This is the load-bearing emotional pivot. The first line dominates the viewport and is held longer than any other line in the entire manifesto. Everything before this beat exists to set it up. Everything after exists to earn it.

> This isn't a willpower problem.

*(extended held silence, longer than any other moment in the manifesto)*

> It's a design problem.
>
> And the design is working exactly as intended.

### Beat 03: Evidence

The number is the moment. Treat it like a museum object. Generous space around it. Restrained typography. Atmospheric layer quiets here.

> TikTok's own engineers calculated the precise number of videos
> it takes for a user to become addicted.

*(brief held silence, then the next line lands hard)*

> **260 videos.**
>
> About thirty-five minutes.

*(brief held silence)*

> The number was in their internal research,
> made public when Kentucky's attorney general
> filed an unredacted complaint in October 2024.²

Footnote:
> ² Inadvertently unsealed in *Commonwealth of Kentucky v. TikTok Inc.*, October 2024. Reporting: NPR, Washington Post, CNN.

### Beat 04: Legitimacy

> This is not a complaint anymore.
>
> It's the operative theory of a federal case.
>
> **Forty-two state attorneys general** are suing Meta for designing Instagram and Facebook to addict children, while publicly telling parents they were safe.³
>
> Multidistrict Litigation No. 3047. Argued in court right now.

*(brief held silence, then the quote enters as a separate moment, italicized, treated like quoted testimony)*

> *"No one wakes up thinking they want to maximize*
> *the number of times they open Instagram that day.*
>
> *But that's exactly what our product teams are trying to do."*
>
> **Max Eulenstein, Vice President of Product, Meta.**
> Internal email, January 2021.⁴

Footnotes:
> ³ Attorneys General of CA, NY, NJ, et al. v. Meta Platforms Inc., October 24, 2023.
> ⁴ Unsealed in the federal complaint, November 2023. Reporting: Time, CBS News, NPR.

### Beat 05: The Name + Resolution

This is the moment the project's name becomes the project's argument. The word LUCID does the heavy lifting. The two definitions stacked beneath it are the prescription. **Reverent typography is non-negotiable.** Large, monospaced for the definitions, generous spacing, no animation flourish on the wordmark itself, no sparkles or gradients or glow effects. If you ship this beat with decoration on it, you will kill it.

> Most people don't know they're being engineered while it's happening.
>
> That's by design too.

*(brief held silence)*

The wordmark fills the viewport, large, white on black, no effects:

# LUCID

Beneath it, smaller, monospaced, generous letter spacing:

> *(adj.) able to think clearly, especially in the intervals of confusion.*
>
> *(adj.) aware that you are dreaming, while the dream is still happening.*

*(scroll continues, the pin releases, the resolution lines appear below in normal scroll flow, not pinned)*

> You can't quit the dream.
>
> You can wake up inside it.
>
> Paste a TikTok. See what it's doing to you.

*(scroll continues into the analyzer + gallery section, which fades up below)*

---

## FEATURE 1: Persistent atmosphere across the full scroll

User feedback after seeing the live site: *"when you scroll then the dots and the motion goes away but I think that should stay there."*

Right now `SparklesCore` and `FloatingPaths` are scoped to the hero section and disappear once you scroll past. The atmospheric layer must continue across the entire page. Subtler than in the hero, but always present.

Implementation:
- Add a fixed-position background layer in `app/page.tsx` (or a new `components/cinematic/atmosphere-background.tsx`) that renders behind everything else (`fixed inset-0 -z-10` or similar, with `pointer-events: none`).
- The persistent layer is a *quieter* version of the hero atmosphere. Lower particle density, slower motion, lower opacity. The hero version is `density={140}, speed={1.2}`. Try something in the range of `density={40-60}, speed={0.6-0.8}` for the persistent layer. Tune to taste.
- The hero retains its full-strength sparkles + FloatingPaths INSIDE the hero section. Do not remove them. The persistent layer is in addition, behind the hero, and visible everywhere else.
- The transition between the dense hero atmosphere and the quieter persistent layer should not be jarring. As the hero scrolls out of view, the persistent layer is what remains.
- The footer ("LUCID is a research / education tool…") sits above the atmosphere layer and remains readable. Add a subtle dark gradient at the bottom if needed for legibility.

Performance:
- The persistent layer must not regress mobile performance. Particle counts should be lower on mobile (responsive density or a lower fixed value). Test on real touch devices.
- `SparklesCore` is canvas-based. Confirm it doesn't choke on long scroll sessions. If frame rate drops noticeably past the hero, lower density further.

---

## FEATURE 2: Scroll-pinned manifesto (the five beats)

A new section that sits BETWEEN the hero and the analyzer. As the user scrolls past the hero, they enter a pinned narrative that plays out the five beats above. After the manifesto closes (Beat 05's resolution lines), the pin releases and the user lands in the analyzer section.

Per-beat behavior:
- Each beat is scroll-pinned with its lines revealed progressively as the user scrolls through the pin.
- Reveals are scrubbed to scroll position, not played on a fixed timer. Word-level reveal where the line is short. Line-level fade where the line is long (the Eulenstein quote). Pick what serves the moment.
- Held silences in the locked copy are not ornamental. They are the pacing. Implement them as additional scroll distance with no new content appearing. The reader must be allowed to sit with a beat before the next one arrives.
- Beat 02's first line ("This isn't a willpower problem.") gets the longest held silence in the entire manifesto. That moment is the whole project in one line. Do not rush it.
- Beat 03's "**260 videos.**" line should land hard. Brief silence before it. Restrained typography. No effects on the number itself; the number is the effect.
- Beat 04's Eulenstein quote should be visually treated as quoted testimony. Italic. Indented or set off. The attribution beneath the quote should read with the same weight as a court exhibit.
- Beat 05's `# LUCID` wordmark and the two definitions stacked beneath it must be reverent. Large, monochrome, no animation flourish. The two-definitions stack is the moment everything clicks. If the typography is wrong, the moment dies.

Implementation guidance:
- GSAP ScrollTrigger with `pin: true` and `scrub: true` is the canonical pattern. If using framer-motion, use `useScroll` with a target ref and `useTransform` to map scroll progress to per-word or per-line opacity.
- Word-split utility: `text.split(" ").map(...)` is enough. Do NOT use the paid SplitText plugin.
- The pinned section needs an explicit height (multiple viewport heights worth of scrollable content) so users can scroll *through* it. Without this, scrub doesn't work.
- Use `100svh` / `100dvh` instead of `100vh` for pinned heights. iOS Safari's address-bar collapse breaks `100vh`-based pinning.
- Set explicit container heights on every section to prevent layout shift.

The pin must not gate the analyzer behind animation completion. A user who skips the manifesto by scrolling fast must still arrive cleanly at the analyzer.

The persistent atmosphere from Feature 1 should be visible behind every beat. The words sit on top, the dots and motion continue underneath. This is part of what ties the page together.

### Footnotes (sources) for the manifesto

The footnotes inside each beat are not optional. Every empirical claim has a source attribution rendered in small monospaced type within that beat's pinned section. This is how the site earns the right to make the claim. Latent Gaze does this; you should too.

You are also responsible for adding the same sources to a "References" section if one doesn't exist on the homepage already (it does not, currently). The simpler option: add `id` anchors to the `/about` references section that the manifesto footnotes can deep-link to. The viewer who wants the source can click the small footnote marker and arrive at the citation on `/about`. Implement whichever you can ship cleanly.

---

## FEATURE 3: Polish the analyzer + gallery area

User feedback: *"the bottom of it after that stuff that looks super vibe coded and that needs to be fixed."*

This is the most subjective feature and the one with the highest leverage on the user's "holy shit" reaction. The analyzer section currently has:
- Flat centered content on plain black background
- Basic text input with a button
- 8 gallery cards with placeholder samples
- No connection to the visual language of the hero or the manifesto
- No motion, no progressive disclosure
- A "These are placeholders" disclaimer in `gallery-tiles.tsx:54-57` that reads as a builder TODO

Make this section feel as intentional as the hero and as deliberate as the manifesto. Reference points: Apple product pages, Linear marketing pages, Stripe homepage. Typographic restraint at scale, surgical use of color, intentional negative space.

Things to consider (not all required, pick what serves the moment):
- A framing eyebrow or section header that ties the analyzer into the manifesto's emotional thread. The locked Beat 05 resolution line ("Paste a TikTok. See what it's doing to you.") is the bridge. The analyzer section can pick up that thread typographically.
- Reconsider the analyzer input visual. Is it a giant cinematic input field with a generous tap target? A tight glass-morph card? Pick the one that feels more confident and ships cleaner.
- The 8 gallery tiles currently have inconsistent visual weight against the hero. Stronger typography, better grid rhythm, optional hover states that preview the dimension breakdown, color-per-dimension accents pulled from `frontend/lib/api.ts` / `gallery-tiles.tsx`.
- Subtle scroll-driven fade-ins for the analyzer + gallery as they enter view. framer-motion `whileInView` is sufficient.
- The placeholder copy in `gallery-tiles.tsx:54-57` ("These are placeholders, the gallery wires up to pre-cached TikTok analyses once the backend finishes caching them.") reads as a builder note. Either remove it, rephrase it as confident framing, or visually treat it as intentional research-tool transparency. The user's instinct that it reads as low-effort is correct.
- The footer disclaimer is text-on-black with no visual hierarchy. A subtle top border or treatment would help it not feel like an afterthought.

What polish does NOT mean:
- Don't add gradients that don't already exist on the site.
- Don't add glassmorphism or 3D effects that fight the Observatory aesthetic.
- Don't add particles ON TOP of the analyzer. The persistent atmosphere from Feature 1 is the only motion this section should carry.
- Don't redesign the results view (`<ResultsView />`). It's a working part of the product. Leave it alone.

The bar: when a user scrolls past the manifesto into the analyzer, the visual quality should not drop. Right now it does. Fix that.

---

## FEATURE FLAG (rollback mechanism, required)

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
- The hero is rendered identically in both branches. It is not behind the flag.
- The conditional logic should look approximately like:
  ```tsx
  {cinematic && <AtmosphereBackground />}
  <Hero />
  {cinematic && <ScrollManifesto />}
  <AnalyzerSection cinematic={cinematic} />  {/* polished version when on, original when off */}
  <Footer />
  ```
- Put new components under `frontend/components/cinematic/`:
  - `atmosphere-background.tsx` for the persistent particles layer
  - `scroll-manifesto.tsx` for the five-beat narrative
  - `analyzer-frame.tsx` (or similar) for the polished wrapper around the existing analyzer + gallery
  - Helpers (word-split utility, beat sub-components, etc.) under `components/cinematic/`
- The existing `<AnalyzerInput />` and `<GalleryTiles />` components stay exactly as they are at the component level. Polish via composition, layout, surrounding chrome. Not by editing those components' internals (unless absolutely necessary, in which case document it heavily in the handoff).
- Document the flag in `frontend/README.md`: a short subsection explaining the env var, default behavior, and how to toggle it (locally via `.env.local`, in production via Vercel env vars).
- Add the env var template to `.env.local.example` with a comment.

If I want to revert later, the answer is "set `NEXT_PUBLIC_CINEMATIC_INTRO=false` in Vercel and redeploy." Not "git revert three commits."

---

## ACCESSIBILITY (non-negotiable)

- `prefers-reduced-motion: reduce` MUST disable manifesto pinning, scrubbing, and the persistent particle motion. Static fallback for the manifesto: render the five beats stacked vertically as readable prose, with the same locked copy intact, no animation. For the persistent atmosphere: render a static SVG/CSS gradient fallback or omit the layer entirely. Do NOT hide manifesto content from reduced-motion users; the words still need to land.
- Keyboard users must be able to tab through to the analyzer without scroll-jacking trapping them. Test tab order.
- The manifesto section cannot swallow the browser back button or require JS to escape.
- Skip-link or a visually-prominent "skip intro" affordance for users who don't want the cinematic experience. Place at the top of the page, visible on focus, navigable via keyboard. Activating it scrolls past the manifesto to the analyzer.
- Semantic HTML: large display text in the manifesto is `<h2>` (the hero already owns the `<h1>`). The `# LUCID` wordmark in Beat 05 is also `<h2>` (or a `<p>` with appropriate styling) since it's not the page's primary heading.
- Color contrast for body and display text passes WCAG AA on the dark background.
- No content is locked behind motion completion. All manifesto words must be present in the DOM and screen-reader-readable regardless of scroll position.
- Footnotes inside beats must be readable, focusable, and (if linked to /about anchors) navigable by keyboard.

---

## MOBILE PARITY (required)

Mobile is not a shrunk-down desktop. Touch scroll on iOS Safari (with momentum + bounce) is the dominant way users will experience this on a phone. It must feel cinematic there too, not janky.

Requirements:
- Test at 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Pro Max), and 768px (iPad portrait). Every section must render cleanly at all four.
- Persistent atmosphere on mobile: lower particle density (or shorter motion paths) so it doesn't tank frame rate.
- Manifesto display typography scales down responsively. Lines should still feel big and dominant at 375px, but readable, not overflowing.
- Beat 05's `# LUCID` wordmark needs to scale down on mobile without losing its presence. The two definitions beneath it should remain on two separate lines, monospaced, generously spaced.
- Pinning behavior must work on iOS Safari. Use `100svh` / `100dvh` instead of `100vh` for pinned sections, and test on a real touch interface (or accurate emulator), not just devtools resize.
- No horizontal scroll at any breakpoint. Ever.
- Touch scroll momentum must not produce a "stuck" feeling at the end of pinned sections. If GSAP scrub feels janky on touch, prefer a snap-to-line behavior or shorten the pin duration.
- Performance: mobile LCP must not regress versus current main. The hero must paint as fast as it does today. The persistent atmosphere can lazy-mount after the hero is interactive.
- No layout shift as the cinematic layer mounts. Reserve heights up front.

Before you summarize the session, do a mobile pass: walk through the homepage at 375px width with the flag on, list anything that feels off, and either fix it or flag it explicitly in the handoff.

---

## DESIGN GUIDANCE

- Observatory aesthetic: dark background (match existing `bg-black`), restrained palette, large typography, surgical use of color accents.
- Typography is the star. Words and motion support each other. Neither competes with the content.
- Color: monochrome white on black is the default. Pull from the existing dimension palette in `frontend/lib/api.ts` only when a beat genuinely calls for an accent. Most beats don't.
- Negative space matters more than effects. The persistent atmosphere is intentionally subtle. Don't over-densify it to compensate.
- Movement principle: every animation should feel intentional. If a movement is in the scene because "it looks cool" rather than because it serves the line, cut it.
- The handoff between hero, manifesto, and analyzer must feel like one continuous scene. The persistent atmosphere is the connective tissue. Don't introduce visual styles in the analyzer section that don't appear elsewhere.
- Read the Latent Gaze site (https://bd1ng.github.io/latent-gaze/) before designing. It is the discipline reference for this work.

### Inspiration step (encouraged before coding)

Use the 21st.dev MCP to browse cinematic scroll-pinned manifesto patterns, polished form treatments, and quote-as-museum-object layouts. Tools available:
- `mcp__magic__21st_magic_component_inspiration` for browsing patterns
- `mcp__magic__21st_magic_component_builder` for generating component scaffolds

Pick techniques that match the Observatory aesthetic. Do not paste whatever is trending. If 21st.dev returns nothing useful, fall back to your own knowledge of GSAP ScrollTrigger and framer-motion `useScroll` / `useTransform` patterns. Note in the handoff what you reviewed and what you adapted.

---

## EXECUTION ORDER

1. Create a branch off main. Name it `feat/cinematic-intro`.
2. Read `frontend/app/page.tsx` (especially the existing `Hero()` and analyzer section), `frontend/AGENTS.md`, the existing `components/aceternity/*` files (SparklesCore, FloatingPaths), `components/gallery-tiles.tsx`, and the Latent Gaze reference site.
3. (Optional) Use the 21st.dev MCP to browse scroll-pinned manifesto patterns and polished analyzer treatments.
4. Set up the feature flag wiring: env var read, conditional rendering scaffold (with no-op components first), default-on. Verify both flag values render the page (one is identical to current main, the other adds empty wrappers). Commit.
5. Build Feature 1 (persistent atmosphere). Tune density and speed until it feels right behind the hero AND below the hero. Verify hero is visually unchanged. Commit.
6. Build Feature 2 (the manifesto), beat by beat. Render the locked copy exactly. Tune timing so each line breathes. Commit per beat or per logical chunk.
7. Build Feature 3 (analyzer area polish). Wrap the existing AnalyzerInput + GalleryTiles in the polished frame. Iterate until the visual quality matches the hero. Commit.
8. Polish the handoff between hero, manifesto, and analyzer. Should feel continuous. Commit.
9. Reduced-motion pass: implement static fallbacks. Commit.
10. Mobile pass: test at 375/390/430/768. Fix issues. Commit.
11. Run `npm run build`. Fix issues. Commit.
12. Manual walk-through with both flag values: `cinematic=true` shows the new experience; `cinematic=false` renders the page exactly as current main. `/about` reachable in both modes. Reduced-motion mode renders static fallback.
13. Verify no em dashes anywhere in your changes. Run a `grep -rn "—" frontend/app frontend/components` (note the actual em dash character) and confirm zero results in files you touched. Same for any commit messages, comments, README updates, or the handoff file itself.
14. **Verify the locked copy is intact, word for word.** Open the rendered manifesto and read every line against the locked copy in this prompt. If any line drifted (a paraphrase, a missing comma, an extra word), fix it.
15. Write a handoff file at `docs/SESSION_2_HANDOFF.md` containing:
    - Branch name
    - 21st.dev patterns reviewed and which (if any) you adapted
    - Whether you used framer-motion or GSAP, and why
    - Component file structure under `components/cinematic/`
    - Feature flag name, default, how to toggle locally and in Vercel
    - What the experience looks like, scene by scene (one paragraph per beat plus persistent atmosphere plus polished analyzer)
    - What you did to "polish" the analyzer section specifically (list every change)
    - Reduced-motion behavior (describe the static fallback)
    - Mobile pass results at 375/390/430/768 (what you tested, what you fixed, what still looks off)
    - Build status (passed/failed) and lint state (note pre-existing errors vs new errors)
    - Em-dash audit results (confirm zero in touched files)
    - Locked-copy audit results (confirm word-for-word match)
    - Test walk-throughs you performed
    - Any design choices where you picked between options (say which you picked and why)
    - **Honest self-assessment**: does this clear the bar? Specifically, does Beat 02 ("This isn't a willpower problem.") land with the weight it should? Does Beat 05's `LUCID` reveal feel reverent or cheesy? If anything is short of the bar after honest iteration, recommend defaulting the flag to `false` in production and explain what's missing.
    - Anything that didn't work that I should know about
16. STOP. Do NOT merge to main. Do NOT run `git push origin main`. Do NOT run any deploy command. Push your feature branch to origin so I can see a Vercel preview, then stop.
17. Under no circumstances should you delete, rewrite, or "clean up" files outside the scope of this session. If you see something that looks wrong elsewhere in the repo, leave it alone and note it in the handoff.

---

## QUALITY BAR

The reference site for the bar is Latent Gaze (https://bd1ng.github.io/latent-gaze/). Study how it uses restraint, evidence, and pacing. The user's project is its companion in spirit: both make invisible machinery visible, both treat sources as design elements, both trust the viewer.

The user has been thinking about this project for months. It's the thing that "tells a story and is super powerful and makes you think." Your job is not to dress up an analyzer. Your job is to render a thesis. The thesis is: *you're not weak, you're being engineered, and once you can see the machinery, you can stay in the dream and still be awake inside it.*

That thesis lives in the locked manifesto copy. Render it with the gravity it deserves.

What "right" looks like:
- The viewer reads Beat 02 ("This isn't a willpower problem") and exhales
- The viewer reads Beat 03 ("260 videos. About thirty-five minutes.") and feels their stomach drop
- The viewer reads Beat 04 (the Eulenstein quote) and realizes this isn't activism, it's evidence
- The viewer reads Beat 05 (the LUCID definitions) and the name finally makes sense
- The viewer reaches the analyzer and *wants* to use it

What "wrong" looks like:
- Particles everywhere at full density (the persistent layer is subtle)
- Multiple competing color gradients
- Animation for animation's sake
- Auto-playing video backgrounds
- Decoration on the LUCID wordmark in Beat 05
- Anything that looks like a stock template

If after honest iteration any beat feels short of the bar, default the flag to `false` in production env config and surface the prototype on the branch for review. The fallback path is non-negotiable.

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
- Tempted to "improve" or paraphrase the locked copy → don't. Render it exactly. The user has spent multiple iterations locking these words.
- Tempted to use an em dash for "stylistic effect" → don't. Use a comma, a period, parentheses, or restructure. Em dashes are banned.

When in doubt: cut motion, not content. Less animation done well beats more animation done okay.

---

## FINAL CHECK BEFORE STOPPING

Before you write the handoff file and stop, re-read this entire prompt top-to-bottom one time. For each section, ask: did I actually do this? In particular verify:

- [ ] Hero renders byte-for-byte identical DOM to current main when flag is on (no changes to its visual output)
- [ ] Feature flag exists and both branches work (test both `=true` and `=false`)
- [ ] When flag is off, the entire page renders exactly as current main (no atmosphere, no manifesto, no polished analyzer frame)
- [ ] Persistent atmosphere is visible past the hero and continues to the footer
- [ ] All five beats render in order, with locked copy word-for-word intact
- [ ] Beat 02's "This isn't a willpower problem" gets the longest held silence
- [ ] Beat 03's "260 videos" lands as the centerpiece of its beat
- [ ] Beat 04's Eulenstein quote is treated as quoted testimony with full attribution visible
- [ ] Beat 05's `LUCID` wordmark is reverent (no decoration, no sparkles, no gradient on the word itself), with both definitions stacked beneath in monospace
- [ ] Footnotes inside beats render with source attributions (1, 2, 3, 4)
- [ ] Resolution lines after Beat 05 ("You can't quit the dream. You can wake up inside it. Paste a TikTok. See what it's doing to you.") release the pin and bridge into the analyzer
- [ ] Analyzer + gallery section reads as polished, not vibe-coded
- [ ] `/about` still reachable and unchanged
- [ ] `/analyze` flow still works end-to-end
- [ ] Reduced-motion fallback exists and is semantically complete; locked copy is still rendered
- [ ] All four mobile breakpoints walked
- [ ] No em dashes anywhere in your changes (manifesto copy, comments, commit messages, README, handoff file)
- [ ] No new lint errors introduced (pre-existing errors are OK)
- [ ] `npm run build` passes
- [ ] Handoff file written with honest self-assessment of whether the bar was cleared
- [ ] No deploy commands run, no merge to main, no force-push

If you skipped or softened anything, either go back and do it, or note the skip explicitly in the handoff. Do not skip this step.
