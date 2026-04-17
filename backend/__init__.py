"""LUCID backend — FastAPI server + inference pipeline.

Decodes short-form video manipulation by extracting text from TikToks
(audio transcript + on-screen overlay + caption), running it through the
trained DistilBERT classifier, and generating a "See Through It" rewrite
via the Claude API.
"""

__version__ = "0.1.0"
