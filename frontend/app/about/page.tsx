import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "About — LUCID",
  description:
    "Why I built LUCID, how the six-dimension manipulation rubric was grounded in behavioral research, and what the model can and cannot tell you.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      <SiteNav current="about" />
      <article className="mx-auto flex w-full max-w-[72ch] flex-col gap-14 px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        {/* Section content will be filled in section-by-section. */}
        <header className="flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">
            about / lucid
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
            Notes on a system that tries to make the scroll legible.
          </h1>
        </header>
      </article>
    </main>
  );
}
