"""'See Through It' rewrite via the Claude API.

Rewrites a manipulative social-media post into a neutral, informational
version that preserves factual claims while stripping manipulation tactics.

This is orthogonal to the trained scoring model — it's a product feature,
not part of the classifier. Transparency note in the technical report:
the rewrite uses Claude (Anthropic API), not our fine-tuned model.
"""

from __future__ import annotations

import anthropic

from backend.config import get_settings


REWRITE_SYSTEM_PROMPT = """You are a writing tool that strips psychological manipulation from social media text while preserving factual content.

RULES
- Preserve: all factual claims, the core topic, the person/thing being described
- Strip: ALL CAPS (use normal sentence case), excessive punctuation (!!!, ???), emoji
- Strip: curiosity gaps ("you won't believe", "wait for it", "the reason will shock you")
- Strip: outrage framing (moralized words like "disgusting", "evil", villain framing)
- Strip: FOMO triggers (manufactured scarcity, "everyone is doing this")
- Strip: engagement bait ("tag a friend", "comment X", "share if you agree")
- Strip: emotional manipulation (guilt trips, "if you scroll past you don't care")
- Tone: calm, descriptive, journalistic — like a neutral news brief
- Length: roughly similar to the original, no need to pad or summarize
- If the original has no factual content and is purely manipulation, return a one-line neutral description of the topic

Output the rewritten text ONLY. No preamble, no explanation, no quotes around it."""


def rewrite(text: str) -> str:
    """Rewrite manipulative text into a neutral version.

    Args:
        text: The fused caption + transcript + overlay text from a TikTok.

    Returns:
        A neutral rewrite. Empty string if the input is empty.
    """
    text = text.strip()
    if not text:
        return ""

    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model=settings.claude_rewrite_model,
        max_tokens=800,
        system=REWRITE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": text}],
    )

    text_blocks = [b.text for b in message.content if b.type == "text"]
    return "\n".join(text_blocks).strip()
