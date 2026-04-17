"""LLM-as-judge labeling with Claude Sonnet.

Takes the merged corpus (Webis + Stop Clickbait + Reddit + TikTok) and
labels each item on all 6 LUCID dimensions using a rubric-backed
system prompt with 8 few-shot examples.

Each label is an integer in {0, 1, 2} (absent/moderate/severe) plus a
short justification. We also derive a 0–100 composite score.

Designed to be idempotent: skips items already present in the output CSV.

Run:
    python -m scripts.label_with_claude --input data/processed/corpus.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import time
from pathlib import Path
from typing import Any

import anthropic
from dotenv import load_dotenv

from backend.config import get_settings
from backend.inference.schemas import DIMENSIONS

REPO_ROOT = Path(__file__).resolve().parent.parent

logger = logging.getLogger(__name__)


LABELING_SYSTEM = """You are a Trust & Safety expert labeling social-media text for psychological manipulation tactics.

For each text, score 6 dimensions on a 0/1/2 ordinal scale:
- 0 = absent
- 1 = moderate
- 2 = severe

DIMENSIONS AND DEFINITIONS

1. outrage_bait — Inflammatory framing designed to elicit anger, moral indignation, contempt, or tribal ("us vs. them") reaction rather than inform on the merits. Signals: moralized language ("disgusting", "evil", "betrayal"), villain framing of an out-group, rhetorical questions assuming the audience's outrage.

2. fomo_trigger — Manufactures urgency, exclusivity, or social comparison to induce anxiety about being left out. Signals: scarcity ("only X left", "last chance"), bandwagon claims ("everyone is switching"), exclusivity ("most people don't know"), comparative lifestyle displays.

3. engagement_bait — Explicit solicitation of a low-cost user action whose primary function is to inflate algorithmic signals. Signals: "tag a friend who…", "comment X if you agree", "follow for part 2", "share if you love your mom".

4. emotional_manipulation — Leverages guilt, pity, empathy, shame, or moral obligation to coerce a response rather than providing evidence. Signals: "if you scroll past you don't care", identifiable-victim appeals without context, implicit moral tests of the viewer's character.

5. curiosity_gap — Deliberately withholds a key referent, outcome, or explanation to compel click/watch-through. Signals: forward-referring pronouns without antecedents ("THIS is why…"), suspense markers ("wait for it"), vague superlatives ("the one thing nobody tells you").

6. dopamine_design — Surface-level attention hooks at the formatting/typography/audiovisual layer, independent of semantic content. Signals: sustained ALL CAPS, excessive punctuation (!!!, ???), emoji spamming, rapid jump cuts, numbered hook-reveal structures.

SCORING GUIDANCE
- Score based on the dominant rhetorical goal, not whether the claim is true
- A single subtle signal → 1; multiple clear signals → 2
- Be conservative: when in doubt between two scores, pick the lower one
- Score independently per dimension (a post can be 2 on multiple dimensions)

OUTPUT FORMAT
Return a JSON object with exactly these keys:
{
  "outrage_bait": 0|1|2,
  "fomo_trigger": 0|1|2,
  "engagement_bait": 0|1|2,
  "emotional_manipulation": 0|1|2,
  "curiosity_gap": 0|1|2,
  "dopamine_design": 0|1|2,
  "justification": "1-2 sentences citing the specific signals observed"
}

