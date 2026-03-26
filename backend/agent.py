"""
agent.py — LangChain agent orchestrating all pipeline tools.
Compatible with LangChain 1.x+
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import os
import json
from dotenv import load_dotenv

from ingestion import extract_text_from_pdf, regex_segment, llm_parse_structure
from ner import extract_legal_entities
from classifier import classify_clause, assign_risk
from vector_store import seed_templates, compare_all_sections
from redline import generate_all_redlines

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2
)

_current_doc = {"sections": [], "pdf_path": ""}


@tool
def parse_document(pdf_path: str) -> str:
    """Parse a PDF contract and segment it into named sections. Input: full path to PDF."""
    try:
        raw_text = extract_text_from_pdf(pdf_path)
        non_space = sum(1 for c in raw_text if c.strip())
        if non_space < 100:
            return json.dumps({
                "error": "OCR_QUALITY_TOO_LOW",
                "message": "Document appears to be a scanned image with insufficient text.",
                "characters_extracted": len(raw_text)
            })
        regex_sections = regex_segment(raw_text)
        enriched = llm_parse_structure(regex_sections)
        _current_doc["sections"] = enriched
        _current_doc["pdf_path"] = pdf_path
        return json.dumps({
            "status": "success",
            "sections_found": len(enriched),
            "section_names": [s.get("canonical_name", s["heading"]) for s in enriched]
        })
    except Exception as e:
        return json.dumps({"error": str(e), "tool": "parse_document"})


@tool
def run_ner(dummy: str = "") -> str:
    """Extract named entities from all sections of the current document."""
    try:
        if not _current_doc["sections"]:
            return json.dumps({"error": "No document loaded. Run parse_document first."})
        results = []
        for section in _current_doc["sections"]:
            entities = extract_legal_entities(section["body"])
            section["entities"] = entities
            results.append({
                "section": section.get("canonical_name", section["heading"]),
                "entities": entities
            })
        return json.dumps({"status": "success", "ner_results": results})
    except Exception as e:
        return json.dumps({"error": str(e), "tool": "run_ner"})


@tool
def classify_sections(dummy: str = "") -> str:
    """Classify each section by clause type and assign a risk level."""
    try:
        if not _current_doc["sections"]:
            return json.dumps({"error": "No document loaded. Run parse_document first."})
        risk_summary = {"high": [], "medium": [], "low": []}
        for section in _current_doc["sections"]:
            clause_type = classify_clause(section["body"])
            entities = section.get("entities", {})
            risk = assign_risk(entities, clause_type)
            section["clause_type"] = clause_type
            section["risk"] = risk
            risk_summary[risk].append(section.get("canonical_name", section["heading"]))
        return json.dumps({
            "status": "success",
            "risk_summary": risk_summary,
            "total_high_risk": len(risk_summary["high"]),
            "total_medium_risk": len(risk_summary["medium"])
        })
    except Exception as e:
        return json.dumps({"error": str(e), "tool": "classify_sections"})


@tool
def compare_to_standards(dummy: str = "") -> str:
    """Compare all sections against gold standard NDA templates using semantic similarity."""
    try:
        if not _current_doc["sections"]:
            return json.dumps({"error": "No document loaded. Run parse_document first."})
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
        return json.dumps({
            "status": "success",
            "total_sections": len(sections),
            "deviations_found": len(deviations),
            "deviations": deviations
        })
    except Exception as e:
        return json.dumps({"error": str(e), "tool": "compare_to_standards"})


@tool
def suggest_redlines(dummy: str = "") -> str:
    """Generate plain-English redline suggestions for all flagged deviations."""
    try:
        if not _current_doc["sections"]:
            return json.dumps({"error": "No document loaded. Run parse_document first."})
        has_comparisons = any("comparison" in s for s in _current_doc["sections"])
        if not has_comparisons:
            return json.dumps({"error": "Run compare_to_standards first."})
        sections = generate_all_redlines(_current_doc["sections"])
        _current_doc["sections"] = sections
        redlines = [
            {
                "section": s.get("canonical_name", s["heading"]),
                "issue": s["redline"]["plain_english_issue"],
                "implication": s["redline"]["legal_implication"],
                "suggestion": s["redline"]["suggested_redline"],
                "urgency": s["redline"]["urgency"]
            }
            for s in sections
            if s.get("redline") is not None
        ]
        return json.dumps({
            "status": "success",
            "redlines_generated": len(redlines),
            "redlines": redlines
        })
    except Exception as e:
        return json.dumps({"error": str(e), "tool": "suggest_redlines"})


@tool
def answer_question(question: str) -> str:
    """Answer a natural language question about the currently loaded contract."""
    try:
        if not _current_doc["sections"]:
            return "No document loaded. Please parse a document first."
        context = "\n\n".join([
            f"[{s.get('canonical_name', s['heading'])}]\n{s['body']}"
            for s in _current_doc["sections"]
        ])
        prompt = f"""You are a legal assistant. Answer this question about the NDA contract.
Be concise and use plain English. If the answer is not in the contract, say so.

CONTRACT:
{context[:4000]}

QUESTION: {question}

Answer in 2-4 sentences maximum."""
        from google import genai as g
        c = g.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = c.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"Could not answer question: {str(e)}"


tools = [
    parse_document,
    run_ner,
    classify_sections,
    compare_to_standards,
    suggest_redlines,
    answer_question,
]

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an AI legal analyst specializing in NDA contract review.
Run tools in this order for a full analysis:
1. parse_document — first, with the PDF path
2. run_ner — extract parties and dates
3. classify_sections — assign risk levels
4. compare_to_standards — find deviations
5. suggest_redlines — generate fix suggestions
Present findings clearly with risk levels and specific suggestions."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_tool_calling_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=10
)


def run_full_analysis(pdf_path: str) -> str:
    result = agent_executor.invoke({
        "input": f"Do a full NDA analysis on: {pdf_path}. "
                 f"Parse it, extract entities, classify risk, compare to standards, "
                 f"and generate redline suggestions for any deviations found.",
        "chat_history": []
    })
    return result["output"]


def ask_agent(question: str) -> str:
    result = agent_executor.invoke({
        "input": question,
        "chat_history": []
    })
    return result["output"]
