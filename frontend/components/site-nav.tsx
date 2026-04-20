import Link from "next/link";

type SiteNavProps = {
  current: "home" | "about";
};

export function SiteNav({ current }: SiteNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="relative z-20 flex w-full items-center justify-between px-4 pt-5 sm:px-8"
    >
      <Link
        href="/"
        aria-current={current === "home" ? "page" : undefined}
        className="rounded-sm font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 min-h-[44px] inline-flex items-center"
      >
        lucid
      </Link>
      <div className="flex items-center gap-6 sm:gap-8">
        <Link
          href={current === "home" ? "#analyzer" : "/#analyzer"}
          className="rounded-sm font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 min-h-[44px] inline-flex items-center"
        >
          analyze
        </Link>
        <Link
          href="/about"
          aria-current={current === "about" ? "page" : undefined}
          className="rounded-sm font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 min-h-[44px] inline-flex items-center"
        >
          about
        </Link>
      </div>
    </nav>
  );
}
