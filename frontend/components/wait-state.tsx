"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FallingPattern } from "@/components/aceternity/falling-pattern";

const PHASES = [
  "Downloading TikTok…",
  "Transcribing what they said…",
  "Reading the overlays…",
  "Finding the tactics…",
  "Measuring the trap…",
];

export function WaitState() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PHASES.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex min-h-[40vh] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-6 py-16">
      <FallingPattern density={80} intensify />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-400" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
            lucid is watching
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ y: 18, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -18, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-2xl font-light text-white sm:text-4xl"
          >
            {PHASES[idx]}
          </motion.p>
        </AnimatePresence>
        <p className="max-w-md text-sm text-zinc-500">
          Usually finishes in 10–20 seconds. We&rsquo;re downloading the video, transcribing the
          audio, reading any overlay text, and running the manipulation classifier.
        </p>
      </div>
    </div>
  );
}
