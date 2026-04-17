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
      </article>
    </main>
  );
}