Return ONLY the JSON, no markdown, no preamble."""


FEWSHOT_EXAMPLES: list[tuple[str, dict[str, Any]]] = [
    (
        "New city council ordinance passed today on short-term rentals. Here's a summary of what changed: owners now need a permit, there's a 90-night annual cap, and enforcement starts June 1.",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 0,
            "emotional_manipulation": 0, "curiosity_gap": 0, "dopamine_design": 0,
            "justification": "Neutral informational summary with complete details and no hooks.",
        },
    ),
    (
        "DISGUSTING. These people are laughing in your face while they rob you blind. If you're not ANGRY right now you're part of the problem.",
        {
            "outrage_bait": 2, "fomo_trigger": 0, "engagement_bait": 0,
            "emotional_manipulation": 1, "curiosity_gap": 0, "dopamine_design": 2,
            "justification": "Severe outrage framing with villain language and moral indictment; ALL CAPS and punctuation drive dopamine design; implicit moral test adds emotional manipulation.",
        },
    ),
    (
        "ONLY 3 SPOTS LEFT. Every successful 22-year-old is already inside this program. If you're still watching this video you're going to be stuck for the next 10 years.",
        {
            "outrage_bait": 0, "fomo_trigger": 2, "engagement_bait": 0,
            "emotional_manipulation": 1, "curiosity_gap": 0, "dopamine_design": 1,
            "justification": "Severe FOMO via artificial scarcity + bandwagon + lifestyle comparison; mild guilt-trip; moderate dopamine design via caps.",
        },
    ),
    (
        "COMMENT 'YES' IF YOU LOVE YOUR MOM. Share to 3 stories or you don't REALLY care. Follow for part 2, 3, 4, and 5.",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 2,
            "emotional_manipulation": 2, "curiosity_gap": 0, "dopamine_design": 1,
            "justification": "Stacked engagement solicitations; severe guilt-trip framing; moderate caps-driven dopamine design.",
        },
    ),
    (
        "You won't BELIEVE what she pulled out of the drawer… WAIT FOR IT… (the ending is insane, watch till the end)",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 0,
            "emotional_manipulation": 0, "curiosity_gap": 2, "dopamine_design": 2,
            "justification": "Severe curiosity gap: forward-reference without antecedent, explicit 'wait for it', superlative hook; heavy caps and punctuation.",
        },
    ),
    (
        "99% of people will scroll past this. If you have ANY heart at all, you'll share this to your story. If you don't, we both know what kind of person you really are.",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 1,
            "emotional_manipulation": 2, "curiosity_gap": 0, "dopamine_design": 1,
            "justification": "Severe emotional manipulation via moral test and shame; mild engagement bait (share prompt); moderate dopamine design.",
        },
    ),
    (
        "Here's how I cut my grocery bill by 30%: I switched to store-brand staples, started meal-prepping on Sundays, and stopped shopping while hungry.",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 0,
            "emotional_manipulation": 0, "curiosity_gap": 0, "dopamine_design": 0,
            "justification": "Clean informational share: complete information delivered upfront with no hooks.",
        },
    ),
    (
        "Okay so you NEED to hear this!! 3 things that changed my life this year (number 2 is wild) 🤯🔥✨",
        {
            "outrage_bait": 0, "fomo_trigger": 0, "engagement_bait": 0,
            "emotional_manipulation": 0, "curiosity_gap": 2, "dopamine_design": 2,
            "justification": "Severe curiosity gap via numbered-list teasing ('#2 is wild'); severe dopamine design via caps + punctuation + emoji cluster.",
        },
    ),
]


def build_messages(text: str) -> list[dict[str, Any]]:
    """Build the messages list with few-shot examples."""
    messages: list[dict[str, Any]] = []
    for example_text, example_labels in FEWSHOT_EXAMPLES:
        messages.append({"role": "user", "content": example_text})
        messages.append({"role": "assistant", "content": json.dumps(example_labels)})
    messages.append({"role": "user", "content": text})
    return messages


def parse_response(raw: str) -> dict[str, Any] | None:
    """Extract the JSON payload from Claude's response."""
    raw = raw.strip()
    # Strip markdown fences if the model ignored instructions
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json\n"):
            raw = raw[5:]
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    for dim in DIMENSIONS:
        if dim not in data or data[dim] not in (0, 1, 2):
            return None
    return data


def composite_from_labels(labels: dict[str, Any]) -> int:
    """0–100 composite = average of 6 dimensions normalized to [0, 1], times 100."""
    total = sum(int(labels[d]) for d in DIMENSIONS)
    max_total = 2 * len(DIMENSIONS)
    return int(round(100 * total / max_total))


def label_one(
    client: anthropic.Anthropic,
    text: str,
    model: str,
    max_retries: int = 3,
) -> dict[str, Any] | None:
    """Label a single text with retries on parse failure or transient errors."""
    for attempt in range(max_retries):
        try:
            resp = client.messages.create(
                model=model,
                max_tokens=300,
                system=LABELING_SYSTEM,
                messages=build_messages(text),
            )
            raw = "\n".join(b.text for b in resp.content if b.type == "text")
            parsed = parse_response(raw)
            if parsed:
                parsed["composite_score"] = composite_from_labels(parsed)
                return parsed
            logger.warning("unparseable response (attempt %d): %s", attempt + 1, raw[:200])
        except anthropic.APIError as exc:
            logger.warning("API error (attempt %d): %s", attempt + 1, exc)
            time.sleep(2**attempt)
    return None


def _load_done(output_path: Path) -> set[str]:
    """Load IDs already labeled, for idempotent re-runs."""
    if not output_path.exists():
        return set()
    done: set[str] = set()
    with output_path.open("r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("id"):
                done.add(row["id"])
    return done


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=REPO_ROOT / "data" / "processed" / "corpus.csv")
    parser.add_argument("--output", type=Path, default=REPO_ROOT / "data" / "processed" / "labeled.csv")
    parser.add_argument("--text-column", default="text")
    parser.add_argument("--id-column", default="id")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_dotenv(REPO_ROOT / ".env")
    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    if not args.input.exists():
        raise SystemExit(
            f"Corpus not found at {args.input}. Run `make data` first to build the merged corpus."
        )

    done = _load_done(args.output)
    logger.info("already labeled: %d", len(done))

    rows: list[dict[str, Any]] = []
    with args.input.open("r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get(args.id_column) in done:
                continue
            rows.append(row)
    if args.limit:
        rows = rows[: args.limit]
    logger.info("to label: %d", len(rows))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        args.id_column,
        args.text_column,
        *DIMENSIONS,
        "composite_score",
        "justification",
    ]
    mode = "a" if args.output.exists() else "w"
    with args.output.open(mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if mode == "w":
            writer.writeheader()
        for i, row in enumerate(rows, 1):
            text = (row.get(args.text_column) or "").strip()
            if not text:
                continue
            labels = label_one(client, text, model=settings.claude_labeling_model)
            if labels is None:
                logger.error("[%d/%d] gave up on id=%s", i, len(rows), row.get(args.id_column))
                continue
            out_row = {
                args.id_column: row.get(args.id_column),
                args.text_column: text,
                **{d: labels[d] for d in DIMENSIONS},
                "composite_score": labels["composite_score"],
                "justification": labels.get("justification", ""),
            }
            writer.writerow(out_row)
            f.flush()
            if i % 25 == 0:
                logger.info("labeled %d / %d", i, len(rows))


if __name__ == "__main__":
    main()
