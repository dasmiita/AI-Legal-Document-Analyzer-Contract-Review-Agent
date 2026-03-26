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

load_dotenv()

app = FastAPI(title="Legal Analyzer API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    print("Seeding gold standard templates into ChromaDB...")
    seed_templates()
    print("Templates ready.")


@app.get("/")
def health_check():
    return {"status": "running", "version": "0.4.0"}


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """Quick ingestion pipeline — returns segmented sections."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        sections = run_pipeline(tmp_path)
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
                    "entities": s.get("entities")
                }
                for s in sections
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
