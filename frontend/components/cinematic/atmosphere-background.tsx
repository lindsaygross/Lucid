"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { FloatingPaths } from "@/components/aceternity/floating-paths";

export function AtmosphereBackground() {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduce) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent"
      />
    );
  }

  const density = mobile ? 28 : 50;
  const speed = mobile ? 0.6 : 0.7;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.35]">
        <FloatingPaths position={1} />
      </div>
      <div className="absolute inset-0">
        <SparklesCore
          background="transparent"
          particleColor="#FFFFFF"
          minSize={0.3}
          maxSize={1.0}
          density={density}
          speed={speed}
        />
      </div>
    </div>
  );
}
