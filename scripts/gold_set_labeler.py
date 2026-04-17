"""Gradio app for Lindsay's 100-post gold-set hand labeling.

Samples N posts from the merged corpus, presents one at a time with
6 sliders (0/1/2 per dimension), saves output to data/processed/gold_labels.csv.

Supports resume: re-running loads previously saved labels and picks up
where you left off. Same 100 posts each time (seeded sampling).

Run:
    python -m scripts.gold_set_labeler
Opens http://localhost:7860
"""

from __future__ import annotations

import argparse
import csv
import logging
from pathlib import Path

import gradio as gr
import pandas as pd

from backend.inference.schemas import DIMENSIONS

REPO_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = REPO_ROOT / "data" / "processed"

logger = logging.getLogger(__name__)


DIM_DESCRIPTIONS = {
    "outrage_bait": "Outrage Bait — inflammatory framing, moralized villain language, rhetorical outrage.",
    "fomo_trigger": "FOMO Trigger — scarcity, bandwagon, exclusivity, lifestyle comparison.",
    "engagement_bait": "Engagement Bait — 'tag a friend', 'comment X', 'follow for part 2'.",
    "emotional_manipulation": "Emotional Manipulation — guilt-trip, shame, identifiable-victim pressure.",
    "curiosity_gap": "Curiosity Gap — 'wait for it', forward-reference without antecedent, cliffhanger.",
    "dopamine_design": "Dopamine Design — ALL CAPS, !!!, emoji spam, rapid cuts, surface salience.",
}


def sample_gold_set(corpus_path: Path, n: int, seed: int) -> pd.DataFrame:
    """Deterministically sample N items from the corpus."""
    df = pd.read_csv(corpus_path)
    if len(df) < n:
        raise SystemExit(f"corpus has only {len(df)} rows, need {n}")
    return df.sample(n=n, random_state=seed).reset_index(drop=True)


def load_existing(output_path: Path) -> dict[str, dict[str, int]]:
    """Load any previously saved gold labels for resume."""
    if not output_path.exists():
        return {}
    labels: dict[str, dict[str, int]] = {}
    with output_path.open("r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("id"):
                labels[row["id"]] = {d: int(row[d]) for d in DIMENSIONS if d in row}
    return labels


def save_all(
    output_paths: list[Path],
    items: pd.DataFrame,
    labels: dict[str, dict[str, int]],
) -> None:
    """Write all completed labels to every path in output_paths."""
    for output_path in output_paths:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "text", *DIMENSIONS])
            writer.writeheader()
            for _, row in items.iterrows():
                if row["id"] not in labels:
                    continue
                lab = labels[row["id"]]
                writer.writerow({
                    "id": row["id"],
                    "text": row["text"],
                    **{d: lab.get(d, 0) for d in DIMENSIONS},
                })


def build_app(items: pd.DataFrame, labels: dict[str, dict[str, int]], output_paths: list[Path]) -> gr.Blocks:
    """Build the Gradio interface."""
    state = {"idx": 0}
    # Jump to first unlabeled
    for i, row in items.iterrows():
        if row["id"] not in labels:
            state["idx"] = int(i)
            break

    def render(idx: int) -> tuple:
        idx = max(0, min(idx, len(items) - 1))
        row = items.iloc[idx]
        existing = labels.get(row["id"], {})
        progress = f"{sum(1 for r in items['id'] if r in labels)} / {len(items)} labeled"
        return (
            f"**Item {idx + 1} of {len(items)}** ({progress})",
            row["text"],
            *[existing.get(d, 0) for d in DIMENSIONS],
        )

    def on_save_next(
        idx: int,
        *scores: int,
    ) -> tuple:
        row = items.iloc[idx]
        labels[row["id"]] = {d: int(s) for d, s in zip(DIMENSIONS, scores)}
        save_all(output_paths, items, labels)
        state["idx"] = min(idx + 1, len(items) - 1)
        return render(state["idx"])

    def on_prev(idx: int) -> tuple:
        state["idx"] = max(0, idx - 1)
        return render(state["idx"])

    def on_next(idx: int) -> tuple:
        state["idx"] = min(idx + 1, len(items) - 1)
        return render(state["idx"])

    with gr.Blocks(title="LUCID Gold-Set Labeler", theme=gr.themes.Monochrome()) as app:
        gr.Markdown("# LUCID Gold-Set Labeler\nRate each post 0/1/2 per dimension. Click **Save & Next** to persist.")
        header = gr.Markdown()
        text_box = gr.Textbox(label="Post text", lines=8, interactive=False)
        sliders = [
            gr.Radio(
                choices=[("0 — absent", 0), ("1 — moderate", 1), ("2 — severe", 2)],
                value=0,
                label=DIM_DESCRIPTIONS[d],
                type="value",
            )
            for d in DIMENSIONS
        ]
        idx_state = gr.State(value=state["idx"])
        with gr.Row():
            prev_btn = gr.Button("◀ Previous")
            save_btn = gr.Button("Save & Next ▶", variant="primary")
            next_btn = gr.Button("Skip ▶")

        outputs = [header, text_box, *sliders]

        def _refresh(idx: int) -> tuple:
            return render(idx)

        app.load(fn=_refresh, inputs=idx_state, outputs=outputs)
        prev_btn.click(
            fn=lambda idx: (_refresh(state["idx"] if idx != state["idx"] else idx), state["idx"]),
            inputs=idx_state,
            outputs=[*outputs, idx_state],
        ).then(fn=_refresh, inputs=idx_state, outputs=outputs)
        save_btn.click(
            fn=on_save_next,
            inputs=[idx_state, *sliders],
            outputs=outputs,
        ).then(fn=lambda: state["idx"], inputs=None, outputs=idx_state)
        next_btn.click(
            fn=on_next,
            inputs=idx_state,
            outputs=outputs,
        ).then(fn=lambda: state["idx"], inputs=None, outputs=idx_state)

    return app


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=PROCESSED_DIR / "corpus.csv")
    parser.add_argument("--output", type=Path, default=PROCESSED_DIR / "gold_labels.csv")
    parser.add_argument(
        "--backup",
        type=Path,
        action="append",
        default=None,
        help="Optional extra path(s) to mirror the labels CSV to on every save. "
        "Pass multiple times for multiple backups "
        "(e.g. --backup ~/Desktop/lucid_labels_backup.csv).",
    )
    parser.add_argument("--n", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--port", type=int, default=7860)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if not args.corpus.exists():
        raise SystemExit(
            f"Corpus not found at {args.corpus}. Run `make data` and "
            "`python -m scripts.build_corpus` first."
        )

    items = sample_gold_set(args.corpus, n=args.n, seed=args.seed)
    labels = load_existing(args.output)
    logger.info("gold set: %d items, %d already labeled", len(items), len(labels))

    output_paths: list[Path] = [args.output.expanduser()]
    if args.backup:
        for b in args.backup:
            output_paths.append(b.expanduser())
    logger.info("saving labels to: %s", ", ".join(str(p) for p in output_paths))

    app = build_app(items, labels, output_paths)
    app.launch(server_port=args.port)


if __name__ == "__main__":
    main()
