"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LucidLogoProps = {
  className?: string;
};

const LETTERS = ["L", "U", "C", "I", "D"];

export function LucidLogo({ className }: LucidLogoProps) {
  return (
    <div
      className={cn(
        "flex select-none gap-[0.02em] font-heading font-black tracking-tight text-white",
        "drop-shadow-[0_0_32px_rgba(255,255,255,0.25)]",
        className,
      )}
      aria-label="LUCID"
    >
      {LETTERS.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: "-120%", opacity: 0, filter: "blur(12px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: 0.25 + i * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}
