"""
agent.py — Pipeline orchestrator without LangChain AgentExecutor
Compatible with LangChain 1.x which removed AgentExecutor
Uses direct tool calls orchestrated by Gemini instead
"""
from langchain_groq import ChatGroq

from langchain_core.messages import HumanMessage, SystemMessage
import os
import json
from dotenv import load_dotenv

from ingestion import extract_text_from_pdf, regex_segment, llm_parse_structure
from ner import extract_legal_entities
from classifier import classify_clause, assign_risk
from vector_store import seed_templates, compare_all_sections
from redline import generate_all_redlines

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2
)

# In-memory store for the current document
_current_doc = {"sections": [], "pdf_path": ""}


# ─────────────────────────────────────────────
# TOOL FUNCTIONS — each is a discrete pipeline step
# ─────────────────────────────────────────────

def tool_parse_document(pdf_path: str) -> dict:
    """Tool 1: Parse PDF and segment into sections."""
    print("\n[TOOL] parse_document")
    try:
        raw_text = extract_text_from_pdf(pdf_path)
        non_space = sum(1 for c in raw_text if c.strip())
        if non_space < 100:
            return {
                "error": "OCR_QUALITY_TOO_LOW",
                "message": "Document appears to be a scanned image. Please upload a text-based PDF.",
                "characters_extracted": len(raw_text)
            }
        regex_sections = regex_segment(raw_text)
        enriched = llm_parse_structure(regex_sections)
        _current_doc["sections"] = enriched
        _current_doc["pdf_path"] = pdf_path
        return {
            "status": "success",
            "sections_found": len(enriched),
            "section_names": [s.get("canonical_name", s["heading"]) for s in enriched]
        }
    except Exception as e:
        return {"error": str(e), "tool": "parse_document"}


def tool_run_ner() -> dict:
    """Tool 2: Extract named entities from all sections."""
    print("\n[TOOL] run_ner")
    try:
        if not _current_doc["sections"]:
            return {"error": "No document loaded. Run parse_document first."}
        for section in _current_doc["sections"]:
            entities = extract_legal_entities(section["body"])
            section["entities"] = entities
        return {
            "status": "success",
            "message": f"Extracted entities from {len(_current_doc['sections'])} sections"
        }
    except Exception as e:
        return {"error": str(e), "tool": "run_ner"}


def tool_classify_sections() -> dict:
    """Tool 3: Classify clauses and assign risk levels."""
    print("\n[TOOL] classify_sections")
    try:
        if not _current_doc["sections"]:
            return {"error": "No document loaded."}
        risk_summary = {"high": [], "medium": [], "low": []}
        for section in _current_doc["sections"]:
            clause_type = classify_clause(section["body"])
            entities = section.get("entities", {})
            risk = assign_risk(entities, clause_type)
            section["clause_type"] = clause_type
            section["risk"] = risk
            risk_summary[risk].append(section.get("canonical_name", section["heading"]))
        return {
            "status": "success",
            "risk_summary": risk_summary,
            "total_high_risk": len(risk_summary["high"]),
            "total_medium_risk": len(risk_summary["medium"])
        }
    except Exception as e:
        return {"error": str(e), "tool": "classify_sections"}


def tool_compare_to_standards() -> dict:
    """Tool 4: Compare sections against gold standard templates."""
    print("\n[TOOL] compare_to_standards")
    try:
        if not _current_doc["sections"]:
            return {"error": "No document loaded."}
        seed_templates()
        sections = compare_all_sections(_current_doc["sections"])
        _current_doc["sections"] = sections
        deviations = [
            {
                "section": s.get("canonical_name", s["heading"]),
                "similarity_score": s["comparison"]["similarity_score"],
                "severity": s["comparison"]["deviation_severity"]
            }
            for s in sections
            if s["comparison"]["is_deviation"]
        ]
        return {
            "status": "success",
            "total_sections": len(sections),
            "deviations_found": len(deviations),
            "deviations": deviations
        }
    except Exception as e:
        return {"error": str(e), "tool": "compare_to_standards"}


