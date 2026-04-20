"use client";

import { useEffect, useRef, useState } from "react";

const EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";

let scriptLoadPromise: Promise<void> | null = null;

function loadEmbedScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_SCRIPT_SRC}"]`,
    );
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = EMBED_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("TikTok embed.js failed to load"));
    };
    document.body.appendChild(s);
  });

  return scriptLoadPromise;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

type TikTokEmbedProps = {
  sourceUrl: string;
  uploader: string;
  label: string;
};

type EmbedState = "idle" | "loading" | "ready" | "error";

export function TikTokEmbed({ sourceUrl, uploader, label }: TikTokEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<EmbedState>("idle");
  const videoId = extractVideoId(sourceUrl);

  useEffect(() => {
    if (!videoId) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            setState("loading");
            loadEmbedScript()
              .then(() => {
                if (!cancelled) setState("ready");
              })
              .catch(() => {
                if (!cancelled) setState("error");
              });
            break;
          }
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [videoId]);

  if (!videoId || state === "error") {
    return (
      <EmbedFallback
        sourceUrl={sourceUrl}
        uploader={uploader}
        label={label}
        reason={!videoId ? "unavailable" : "blocked"}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl [&_iframe]:block [&_iframe]:!w-full [&_iframe]:!max-w-full [&_iframe]:!min-w-0 [&_.tiktok-embed]:!max-w-full [&_.tiktok-embed]:!min-w-0"
      style={{ minHeight: "320px" }}
    >
      <blockquote
        className="tiktok-embed"
        cite={sourceUrl}
        data-video-id={videoId}
        style={{
          maxWidth: "100%",
          minWidth: "0",
          margin: 0,
        }}
      >
        <section>
          <a target="_blank" rel="noopener noreferrer" href={sourceUrl}>
            @{uploader}
          </a>
        </section>
      </blockquote>
    </div>
  );
}

type EmbedFallbackProps = {
  sourceUrl: string;
  uploader: string;
  label: string;
  reason: "unavailable" | "blocked";
};

function EmbedFallback({ sourceUrl, uploader, label, reason }: EmbedFallbackProps) {
  const caption =
    reason === "unavailable"
      ? "Video unavailable. Open it on TikTok to watch."
      : "Embed blocked. Open it on TikTok to watch.";
  return (
    <div className="flex aspect-[9/16] w-full max-w-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        {reason === "unavailable" ? "video unavailable" : "embed blocked"}
      </span>
      <p className="text-[13px] leading-[1.5] text-zinc-300">
        @{uploader}
      </p>
      <p className="max-w-[28ch] text-[12px] leading-[1.5] text-zinc-500">
        {caption}
      </p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${label} on TikTok`}
        className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[12px] font-medium text-white hover:border-white/40"
      >
        Watch on TikTok
      </a>
    </div>
  );
}
