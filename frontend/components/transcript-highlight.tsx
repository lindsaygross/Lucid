"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DIMENSIONS, type AnalysisResult, type DimensionKey } from "@/lib/api";
import { cn } from "@/lib/utils";

type TranscriptHighlightProps = {
  result: AnalysisResult;
};

const TRIGGER_WORDS: Record<DimensionKey, string[]> = {
  outrage_bait: [
    "disgusting",
    "evil",
    "betrayal",
    "shameful",
    "insane",
    "they don't want",
    "wake up",
  ],
  fomo_trigger: [
    "last chance",
    "only",
    "everyone is",
    "most people",
    "don't miss",
    "left behind",
    "limited",
  ],
  engagement_bait: [
    "tag a friend",
    "tag someone",
    "comment",
    "share if",
    "follow for",
    "part 2",
  ],
  emotional_manipulation: [
    "if you scroll past",
    "99%",
    "please share",
    "if you have any heart",
    "make this go viral",
  ],
  curiosity_gap: [
    "wait for it",
    "you won't believe",
    "watch till the end",
    "the reason",
    "the secret",
    "nobody tells you",
    "this one thing",
  ],
  dopamine_design: ["!!!", "stop scrolling", "wait wait", "you need to", "listen up"],
};

function buildSegments(text: string) {
  if (!text) return [] as { text: string; dim: DimensionKey | null }[];
  const lower = text.toLowerCase();
  const hits: { start: number; end: number; dim: DimensionKey }[] = [];
  for (const [dim, words] of Object.entries(TRIGGER_WORDS) as [DimensionKey, string[]][]) {
    for (const w of words) {
      let from = 0;
      while (true) {
        const idx = lower.indexOf(w, from);
        if (idx === -1) break;
        hits.push({ start: idx, end: idx + w.length, dim });
        from = idx + w.length;
      }
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered: typeof hits = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.start >= lastEnd) {
      filtered.push(h);
      lastEnd = h.end;
    }
  }
  const out: { text: string; dim: DimensionKey | null }[] = [];
  let cursor = 0;
  for (const h of filtered) {
    if (h.start > cursor) out.push({ text: text.slice(cursor, h.start), dim: null });
    out.push({ text: text.slice(h.start, h.end), dim: h.dim });
    cursor = h.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), dim: null });
  return out;
}

export function TranscriptHighlight({ result }: TranscriptHighlightProps) {
  const [showRewrite, setShowRewrite] = useState(false);
  const segments = useMemo(() => buildSegments(result.fused_text || result.transcript), [result]);
  const colorFor = (dim: DimensionKey | null) =>
    DIMENSIONS.find((d) => d.key === dim)?.color ?? null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
          {showRewrite ? "stripped" : "original transcript"}
        </span>
        <button
          type="button"
          onClick={() => setShowRewrite((s) => !s)}
          className={cn(
            "group flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
            showRewrite
              ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-200"
              : "border-white/15 bg-white/5 text-zinc-200 hover:border-white/30",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              showRewrite ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-zinc-500",
            )}
          />
          See Through It
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={showRewrite ? "rewrite" : "original"}
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/10 bg-black/60 p-5 font-sans text-[15px] leading-relaxed text-zinc-200 sm:text-base"
        >
          {showRewrite ? (
            <p className="whitespace-pre-wrap">
              {result.rewrite || (
                <span className="text-zinc-500">No rewrite available for this input.</span>
              )}
            </p>
          ) : segments.length === 0 ? (
            <p className="text-zinc-500">No transcript text available.</p>
          ) : (
            <p className="whitespace-pre-wrap">
              {segments.map((seg, i) => {
                const color = colorFor(seg.dim);
                if (!color) return <span key={i}>{seg.text}</span>;
                return (
                  <span
                    key={i}
                    className="rounded px-0.5"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                      textShadow: `0 0 8px ${color}66`,
                    }}
                  >
                    {seg.text}
                  </span>
                );
              })}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
