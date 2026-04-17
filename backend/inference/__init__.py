"""Three model implementations: naive baseline, classical ML, deep learning.

Each exports a single class with a `predict(text: str) -> Prediction` method.
The `router` module selects one based on config; DistilBERT is the default
for production. Naive and classical are kept for report comparison.
"""
