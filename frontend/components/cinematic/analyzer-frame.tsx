"use client";

import type { ReactNode, RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AnalyzerFrameProps = {
  cinematic: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export function AnalyzerFrame({ cinematic, sectionRef, children }: AnalyzerFrameProps) {
  if (!cinematic) {
    return (
      <section
        ref={sectionRef}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 pb-24 pt-16 sm:px-8"
      >
        {children}
      </section>
    );
  }
  return <CinematicAnalyzerFrame sectionRef={sectionRef}>{children}</CinematicAnalyzerFrame>;
}

function CinematicAnalyzerFrame({
  sectionRef,
  children,
}: {
  sectionRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -15% 0px" },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      ref={sectionRef}
      id="analyzer"
      aria-label="Analyzer"
      className="relative z-10 w-full scroll-mt-10"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        <motion.header {...motionProps} className="flex flex-col items-center gap-5 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
            step one
          </span>
          <h2 className="max-w-[22ch] font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[38px]">
            Pick a post. See what it&rsquo;s doing.
          </h2>
          <p className="max-w-[48ch] text-[14px] leading-[1.55] text-zinc-400 sm:text-[15px]">
            Paste a TikTok link or any caption text. The model scores six research-grounded
            manipulation tactics and returns a 0 to 100 Scroll Trap Score in about fifteen
            seconds.
          </p>
          <div className="mt-1 h-px w-12 bg-white/15" aria-hidden />
        </motion.header>

        <motion.div
          {...motionProps}
          transition={
            reduce
              ? undefined
              : {
                  duration: 0.9,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1] as const,
                }
          }
          className="flex w-full flex-col items-center gap-12"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
