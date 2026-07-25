"""
Coding Assignment 1 - Part 1: LLM Workflow (5 Marks)
------------------------------------------------------
Accepts user input from the terminal and generates a response using an LLM.

Supports THREE backends - use whichever you have access to:
  1. OpenAI   (needs OPENAI_API_KEY)
  2. Gemini   (needs GOOGLE_API_KEY)
  3. Ollama   (needs Ollama installed locally, no API key / no internet needed)

Just set BACKEND below to "openai", "gemini", or "ollama".

Install (pick what you need):
    pip install openai
    pip install google-generativeai
    pip install ollama          # + `ollama pull llama3` once, from the terminal
"""

import os

# ---------------------------------------------------------------------------
# 1. CHOOSE YOUR BACKEND HERE
# ---------------------------------------------------------------------------
BACKEND = "openai"   # options: "openai", "gemini", "ollama"


def get_llm_response(prompt: str) -> str:
    """Send `prompt` to the chosen LLM backend and return the text response."""

    if BACKEND == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    elif BACKEND == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text

    elif BACKEND == "ollama":
        import ollama
        response = ollama.chat(
            model="llama3",
            messages=[{"role": "user", "content": prompt}],
        )
        return response["message"]["content"]

    else:
        raise ValueError(f"Unknown BACKEND: {BACKEND}")


def main():
    print("=== Simple LLM Chat ===")
    print(f"(using backend: {BACKEND})  Type 'exit' to quit.\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            print("Goodbye!")
            break
        if not user_input:
            continue

        try:
            answer = get_llm_response(user_input)
            print(f"\nAI: {answer}\n")
        except Exception as e:
            print(f"[Error] {e}\n"
                  f"Check that your API key is set and the package is installed.")


if __name__ == "__main__":
    main()
