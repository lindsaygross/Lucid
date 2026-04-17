"use client";

import { motion } from "framer-motion";

type FloatingPathsProps = {
  position?: 1 | -1;
  className?: string;
};

export function FloatingPaths({ position = 1, className }: FloatingPathsProps) {
  const paths = Array.from({ length: 36 }).map((_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${
      189 + i * 6
    } -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${
      616 - i * 5 * position
    } ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    }`,
    opacity: 0.05 + i * 0.02,
    width: 0.4 + i * 0.02,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <svg className="h-full w-full text-white" viewBox="0 0 696 316" fill="none">
        <title>Floating paths</title>
        {paths.map((p) => (
          <motion.path
            key={p.id}
            d={p.d}
            stroke="currentColor"
            strokeWidth={p.width}
            strokeOpacity={0.1 + p.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.6, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
