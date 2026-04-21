"use client";

import { useRef, useState } from "react";
import { analyze, type AnalysisResult } from "@/lib/api";
import { AnalyzerInput } from "@/components/analyzer-input";
import { LiveDemo } from "@/components/live-demo/live-demo";
import { WaitState } from "@/components/wait-state";
import { ResultsView } from "@/components/results-view";
import { SiteNav } from "@/components/site-nav";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { AtmosphereBackground } from "@/components/cinematic/atmosphere-background";
import { ScrollManifesto } from "@/components/cinematic/scroll-manifesto";
import { AnalyzerFrame } from "@/components/cinematic/analyzer-frame";
import { BackToTop } from "@/components/back-to-top";

type Status = "idle" | "loading" | "done" | "error";

const CINEMATIC_ENABLED = process.env.NEXT_PUBLIC_CINEMATIC_INTRO !== "false";

// Demo-day "try this one" example. @itsdanikasworld post whose caption
// literally instructs "don't scroll" — on-message high-trap content.
const EXAMPLE_URL =
  "https://www.tiktok.com/@itsdanikasworld/video/7604982015439490317?q=dont%20scroll&t=1776447074916";

function friendlyErrorMessage(raw: string | null): { headline: string; body: string } {
  const msg = (raw ?? "").toLowerCase();
  if (!msg) {
    return {
      headline: "Something went wrong.",
      body: "Try again, or swap in a different URL.",
    };
  }
  if (msg.includes("private") || msg.includes("unavailable") || msg.includes("not found") || msg.includes("404")) {
    return {
      headline: "Couldn't reach that TikTok.",
      body: "It may be private, removed, or region-locked. Try a different URL, or paste the caption text directly.",
    };
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return {
      headline: "That took too long to download.",
      body: "TikTok's servers can be slow. Try again in a moment, or pick a different URL.",
    };
  }
  if (msg.includes("invalid") || msg.includes("parse") || msg.includes("url")) {
    return {
      headline: "That URL didn't look quite right.",
      body: "Paste a TikTok video URL, e.g. tiktok.com/@username/video/7xxxxxxxxxxxxxxxxxx.",
    };
  }
  if (msg.includes("rate") || msg.includes("429") || msg.includes("overload") || msg.includes("529")) {
    return {
      headline: "Our labeling service is rate-limited right now.",
      body: "Claude Vision is briefly throttled. Give it 30 seconds and try again.",
    };
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    return {
      headline: "Network hiccup.",
      body: "Check your connection, or the backend may be restarting. Try again in a moment.",
    };
  }
  return {
    headline: "Something went wrong while analyzing that post.",
    body: "Try again, or swap in a different URL.",
  };
}

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
            <button
              type="button"
              onClick={() => handleAnalyze({ url: EXAMPLE_URL })}
              className="rounded-sm font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            >
              no tiktok handy? try this one →
            </button>
            <Link
              href="/about"
              className="rounded-sm font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            >
              new here? read the about page ↗
            </Link>
          </div>
        )}

        {status === "loading" && <WaitState />}

        {status === "error" && (() => {
          const friendly = friendlyErrorMessage(error);
          return (
            <div className="w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-sm text-red-200">
              <p className="font-medium">{friendly.headline}</p>
              <p className="mt-1 text-red-200/90">{friendly.body}</p>
              {error && (
                <details className="mt-3 text-red-300/70">
                  <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em]">
                    technical detail
                  </summary>
                  <p className="mt-2 font-mono text-[11px]">{error}</p>
                </details>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full border border-red-400/40 px-4 py-1.5 text-xs text-red-100 hover:bg-red-500/10"
              >
                try again
              </button>
            </div>
          );
        })()}

        {status === "done" && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </AnalyzerFrame>

      <Footer />
      <BackToTop />
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
          <span>Built by Lindsay Gross · 2026</span>
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
