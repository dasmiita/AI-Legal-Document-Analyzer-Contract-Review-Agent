"""
llm_parser.py — swap between Anthropic, OpenAI, and Gemini with one line
Usage: set LLM_PROVIDER in your .env file to "anthropic", "openai", or "gemini"
"""

import json
import os
from dotenv import load_dotenv

load_dotenv()

# ── Change this one variable to switch providers ──
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # default: anthropic


# ─────────────────────────────────────────────
# The prompt is identical for all three —
# only the API call changes
# ─────────────────────────────────────────────

def build_prompt(compact_sections: list[dict]) -> str:
    return f"""You are a legal document structure parser.

Below is a list of sections detected from an NDA by a regex parser.
Each entry has an index, a raw heading, and a 200-character preview.

Your job:
1. Assign each section a canonical name from this list if it matches:
   Definitions, Confidential Information, Obligations of Receiving Party,
   Carve-outs / Exclusions, Term and Termination, Return or Destruction,
   Non-Solicitation, Non-Compete, Remedies, Governing Law,
   Dispute Resolution, Miscellaneous, Recitals / Preamble

   If no match, use "Other: <your description>"

2. Return ONLY a JSON array. No explanation, no markdown, no code fences.
   Each object must have: index, canonical_name, confidence (high/medium/low)

Sections to classify:
{json.dumps(compact_sections, indent=2)}"""


# ─────────────────────────────────────────────
# ANTHROPIC
# pip install anthropic
# .env: ANTHROPIC_API_KEY=sk-ant-...
# ─────────────────────────────────────────────

def call_anthropic(prompt: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()


# ─────────────────────────────────────────────
# OPENAI
# pip install openai
# .env: OPENAI_API_KEY=sk-...
# ─────────────────────────────────────────────

def call_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o-mini",   # cheaper than gpt-4o, still very accurate
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────
# GEMINI
# pip install google-generativeai
# .env: GEMINI_API_KEY=...  (get free at aistudio.google.com)
# ─────────────────────────────────────────────

def call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")  # free tier model
    response = model.generate_content(prompt)
    return response.text.strip()


# ─────────────────────────────────────────────
# MAIN FUNCTION — called by ingestion.py
# ─────────────────────────────────────────────

PROVIDERS = {
    "anthropic": call_anthropic,
    "openai": call_openai,
    "gemini": call_gemini,
}

def llm_parse_structure(raw_sections: list[dict]) -> list[dict]:
    """
    Send regex-detected sections to whichever LLM is configured.
    Returns sections enriched with canonical_name and confidence.
    """
    # Build compact input (headings + previews only, not full body)
    compact = [
        {
            "index": i,
            "heading": s["heading"],
            "preview": s["body"][:200]
        }
        for i, s in enumerate(raw_sections)
    ]

    prompt = build_prompt(compact)

    # Pick the provider
    if LLM_PROVIDER not in PROVIDERS:
        raise ValueError(f"Unknown provider '{LLM_PROVIDER}'. Choose: anthropic, openai, gemini")

    print(f"   Using provider: {LLM_PROVIDER}")
    call_fn = PROVIDERS[LLM_PROVIDER]

    try:
        response_text = call_fn(prompt)
        classifications = json.loads(response_text)
    except json.JSONDecodeError:
        print(f"⚠️  {LLM_PROVIDER} returned non-JSON. Raw response:")
        print(response_text)
        # Fallback: return sections with original headings unchanged
        return raw_sections
    except Exception as e:
        print(f"⚠️  {LLM_PROVIDER} API call failed: {e}")
        return raw_sections

    # Merge canonical names back into the original sections
    enriched = []
    for item in classifications:
        idx = item["index"]
        section = raw_sections[idx].copy()
        section["canonical_name"] = item["canonical_name"]
        section["confidence"] = item["confidence"]
        enriched.append(section)

    return enriched