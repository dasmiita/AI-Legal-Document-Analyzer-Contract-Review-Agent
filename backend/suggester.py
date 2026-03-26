import google.generativeai as genai

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_suggestion(clause_text, deviation):
    if not deviation:
        return "No issues detected."

    prompt = f"""
    This contract clause may be risky:

    {clause_text}

    Suggest a safer version and explain why.
    Keep it short and simple.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "Suggestion unavailable."