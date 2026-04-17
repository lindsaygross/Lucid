"use client";

import { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { cn } from "@/lib/utils";

type SparklesCoreProps = {
  id?: string;
  className?: string;
  background?: string;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  density?: number;
};

export function SparklesCore({
  id,
  className,
  background = "transparent",
  particleColor = "#FFFFFF",
  minSize = 0.4,
  maxSize = 1.4,
  speed = 1,
  density = 80,
}: SparklesCoreProps) {
  const [ready, setReady] = useState(false);
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  const options: ISourceOptions = {
    background: { color: { value: background } },
    fullScreen: { enable: false },
    fpsLimit: 120,
    detectRetina: true,
    particles: {
      color: { value: particleColor },
      move: {
        enable: true,
        direction: "none",
        speed: { min: 0.1, max: speed },
        outModes: { default: "out" },
        random: true,
        straight: false,
      },
      number: {
        value: density,
        density: { enable: true, width: 400, height: 400 },
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: {
          enable: true,
          speed: speed,
          sync: false,
          startValue: "random",
          destroy: "none",
        },
      },
      shape: { type: "circle" },
      size: { value: { min: minSize, max: maxSize } },
    },
  };

  return (
    <div className={cn("h-full w-full", className)}>
      <Particles id={id ?? generatedId} options={options} className="h-full w-full" />
    </div>
  );
}
