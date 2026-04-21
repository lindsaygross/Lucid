import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { AboutSection, Cite } from "@/components/about/about-section";
import { BackToTop } from "@/components/back-to-top";

export const metadata: Metadata = {
  title: "About — LUCID",
  description:
    "Why I built LUCID, how the six-dimension manipulation rubric was grounded in behavioral research, and what the model can and cannot tell you.",
};

const DIMENSIONS: Array<{
  key: string;
  label: string;
  color: string;
  oneLiner: string;
  citeText: string;
  citeHref: string;
}> = [
  {
    key: "outrage",
    label: "Outrage Bait",
    color: "#EF4444",
    oneLiner:
      "Framing designed primarily to provoke anger, moral indignation, or tribal reaction rather than to inform.",
    citeText: "Crockett, 2017; Brady et al., 2017 / 2021",
    citeHref: "#ref-crockett-2017",
  },
  {
    key: "fomo",
    label: "FOMO Trigger",
    color: "#F59E0B",
    oneLiner:
      "Manufactured urgency, scarcity, or social comparison used to make the viewer feel like opting out is a loss.",
    citeText: "Przybylski et al., 2013; Cialdini, 2009",
    citeHref: "#ref-przybylski-2013",
  },
  {
    key: "engagement",
    label: "Engagement Bait",
    color: "#14B8A6",
    oneLiner:
      "Explicit prompts to tag, comment, share, or follow whose purpose is to inflate algorithmic signals, not to host a real conversation.",
    citeText: "Meta, 2017; Munger, 2020; Mathur et al., 2019",
    citeHref: "#ref-meta-2017",
  },
  {
    key: "emotional",
    label: "Emotional Manipulation",
    color: "#EC4899",
    oneLiner:
      "Guilt, pity, or shame used as a substitute for evidence. Emotional pressure that stands in for an argument.",
    citeText: "Small, Loewenstein, & Slovic, 2007; Kramer et al., 2014",
    citeHref: "#ref-small-2007",
  },
  {
    key: "curiosity",
    label: "Curiosity Gap",
    color: "#A855F7",
    oneLiner:
      "Deliberate withholding of a key referent or outcome to force the viewer to click, scroll, or watch through.",
    citeText: "Loewenstein, 1994; Blom & Hansen, 2015",
    citeHref: "#ref-loewenstein-1994",
  },
  {
    key: "dopamine",
    label: "Dopamine Design",
    color: "#06B6D4",
    oneLiner:
      "Surface-level salience hooks (ALL CAPS, rapid cuts, emoji spam, variable-reward pacing) that capture attention before the content is evaluated.",
    citeText: "Skinner, 1953; Alter, 2017; Montag et al., 2019",
    citeHref: "#ref-skinner-1953",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      <SiteNav current="about" />

      <article className="mx-auto flex w-full max-w-[68ch] flex-col gap-10 px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <header className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
            about / lucid
          </p>
          <h1 className="font-heading text-[32px] font-semibold leading-[1.08] text-white sm:text-[44px]">
            Notes on a system that tries to make the scroll legible.
          </h1>
          <p className="text-[15px] leading-[1.6] text-zinc-400 sm:text-base">
            LUCID is a proof-of-concept tool that scores short-form video for six research-grounded
            manipulation tactics. This page is the long version of why it exists, how the rubric
            was built, and what it can and cannot tell you.
          </p>
        </header>

        <AboutSection id="hook" eyebrow="§ 01 — overview" heading="Something is being done to your attention, and you don&rsquo;t have a vocabulary for it.">
          <p>
            Open TikTok at 11 p.m., close it at 1 a.m., and try to name five things you watched.
            Most people can&rsquo;t. The posts blur. What&rsquo;s left is the feeling of having
            been acted on rather than the feeling of having chosen.
          </p>
          <p>
            Short-form video platforms rank posts by engagement, and creators have adapted their
            craft to the specific psychological levers those rankings reward. The levers are real,
            and they&rsquo;ve been studied for decades. Curiosity gaps, variable-ratio
            reinforcement, outrage-based sharing, scarcity framing. But they&rsquo;re usually
            invisible at the post level. A single TikTok isn&rsquo;t labeled as manipulative, and
            most viewers don&rsquo;t have the vocabulary to describe <em>which</em> lever is being
            pulled on them at which moment.
          </p>
          <p>
            LUCID is a small attempt at that vocabulary. Paste a TikTok URL, and it returns a
            0&ndash;100 Scroll Trap Score with a per-dimension breakdown: how much of what
            you&rsquo;re about to watch is outrage bait, how much is a curiosity gap, how much is
            surface-level dopamine design. It will not tell you a creator&rsquo;s intent. It will
            not tell you whether a post is true. It will tell you, as a statistical estimate over a
            rubric rooted in peer-reviewed research, what rhetorical moves the post is making.
          </p>
        </AboutSection>

        <AboutSection
          id="meta-case"
          eyebrow="§ 02 — the landmark case"
          heading="This isn&rsquo;t only an academic question. It&rsquo;s being argued in court right now."
        >
          <p>
            Meta, TikTok / ByteDance, Snap, YouTube, and Alphabet are all defendants in a
            consolidated multidistrict litigation in the Northern District of California:{" "}
            <em>In re: Social Media Adolescent Addiction / Personal Injury Products Liability
              Litigation</em>, <Cite href="#ref-mdl-3047">MDL No. 3047</Cite>, before Judge Yvonne
            Gonzalez Rogers (case 4:22-md-03047-YGR). The MDL consolidates thousands of individual
            personal-injury suits, hundreds of school-district actions, and attorney-general
            filings from more than forty states. The plaintiffs&rsquo; core theory is
            straightforward: the products were designed to maximize engagement in a way the
            defendants knew produced addictive use patterns in minors, and were marketed as safe
            anyway.
          </p>
          <p>
            On October 24, 2023, a multi-state coalition of forty-two attorneys general filed
            parallel actions against Meta alleging that Instagram and Facebook were deliberately
            engineered to addict young users while the company publicly denied doing so.
            Thirty-three AGs joined a joint federal complaint in the Northern District of
            California; the remaining states filed in their own state courts. The filings allege
            violations of the federal Children&rsquo;s Online Privacy Protection Act and state
            consumer-protection statutes, and they name specific product mechanics (infinite
            scroll, push notifications, recommendation-driven feeds) as the designed features
            causing harm (<Cite href="#ref-njag-2023">NJ AG press release, 2023</Cite>;{" "}
            <Cite href="#ref-nyag-2023">NY AG press release, 2023</Cite>;{" "}
            <Cite href="#ref-npr-ags-2023">Allyn, NPR, 2023</Cite>).
          </p>
          <p>
            The record the AGs are drawing on was not discovered in court. In September 2021, the{" "}
            <em>Wall Street Journal</em> published the &ldquo;Facebook Files&rdquo; based on
            internal Meta research leaked by a former employee, Frances Haugen. One slide from a
            2019 internal presentation read, verbatim: &ldquo;We make body image issues worse for
            one in three teen girls.&rdquo; Another reported that thirty-two percent of teen girls
            said that when they felt bad about their bodies, Instagram made them feel worse.
            Haugen identified herself publicly on <em>60 Minutes</em> on October 3, 2021, and
            testified before the U.S. Senate Commerce Subcommittee two days later. Meta contested
            the framing of the research but not, by and large, its existence
            (<Cite href="#ref-cnbc-wsj-2021">Vanian, CNBC, 2021</Cite>;{" "}
            <Cite href="#ref-nyt-teen-girls-2021">Wells, NYT, 2021</Cite>;{" "}
            <Cite href="#ref-npr-haugen-2021">Allyn, NPR, 2021</Cite>).
          </p>
          <p>
            I&rsquo;m flagging this up front because the concept underneath LUCID is not a
            researcher&rsquo;s hypothesis anymore. The manipulation of attention at the post level
            is measurable, and platforms have internal knowledge of the machinery. It&rsquo;s a
            live federal case with more than forty state governments on one side.
          </p>
        </AboutSection>

        <AboutSection
          id="rubric"
          eyebrow="§ 03 — the six dimensions"
          heading="How the rubric was built, and why it has six axes rather than one."
        >
          <p>
            The rubric is the part of the project I took most seriously. A score is only as
            meaningful as the taxonomy underneath it, and a single &ldquo;manipulation score&rdquo;
            collapses distinctions that matter. Outrage bait and a curiosity gap both raise
            engagement, but they do it by pressing on entirely different cognitive mechanisms, and
            a viewer who can name which lever a post is pulling is in a different relationship to
            the post than one who can&rsquo;t. So LUCID scores six dimensions, each of which traces
            to at least one established line of behavioral research.
          </p>

          <ol className="flex flex-col gap-3">
            {DIMENSIONS.map((d, i) => (
              <li
                key={d.key}
                className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
                style={{ borderLeftColor: d.color, borderLeftWidth: "3px" }}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="font-heading text-[15px] font-semibold text-white sm:text-base">
                    {String(i + 1).padStart(2, "0")} &middot; {d.label}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.24em]"
                    style={{ color: d.color }}
                  >
                    dim.{d.key}
                  </span>
                </div>
                <p className="text-[15px] leading-[1.55] text-zinc-300 sm:text-[15.5px]">
                  {d.oneLiner}
                </p>
                <p className="font-mono text-[11px] leading-[1.5] text-zinc-500">
                  <Cite href={d.citeHref}>{d.citeText}</Cite>
                </p>
              </li>
            ))}
          </ol>

          <p>
            Two design choices in the scoring that I want to be explicit about.
          </p>
          <p>
            <strong className="text-white">The severity scale is ordinal, not binary.</strong> Each
            dimension is scored 0 / 1 / 2 (absent, moderate, severe), and the composite Scroll
            Trap Score is a 0&ndash;100 aggregation of the six. Manipulation is gradient; a post
            using a single mild outrage hook is doing something qualitatively different from one
            stacking outrage, scarcity, and guilt in the same ten seconds. Binary labels would
            hide that. Three levels are coarse enough to be teachable to both a human labeler and
            a language-model judge, and fine enough to distinguish rhetorical intensity.
          </p>
          <p>
            <strong className="text-white">The score is a property of the text, not of the
              creator.</strong>{" "}
            LUCID evaluates what the post is <em>doing</em> at the level of fused caption, audio
            transcript, and on-screen overlay. It does not claim to measure intent, and it
            doesn&rsquo;t try to. A nonprofit using emotional appeals to recruit foster parents and
            a con artist using the same techniques for an info-product will both score high on
            Emotional Manipulation, because the rhetorical move is the same on the page. The
            judgment about intent is the reader&rsquo;s.
          </p>
          <p>
            Finally, a note on why the rubric is fixed rather than learned. A clustering approach
            would surface whatever structure the data happens to have; a fixed rubric commits up
            front to a set of categories that are defensible to a non-ML reader. For a tool
            intended to help people articulate what a post is doing to them, the second property
            matters more. The taxonomy is one defensible cut of the space, not the only one.
          </p>
        </AboutSection>

        <AboutSection
          id="labels"
          eyebrow="§ 04 — how the labels were made"
          heading="And why, at some point, I sat down and hand-labeled a hundred of them myself."
        >
          <p>
            The deployed model is a fine-tuned DistilBERT, which is a small (66M-parameter) encoder
            transformer. It needs labeled training data in its target format. The issue is that no
            one has ever labeled three and a half thousand short-form-video captions on a
            six-dimension ordinal rubric that I made up. The data doesn&rsquo;t exist.
          </p>
          <p>
            The pragmatic solution is what the literature has started calling{" "}
            <em>LLM-as-a-judge</em>. Claude Sonnet 4.5 is given the full rubric (the one in{" "}
            <a href="#rubric" className="underline decoration-white/20 decoration-dotted underline-offset-4 hover:decoration-white/60">
              §03 above
            </a>
            ) along with eight few-shot examples spanning 0 / 1 / 2 severity per dimension, and it
            labels every item in the training corpus. DistilBERT is then trained on those labels.
            The framing is borrowed from Anthropic&rsquo;s{" "}
            <Cite href="#ref-bai-2022">Constitutional AI</Cite> work and formalized for evaluation
            use by <Cite href="#ref-zheng-2023">Zheng et al. (2023)</Cite> on MT-Bench. The idea,
            in plain terms: a larger language model trained on human-written principles can act as
            a consistent labeler at scale for a smaller model to learn from.
          </p>
          <p>
            The honest worry about this approach is that it&rsquo;s circular. You defined
            manipulation one way; you gave that definition to an LLM; the LLM produced labels that
            reflect your definition; a model trained on those labels ends up saying what you
            already believed. If all you do is train and ship, you&rsquo;re not measuring anything
            about the world. You&rsquo;re measuring the consistency of your own rubric applied by
            a proxy.
          </p>
          <p>
            The way out is to treat the Claude labels as a noisy oracle, not ground truth, and to
            calibrate them against something external. Which is why I hand-labeled 100 items
            sampled from the corpus with a fixed seed of 42, through a small Gradio interface I
            built for the purpose. Same rubric, same severity levels, no Claude output visible
            during labeling. The point of the exercise is not that one person&rsquo;s labels are
            the truth. The point is that if you&rsquo;re going to build a labeling pipeline at
            scale, you need to do the labeling yourself at least once, on a representative sample,
            and see whether the pipeline agrees with you in places that are easy and disagrees
            with you in places that are hard. Otherwise you don&rsquo;t actually know what you
            shipped.
          </p>
          <p>
            The metrics that come out of that comparison are per-dimension{" "}
            <strong className="text-white">Spearman rank correlation</strong> (how well the two
            labelers order severity) and{" "}
            <strong className="text-white">Krippendorff&rsquo;s &alpha;</strong> (an ordinal
            agreement coefficient), alongside exact-match and within-one-step accuracy. Here is
            what the 100-item pass produced.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full border-collapse text-left text-[13px] sm:text-[14px]">
              <caption className="sr-only">
                Claude-vs-human agreement on the 100-item gold set, per dimension.
              </caption>
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  <th className="border-b border-white/10 px-3 py-2 font-normal">Dimension</th>
                  <th className="border-b border-white/10 px-3 py-2 text-right font-normal">Spearman &rho;</th>
                  <th className="border-b border-white/10 px-3 py-2 text-right font-normal">Krippendorff &alpha;</th>
                  <th className="border-b border-white/10 px-3 py-2 text-right font-normal">Exact</th>
                  <th className="border-b border-white/10 px-3 py-2 text-right font-normal">Within 1</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr><td className="px-3 py-2">Outrage Bait</td><td className="px-3 py-2 text-right font-mono">+0.463</td><td className="px-3 py-2 text-right font-mono">+0.388</td><td className="px-3 py-2 text-right font-mono">0.81</td><td className="px-3 py-2 text-right font-mono">0.90</td></tr>
                <tr className="bg-white/[0.02]"><td className="px-3 py-2">FOMO Trigger</td><td className="px-3 py-2 text-right font-mono">+0.019</td><td className="px-3 py-2 text-right font-mono">+0.019</td><td className="px-3 py-2 text-right font-mono">0.82</td><td className="px-3 py-2 text-right font-mono">0.94</td></tr>
                <tr><td className="px-3 py-2">Engagement Bait</td><td className="px-3 py-2 text-right font-mono">+0.403</td><td className="px-3 py-2 text-right font-mono">+0.332</td><td className="px-3 py-2 text-right font-mono">0.81</td><td className="px-3 py-2 text-right font-mono">0.95</td></tr>
                <tr className="bg-white/[0.02]"><td className="px-3 py-2">Emotional Manipulation</td><td className="px-3 py-2 text-right font-mono">&minus;0.056</td><td className="px-3 py-2 text-right font-mono">&minus;0.053</td><td className="px-3 py-2 text-right font-mono">0.89</td><td className="px-3 py-2 text-right font-mono">0.96</td></tr>
                <tr><td className="px-3 py-2">Curiosity Gap</td><td className="px-3 py-2 text-right font-mono">+0.238</td><td className="px-3 py-2 text-right font-mono">+0.239</td><td className="px-3 py-2 text-right font-mono">0.68</td><td className="px-3 py-2 text-right font-mono">0.96</td></tr>
                <tr className="bg-white/[0.02]"><td className="px-3 py-2">Dopamine Design</td><td className="px-3 py-2 text-right font-mono">+0.176</td><td className="px-3 py-2 text-right font-mono">+0.166</td><td className="px-3 py-2 text-right font-mono">0.84</td><td className="px-3 py-2 text-right font-mono">1.00</td></tr>
                <tr className="font-semibold text-white">
                  <td className="border-t border-white/10 px-3 py-2">Macro average</td>
                  <td className="border-t border-white/10 px-3 py-2 text-right font-mono">+0.207</td>
                  <td className="border-t border-white/10 px-3 py-2 text-right font-mono">+0.182</td>
                  <td className="border-t border-white/10 px-3 py-2 text-right font-mono">0.808</td>
                  <td className="border-t border-white/10 px-3 py-2 text-right font-mono">0.952</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Two things stand out. Within-one-step agreement averages 0.95, which means that on a 0
            / 1 / 2 scale Claude and I rarely disagreed by more than a single severity level. At
            the coarse &ldquo;present or absent&rdquo; decision, we agree most of the time. At the
            same time, the rank-correlation numbers on the rarer dimensions sit close to zero.
            That is a class-imbalance artifact, not a labeling failure. When only 7 of 100 items
            are non-zero on Emotional Manipulation, a single borderline disagreement drags
            Spearman toward zero because the formula has almost no variance to work with. The
            dimensions with real variance behave as expected: Outrage Bait and Engagement Bait
            both land around &rho; = 0.4, which is a moderate correlation typical of one-human
            ordinal agreement with an LLM judge on a multi-dimensional rubric.
          </p>
          <p>
            A third pattern is that Claude is systematically more conservative than I was.
            On almost every dimension, Claude fires non-zero roughly half as often as I do. That
            is consistent with the &ldquo;when in doubt, pick the lower score&rdquo; instruction
            in the labeling prompt, and it pushes the downstream model toward precision at the
            cost of recall. Read the agreement table as a lower bound on true agreement with a
            less conservative labeler prior.
          </p>
          <p>
            The broader point: If LUCID&rsquo;s labels came solely from a language model this
            would be a scalable-oversight move with a known failure mode, and the human-validation
            pass is what makes it defensible. Where the agreement numbers come back weak, that is
            useful information. It shows which part of the rubric needs to be tightened or
            dropped.
          </p>
        </AboutSection>

        <AboutSection
          id="model"
          eyebrow="§ 05 — why a model, not a lecture"
          heading="What the pipeline actually does when you paste a URL."
        >
          <p>
            Most media-literacy work is essays. Essays describe the machinery in the abstract and
            leave you to spot it in the wild, which is the hard part. A model that scores a
            specific post on specific dimensions turns a vague intuition into something you can
            point at.
          </p>
          <p>Here&rsquo;s what happens when you paste a TikTok URL, described without equations:</p>
          <ol className="flex list-decimal flex-col gap-3 pl-5 marker:font-mono marker:text-[12px] marker:text-zinc-500">
            <li>
              The video is downloaded and its caption pulled from metadata.
            </li>
            <li>
              The audio is transcribed to text by Whisper, a widely used speech-recognition model.
            </li>
            <li>
              Four evenly-spaced keyframes are pulled from the video, and a vision-language model
              (Claude Vision) reads any on-screen overlay text from those frames. This is the
              closest thing in the stack to &ldquo;watching&rdquo; the video.
            </li>
            <li>
              The three streams (caption, transcript, overlay) are concatenated into one fused
              text blob. From the model&rsquo;s perspective, a TikTok is just that blob.
            </li>
            <li>
              The fused text is passed to a fine-tuned{" "}
              <Cite href="#ref-sanh-2019">DistilBERT</Cite> classifier with a multi-output head:
              six per-dimension probabilities plus a composite. That&rsquo;s the Scroll Trap Score
              you see.
            </li>
          </ol>
          <p>
            The model was trained on 3,491 items sampled from two established clickbait
            corpora and a small TikTok scrape, all relabeled against the six-dimension rubric.
            That sample size is explicitly small; it would not satisfy a commercial T&amp;S team.
            The full technical report, with metrics, confusion matrices, a noise-robustness
            experiment, and an error analysis, lives in the{" "}
            <a
              href="https://github.com/lindsaygross/Lucid"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-zinc-200 underline decoration-white/20 decoration-dotted underline-offset-4 transition-colors hover:decoration-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            >
              project repository on GitHub
            </a>
            . The fine-tuned model weights are on the{" "}
            <a
              href="https://huggingface.co/lindsaygross32/lucid-distilbert"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-zinc-200 underline decoration-white/20 decoration-dotted underline-offset-4 transition-colors hover:decoration-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            >
              Hugging Face Hub
            </a>
            .
          </p>
        </AboutSection>

        <AboutSection
          id="ethics"
          eyebrow="§ 06 — ethics &amp; limitations"
          heading="Four things this tool is not, stated plainly."
        >
          <p>
            <strong className="text-white">It is not ground truth.</strong> The training labels
            come from a language model applying a rubric I wrote. A different labeler with a
            different taxonomy would produce different numbers. The human-validation pass in
            §04 bounds how much to trust the labels, but it doesn&rsquo;t make them authoritative.
            Treat the scores as an informed estimate, not a measurement.
          </p>
          <p>
            <strong className="text-white">It does not read minds.</strong> The model scores
            surface features of a post&rsquo;s fused text. It says nothing about what the creator
            intended, whether the underlying claim is true, or how any specific viewer will feel
            after watching. A documentary, a fundraiser, and a scam can all score high on
            Emotional Manipulation if they use the same rhetorical moves. The score is a signal,
            not a verdict.
          </p>
          <p>
            <strong className="text-white">It is a small research dataset.</strong> 3,491
            items, heavily weighted toward English-language clickbait headlines plus a modest
            TikTok scrape. This is enough to compare naive, classical, and deep approaches on a
            fixed rubric. It is not enough to underwrite a commercial moderation product, and I
            don&rsquo;t claim otherwise.
          </p>
          <p>
            <strong className="text-white">It is one cut of the space.</strong> The six-dimension
            taxonomy is defensible, since every axis is grounded in at least one line of
            peer-reviewed research, but it is not the only defensible taxonomy. A researcher
            working primarily in misinformation or in persuasion studies might carve up the same
            content space differently. The rubric is a starting point for making the invisible
            legible, not the final word on what &ldquo;manipulation&rdquo; means.
          </p>
        </AboutSection>

        <AboutSection
          id="references"
          eyebrow="§ 07 — references"
          heading="Every factual claim above, sourced."
        >
          <p className="text-[15px] text-zinc-400">
            Grouped by section. News and court filings first, then behavioral-research citations
            underpinning the rubric, then the machine-learning literature.
          </p>

          <div className="flex flex-col gap-8">
            <RefGroup title="§ 02 — legal &amp; journalism">
              <Reference id="ref-mdl-3047">
                U.S. District Court, Northern District of California.{" "}
                <em>In re: Social Media Adolescent Addiction / Personal Injury Products
                  Liability Litigation</em>, Case 4:22-md-03047-YGR (MDL No. 3047).{" "}
                <RefLink href="https://cand.uscourts.gov/cases-e-filing/cases/422-md-03047-ygr/re-social-media-adolescent-addictionpersonal-injury-products">
                  cand.uscourts.gov
                </RefLink>
                .
              </Reference>
              <Reference id="ref-njag-2023">
                New Jersey Office of the Attorney General (2023, October 24). AG Platkin, 41 other
                attorneys general sue Meta for harms to youth from Instagram, Facebook.{" "}
                <RefLink href="https://www.njoag.gov/ag-platkin-41-other-attorneys-general-sue-meta-for-harms-to-youth-from-instagram-facebook/">
                  njoag.gov
                </RefLink>
                .
              </Reference>
              <Reference id="ref-nyag-2023">
                Office of the New York State Attorney General (2023, October 24). Attorney General
                James and multistate coalition sue Meta for harming youth.{" "}
                <RefLink href="https://ag.ny.gov/press-release/2023/attorney-general-james-and-multistate-coalition-sue-meta-harming-youth">
                  ag.ny.gov
                </RefLink>
                .
              </Reference>
              <Reference id="ref-npr-ags-2023">
                Allyn, B. (2023, October 24). States sue Meta, claiming Instagram, Facebook fueled
                youth mental health crisis. <em>NPR</em>.{" "}
                <RefLink href="https://www.npr.org/2023/10/24/1208219216/states-sue-meta-claiming-instagram-facebook-fueled-youth-mental-health-crisis">
                  npr.org
                </RefLink>
                .
              </Reference>
              <Reference id="ref-cnbc-wsj-2021">
                Vanian, J. (2021, September 14). Facebook documents show how toxic Instagram is
                for teens, Wall Street Journal reports. <em>CNBC</em>.{" "}
                <RefLink href="https://www.cnbc.com/2021/09/14/facebook-documents-show-how-toxic-instagram-is-for-teens-wsj.html">
                  cnbc.com
                </RefLink>
                .
              </Reference>
              <Reference id="ref-nyt-teen-girls-2021">
                Wells, G. (2021, October 5). Teenage girls say Instagram&rsquo;s mental-health
                impacts are no surprise. <em>The New York Times</em>.{" "}
                <RefLink href="https://www.nytimes.com/2021/10/05/technology/teenage-girls-instagram.html">
                  nytimes.com
                </RefLink>
                .
              </Reference>
              <Reference id="ref-npr-haugen-2021">
                Allyn, B. (2021, October 5). Whistleblower&rsquo;s testimony has resurfaced
                Facebook&rsquo;s Instagram problem. <em>NPR</em>.{" "}
                <RefLink href="https://www.npr.org/2021/10/05/1043194385/whistleblowers-testimony-facebook-instagram">
                  npr.org
                </RefLink>
                .
              </Reference>
            </RefGroup>

            <RefGroup title="§ 03 — rubric, behavioral research">
              <Reference id="ref-crockett-2017">
                Crockett, M. J. (2017). Moral outrage in the digital age.{" "}
                <em>Nature Human Behaviour</em>, 1(11), 769&ndash;771.{" "}
                <RefLink href="https://doi.org/10.1038/s41562-017-0213-3">
                  doi:10.1038/s41562-017-0213-3
                </RefLink>
                .
              </Reference>
              <Reference id="ref-brady-2017">
                Brady, W. J., Wills, J. A., Jost, J. T., Tucker, J. A., &amp; Van Bavel, J. J.
                (2017). Emotion shapes the diffusion of moralized content in social networks.{" "}
                <em>PNAS</em>, 114(28), 7313&ndash;7318.{" "}
                <RefLink href="https://doi.org/10.1073/pnas.1618923114">
                  doi:10.1073/pnas.1618923114
                </RefLink>
                .
              </Reference>
              <Reference id="ref-brady-2021">
                Brady, W. J., McLoughlin, K., Doan, T. N., &amp; Crockett, M. J. (2021). How social
                learning amplifies moral outrage expression in online social networks.{" "}
                <em>Science Advances</em>, 7(33), eabe5641.{" "}
                <RefLink href="https://doi.org/10.1126/sciadv.abe5641">
                  doi:10.1126/sciadv.abe5641
                </RefLink>
                .
              </Reference>
              <Reference id="ref-przybylski-2013">
                Przybylski, A. K., Murayama, K., DeHaan, C. R., &amp; Gladwell, V. (2013).
                Motivational, emotional, and behavioral correlates of fear of missing out.{" "}
                <em>Computers in Human Behavior</em>, 29(4), 1841&ndash;1848.{" "}
                <RefLink href="https://doi.org/10.1016/j.chb.2013.02.014">
                  doi:10.1016/j.chb.2013.02.014
                </RefLink>
                .
              </Reference>
              <Reference id="ref-cialdini-2009">
                Cialdini, R. B. (2009). <em>Influence: Science and Practice</em> (5th ed.).
                Pearson.
              </Reference>
              <Reference id="ref-meta-2017">
                Meta Newsroom (2017, December 18). Fighting engagement bait on Facebook.{" "}
                <RefLink href="https://about.fb.com/news/2017/12/news-feed-fyi-fighting-engagement-bait-on-facebook/">
                  about.fb.com
                </RefLink>
                .
              </Reference>
              <Reference id="ref-munger-2020">
                Munger, K. (2020). All the news that&rsquo;s fit to click: The economics of
                clickbait media. <em>Political Communication</em>, 37(3), 376&ndash;397.{" "}
                <RefLink href="https://doi.org/10.1080/10584609.2019.1687626">
                  doi:10.1080/10584609.2019.1687626
                </RefLink>
                .
              </Reference>
              <Reference id="ref-mathur-2019">
                Mathur, A., Acar, G., Friedman, M. J., Lucherini, E., Mayer, J., Chetty, M., &amp;
                Narayanan, A. (2019). Dark patterns at scale: Findings from a crawl of 11K
                shopping websites. <em>Proceedings of the ACM on Human-Computer Interaction</em>,
                3(CSCW).{" "}
                <RefLink href="https://doi.org/10.1145/3359183">doi:10.1145/3359183</RefLink>.
              </Reference>
              <Reference id="ref-small-2007">
                Small, D. A., Loewenstein, G., &amp; Slovic, P. (2007). Sympathy and callousness:
                The impact of deliberative thought on donations to identifiable and statistical
                victims.{" "}
                <em>Organizational Behavior and Human Decision Processes</em>, 102(2),
                143&ndash;153.{" "}
                <RefLink href="https://doi.org/10.1016/j.obhdp.2006.01.005">
                  doi:10.1016/j.obhdp.2006.01.005
                </RefLink>
                .
              </Reference>
              <Reference id="ref-kramer-2014">
                Kramer, A. D. I., Guillory, J. E., &amp; Hancock, J. T. (2014). Experimental
                evidence of massive-scale emotional contagion through social networks.{" "}
                <em>PNAS</em>, 111(24), 8788&ndash;8790.{" "}
                <RefLink href="https://doi.org/10.1073/pnas.1320040111">
                  doi:10.1073/pnas.1320040111
                </RefLink>
                .
              </Reference>
              <Reference id="ref-loewenstein-1994">
                Loewenstein, G. (1994). The psychology of curiosity: A review and reinterpretation.{" "}
                <em>Psychological Bulletin</em>, 116(1), 75&ndash;98.{" "}
                <RefLink href="https://doi.org/10.1037/0033-2909.116.1.75">
                  doi:10.1037/0033-2909.116.1.75
                </RefLink>
                .
              </Reference>
              <Reference id="ref-blom-hansen-2015">
                Blom, J. N., &amp; Hansen, K. R. (2015). Click bait: Forward-reference as lure in
                online news headlines. <em>Journal of Pragmatics</em>, 76, 87&ndash;100.{" "}
                <RefLink href="https://doi.org/10.1016/j.pragma.2014.11.010">
                  doi:10.1016/j.pragma.2014.11.010
                </RefLink>
                .
              </Reference>
              <Reference id="ref-skinner-1953">
                Skinner, B. F. (1953). <em>Science and Human Behavior</em>. Macmillan.
              </Reference>
              <Reference id="ref-alter-2017">
                Alter, A. (2017). <em>Irresistible: The Rise of Addictive Technology and the
                Business of Keeping Us Hooked</em>. Penguin Press.
              </Reference>
              <Reference id="ref-montag-2019">
                Montag, C., Lachmann, B., Herrlich, M., &amp; Zweig, K. (2019). Addictive features
                of social media/messenger platforms and freemium games against the background of
                psychological and economic theories.{" "}
                <em>International Journal of Environmental Research and Public Health</em>,
                16(14), 2612.{" "}
                <RefLink href="https://doi.org/10.3390/ijerph16142612">
                  doi:10.3390/ijerph16142612
                </RefLink>
                .
              </Reference>
            </RefGroup>

            <RefGroup title="§ 04&ndash;05 — machine learning">
              <Reference id="ref-bai-2022">
                Bai, Y., Kadavath, S., Kundu, S., et al. (2022). Constitutional AI: Harmlessness
                from AI Feedback. <em>arXiv:2212.08073</em>.{" "}
                <RefLink href="https://arxiv.org/abs/2212.08073">arxiv.org/abs/2212.08073</RefLink>
                .
              </Reference>
              <Reference id="ref-zheng-2023">
                Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). Judging LLM-as-a-Judge with
                MT-Bench and Chatbot Arena.{" "}
                <em>NeurIPS Datasets and Benchmarks Track</em>.{" "}
                <RefLink href="https://arxiv.org/abs/2306.05685">arxiv.org/abs/2306.05685</RefLink>
                .
              </Reference>
              <Reference id="ref-sanh-2019">
                Sanh, V., Debut, L., Chaumond, J., &amp; Wolf, T. (2019). DistilBERT, a distilled
                version of BERT: smaller, faster, cheaper and lighter.{" "}
                <em>NeurIPS EMC&sup2; Workshop</em>.{" "}
                <RefLink href="https://arxiv.org/abs/1910.01108">arxiv.org/abs/1910.01108</RefLink>
                .
              </Reference>
            </RefGroup>
          </div>
        </AboutSection>

        <nav
          aria-label="End of page"
          className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href="/"
            className="rounded-sm font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 min-h-[44px] inline-flex items-center"
          >
            ← back to lucid
          </Link>
          <Link
            href="/#analyzer"
            className="rounded-sm font-mono text-[11px] uppercase tracking-[0.32em] text-white transition-colors hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 min-h-[44px] inline-flex items-center"
          >
            try the analyzer →
          </Link>
        </nav>

        <footer className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-10 text-[13px] leading-[1.6] text-zinc-500">
          <p>
            LUCID is a research and education tool. Scores are statistical estimates based on a
            rubric grounded in peer-reviewed behavioral research, not a measurement of intent.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.24em]">
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
        </footer>
      </article>
      <BackToTop />
    </main>
  );
}

function RefGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-400">{title}</h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function Reference({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <li
      id={id}
      className="scroll-mt-20 text-[14px] leading-[1.6] text-zinc-300 target:text-white target:bg-white/[0.04] target:-mx-2 target:px-2 target:py-1 target:rounded-md"
    >
      {children}
    </li>
  );
}

function RefLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words font-mono text-[12px] text-zinc-400 underline decoration-white/20 decoration-dotted underline-offset-4 transition-colors hover:decoration-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      {children}
    </a>
  );
}
