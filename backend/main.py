"""
main.py — FastAPI server
Day 4: full pipeline with agent, comparison, and redlines
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
from dotenv import load_dotenv

from ingestion import run_pipeline
from vector_store import seed_templates
from agent import run_full_analysis, ask_agent
from groq import Groq

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def explain_clauses_batch(sections: list) -> list:
    """Single LLM call to explain all clauses at once."""
    try:
        clauses_text = "\n\n".join([
            f"CLAUSE {i+1} ({s.get('clause_type','contract')}, {s.get('risk','low')} risk):\n{s['body'][:400]}"
            for i, s in enumerate(sections)
        ])
        prompt = f"""You are a legal assistant. For each clause below, write exactly 2 sentences of plain English explanation for a non-lawyer founder. Focus on what it means for them and the risk level.

Respond in this exact format for each clause:
CLAUSE 1: <explanation>
CLAUSE 2: <explanation>
...and so on.

{clauses_text}"""
        chat = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        raw = chat.choices[0].message.content.strip()
        explanations = []
        for i in range(len(sections)):
            marker = f"CLAUSE {i+1}:"
            next_marker = f"CLAUSE {i+2}:"
            start = raw.find(marker)
            end = raw.find(next_marker) if i+1 < len(sections) else len(raw)
            if start != -1:
                explanations.append(raw[start+len(marker):end].strip())
            else:
                explanations.append("")
        return explanations
    except:
        return ["" for _ in sections]

app = FastAPI(title="Legal Analyzer API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_seeded = False

@app.on_event("startup")
async def startup():
    print("App started. Templates will seed on first request.")

def ensure_seeded():
    global _seeded
    if not _seeded:
        print("Seeding templates...")
        seed_templates()
        _seeded = True


@app.get("/")
def health_check():
    return {"status": "running", "version": "0.4.0"}


@app.post("/analyze")

async def analyze_document(file: UploadFile = File(...)):
    ensure_seeded() 
    """Quick ingestion pipeline — returns segmented sections."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        sections = run_pipeline(tmp_path)
        explanations = explain_clauses_batch(sections)
        return {
            "filename": file.filename,
            "section_count": len(sections),
            "sections": [
                {
                    "canonical_name": s.get("canonical_name", s["heading"]),
                    "raw_heading": s["heading"],
                    "confidence": s.get("confidence", "n/a"),
                    "body": s["body"],
                    "clause_type": s.get("clause_type"),
                    "risk": s.get("risk"),
                    "entities": s.get("entities"),
                    "explanation": explanations[i]
                }
                for i, s in enumerate(sections)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)


@app.post("/agent/analyze")
async def agent_analyze(file: UploadFile = File(...)):
    """Full pipeline through the LangChain agent."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    tmp_path = f"./tmp_{file.filename}"
    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        result = run_full_analysis(tmp_path)
        return {"status": "success", "analysis": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


class QuestionRequest(BaseModel):
    question: str

@app.post("/agent/ask")
async def agent_ask(request: QuestionRequest):
    """Ask a follow-up question about the last analyzed document."""
    try:
        answer = ask_agent(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
