"""Shared evaluation utilities across all 3 models.

- `evaluate_predictor(predictor, df)` runs the predictor on every row and
  computes per-dimension accuracy/F1/precision/recall + composite MAE/RMSE/R².
- `save_metrics(metrics, path)` writes JSON.
- `plot_confusion(...)` writes a matplotlib figure per dimension.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Protocol

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)

from backend.inference.schemas import DIMENSIONS, Prediction

logger = logging.getLogger(__name__)


class Predictor(Protocol):
    def predict(self, text: str) -> Prediction: ...


def evaluate_predictor(predictor: Predictor, df: pd.DataFrame) -> dict[str, Any]:
    """Run `predictor.predict` over every row, compute metrics, return a dict."""
    y_true_composite: list[int] = []
    y_pred_composite: list[int] = []
    y_true_dims: dict[str, list[int]] = {d: [] for d in DIMENSIONS}
    y_pred_dims: dict[str, list[int]] = {d: [] for d in DIMENSIONS}

    for _, row in df.iterrows():
        text = row["text"]
        pred = predictor.predict(text)
        y_true_composite.append(int(row["composite_score"]))
        y_pred_composite.append(int(pred.scroll_trap_score))
        for dim in DIMENSIONS:
            # Ground truth dimension label is 0/1/2; convert to binary at threshold 1
            gold_ord = int(row[dim])
            y_true_dims[dim].append(1 if gold_ord >= 1 else 0)
            y_pred_dims[dim].append(1 if pred.dimension_present[dim] else 0)

    dim_metrics = {}
    for dim in DIMENSIONS:
        yt = y_true_dims[dim]
        yp = y_pred_dims[dim]
        cm = confusion_matrix(yt, yp, labels=[0, 1]).tolist()
        dim_metrics[dim] = {
            "accuracy": float(accuracy_score(yt, yp)),
            "f1": float(f1_score(yt, yp, zero_division=0)),
            "precision": float(precision_score(yt, yp, zero_division=0)),
            "recall": float(recall_score(yt, yp, zero_division=0)),
            "confusion_matrix": cm,
            "support": int(len(yt)),
            "positive_rate": float(np.mean(yt)) if yt else 0.0,
        }

    yt_c = np.asarray(y_true_composite, dtype=float)
    yp_c = np.asarray(y_pred_composite, dtype=float)
    composite_metrics = {
        "mae": float(mean_absolute_error(yt_c, yp_c)),
        "rmse": float(np.sqrt(mean_squared_error(yt_c, yp_c))),
        "r2": float(r2_score(yt_c, yp_c)) if np.var(yt_c) > 0 else 0.0,
    }

    macro_f1 = float(np.mean([m["f1"] for m in dim_metrics.values()]))
    macro_acc = float(np.mean([m["accuracy"] for m in dim_metrics.values()]))

    return {
        "n_test": int(len(df)),
        "composite": composite_metrics,
        "per_dimension": dim_metrics,
        "macro_f1": macro_f1,
        "macro_accuracy": macro_acc,
    }


def save_metrics(metrics: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    logger.info("wrote metrics → %s  (macro_f1=%.3f)", output_path, metrics["macro_f1"])


def plot_confusion_matrices(metrics: dict[str, Any], output_dir: Path, title_prefix: str = "") -> None:
    """One confusion-matrix heatmap per dimension, saved as PNG."""
    import matplotlib.pyplot as plt
    import seaborn as sns

    output_dir.mkdir(parents=True, exist_ok=True)
    for dim, m in metrics["per_dimension"].items():
        cm = np.array(m["confusion_matrix"])
        fig, ax = plt.subplots(figsize=(4, 3.5))
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="mako",
            cbar=False,
            xticklabels=["pred 0", "pred 1"],
            yticklabels=["true 0", "true 1"],
            ax=ax,
        )
        ax.set_title(f"{title_prefix}{dim}  (F1={m['f1']:.2f})")
        fig.tight_layout()
        fig.savefig(output_dir / f"{dim}_confusion.png", dpi=130)
        plt.close(fig)
