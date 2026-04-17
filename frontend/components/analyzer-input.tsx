"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnalyzerInputProps = {
  onSubmit: (payload: { url: string } | { text: string }) => void;
  disabled?: boolean;
};

export function AnalyzerInput({ onSubmit, disabled }: AnalyzerInputProps) {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    if (mode === "url" && url.trim()) onSubmit({ url: url.trim() });
    if (mode === "text" && text.trim()) onSubmit({ text: text.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="mb-3 flex gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "rounded px-2 py-1 transition-colors",
            mode === "url" ? "bg-white/10 text-white" : "hover:text-white",
          )}
        >
          tiktok url
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={cn(
            "rounded px-2 py-1 transition-colors",
            mode === "text" ? "bg-white/10 text-white" : "hover:text-white",
          )}
        >
          paste text
        </button>
      </div>
      <motion.div
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(168,85,247,0.0), 0 0 24px 0 rgba(168,85,247,0.15)",
            "0 0 0 0 rgba(236,72,153,0.0), 0 0 40px 0 rgba(236,72,153,0.25)",
            "0 0 0 0 rgba(6,182,212,0.0), 0 0 32px 0 rgba(6,182,212,0.2)",
            "0 0 0 0 rgba(168,85,247,0.0), 0 0 24px 0 rgba(168,85,247,0.15)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {mode === "url" ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a TikTok URL — tiktok.com/@user/video/..."
            className="w-full bg-transparent px-5 py-5 text-base text-white placeholder:text-zinc-500 focus:outline-none sm:text-lg"
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste video transcript or caption text…"
            className="w-full resize-none bg-transparent px-5 py-5 text-base text-white placeholder:text-zinc-500 focus:outline-none sm:text-lg"
            rows={4}
            disabled={disabled}
          />
        )}
        <div className="flex justify-end border-t border-white/5 bg-black/40 p-2">
          <Button
            type="submit"
            disabled={disabled}
            className="bg-white text-black hover:bg-white/90"
          >
            Analyze
          </Button>
        </div>
      </motion.div>
    </form>
  );
}
