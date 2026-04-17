"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { analyze, type AnalysisResult } from "@/lib/api";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { FloatingPaths } from "@/components/aceternity/floating-paths";
import { LucidLogo } from "@/components/lucid-logo";
import { ScreenshotWall } from "@/components/screenshot-wall";
import { AnalyzerInput } from "@/components/analyzer-input";
import { GalleryTiles } from "@/components/gallery-tiles";
import { WaitState } from "@/components/wait-state";
import { ResultsView } from "@/components/results-view";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze(payload: { url: string } | { text: string }) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    try {
      const data = await analyze(payload);
      setResult(data);
      setStatus("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-black text-white">
      <Hero />

      <section
        ref={resultsRef}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 pb-24 pt-16 sm:px-8"
      >
        {status === "idle" && (
          <div className="flex w-full flex-col items-center gap-10">
            <AnalyzerInput onSubmit={handleAnalyze} />
            <GalleryTiles
              onPick={(label) =>
                handleAnalyze({
                  text: `Sample: ${label}. This is a placeholder prompt used before the pre-cached gallery is wired up.`,
                })
              }
            />
          </div>
        )}

        {status === "loading" && <WaitState />}

        {status === "error" && (
          <div className="w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-sm text-red-200">
            <p className="font-medium">Something broke while analyzing that.</p>
            <p className="mt-1 font-mono text-[11px] text-red-300/80">{error}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 rounded-full border border-red-400/40 px-4 py-1.5 text-xs text-red-100 hover:bg-red-500/10"
            >
              try again
            </button>
          </div>
        )}

        {status === "done" && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </section>

      <Footer />
    </main>
  );
}

function Hero() {
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

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <LucidLogo className="text-[4rem] leading-none sm:text-[7rem] md:text-[9rem]" />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-balance text-base text-zinc-300 sm:text-lg md:text-xl"
        >
          You&rsquo;re not addicted. You&rsquo;re being engineered.{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text font-semibold text-transparent">
            See how.
          </span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500"
        >
          paste a tiktok ↓
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="mt-2"
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

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black px-4 py-8 text-center sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 text-[12px] text-zinc-500">
        <p>
          LUCID is a research / education tool. Scores are statistical estimates based on a
          rubric grounded in peer-reviewed behavioral research, not a measurement of intent.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]">
          built for Duke DL · 2026 · lindsay gross
        </p>
      </div>
    </footer>
  );
}
