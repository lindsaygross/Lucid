"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Drop = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  char: string;
  color: string;
};

const CHARS = "01░▒▓█";

type FallingPatternProps = {
  density?: number;
  intensify?: boolean;
  colors?: string[];
  className?: string;
};

export function FallingPattern({
  density = 60,
  intensify = false,
  colors = ["#EF4444", "#F59E0B", "#14B8A6", "#EC4899", "#A855F7", "#06B6D4"],
  className,
}: FallingPatternProps) {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    const n = intensify ? density * 2 : density;
    const next: Drop[] = Array.from({ length: n }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setDrops(next);
  }, [density, intensify, colors]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {drops.map((d) => (
        <motion.span
          key={d.id}
          className="absolute top-[-10%] font-mono text-xs tracking-widest"
          style={{ left: `${d.left}%`, color: d.color, textShadow: `0 0 6px ${d.color}` }}
          initial={{ y: "-10%", opacity: 0 }}
          animate={{ y: "110%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {d.char}
        </motion.span>
      ))}
    </div>
  );
}
