"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DIMENSIONS, type AnalysisResult } from "@/lib/api";
import { cn } from "@/lib/utils";

type DimensionBarsProps = {
  result: AnalysisResult;
};

export function DimensionBars({ result }: DimensionBarsProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      {DIMENSIONS.map((dim, i) => {
        const score = result.dimension_scores[dim.key] ?? 0;
        const present = result.dimension_present[dim.key] ?? false;
        const pct = Math.round(score * 100);
        const isOpen = open === dim.key;
        return (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : dim.key)}
              className="w-full text-left"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      present ? "shadow-[0_0_12px_currentColor]" : "opacity-30",
                    )}
                    style={{ backgroundColor: dim.color, color: dim.color }}
                  />
                  <span className="font-heading text-sm font-semibold tracking-wide text-white sm:text-base">
                    {dim.label}
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-400">{pct}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: dim.color,
                    boxShadow: `0 0 12px ${dim.color}99`,
                  }}
                />
              </div>
            </button>
            {isOpen && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm leading-relaxed text-zinc-400"
              >
                {dim.blurb}
              </motion.p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
