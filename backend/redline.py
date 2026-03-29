"""
redline.py — Generates plain-English redline suggestions using the LLM.
Called by the agent when a deviation is found.
"""
import os
from dotenv import load_dotenv
load_dotenv()
from groq import Groq

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))




def generate_redline(
    clause_type: str,
    original_text: str,
    gold_standard: str,
    deviation_severity: str
) -> dict:
    """
    Given a deviating clause and the gold standard, ask the LLM to:
    1. Explain what's wrong in plain English
    2. Explain the legal implication
    3. Suggest specific redline modifications
    """
    import json
    from groq import Groq

    prompt = f"""You are a legal contract reviewer specializing in NDAs.

A clause has been flagged as deviating from the gold standard.

CLAUSE TYPE: {clause_type}
DEVIATION SEVERITY: {deviation_severity}

UPLOADED CLAUSE (what they sent):
{original_text}

GOLD STANDARD (what it should look like):
{gold_standard}

Your job — respond in this exact JSON format, no markdown, no code fences:
{{
  "plain_english_issue": "1-2 sentences explaining what is wrong, written for a non-lawyer founder",
  "legal_implication": "1-2 sentences on what risk this creates if signed as-is",
  "suggested_redline": "The specific text that should replace or be added to the problematic section",
  "urgency": "must_fix" | "should_fix" | "minor_suggestion"
}}"""

    try:
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        chat = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        text = chat.choices[0].message.content.strip()

        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        return json.loads(text.strip())

    except json.JSONDecodeError:
        return {
            "plain_english_issue": f"This {clause_type} clause deviates from the standard template ({deviation_severity} severity).",
            "legal_implication": "Review manually — this clause may expose you to unnecessary risk if signed as-is.",
            "suggested_redline": gold_standard[:300] + "...",
            "urgency": "should_fix" if deviation_severity == "minor" else "must_fix"
        }
    except Exception as e:
        return {
            "plain_english_issue": f"This {clause_type} clause deviates from the standard template ({deviation_severity} severity).",
            "legal_implication": "Review manually — this clause may expose you to unnecessary risk if signed as-is.",
            "suggested_redline": gold_standard[:300] + "...",
            "urgency": "should_fix" if deviation_severity == "minor" else "must_fix"
        }



def generate_all_redlines(sections: list[dict]) -> list[dict]:
    """
    For every section flagged as a deviation, generate a redline suggestion.
    Skips sections that passed comparison.
    """
    deviations = [
        s for s in sections
        if s.get("comparison", {}).get("is_deviation", False)
    ]

    print(f"\n✍️  Generating redlines for {len(deviations)} flagged sections...")

    for section in sections:
        comparison = section.get("comparison", {})

        if not comparison.get("is_deviation", False):
            section["redline"] = None
            continue

        clause_type = section.get("canonical_name", section.get("clause_type", "Unknown"))
        print(f"   Redlining: {clause_type}")

        redline = generate_redline(
            clause_type=clause_type,
            original_text=section.get("body", ""),
            gold_standard=comparison.get("matched_template", ""),
            deviation_severity=comparison.get("deviation_severity", "minor")
        )

        section["redline"] = redline

    return sections
