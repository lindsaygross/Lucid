"use client";

import type { ReactNode, RefObject } from "react";

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
  return (
    <section
      ref={sectionRef}
      className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 pb-24 pt-16 sm:px-8"
    >
      {children}
    </section>
  );
}
