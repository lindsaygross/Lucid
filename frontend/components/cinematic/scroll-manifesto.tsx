"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

export function ScrollManifesto() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticManifesto />;

  return (
    <div className="relative z-10" aria-label="Manifesto">
      <Beat01 />
      <Beat02 />
      <Beat03 />
      <Beat04 />
      <Beat05 />
    </div>
  );
}

/* ---------- primitives ---------- */

type LineProps = {
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
  as?: "div" | "h2";
  children: React.ReactNode;
};

function Line({ progress, start, end, className, as = "div", children }: LineProps) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [14, 0]);
  const filter = useTransform(progress, [start, end], ["blur(6px)", "blur(0px)"]);
  const Component = as === "h2" ? motion.h2 : motion.div;
  return (
    <Component style={{ opacity, y, filter }} className={className}>
      {children}
    </Component>
  );
}

function Footnote({
  progress,
  start,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  children: React.ReactNode;
}) {
  // Clamp the reveal window into [0, 1]. Chrome's Web Animations API rejects
  // keyframe offsets outside that range with
  //   "Offsets must be null or in the range [0, 1]"
  // which crashes the page. Safari was silently tolerant.
  const safeStart = Math.min(Math.max(start, 0), 1);
  const safeEnd = Math.min(safeStart + 0.05, 1);
  const opacity = useTransform(progress, [safeStart, safeEnd], [0, 1]);
  return (
    <motion.p
      style={{ opacity }}
      className="mt-10 max-w-[40ch] text-left font-mono text-[10px] leading-[1.6] tracking-[0.02em] text-zinc-500 sm:text-[11px]"
    >
      {children}
    </motion.p>
  );
}

