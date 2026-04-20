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
        <motion.div
          {...motionProps}
          className="flex w-full flex-col items-center gap-12"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
