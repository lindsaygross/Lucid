"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AnalysisResult } from "@/lib/api";
import { ScoreCounter } from "@/components/score-counter";
import { DimensionBars } from "@/components/dimension-bars";
import { TranscriptHighlight } from "@/components/transcript-highlight";
import { CompareView } from "@/components/compare-view";
import { AttentionView } from "@/components/attention-view";
import { cn } from "@/lib/utils";

type ResultsViewProps = {
  result: AnalysisResult;
  onReset: () => void;
};

type ViewMode = "default" | "compare" | "explain";

function formatMeta(result: AnalysisResult) {
  const bits: string[] = [];
  if (result.uploader) bits.push(`@${result.uploader}`);
  if (result.platform) bits.push(result.platform);
  if (result.duration_seconds) bits.push(`${Math.round(result.duration_seconds)}s`);
  const { likes, views } = result.engagement ?? {};
  if (views) bits.push(`${views.toLocaleString()} views`);
  else if (likes) bits.push(`${likes.toLocaleString()} likes`);
  return bits.join(" · ");
}

export function ResultsView({ result, onReset }: ResultsViewProps) {
  const meta = formatMeta(result);
  const [mode, setMode] = useState<ViewMode>("default");
  const analysisText = result.fused_text || result.caption || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <ScoreCounter value={Math.round(result.scroll_trap_score ?? 0)} />
        {meta && <p className="font-mono text-xs text-zinc-500">{meta}</p>}
        <button
          type="button"
          onClick={onReset}
          className="mt-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/25 hover:text-white"
        >
          analyze another
        </button>
      </div>

      <ViewSwitcher mode={mode} onChange={setMode} />

      {mode === "default" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          <DimensionBars result={result} />
          <TranscriptHighlight result={result} />
        </div>
      )}

      {mode === "compare" && analysisText && <CompareView text={analysisText} />}

      {mode === "explain" && analysisText && <AttentionView text={analysisText} />}
    </motion.div>
  );
}

type ViewSwitcherProps = {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
};

const MODES: { key: ViewMode; label: string; hint: string }[] = [
  { key: "default", label: "Breakdown", hint: "per-dimension scores + transcript" },
  { key: "compare", label: "Compare 3 models", hint: "naive · classical · deep" },
  { key: "explain", label: "Why · token attributions", hint: "integrated gradients" },
];

function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {MODES.map((m) => {
          const active = m.key === mode;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange(m.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs transition-colors",
                active
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
              title={m.hint}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