function BeatShell({
  heightVh,
  children,
  sectionRef,
  label,
}: {
  heightVh: number;
  children: React.ReactNode;
  sectionRef: React.RefObject<HTMLElement | null>;
  label?: string;
}) {
  return (
    <section
      ref={sectionRef}
      aria-label={label}
      className="relative w-full"
      style={{ height: `${heightVh}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 sm:px-8">
        <div className="flex w-full max-w-[62ch] flex-col items-start justify-center text-left">
          {children}
        </div>
      </div>
    </section>
  );
}

/* ---------- Beat 01: Recognition + Scale ---------- */

function Beat01() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return (
    <BeatShell heightVh={220} sectionRef={ref} label="Beat 01, recognition and scale">
      <Line
        progress={progress}
        start={0.02}
        end={0.1}
        as="h2"
        className="font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[40px]"
      >
        You opened TikTok at 11.
      </Line>
      <Line
        progress={progress}
        start={0.12}
        end={0.2}
        className="mt-6 font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[40px]"
      >
        You finally put your phone down at 1.
      </Line>
      <Line
        progress={progress}
        start={0.22}
        end={0.3}
        className="mt-6 font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[40px]"
      >
        You can&rsquo;t remember a single video.
      </Line>

      {/* held silence: 0.30 to 0.55 */}

      <Line
        progress={progress}
        start={0.6}
        end={0.72}
        className="mt-14 text-[18px] leading-[1.5] text-zinc-200 sm:text-[22px]"
      >
        The average user spends{" "}
        <span className="font-semibold text-white">95 minutes a day</span> on the app.
        <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">1</sup>
      </Line>
      <Line
        progress={progress}
        start={0.78}
        end={0.9}
        className="mt-4 text-[18px] leading-[1.5] text-zinc-200 sm:text-[22px]"
      >
        That&rsquo;s almost{" "}
        <span className="font-semibold text-white">24 days a year spent scrolling.</span>
      </Line>

      <Footnote progress={progress} start={0.9}>
        &sup1; Sensor Tower, 2024.
      </Footnote>
    </BeatShell>
  );
}

/* ---------- Beat 02: Absolution (the pivot) ---------- */

function Beat02() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return (
    <BeatShell heightVh={300} sectionRef={ref} label="Beat 02, absolution">
      <Line
        progress={progress}
        start={0.04}
        end={0.18}
        as="h2"
        className="font-heading text-[34px] font-semibold leading-[1.1] text-white sm:text-[56px]"
      >
        This isn&rsquo;t a willpower problem.
      </Line>

      {/* the longest held silence in the manifesto: 0.18 to 0.66 */}

      <Line
        progress={progress}
        start={0.72}
        end={0.82}
        className="mt-10 font-heading text-[22px] font-semibold leading-[1.2] text-white sm:text-[32px]"
      >
        It&rsquo;s a design problem.
      </Line>
      <Line
        progress={progress}
        start={0.88}
        end={0.98}
        className="mt-4 font-heading text-[22px] font-semibold leading-[1.2] text-white sm:text-[32px]"
      >
        And the design is working exactly as intended.
      </Line>
    </BeatShell>
  );
}

/* ---------- Beat 03: Evidence (260 videos) ---------- */

function Beat03() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return (
    <BeatShell heightVh={300} sectionRef={ref} label="Beat 03, evidence">
      <Line
        progress={progress}
        start={0.02}
        end={0.12}
        className="text-[20px] leading-[1.4] text-zinc-200 sm:text-[26px]"
      >
        TikTok&rsquo;s own engineers calculated the precise number of videos
      </Line>
      <Line
        progress={progress}
        start={0.14}
        end={0.24}
        className="mt-2 text-[20px] leading-[1.4] text-zinc-200 sm:text-[26px]"
      >
        it takes for a user to become addicted.
      </Line>

      {/* held silence: 0.24 to 0.40 */}

      <Line
        progress={progress}
        start={0.44}
        end={0.56}
        as="h2"
        className="mt-16 font-heading text-[52px] font-semibold leading-[0.95] tracking-[-0.02em] text-white sm:text-[104px] md:text-[120px]"
      >
        260 videos.
      </Line>
      <Line
        progress={progress}
        start={0.58}
        end={0.68}
        className="mt-4 font-mono text-[14px] uppercase tracking-[0.24em] text-zinc-400 sm:text-[16px]"
      >
        About thirty-five minutes.
      </Line>

      {/* held silence: 0.68 to 0.78 */}

      <Line
        progress={progress}
        start={0.8}
        end={0.86}
        className="mt-16 text-[16px] leading-[1.55] text-zinc-300 sm:text-[18px]"
      >
        The number was in their internal research,
      </Line>
      <Line
        progress={progress}
        start={0.87}
        end={0.92}
        className="text-[16px] leading-[1.55] text-zinc-300 sm:text-[18px]"
      >
        made public when Kentucky&rsquo;s attorney general
      </Line>
      <Line
        progress={progress}
        start={0.92}
        end={0.97}
        className="text-[16px] leading-[1.55] text-zinc-300 sm:text-[18px]"
      >
        filed an unredacted complaint in October 2024.
        <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">2</sup>
      </Line>

      <Footnote progress={progress} start={0.97}>
        &sup2; Inadvertently unsealed in <em>Commonwealth of Kentucky v. TikTok Inc.</em>,
        October 2024. Reporting: NPR, Washington Post, CNN.
      </Footnote>
    </BeatShell>
  );
}

/* ---------- Beat 04: Legitimacy + the Eulenstein quote ---------- */

function Beat04() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return (
    <BeatShell heightVh={380} sectionRef={ref} label="Beat 04, legitimacy">
      <Line
        progress={progress}
        start={0.01}
        end={0.08}
        as="h2"
        className="font-heading text-[22px] font-semibold leading-[1.15] text-white sm:text-[30px]"
      >
        This is not a complaint anymore.
      </Line>
      <Line
        progress={progress}
        start={0.1}
        end={0.18}
        className="mt-3 font-heading text-[22px] font-semibold leading-[1.15] text-white sm:text-[30px]"
      >
        It&rsquo;s the operative theory of a federal case.
      </Line>

      <Line
        progress={progress}
        start={0.24}
        end={0.36}
        className="mt-8 text-[15px] leading-[1.55] text-zinc-200 sm:text-[17px]"
      >
        <span className="font-semibold text-white">Forty-two state attorneys general</span>{" "}
        are suing Meta for designing Instagram and Facebook to addict children, while
        publicly telling parents they were safe.
        <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">3</sup>
      </Line>

      <Line
        progress={progress}
        start={0.38}
        end={0.46}
        className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[12px]"
      >
        Multidistrict Litigation No. 3047. Argued in court right now.
      </Line>

      {/* held silence: 0.46 to 0.58 */}

      <Line
        progress={progress}
        start={0.58}
        end={0.68}
        className="mt-10 max-w-[55ch] border-l-2 border-white/40 pl-5 font-heading text-[17px] italic leading-[1.5] text-white sm:text-[21px]"
      >
        &ldquo;No one wakes up thinking they want to maximize the number of times they
        open Instagram that day.
      </Line>
      <Line
        progress={progress}
        start={0.68}
        end={0.76}
        className="mt-3 max-w-[55ch] border-l-2 border-white/40 pl-5 font-heading text-[17px] italic leading-[1.5] text-white sm:text-[21px]"
      >
        But that&rsquo;s exactly what our product teams are trying to do.&rdquo;
      </Line>

      <Line
        progress={progress}
        start={0.78}
        end={0.86}
        className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[12px]"
      >
        Max Eulenstein, Vice President of Product, Meta.
      </Line>
      <Line
        progress={progress}
        start={0.86}
        end={0.92}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 sm:text-[12px]"
      >
        Internal email, January 2021.
        <sup className="ml-0.5 text-[10px] text-zinc-400">4</sup>
      </Line>

      <Footnote progress={progress} start={0.94}>
        &sup3; Attorneys General of CA, NY, NJ, et al. v. Meta Platforms Inc., October
        24, 2023.
        <br />
        &#8308; Unsealed in the federal complaint, November 2023. Reporting: Time, CBS
        News, NPR.
      </Footnote>
    </BeatShell>
  );
}

/* ---------- Beat 05: the Name + Resolution ---------- */

function Beat05() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(
    progress,
    [0.02, 0.12, 0.3, 0.4],
    [0, 1, 1, 0],
  );
  const introOpacity2 = useTransform(
    progress,
    [0.14, 0.24, 0.3, 0.4],
    [0, 1, 1, 0],
  );
  const introY1 = useTransform(progress, [0.02, 0.12], [14, 0]);
  const introY2 = useTransform(progress, [0.14, 0.24], [14, 0]);
  const introFilter1 = useTransform(progress, [0.02, 0.12], ["blur(6px)", "blur(0px)"]);
  const introFilter2 = useTransform(progress, [0.14, 0.24], ["blur(6px)", "blur(0px)"]);

  const wordmarkOpacity = useTransform(progress, [0.42, 0.52], [0, 1]);
  const wordmarkY = useTransform(progress, [0.42, 0.52], [20, 0]);
  const defOneOpacity = useTransform(progress, [0.62, 0.72], [0, 1]);
  const defTwoOpacity = useTransform(progress, [0.78, 0.88], [0, 1]);

  return (
    <>
      <section
        ref={ref}
        aria-label="Beat 05, the name"
        className="relative w-full"
        style={{ height: `300svh` }}
      >
        <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 text-center sm:px-8">
          {/* intro lines: present then cross-fade out */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8">
            <motion.div
              style={{ opacity: introOpacity, y: introY1, filter: introFilter1 }}
              className="max-w-[58ch] font-heading text-[24px] font-semibold leading-[1.2] text-white sm:text-[34px]"
            >
              Most people don&rsquo;t know they&rsquo;re being engineered while
              it&rsquo;s happening.
            </motion.div>
            <motion.div
              style={{ opacity: introOpacity2, y: introY2, filter: introFilter2 }}
              className="mt-4 max-w-[58ch] font-heading text-[24px] font-semibold leading-[1.2] text-white sm:text-[34px]"
            >
              That&rsquo;s by design too.
            </motion.div>
          </div>

          {/* wordmark + two definitions */}
          <motion.h2
            style={{ opacity: wordmarkOpacity, y: wordmarkY }}
            className="select-none font-heading text-[72px] font-black leading-none tracking-[-0.02em] text-white sm:text-[140px] md:text-[180px]"
          >
            LUCID
          </motion.h2>
          <div className="mt-8 flex max-w-[52ch] flex-col gap-4 sm:mt-12 sm:gap-5">
            <motion.p
              style={{ opacity: defOneOpacity }}
              className="font-mono text-[13px] italic leading-[1.6] tracking-[0.02em] text-zinc-300 sm:text-[15px]"
            >
              (adj.) able to think clearly, especially in the intervals of confusion.
            </motion.p>
            <motion.p
              style={{ opacity: defTwoOpacity }}
              className="font-mono text-[13px] italic leading-[1.6] tracking-[0.02em] text-zinc-300 sm:text-[15px]"
            >
              (adj.) aware that you are dreaming, while the dream is still happening.
            </motion.p>
          </div>
        </div>
      </section>

      <ResolutionLines />
    </>
  );
}

function ResolutionLines() {
  return (
    <section
      className="relative z-10 w-full px-5 pb-10 pt-24 sm:px-8 sm:pt-28"
      aria-label="Manifesto resolution"
    >
      <div className="mx-auto flex max-w-[58ch] flex-col gap-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-[22px] font-semibold leading-[1.25] text-white sm:text-[30px]"
        >
          You can&rsquo;t quit the dream.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-[22px] font-semibold leading-[1.25] text-white sm:text-[30px]"
        >
          You can wake up inside it.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-mono text-[12px] uppercase tracking-[0.28em] text-zinc-400 sm:text-[13px]"
        >
          Paste a TikTok. See what it&rsquo;s doing to you.
        </motion.p>
      </div>
    </section>
  );
}

/* ---------- Static fallback for prefers-reduced-motion ---------- */

function StaticManifesto() {
  return (
    <article
      aria-label="Manifesto, static text fallback"
      className="relative z-10 mx-auto flex w-full max-w-[62ch] flex-col gap-20 px-5 pb-24 pt-20 sm:px-8 sm:pt-28"
    >
      <StaticBeat
        label="Beat 01, recognition and scale"
        body={[
          <p key="l1" className="font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[36px]">
            You opened TikTok at 11.
          </p>,
          <p key="l2" className="font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[36px]">
            You finally put your phone down at 1.
          </p>,
          <p key="l3" className="font-heading text-[28px] font-semibold leading-[1.15] text-white sm:text-[36px]">
            You can&rsquo;t remember a single video.
          </p>,
          <p key="l4" className="mt-8 text-[18px] leading-[1.55] text-zinc-200 sm:text-[20px]">
            The average user spends{" "}
            <span className="font-semibold text-white">95 minutes a day</span> on the app.
            <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">1</sup>
          </p>,
          <p key="l5" className="text-[18px] leading-[1.55] text-zinc-200 sm:text-[20px]">
            That&rsquo;s almost{" "}
            <span className="font-semibold text-white">24 days a year spent scrolling.</span>
          </p>,
          <p key="fn" className="mt-4 font-mono text-[11px] text-zinc-500">
            &sup1; Sensor Tower, 2024.
          </p>,
        ]}
      />
      <StaticBeat
        label="Beat 02, absolution"
        body={[
          <p key="l1" className="font-heading text-[32px] font-semibold leading-[1.1] text-white sm:text-[44px]">
            This isn&rsquo;t a willpower problem.
          </p>,
          <p key="l2" className="mt-6 font-heading text-[22px] font-semibold leading-[1.2] text-white sm:text-[28px]">
            It&rsquo;s a design problem.
          </p>,
          <p key="l3" className="font-heading text-[22px] font-semibold leading-[1.2] text-white sm:text-[28px]">
            And the design is working exactly as intended.
          </p>,
        ]}
      />
      <StaticBeat
        label="Beat 03, evidence"
        body={[
          <p key="l1" className="text-[18px] leading-[1.55] text-zinc-200 sm:text-[20px]">
            TikTok&rsquo;s own engineers calculated the precise number of videos it takes
            for a user to become addicted.
          </p>,
          <p key="l2" className="mt-6 font-heading text-[48px] font-semibold leading-[0.95] tracking-[-0.02em] text-white sm:text-[88px]">
            260 videos.
          </p>,
          <p key="l3" className="mt-1 font-mono text-[13px] uppercase tracking-[0.24em] text-zinc-400 sm:text-[15px]">
            About thirty-five minutes.
          </p>,
          <p key="l4" className="mt-6 text-[16px] leading-[1.55] text-zinc-300 sm:text-[18px]">
            The number was in their internal research, made public when Kentucky&rsquo;s
            attorney general filed an unredacted complaint in October 2024.
            <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">2</sup>
          </p>,
          <p key="fn" className="mt-4 font-mono text-[11px] text-zinc-500">
            &sup2; Inadvertently unsealed in <em>Commonwealth of Kentucky v. TikTok Inc.</em>,
            October 2024. Reporting: NPR, Washington Post, CNN.
          </p>,
        ]}
      />
      <StaticBeat
        label="Beat 04, legitimacy"
        body={[
          <p key="l1" className="font-heading text-[24px] font-semibold leading-[1.15] text-white sm:text-[30px]">
            This is not a complaint anymore.
          </p>,
          <p key="l2" className="font-heading text-[24px] font-semibold leading-[1.15] text-white sm:text-[30px]">
            It&rsquo;s the operative theory of a federal case.
          </p>,
          <p key="l3" className="mt-6 text-[16px] leading-[1.55] text-zinc-200 sm:text-[18px]">
            <span className="font-semibold text-white">Forty-two state attorneys general</span>{" "}
            are suing Meta for designing Instagram and Facebook to addict children, while
            publicly telling parents they were safe.
            <sup className="ml-0.5 font-mono text-[10px] text-zinc-400">3</sup>
          </p>,
          <p key="l4" className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[13px]">
            Multidistrict Litigation No. 3047. Argued in court right now.
          </p>,
          <blockquote key="q" className="mt-8 flex flex-col gap-3 border-l-2 border-white/40 pl-5 font-heading text-[18px] italic leading-[1.5] text-white sm:text-[22px]">
            <p>
              &ldquo;No one wakes up thinking they want to maximize the number of times
              they open Instagram that day.
            </p>
            <p>But that&rsquo;s exactly what our product teams are trying to do.&rdquo;</p>
          </blockquote>,
          <p key="att1" className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
            Max Eulenstein, Vice President of Product, Meta.
          </p>,
          <p key="att2" className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
            Internal email, January 2021.
            <sup className="ml-0.5 text-[10px] text-zinc-400">4</sup>
          </p>,
          <p key="fn" className="mt-4 font-mono text-[11px] text-zinc-500">
            &sup3; Attorneys General of CA, NY, NJ, et al. v. Meta Platforms Inc., October
            24, 2023.
            <br />
            &#8308; Unsealed in the federal complaint, November 2023. Reporting: Time, CBS
            News, NPR.
          </p>,
        ]}
      />
      <StaticBeat
        label="Beat 05, the name"
        body={[
          <p key="l1" className="font-heading text-[24px] font-semibold leading-[1.15] text-white sm:text-[30px]">
            Most people don&rsquo;t know they&rsquo;re being engineered while
            it&rsquo;s happening.
          </p>,
          <p key="l2" className="font-heading text-[24px] font-semibold leading-[1.15] text-white sm:text-[30px]">
            That&rsquo;s by design too.
          </p>,
          <h2 key="w" className="mt-10 font-heading text-[64px] font-black leading-none tracking-[-0.02em] text-white sm:text-[128px]">
            LUCID
          </h2>,
          <p key="d1" className="mt-4 font-mono text-[13px] italic leading-[1.6] text-zinc-300 sm:text-[15px]">
            (adj.) able to think clearly, especially in the intervals of confusion.
          </p>,
          <p key="d2" className="font-mono text-[13px] italic leading-[1.6] text-zinc-300 sm:text-[15px]">
            (adj.) aware that you are dreaming, while the dream is still happening.
          </p>,
        ]}
      />
      <div className="flex flex-col gap-2 text-center">
        <p className="font-heading text-[22px] font-semibold leading-[1.25] text-white sm:text-[28px]">
          You can&rsquo;t quit the dream.
        </p>
        <p className="font-heading text-[22px] font-semibold leading-[1.25] text-white sm:text-[28px]">
          You can wake up inside it.
        </p>
        <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.28em] text-zinc-400 sm:text-[13px]">
          Paste a TikTok. See what it&rsquo;s doing to you.
        </p>
      </div>
    </article>
  );
}

function StaticBeat({
  label,
  body,
}: {
  label: string;
  body: React.ReactNode[];
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-3">
      {body}
    </section>
  );
}
