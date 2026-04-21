"use client";

import { useEffect, useState } from "react";

/**
 * Floating back-to-top button. Appears once the user has scrolled past
 * the reveal threshold and smoothly returns the page to the top on
 * click. Positioned fixed bottom-right so it follows the viewport on
 * both mobile and desktop, with a 44px minimum touch target.
 */
export function BackToTop({ revealAfterPx = 600 }: { revealAfterPx?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > revealAfterPx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfterPx]);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/80 text-zinc-300 backdrop-blur-sm transition-opacity duration-300 hover:text-white hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 sm:bottom-8 sm:right-8 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 13V3M3 8l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
