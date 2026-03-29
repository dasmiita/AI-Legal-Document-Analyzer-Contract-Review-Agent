import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def generate_suggestion(clause_text: str, deviation: bool) -> str:
    if not deviation:
        return "No issues detected."

    prompt = f"""
This contract clause may be risky:

{clause_text}

Suggest a safer version and explain why.
Keep it short and simple.
"""

    try:
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        chat = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return chat.choices[0].message.content.strip()

    except Exception as e:
        return f"Suggestion unavailable: {str(e)[:60]}"
