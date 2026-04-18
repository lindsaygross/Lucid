"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DIMENSIONS, type AnalysisResult, type DimensionKey } from "@/lib/api";
import { TikTokEmbed } from "./tiktok-embed";

type DemoCardProps = {
  index: number;
  heading: string;
  body: string;
  result: AnalysisResult;
};

export function DemoCard({ index, heading, body, result }: DemoCardProps) {
  const reduce = useReducedMotion();
  const headingId = `live-demo-card-${index}`;
  const pct = Math.round(result.scroll_trap_score ?? 0);

  const cardMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
        transition: {
          duration: 0.75,
          delay: 0.04 * index,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <motion.article
      {...cardMotion}
      aria-labelledby={headingId}
      className="flex w-full flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 md:flex-row md:gap-8"
    >
      <figure className="flex w-full flex-col gap-3 md:w-[44%] md:flex-shrink-0">
        <TikTokEmbed
          sourceUrl={result.source_url}
          uploader={result.uploader}
          label={heading}
        />
        <a
          href={result.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center self-start rounded-full border border-white/15 px-4 py-2 text-[12px] font-medium text-zinc-200 hover:border-white/30 hover:text-white"
        >
          Watch on TikTok
        </a>
        <figcaption className="sr-only">
          TikTok from @{result.uploader}. {heading}
        </figcaption>
      </figure>

      <div className="flex flex-1 flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px]">
            @{result.uploader}
          </span>
          <h3
            id={headingId}
            className="font-heading text-[22px] font-semibold leading-[1.2] text-white sm:text-[26px]"
          >
            {heading}
          </h3>
          <p className="text-[14px] leading-[1.55] text-zinc-300 sm:text-[15px]">
            {body}
          </p>
        </header>

        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            scroll trap score
          </span>
          <span className="flex items-baseline gap-1">
            <span className="font-heading text-[48px] font-black leading-none text-white sm:text-[60px]">
              {pct}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">/ 100</span>
          </span>
        </div>

        <DemoDimensions result={result} />

        <Rewrite text={result.rewrite} />
      </div>
    </motion.article>
  );
}

function DemoDimensions({ result }: { result: AnalysisResult }) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="Per-dimension scores">
      {DIMENSIONS.map((dim) => {
        const raw = result.dimension_scores[dim.key as DimensionKey] ?? 0;
        const present = result.dimension_present[dim.key as DimensionKey] ?? false;
        const pct = Math.round(raw * 100);
        return (
          <li key={dim.key} className="flex items-center gap-3">
            <span className="w-[120px] flex-shrink-0 text-[11px] text-zinc-400 sm:text-[12px]">
              {dim.label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: dim.color,
                  boxShadow: present ? `0 0 10px ${dim.color}88` : undefined,
                  opacity: present ? 1 : 0.55,
                }}
              />
            </span>
            <span className="w-[40px] flex-shrink-0 text-right font-mono text-[10px] text-zinc-500 sm:text-[11px]">
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Rewrite({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-white/5 pt-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        see through it
      </span>
      <p className="text-[13px] leading-[1.6] text-zinc-300 sm:text-[14px]">
        {text}
      </p>
    </div>
  );
}
