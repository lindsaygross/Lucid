"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { AnalysisResult } from "@/lib/api";
import { DemoCard } from "./demo-card";
import highRaw from "../../../scripts/cached/high_donotfind.json";
import medRaw from "../../../scripts/cached/med_rossjenna3.json";
import lowRaw from "../../../scripts/cached/low_apnews.json";

const HIGH = highRaw as AnalysisResult;
const MED = medRaw as AnalysisResult;
const LOW = lowRaw as AnalysisResult;

type CardCopy = {
  heading: string;
  body: string;
  result: AnalysisResult;
};

const CARDS: CardCopy[] = [
  {
    heading: "The textbook example.",
    body: "A teenager doing maximum-engagement storytime: caps-locked overlay text, an emotional hook in the caption, a payoff that never quite arrives. Curiosity, dopamine, and engagement bait stacked in a single post.",
    result: HIGH,
  },
  {
    heading: "Form, not intent.",
    body: "A genuinely wholesome moment, a 26-year-old realizing the high school refs they used to swear at were just dads volunteering. The caption still uses curiosity-gap construction. The model catches the rhetorical move, not the creator's intent. That distinction is the whole point.",
    result: MED,
  },
  {
    heading: "Even the news plays the game.",
    body: "A straight news post about jet fuel shortages in Europe. Lowest score in the demo. But it's not zero. Even Associated Press structures its TikTok captions to compete on the platform. The system shapes everyone, not just bad actors.",
    result: LOW,
  },
];

export function LiveDemo() {
  const reduce = useReducedMotion();
  const headerMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -10% 0px" },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      aria-label="Live demo, three analyzed TikToks"
      className="flex w-full flex-col gap-10"
    >
      <motion.header
        {...headerMotion}
        className="flex flex-col items-center gap-3 text-center"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
          live demo
        </span>
        <p className="max-w-[46ch] font-heading text-[20px] font-semibold leading-[1.3] text-white sm:text-[24px]">
          Three real TikToks. Three real scores. Watch the model show its work.
        </p>
      </motion.header>

      <div className="flex w-full flex-col gap-10">
        {CARDS.map((card, i) => (
          <DemoCard
            key={card.heading}
            index={i}
            heading={card.heading}
            body={card.body}
            result={card.result}
          />
        ))}
      </div>
    </section>
  );
}
