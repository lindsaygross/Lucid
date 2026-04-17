"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DIMENSIONS,
  explain,
  type DimensionKey,
  type ExplainResult,
  type TokenAttribution,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type AttentionViewProps = {
  text: string;
};

export function AttentionView({ text }: AttentionViewProps) {
  const [data, setData] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<DimensionKey>("engagement_bait");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    explain(text, 10)
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

  const activeTokens = data?.dimension_tokens?.[active] ?? [];
  const maxAbs = useMemo(
    () => Math.max(0.0001, ...activeTokens.map((t) => Math.abs(t.attribution))),
    [activeTokens],
  );
  const activeDim = DIMENSIONS.find((d) => d.key === active)!;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
        explain failed: {error}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          why · integrated gradients · per-dimension token attribution
        </span>
        <p className="text-sm text-zinc-400">
          each dimension is a separate classifier head on top of DistilBERT. the
          tokens below are the ones that most <span className="text-zinc-200">push the model</span> toward
          or away from that specific tactic. positive = fires; negative = suppresses.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {DIMENSIONS.map((d) => {
          const dimScore = Math.round((data?.dimension_scores?.[d.key] ?? 0) * 100);
          const isActive = d.key === active;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActive(d.key)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
              )}
              style={
                isActive
                  ? { boxShadow: `inset 0 0 0 1px ${d.color}55, 0 0 14px -6px ${d.color}` }
                  : undefined
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}aa` }}
              />
              <span>{d.label}</span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-500">
                {dimScore}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            what drives <span style={{ color: activeDim.color }}>{activeDim.label}</span>
          </h3>
          <span className="font-mono text-[10px] text-zinc-500">
            integrated gradients · pad-token baseline · 24 steps
          </span>
        </div>

        <p className="text-xs leading-relaxed text-zinc-500">{activeDim.blurb}</p>

        {!data ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded bg-white/5" />
            ))}
          </div>
        ) : activeTokens.length === 0 ? (
          <p className="text-sm text-zinc-500">No informative tokens above threshold.</p>
        ) : (
          <ol className="flex flex-col gap-1.5">
            {activeTokens.map((tok, i) => (
              <TokenRow
                key={`${tok.position}-${i}`}
                token={tok}
                maxAbs={maxAbs}
                color={activeDim.color}
                rank={i + 1}
              />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function TokenRow({
  token,
  maxAbs,
  color,
  rank,
}: {
  token: TokenAttribution;
  maxAbs: number;
  color: string;
  rank: number;
}) {
  const pct = Math.round((Math.abs(token.attribution) / maxAbs) * 100);
  const pushesToFire = token.attribution > 0;
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.02 * rank }}
      className="flex items-center gap-3"
    >
      <span className="w-5 shrink-0 text-right font-mono text-[10px] text-zinc-600 tabular-nums">
        {rank}
      </span>
      <span
        className={cn(
          "min-w-[90px] shrink-0 truncate rounded px-2 py-1 font-mono text-xs",
          pushesToFire ? "bg-white/5 text-white" : "text-zinc-500",
        )}
        style={
          pushesToFire
            ? {
                boxShadow: `inset 0 -2px 0 0 ${color}`,
              }
            : undefined
        }
      >
        {token.token || "·"}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "h-full rounded-full",
            pushesToFire ? "" : "opacity-50",
          )}
          style={{
            backgroundColor: pushesToFire ? color : "#525252",
            boxShadow: pushesToFire ? `0 0 10px ${color}88` : undefined,
          }}
        />
      </div>
      <span className="w-[60px] shrink-0 text-right font-mono text-[10px] tabular-nums text-zinc-500">
        {pushesToFire ? "+" : ""}
        {token.attribution.toFixed(3)}
      </span>
    </motion.li>
  );
}
