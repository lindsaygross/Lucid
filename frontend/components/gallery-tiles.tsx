"use client";

import { motion } from "framer-motion";

const EXAMPLES = [
  { label: "wait for it", tagline: "classic curiosity gap", color: "#A855F7" },
  { label: "you WON'T believe", tagline: "severe curiosity + dopamine", color: "#EC4899" },
  { label: "tag a friend", tagline: "engagement bait", color: "#14B8A6" },
  { label: "ONLY 3 SPOTS LEFT", tagline: "FOMO + urgency", color: "#F59E0B" },
  { label: "they don't want you to know", tagline: "outrage + curiosity", color: "#EF4444" },
  { label: "day 14/30", tagline: "dopamine loop", color: "#06B6D4" },
  { label: "if you scroll past…", tagline: "emotional pressure", color: "#EC4899" },
  { label: "calm explainer", tagline: "low-trap control", color: "#A1A1AA" },
];

type GalleryTilesProps = {
  onPick: (label: string) => void;
};

export function GalleryTiles({ onPick }: GalleryTilesProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        or try one of these
      </span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EXAMPLES.map((ex, i) => (
          <motion.button
            key={ex.label}
            type="button"
            onClick={() => onPick(ex.label)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            whileHover={{ y: -2 }}
            className="group relative aspect-[9/12] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-3 text-left transition-colors hover:border-white/25"
            style={{ boxShadow: `inset 0 -40px 60px -40px ${ex.color}55` }}
          >
            <div className="flex h-full flex-col justify-between">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ color: ex.color }}
              >
                sample
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold leading-tight text-white">{ex.label}</span>
                <span className="text-[11px] text-zinc-400">{ex.tagline}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="text-[11px] text-zinc-500">
        These are placeholders — the gallery wires up to pre-cached TikTok analyses once the
        backend finishes caching them.
      </p>
    </div>
  );
}
