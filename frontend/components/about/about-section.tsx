import type { ReactNode } from "react";

type AboutSectionProps = {
  id: string;
  eyebrow: string;
  heading: string;
  children: ReactNode;
};

export function AboutSection({ id, eyebrow, heading, children }: AboutSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-16 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 border-t border-white/5 pt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
          {eyebrow}
        </p>
        <h2
          id={`${id}-heading`}
          className="font-heading text-2xl font-semibold leading-[1.15] text-white sm:text-[28px]"
        >
          {heading}
        </h2>
      </div>
      <div className="flex flex-col gap-5 text-[16px] leading-[1.65] text-zinc-300 sm:text-[17px]">
        {children}
      </div>
    </section>
  );
}

type CiteProps = {
  href: string;
  children: ReactNode;
};

export function Cite({ href, children }: CiteProps) {
  return (
    <a
      href={href}
      className="rounded-sm text-zinc-200 underline decoration-white/20 decoration-dotted underline-offset-4 transition-colors hover:decoration-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      {children}
    </a>
  );
}
