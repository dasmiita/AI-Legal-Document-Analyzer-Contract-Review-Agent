"""
vector_store.py — ChromaDB setup + semantic similarity comparison.
Stores gold standard templates and compares uploaded clauses against them.

Tuning log (KPI: debugging effort):
- Threshold 0.95: too strict — flagged synonym usage like "keep secret" vs "hold in confidence"
- Threshold 0.80: too loose — missed real deviations in liability clauses
- Threshold 0.85: sweet spot — catches structural deviations, ignores synonym variation
- Final threshold: 0.85 (SIMILARITY_THRESHOLD below)
"""

import chromadb
from chromadb.utils import embedding_functions
import os
from templates import GOLD_STANDARD_TEMPLATES

# ── Tuned similarity threshold ──
# Below this score = clause deviates from gold standard = flag it
# Above this score = clause is close enough to standard = safe
SIMILARITY_THRESHOLD = 0.85

# ChromaDB persists to disk so templates survive restarts
CHROMA_PATH = "./chroma_db"

# Use sentence-transformers for embeddings (free, runs locally)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def get_collection():
    """Initialize ChromaDB client and return the templates collection."""
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL
    )

    collection = client.get_or_create_collection(
        name="nda_templates",
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )

    return collection


def seed_templates():
    """
    Load gold standard templates into ChromaDB.
    Safe to call multiple times — skips if already seeded.
    """
    collection = get_collection()

    # Check if already seeded
    existing = collection.count()
    if existing >= len(GOLD_STANDARD_TEMPLATES):
        print(f"   Templates already seeded ({existing} entries)")
        return

    print(f"   Seeding {len(GOLD_STANDARD_TEMPLATES)} gold standard templates...")

    documents = []
    metadatas = []
    ids = []

    for clause_type, template_text in GOLD_STANDARD_TEMPLATES.items():
        documents.append(template_text.strip())
        metadatas.append({"clause_type": clause_type})
        ids.append(f"template_{clause_type.replace(' ', '_').replace('/', '_')}")

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    print(f"   Seeded {len(documents)} templates successfully")


def compare_clause_to_standard(clause_text: str, clause_type: str) -> dict:
    """
    Compare a clause from the uploaded contract against the gold standard.

    Returns:
        {
            "similarity_score": float,       # 0.0 to 1.0
            "is_deviation": bool,            # True if below threshold
            "matched_template": str,         # closest gold standard text
            "matched_type": str,             # what clause type it matched
            "deviation_severity": str        # "none", "minor", "major"
        }
    """
    collection = get_collection()

    # Query top 3 most similar templates
    results = collection.query(
        query_texts=[clause_text],
        n_results=min(3, collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    if not results["documents"][0]:
        return {
            "similarity_score": 0.0,
            "is_deviation": True,
            "matched_template": "",
            "matched_type": "Unknown",
            "deviation_severity": "major"
        }

    # ChromaDB cosine distance: 0 = identical, 2 = opposite
    # Convert to similarity score: 1 - (distance / 2)
    distance = results["distances"][0][0]
    similarity_score = round(1 - (distance / 2), 3)

    matched_template = results["documents"][0][0]
    matched_type = results["metadatas"][0][0].get("clause_type", "Unknown")

    is_deviation = similarity_score < SIMILARITY_THRESHOLD

    # Severity bands
    if similarity_score >= SIMILARITY_THRESHOLD:
        severity = "none"
    elif similarity_score >= 0.70:
        severity = "minor"
    else:
        severity = "major"

    return {
        "similarity_score": similarity_score,
        "is_deviation": is_deviation,
        "matched_template": matched_template,
        "matched_type": matched_type,
        "deviation_severity": severity
    }


def compare_all_sections(sections: list[dict]) -> list[dict]:
    """
    Run similarity comparison on every section from the ingestion pipeline.
    Adds comparison results to each section dict.
    """
    print(f"\n📐 Comparing {len(sections)} sections against gold standards...")

    for section in sections:
        clause_type = section.get("canonical_name", section.get("clause_type", "Unknown"))
        body = section.get("body", "")

        if not body.strip():
            section["comparison"] = {
                "similarity_score": 0.0,
                "is_deviation": False,
                "matched_template": "",
                "matched_type": "Empty",
                "deviation_severity": "none"
            }
            continue

        comparison = compare_clause_to_standard(body, clause_type)
        section["comparison"] = comparison

        status = "DEVIATION" if comparison["is_deviation"] else "OK"
        print(f"   [{status}] {clause_type[:40]:<40} score={comparison['similarity_score']:.3f} severity={comparison['deviation_severity']}")

    return sections
