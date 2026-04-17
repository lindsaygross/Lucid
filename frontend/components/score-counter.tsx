"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function scoreTier(score: number) {
  if (score >= 75) return { label: "severe trap", color: "#EF4444" };
  if (score >= 50) return { label: "high trap", color: "#F59E0B" };
  if (score >= 25) return { label: "moderate trap", color: "#A855F7" };
  return { label: "low trap", color: "#06B6D4" };
}

export function ScoreCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const tier = scoreTier(value);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">
        scroll trap score
      </span>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <span
          className="block font-heading text-[7rem] font-black leading-none tracking-tight text-white sm:text-[10rem]"
          style={{ textShadow: `0 0 60px ${tier.color}80, 0 0 20px ${tier.color}60` }}
        >
          {display}
        </span>
        <span className="absolute right-0 top-4 font-mono text-xs text-zinc-500">/ 100</span>
      </motion.div>
      <span
        className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em]"
        style={{ borderColor: `${tier.color}55`, color: tier.color }}
      >
        {tier.label}
      </span>
    </div>
  );
}
