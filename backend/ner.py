import spacy

# Load model once (important for performance)
nlp = spacy.load("en_core_web_sm")

def extract_legal_entities(text: str) -> dict:
    doc = nlp(text)

    entities = {
        "PARTY": [],
        "DATE": [],
        "MONEY": [],
        "JURISDICTION": []
    }

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PERSON"]:
            entities["PARTY"].append(ent.text)

        elif ent.label_ == "DATE":
            entities["DATE"].append(ent.text)

        elif ent.label_ == "MONEY":
            entities["MONEY"].append(ent.text)

        elif ent.label_ in ["GPE", "LOC"]:
            entities["JURISDICTION"].append(ent.text)

    return entities