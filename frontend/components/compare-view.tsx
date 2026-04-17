"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DIMENSIONS,
  compare,
  type CompareResult,
  type DimensionKey,
  type ModelName,
  type SingleModelPrediction,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type CompareViewProps = {
  text: string;
};

const MODELS: { key: ModelName; label: string; tag: string }[] = [
  { key: "naive", label: "naive", tag: "keyword rules" },
  { key: "classical", label: "classical", tag: "TF-IDF + XGBoost" },
  { key: "deep", label: "deep", tag: "fine-tuned DistilBERT" },
];

export function CompareView({ text }: CompareViewProps) {
  const [data, setData] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    compare(text)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
        compare failed: {error}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          side-by-side · three-model comparison
        </span>
        <p className="text-sm text-zinc-400">
          same text scored by every model in the repo. watch the{" "}
          <span className="text-zinc-200">calibration</span> shift as the architecture
          gets smarter.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {MODELS.map((m, i) => {
          const pred = data?.predictions?.[m.key];
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5"
            >
              <header className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {m.label}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {m.tag}
                  </p>
                </div>
                <ModelScore pred={pred} />
              </header>
              <MiniBars pred={pred} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ModelScore({ pred }: { pred?: SingleModelPrediction }) {
  if (!pred) return <Skeleton className="h-8 w-12 rounded" />;
  if (pred.error) return <span className="text-[11px] text-red-300">err</span>;
  const s = Math.round(pred.scroll_trap_score ?? 0);
  return (
    <span
      className={cn(
        "font-heading text-3xl font-semibold tabular-nums",
        s >= 66 ? "text-red-300" : s >= 33 ? "text-amber-300" : "text-emerald-300",
      )}
    >
      {s}
    </span>
  );
}

function MiniBars({ pred }: { pred?: SingleModelPrediction }) {
  if (!pred || pred.error || !pred.dimension_scores) {
    return (
      <div className="flex flex-col gap-2">
        {DIMENSIONS.map((d) => (
          <Skeleton key={d.key} className="h-6 w-full rounded" />
        ))}
      </div>
    );
  }
  const dim_scores = pred.dimension_scores as Record<DimensionKey, number>;
  return (
    <div className="flex flex-col gap-2">
      {DIMENSIONS.map((d) => {
        const p = dim_scores[d.key] ?? 0;
        return (
          <div key={d.key} className="flex items-center gap-3">
            <span className="w-[88px] shrink-0 text-[11px] text-zinc-400">
              {d.label.replace(" Bait", "").replace(" Manipulation", "").replace(" Trigger", "").replace(" Gap", "").replace(" Design", "")}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(p * 100)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }}
              />
            </div>
            <span className="w-[30px] shrink-0 text-right font-mono text-[10px] text-zinc-500 tabular-nums">
              {Math.round(p * 100)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/5", className)} />;
}
