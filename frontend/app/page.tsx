"use client";

import { useRef, useState } from "react";
import { analyze, type AnalysisResult } from "@/lib/api";
import { AnalyzerInput } from "@/components/analyzer-input";
import { LiveDemo } from "@/components/live-demo/live-demo";
import { WaitState } from "@/components/wait-state";
import { ResultsView } from "@/components/results-view";
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { AtmosphereBackground } from "@/components/cinematic/atmosphere-background";
import { ScrollManifesto } from "@/components/cinematic/scroll-manifesto";
import { AnalyzerFrame } from "@/components/cinematic/analyzer-frame";

type Status = "idle" | "loading" | "done" | "error";

const CINEMATIC_ENABLED = process.env.NEXT_PUBLIC_CINEMATIC_INTRO !== "false";

export default function Home() {
  const cinematic = CINEMATIC_ENABLED;
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
    <main className="relative flex min-h-screen w-full flex-col text-white">
      {cinematic && (
        <a
          href="#analyzer"
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:border focus:border-white/30 focus:bg-black/90 focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.24em] focus:text-white"
        >
          skip to analyzer
        </a>
      )}
      {cinematic && <AtmosphereBackground />}
      <div className="absolute inset-x-0 top-0 z-30">
        <SiteNav current="home" />
      </div>
      <Hero />

      {cinematic && <ScrollManifesto />}

      <AnalyzerFrame cinematic={cinematic} sectionRef={resultsRef}>
        {status === "idle" && (
          <div className="flex w-full flex-col items-center gap-12">
            {cinematic && <LiveDemo />}
            {cinematic && (
              <header className="mt-10 flex w-full flex-col items-center gap-3 border-t border-white/5 pt-16 text-center sm:mt-14 sm:pt-20">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
                  your turn
                </span>
                <p className="max-w-[46ch] font-heading text-[20px] font-semibold leading-[1.3] text-white sm:text-[24px]">
                  Pick a post. See how it&rsquo;s engineered.
                </p>
              </header>
            )}
            <AnalyzerInput onSubmit={handleAnalyze} />
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
      </AnalyzerFrame>

      <Footer />
    </main>
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
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em]">
          <span>built for Duke DL · 2026 · lindsay gross</span>
          <span className="text-zinc-700" aria-hidden="true">·</span>
          <a
            href="https://github.com/lindsaygross/Lucid"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-zinc-400 underline decoration-white/20 decoration-dotted underline-offset-4 transition-colors hover:decoration-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
          >
            source on github
          </a>
        </p>
      </div>
    </footer>
  );
}