def tool_suggest_redlines() -> dict:
    """Tool 5: Generate redline suggestions for flagged deviations."""
    print("\n[TOOL] suggest_redlines")
    try:
        if not _current_doc["sections"]:
            return {"error": "No document loaded."}
        sections = generate_all_redlines(_current_doc["sections"])
        _current_doc["sections"] = sections
        redlines = [
            {
                "section": s.get("canonical_name", s["heading"]),
                "issue": s["redline"]["plain_english_issue"],
                "implication": s["redline"]["legal_implication"],
                "urgency": s["redline"]["urgency"]
            }
            for s in sections
            if s.get("redline") is not None
        ]
        return {
            "status": "success",
            "redlines_generated": len(redlines),
            "redlines": redlines
        }
    except Exception as e:
        return {"error": str(e), "tool": "suggest_redlines"}


def tool_answer_question(question: str) -> str:
    """Tool 6: Answer a question about the loaded contract."""
    print(f"\n[TOOL] answer_question: {question}")
    try:
        if not _current_doc["sections"]:
            return "No document loaded."
        context = "\n\n".join([
            f"[{s.get('canonical_name', s['heading'])}]\n{s['body']}"
            for s in _current_doc["sections"]
        ])
        messages = [
            SystemMessage(content="You are a legal assistant. Answer questions about NDA contracts concisely in plain English."),
            HumanMessage(content=f"CONTRACT:\n{context[:4000]}\n\nQUESTION: {question}\n\nAnswer in 2-4 sentences.")
        ]
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        return f"Could not answer: {str(e)}"


# ─────────────────────────────────────────────
# ORCHESTRATOR — runs all tools in sequence
# then uses LLM to generate final summary
# ─────────────────────────────────────────────

def run_full_analysis(pdf_path: str) -> str:
    """Run the complete 5-tool pipeline and return a plain-English summary."""
    print(f"\n🤖 Starting full agent analysis: {pdf_path}")

    results = {}

    # Run all 5 tools in order
    results["parse"] = tool_parse_document(pdf_path)
    if "error" in results["parse"]:
        return f"Pipeline failed at parsing: {results['parse']['error']}"

    results["ner"] = tool_run_ner()
    results["classify"] = tool_classify_sections()
    results["compare"] = tool_compare_to_standards()
    results["redlines"] = tool_suggest_redlines()

    # Ask LLM to generate a plain-English executive summary
    print("\n[TOOL] generating executive summary...")
    try:
        summary_prompt = f"""You are a legal analyst. Based on this NDA contract analysis, 
write a clear executive summary for a non-lawyer founder.

ANALYSIS RESULTS:
{json.dumps(results, indent=2)[:3000]}

Write a summary covering:
1. Overall risk level (Low/Medium/High) and why
2. The 2-3 most important issues found
3. What they must fix before signing
4. What is acceptable as-is

Keep it under 200 words. Use plain English, no legal jargon."""

        messages = [HumanMessage(content=summary_prompt)]
        response = llm.invoke(messages)
        summary = response.content
    except Exception as e:
        summary = f"Summary generation failed: {str(e)}"

    # Print full results to console
    print("\n" + "=" * 60)
    print("  AGENT ANALYSIS COMPLETE")
    print("=" * 60)
    print(f"\nSections parsed:     {results['parse'].get('sections_found', 0)}")
    print(f"High risk clauses:   {results['classify'].get('total_high_risk', 0)}")
    print(f"Medium risk clauses: {results['classify'].get('total_medium_risk', 0)}")
    print(f"Deviations found:    {results['compare'].get('deviations_found', 0)}")
    print(f"Redlines generated:  {results['redlines'].get('redlines_generated', 0)}")
    print(f"\n--- EXECUTIVE SUMMARY ---\n{summary}")
    print("=" * 60)

    return summary


def ask_agent(question: str) -> str:
    """Ask a follow-up question about the last analyzed document."""
    return tool_answer_question(question)
