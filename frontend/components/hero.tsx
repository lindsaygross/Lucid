"use client";

import { motion } from "framer-motion";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { FloatingPaths } from "@/components/aceternity/floating-paths";
import { LucidLogo } from "@/components/lucid-logo";
import { ScreenshotWall } from "@/components/screenshot-wall";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden border-b border-white/5 px-4 py-24 sm:min-h-screen">
      <div className="absolute inset-0 z-0">
        <ScreenshotWall />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/40 to-black" />
      <div className="absolute inset-0 z-[2]">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <div className="absolute inset-0 z-[3]">
        <SparklesCore
          background="transparent"
          particleColor="#FFFFFF"
          minSize={0.4}
          maxSize={1.6}
          density={140}
          speed={1.2}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <LucidLogo className="text-[4rem] leading-none sm:text-[7rem] md:text-[9rem]" />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-balance text-sm italic leading-relaxed text-zinc-400 sm:text-base md:text-lg"
        >
          <span className="not-italic font-mono text-zinc-500">(adj.)</span> aware
          you&rsquo;re dreaming, while the dream is still happening.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-balance text-base font-semibold text-zinc-200 sm:text-lg md:text-xl"
        >
          <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Wake up inside the scroll.
          </span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="mt-6"
          aria-hidden
        >
          <svg
            width="20"
            height="32"
            viewBox="0 0 20 32"
            fill="none"
            className="animate-bounce text-zinc-500"
          >
            <path
              d="M10 2v26M2 20l8 8 8-8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
