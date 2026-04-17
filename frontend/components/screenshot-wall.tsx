"use client";

import { motion } from "framer-motion";

const PLACEHOLDER_GRADIENTS = [
  "from-rose-900/70 via-fuchsia-900/50 to-black",
  "from-amber-900/70 via-orange-900/40 to-black",
  "from-teal-900/70 via-emerald-900/40 to-black",
  "from-pink-900/70 via-rose-900/50 to-black",
  "from-violet-900/70 via-purple-900/50 to-black",
  "from-cyan-900/70 via-sky-900/40 to-black",
  "from-red-900/70 via-rose-900/40 to-black",
  "from-yellow-900/70 via-amber-900/40 to-black",
  "from-indigo-900/70 via-blue-900/40 to-black",
  "from-pink-900/70 via-fuchsia-900/40 to-black",
  "from-green-900/70 via-emerald-900/40 to-black",
  "from-purple-900/70 via-indigo-900/50 to-black",
];

const LABELS = [
  "POV: …",
  "WAIT FOR IT",
  "YOU WON'T BELIEVE",
  "part 2 in comments",
  "tag someone",
  "it's so over",
  "no one is talking about this",
  "day 14/30",
  "the SECRET they don't want you to know",
  "hot take:",
  "comment 'yes'",
  "trust me on this",
];

export function ScreenshotWall() {
  const tiles = Array.from({ length: 24 }).map((_, i) => ({
    gradient: PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length],
    label: LABELS[i % LABELS.length],
    delay: (i * 0.12) % 2.4,
  }));

  return (
    <div
      className="pointer-events-none absolute inset-0 grid grid-cols-4 gap-2 p-2 opacity-[0.18] sm:grid-cols-6 md:grid-cols-8"
      aria-hidden
    >
      {tiles.map((t, i) => (
        <motion.div
          key={i}
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.75, 1, 0.75],
          }}
          transition={{
            duration: 4,
            delay: t.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative aspect-[9/16] overflow-hidden rounded-lg bg-gradient-to-br ${t.gradient}`}
        >
          <div className="absolute inset-x-2 bottom-2 font-mono text-[10px] leading-tight text-white/90">
            {t.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
