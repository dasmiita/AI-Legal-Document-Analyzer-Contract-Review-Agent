"""
ingestion.py — Day 2 skeleton pipeline
Reads a PDF, segments it into named sections, prints results to console.
"""
from ner import extract_legal_entities
from classifier import classify_clause, assign_risk
from google import genai
import os
import json
from dotenv import load_dotenv
import fitz  # PyMuPDF
import re
import sys
from pathlib import Path
from vector_store import compare_all_sections, seed_templates
from suggester import generate_suggestion

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
print("API KEY LOADED:", os.getenv("GEMINI_API_KEY")[:5])


# ─────────────────────────────────────────────
# STEP 1: Read PDF with PyMuPDF
# ─────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: str) -> str:
    """Open a PDF and return all text as a single string."""
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num, page in enumerate(doc):
        text = page.get_text()
        full_text += f"\n--- PAGE {page_num + 1} ---\n{text}"
    doc.close()
    return full_text


# ─────────────────────────────────────────────
# STEP 2: Regex pre-segmentation
# ─────────────────────────────────────────────

HEADING_PATTERN = re.compile(
    r"(?m)^(?:"
    r"\d+[\.\)]\s+[A-Z][^\n]{3,60}"
    r"|[A-Z][A-Z\s]{4,50}(?:\n|$)"
    r"|(?:SECTION|ARTICLE)\s+\d+[^\n]{0,60}"
    r")"
)


def regex_segment(text: str) -> list[dict]:
    """
    Split the raw text into rough sections using heading detection.
    Returns a list of dicts: { heading, body }
    """
    matches = list(HEADING_PATTERN.finditer(text))

    if not matches:
        return [{"heading": "Full Document", "body": text.strip()}]

    sections = []
    for i, match in enumerate(matches):
        heading = match.group().strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        if body:
            sections.append({"heading": heading, "body": body})

    return sections


# ─────────────────────────────────────────────
# STEP 3: LLM structure parser
# ─────────────────────────────────────────────

def llm_parse_structure(raw_sections: list[dict]) -> list[dict]:
    compact = []
    for i, s in enumerate(raw_sections):
        compact.append({
            "index": i,
            "heading": s["heading"],
            "preview": s["body"][:200]
        })

    prompt = f"""
You are a legal document structure parser.

Classify each section into one of these:
Definitions, Confidential Information, Obligations of Receiving Party,
Carve-outs / Exclusions, Term and Termination, Return or Destruction,
Non-Solicitation, Non-Compete, Remedies, Governing Law,
Dispute Resolution, Miscellaneous, Recitals / Preamble

If none match, use: "Other: <description>"

Return ONLY JSON:
[
  {{
    "index": number,
    "canonical_name": string,
    "confidence": "high" | "medium" | "low"
  }}
]

Sections:
{json.dumps(compact, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    response_text = response.text.strip()

    try:
        classifications = json.loads(response_text)
    except json.JSONDecodeError:
        print("⚠️ LLM returned invalid JSON:")
        print(response_text)
        return raw_sections

    enriched = []
    for item in classifications:
        idx = item["index"]
        section = raw_sections[idx].copy()
        section["canonical_name"] = item["canonical_name"]
        section["confidence"] = item["confidence"]
        enriched.append(section)

    return enriched


# ─────────────────────────────────────────────
# STEP 4: Print results to console
# ─────────────────────────────────────────────

def print_segments(sections: list[dict]) -> None:
    print("\n" + "=" * 60)
    print(f"  DOCUMENT SEGMENTATION RESULTS — {len(sections)} sections found")
    print("=" * 60)

    for i, section in enumerate(sections, 1):
        canonical = section.get("canonical_name", section["heading"])
        confidence = section.get("confidence", "n/a")
        body_preview = section["body"][:300].replace("\n", " ")

        print(f"\n[{i}] {canonical}")
        print(f"    Raw heading : {section['heading']}")
        print(f"    Confidence  : {confidence}")
        print(f"    Preview     : {body_preview}...")
        print(f"    Clause Type : {section.get('clause_type')}")
        print(f"    Risk Level  : {section.get('risk')}")
        print(f"    Entities    : {section.get('entities')}")
        print(f"    Similarity  : {section.get('comparison', {}).get('similarity_score')}")
        print(f"    Deviation   : {section.get('comparison', {}).get('is_deviation')}")
        print(f"    Severity    : {section.get('comparison', {}).get('deviation_severity')}")
        print(f"    Risk Score  : {section.get('risk_score')}")
        print(f"    Explanation : {section.get('risk_explanation')}")
        print(f"    Suggestion  : {section.get('suggestion', '')[:150]}...")
        print()

    print("=" * 60)



def compute_risk_score(risk, similarity):
    base = {"low": 30, "medium": 60, "high": 90}.get(risk, 50)
    penalty = int((1 - similarity) * 50)
    return min(100, base + penalty)
def explain_risk(clause_type, risk, deviation):
    if not deviation:
        return "Clause aligns with standard industry practices."

    if clause_type == "Confidentiality" and risk == "high":
        return "Unlimited confidentiality can create long-term legal exposure."

    if clause_type == "Liability":
        return "Uncapped liability can expose the company to financial risk."

    if clause_type == "Governing Law":
        return "Unclear jurisdiction may lead to legal disputes."

    return "Clause deviates from standard structure and may introduce risk."



# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def run_pipeline(pdf_path: str) -> list[dict]:
    print(f"\n📄 Reading PDF: {pdf_path}")
    raw_text = extract_text_from_pdf(pdf_path)
    print(f"   Extracted {len(raw_text):,} characters from PDF")

    print("\n🔍 Running regex segmentation...")
    regex_sections = regex_segment(raw_text)
    print(f"   Found {len(regex_sections)} candidate sections")

    print("\n🤖 Sending to LLM for canonical naming...")
    enriched_sections = regex_sections

    # STEP 1: NER + Classification
    for section in enriched_sections:
        entities = extract_legal_entities(section["body"])
        clause_type = classify_clause(section["body"])
        risk = assign_risk(entities, clause_type)

        section["entities"] = entities
        section["clause_type"] = clause_type
        section["risk"] = risk

    # STEP 2: Seed templates (run once)
    seed_templates()

    # STEP 3: Compare with gold standards
    enriched_sections = compare_all_sections(enriched_sections)

    # STEP 4: Generate suggestions (FIXED LOOP)
    for section in enriched_sections:
        comparison = section.get("comparison", {})

    # Suggestion (already there)
        try:
            suggestion = generate_suggestion(
                section["body"],
                comparison.get("is_deviation", False)
            )
        except:
            suggestion = "Error generating suggestion"

        section["suggestion"] = suggestion

    # 🔥 NEW: Risk Explanation
        section["risk_explanation"] = explain_risk(
            section.get("clause_type"),
            section.get("risk"),
            comparison.get("is_deviation", False)
            )

    # 🔥 NEW: Risk Score
        score = compute_risk_score(
            section.get("risk"),
            comparison.get("similarity_score", 0)
            )
        section["risk_score"] = score

    print(f"   LLM classified {len(enriched_sections)} sections")
    print_segments(enriched_sections)

    return enriched_sections

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingestion.py path/to/nda.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not Path(pdf_path).exists():
        print(f"Error: file not found — {pdf_path}")
        sys.exit(1)

    run_pipeline(pdf_path)
