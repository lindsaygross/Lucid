# LUCID Frontend

> **This directory is a scaffold placeholder.** The frontend will be built locally in tomorrow's Claude Code session using the `magic` (21st.dev) MCP for component generation, shadcn/ui, Aceternity UI, Tailwind CSS, and Framer Motion.

## Spec (see `docs/PLAN.md` for full context)

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui primitives
- **Motion:** Framer Motion + Aceternity UI (`SparklesCore`, `FloatingPaths`, `FallingPattern`)
- **Particles:** `@tsparticles/react`
- **Aesthetic:** "The Observatory" — dark, ambient, motion-rich, retro-game energy
- **Logo:** Animated "LUCID" text (letter-drop animation), no mark

## Pages

### `/` — Landing + Analyzer

1. **Hero** (full viewport, black background):
   - TikTok screenshot wall (20–30 screenshots tiled, dimmed to ~15% opacity, desaturated, slight blur)
   - Breathing animation on screenshots (staggered scale 1.00 → 1.02 over 4s)
   - SparklesCore particle overlay
   - Animated "LUCID" logo (letter-by-letter drop-in)
   - Tagline fades in: *"You're not addicted. You're being engineered. See how."*

2. **Analyzer** (below fold or scroll-anchored):
   - URL paste input with pulse glow
   - Secondary text-paste fallback
   - "Try these" horizontal carousel of 8 pre-cached gallery TikToks

3. **Results view** (in-place, no route change):
   - Big Scroll Trap Score (counter animates 0 → N over ~1s)
   - 6 dimension bars slide in sequentially, each with its own color glow
   - Transcript with inline highlighted phrases, color-coded per dimension
   - "See Through It" toggle → morph transcript to clean rewrite
   - Expandable "Why This Works On Your Brain" psychology panel with citations

4. **Wait state** (during the ~10–20s analysis):
   - `FallingPattern` intensifies
   - Sparkles get denser
   - Narrative progress text cycles: *"Downloading TikTok…"* → *"Transcribing what they said…"* → *"Reading the overlays…"* → *"Finding the tactics…"* → *"Measuring the trap…"*

## Backend contract

The backend (FastAPI) exposes:

- `GET /health` — `{ "status": "ok" }`
- `POST /analyze` — body: `{ "url": string }` OR `{ "text": string }` → returns `AnalysisResult` JSON
- `GET /gallery` — returns list of `{ slug, uploader, caption, scroll_trap_score }`
- `GET /gallery/{slug}` — returns full cached `AnalysisResult`

`AnalysisResult` schema (see `backend/pipeline/analyze.py`):

```ts
{
  source_url: string;
  platform: string;
  uploader: string;
  duration_seconds: number;
  caption: string;
  transcript: string;
  overlay_text: string;
  fused_text: string;
  scroll_trap_score: number;  // 0-100 integer
  dimension_scores: {
    outrage_bait: number;         // 0..1
    fomo_trigger: number;
    engagement_bait: number;
    emotional_manipulation: number;
    curiosity_gap: number;
    dopamine_design: number;
  };
  dimension_present: {
    outrage_bait: boolean;
    fomo_trigger: boolean;
    engagement_bait: boolean;
    emotional_manipulation: boolean;
    curiosity_gap: boolean;
    dopamine_design: boolean;
  };
  rewrite: string;
  engagement: {
    likes: number | null;
    views: number | null;
    comments: number | null;
  };
}
```

## Color-per-dimension palette

| Dimension | Color | Hex |
|---|---|---|
| outrage_bait | red | `#EF4444` |
| fomo_trigger | amber | `#F59E0B` |
| engagement_bait | teal | `#14B8A6` |
| emotional_manipulation | pink | `#EC4899` |
| curiosity_gap | purple | `#A855F7` |
| dopamine_design | cyan | `#06B6D4` |

Background `#000000`, primary text `#FFFFFF`, secondary text `#A1A1AA`.

## Environment

`NEXT_PUBLIC_API_URL` points to the backend:

- Dev: `http://localhost:8000`
- Prod (Vercel): `https://lucid-api.up.railway.app` (or wherever Railway deploys)

### `NEXT_PUBLIC_CINEMATIC_INTRO`

Controls whether the homepage renders the cinematic intro (persistent
atmosphere layer, scroll-pinned five-beat manifesto, polished analyzer
frame). Default when unset: `true` (shows the new experience).

To render the original pre-cinematic homepage, set the value to the exact
string `false`:

- **Local:** add `NEXT_PUBLIC_CINEMATIC_INTRO=false` to `.env.local` and
  restart `npm run dev`.
- **Vercel:** set `NEXT_PUBLIC_CINEMATIC_INTRO` to `false` under Project
  Settings, Environment Variables, then redeploy.

Toggling is a one-switch rollback. No code revert required.
