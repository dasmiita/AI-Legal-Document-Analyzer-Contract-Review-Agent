def classify_clause(text: str) -> str:
    text = text.lower()

    if "confidential" in text:
        return "Confidentiality"
    elif "terminate" in text:
        return "Termination"
    elif "law" in text:
        return "Governing Law"
    elif "payment" in text or "$" in text:
        return "Financial"
    elif "non-compete" in text:
        return "Non-Compete"
    else:
        return "Other"


def assign_risk(entities: dict, clause_type: str) -> str:
    if entities["MONEY"]:
        return "high"

    if clause_type in ["Non-Compete"]:
        return "high"

    if clause_type in ["Termination", "Liability"]:
        return "medium"

    return "low"