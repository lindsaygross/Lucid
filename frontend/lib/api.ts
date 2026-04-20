export type DimensionKey =
  | "outrage_bait"
  | "fomo_trigger"
  | "engagement_bait"
  | "emotional_manipulation"
  | "curiosity_gap"
  | "dopamine_design";

export type AnalysisResult = {
  source_url: string;
  platform: string;
  uploader: string;
  duration_seconds: number;
  caption: string;
  transcript: string;
  overlay_text: string;
  fused_text: string;
  scroll_trap_score: number;
  dimension_scores: Record<DimensionKey, number>;
  dimension_present: Record<DimensionKey, boolean>;
  rewrite: string;
  engagement: {
    likes: number | null;
    views: number | null;
    comments: number | null;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function analyze(
  payload: { url: string } | { text: string }
): Promise<AnalysisResult> {
  const r = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Analyze failed (${r.status}): ${body.slice(0, 200)}`);
  }
  return (await r.json()) as AnalysisResult;
}

export type ModelName = "naive" | "classical" | "deep";

export type SingleModelPrediction = {
  scroll_trap_score?: number;
  dimension_scores?: Record<DimensionKey, number>;
  dimension_present?: Record<DimensionKey, boolean>;
  error?: string;
};

export type CompareResult = {
  text: string;
  predictions: Record<ModelName, SingleModelPrediction>;
};

export async function compare(text: string): Promise<CompareResult> {
  const r = await fetch(`${API_URL}/analyze/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Compare failed (${r.status}): ${body.slice(0, 200)}`);
  }
  return (await r.json()) as CompareResult;
}

export type TokenAttribution = {
  token: string;
  position: number;
  attribution: number;
  count?: number;
};

export type ExplainResult = {
  text: string;
  scroll_trap_score: number;
  dimension_scores: Record<DimensionKey, number>;
  dimension_present: Record<DimensionKey, boolean>;
  dimension_tokens: Record<DimensionKey, TokenAttribution[]>;
};

export async function explain(text: string, topK = 8): Promise<ExplainResult> {
  const r = await fetch(`${API_URL}/analyze/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, top_k: topK }),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Explain failed (${r.status}): ${body.slice(0, 200)}`);
  }
  return (await r.json()) as ExplainResult;
}

export const DIMENSIONS: {
  key: DimensionKey;
  label: string;
  color: string;
  blurb: string;
}[] = [
  {
    key: "outrage_bait",
    label: "Outrage Bait",
    color: "#EF4444",
    blurb:
      "Moralized / tribal framing designed to provoke anger — piggybacks on outrage-sharing research (Crockett 2017; Brady et al. 2017).",
  },
  {
    key: "fomo_trigger",
    label: "FOMO Trigger",
    color: "#F59E0B",
    blurb:
      "Scarcity, urgency, and social-comparison cues weaponized to hijack loss aversion (Przybylski et al. 2013; Cialdini).",
  },
  {
    key: "engagement_bait",
    label: "Engagement Bait",
    color: "#14B8A6",
    blurb:
      "Explicit prompts to tag / comment / share that game the algorithm rather than fuel real discussion (Meta 2017; Munger 2020).",
  },
  {
    key: "emotional_manipulation",
    label: "Emotional Manipulation",
    color: "#EC4899",
    blurb:
      "Guilt, pity, and shame used to pressure compliance instead of argument (Cialdini 1987; Small et al. 2007; Kramer 2014).",
  },
  {
    key: "curiosity_gap",
    label: "Curiosity Gap",
    color: "#A855F7",
    blurb:
      "Deliberately withheld referents that force watch-through to resolve the tension (Loewenstein 1994; Blom & Hansen 2015).",
  },
  {
    key: "dopamine_design",
    label: "Dopamine Design",
    color: "#06B6D4",
    blurb:
      "Surface-level attention hooks — all caps, jump cuts, variable reward pacing (Skinner 1953; Alter 2017; Montag 2019).",
  },
];
