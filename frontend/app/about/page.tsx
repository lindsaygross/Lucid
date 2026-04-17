import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { AboutSection, Cite } from "@/components/about/about-section";

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
      "Guilt, pity, or shame used as a substitute for evidence — emotional pressure that stands in for an argument.",
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
      "Surface-level salience hooks — ALL CAPS, rapid cuts, emoji spam, variable-reward pacing — that capture attention before the content is evaluated.",
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

        <AboutSection id="hook" eyebrow="§ 01 — the hook" heading="Something is being done to your attention, and you don&rsquo;t have a vocabulary for it.">
          <p>
            Open TikTok at 11 p.m. Close it at 1 a.m. and try to remember what you watched. Most
            people can&rsquo;t. The individual posts blur. What stays is a physical residue — a
            slight jangle, a flatness, the distinct feeling of having been acted on rather than the
            feeling of having chosen.
          </p>
          <p>
            Short-form video platforms rank posts by engagement, and creators have adapted their
            craft to the specific psychological levers those rankings reward. The levers are real,
            and they&rsquo;ve been studied for decades — curiosity gaps, variable-ratio
            reinforcement, outrage-based sharing, scarcity framing. But they&rsquo;re usually
            invisible at the post level. A single TikTok isn&rsquo;t labeled as manipulative, and
            most viewers don&rsquo;t have the vocabulary to describe <em>which</em> lever is being
            pulled on them at which moment.
          </p>
          <p>
            LUCID is a small attempt at that vocabulary. Paste a TikTok URL, and it returns a
            0&ndash;100 Scroll Trap Score with a per-dimension breakdown — how much of what
            you&rsquo;re about to watch is outrage bait, how much is a curiosity gap, how much is
            surface-level dopamine design. It will not tell you a creator&rsquo;s intent. It will
            not tell you whether a post is true. It will tell you, as a statistical estimate over a
            rubric rooted in peer-reviewed research, what rhetorical moves the post is making.
            That&rsquo;s the honest scope.
          </p>
        </AboutSection>

        <AboutSection
          id="meta-case"
          eyebrow="§ 02 — the landmark case"
          heading="This isn&rsquo;t only an academic question. It is currently the single largest consumer-protection case in the American federal courts."
        >
          <p>
            As of 2026, Meta, TikTok / ByteDance, Snap, YouTube, and Alphabet are defendants in a
            consolidated multidistrict litigation in the Northern District of California:{" "}
            <em>In re: Social Media Adolescent Addiction / Personal Injury Products Liability
              Litigation</em>, <Cite href="#ref-mdl-3047">MDL No. 3047</Cite>, before Judge Yvonne
            Gonzalez Rogers (case 4:22-md-03047-YGR). The MDL consolidates thousands of individual
            personal-injury cases, school-district suits, and state attorney-general actions. The
            plaintiffs&rsquo; core theory is straightforward: the products were designed to
            maximize engagement in a way the defendants knew produced addictive use patterns in
            minors, and were marketed as safe anyway.
          </p>
          <p>
            On October 24, 2023, a multi-state coalition — forty-two attorneys general in total —
            filed parallel actions against Meta alleging that Instagram and Facebook were
            deliberately engineered to addict young users while the company publicly denied doing
            so. Thirty-three AGs joined a joint federal complaint in the Northern District of
            California; the remaining states filed in their own state courts. The filings allege
            violations of the federal Children&rsquo;s Online Privacy Protection Act and state
            consumer-protection statutes, and they name specific product mechanics — infinite
            scroll, push notifications, recommendation-driven feeds — as the designed features
            causing harm (<Cite href="#ref-njag-2023">NJ AG press release, 2023</Cite>;{" "}
            <Cite href="#ref-nyag-2023">NY AG press release, 2023</Cite>;{" "}
            <Cite href="#ref-npr-ags-2023">Allyn, NPR, 2023</Cite>).
          </p>
          <p>
            The record the AGs are drawing on was not discovered in court. In September 2021, the{" "}
            <em>Wall Street Journal</em> published the &ldquo;Facebook Files&rdquo; based on
            internal Meta research leaked by a former employee, Frances Haugen. One slide from a
            2019 internal presentation read, verbatim: &ldquo;We make body image issues worse for
            one in three teen girls.&rdquo; Another stated that among teens who reported suicidal
            thoughts, substantial minorities traced the feeling back to Instagram. Haugen
            identified herself publicly on <em>60 Minutes</em> on October 3, 2021, and testified
            before the U.S. Senate Commerce Subcommittee days later. Meta contested the framing
            but did not, by and large, contest that the research existed (<Cite href="#ref-cnbc-wsj-2021">Vanian, CNBC, 2021</Cite>;{" "}
            <Cite href="#ref-nyt-teen-girls-2021">Wells, NYT, 2021</Cite>;{" "}
            <Cite href="#ref-npr-haugen-2021">Allyn, NPR, 2021</Cite>).
          </p>
          <p>
            I&rsquo;m flagging this up front because the concept underneath LUCID — that the
            manipulation of attention at the post level is measurable, and that platforms have
            internal knowledge of the machinery — is not a researcher&rsquo;s hypothesis anymore.
            It&rsquo;s the operative theory of a live case with more than forty state governments
            on one side.
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
                <div className="flex items-center justify-between gap-3">
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
            dimension is scored 0 / 1 / 2 — absent, moderate, severe — and the composite Scroll
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
            a grifter using the same techniques for an info-product will both score high on
            Emotional Manipulation, because the rhetorical move is the same on the page. The
            judgment about intent is the reader&rsquo;s. This distinction matters enough to state
            plainly, and it&rsquo;s repeated in the footer of the main app.
          </p>
          <p>
            Finally, a note on why the rubric is fixed rather than learned. A clustering approach
            would surface whatever structure the data happens to have; a fixed rubric commits up
            front to a set of categories that are defensible to a non-ML reader. For a tool
            intended to help people articulate what a post is doing to them, the second property
            matters more. The taxonomy is one defensible cut of the space, not the only one —
            §<a href="#ethics" className="underline decoration-white/20 decoration-dotted underline-offset-4 hover:decoration-white/60">06</a>{" "}
            says so.
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
            six-dimension ordinal rubric that I made up — the data doesn&rsquo;t exist.
          </p>
          <p>
            The pragmatic solution is what the literature has started calling{" "}
            <em>LLM-as-a-judge</em>. Claude Sonnet 4.5 is given the full rubric — the one in{" "}
            <Link href="/#" className="underline decoration-white/20 decoration-dotted underline-offset-4 hover:decoration-white/60">
              §03 above
            </Link>{" "}
            — along with eight few-shot examples spanning 0 / 1 / 2 severity per dimension, and it
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
            about the world — you&rsquo;re measuring the consistency of your own rubric applied by
            a proxy.
          </p>
          <p>
            The way out is to treat the Claude labels as a noisy oracle, not ground truth, and to
            calibrate them against something external. Which is why I spent a long weekend
            hand-labeling 100 items sampled from the corpus with a fixed seed of 42, through a
            small Gradio interface I built for the purpose. Same rubric, same severity levels, no
            Claude output visible during labeling. The point of the exercise is not that one
            person&rsquo;s labels are the truth. The point is that if you&rsquo;re going to build a
            labeling pipeline at scale, you need to do the labeling yourself at least once, on a
            representative sample, and see whether the pipeline agrees with you in places that are
            easy and disagrees with you in places that are hard. Otherwise you don&rsquo;t actually
            know what you shipped.
          </p>
          <p>
            The metrics that come out of that comparison are per-dimension{" "}
            <strong className="text-white">Spearman rank correlation</strong> (how well the two
            labelers order severity) and{" "}
            <strong className="text-white">Krippendorff&rsquo;s &alpha;</strong> (an ordinal
            agreement coefficient). Strong agreement on Dopamine Design or Engagement Bait would
            not be surprising — those dimensions have unambiguous surface cues. Weaker agreement
            on Emotional Manipulation would also not be surprising, because the call between a
            genuine emotional appeal and a coercive one is genuinely hard. The report will publish
            whatever comes out, strong or weak.
          </p>
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-[15px] leading-[1.6] text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              placeholder · agreement table
            </span>
            <br />
            Per-dimension Spearman &rho; and Krippendorff&rsquo;s &alpha; will land here once the
            gold-set pass is complete. I am deliberately not filling in numbers before the
            labeling finishes.
          </p>
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-[15px] leading-[1.6] text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              [Lindsay to fill in: which dimensions felt hardest to label and why]
            </span>
            <br />
            A short paragraph from me, after labeling, about which axes were easiest to call
            confidently and which kept me second-guessing. Leaving this here so I remember to
            write it in my own words rather than retrofitting something tidy after the fact.
          </p>
          <p>
            The broader point: the fact that LUCID&rsquo;s labels come from a language model is
            not something to hide. It&rsquo;s a scalable-oversight move with a known failure mode,
            and the human-validation pass is the thing that makes the move defensible rather than
            sloppy. If the agreement numbers come back weak on some dimension, that&rsquo;s useful
            information — it tells me which part of the rubric needs to be tightened or dropped.
          </p>
        </AboutSection>
      </article>
    </main>
  );
}
