"""
Coding Assignment 1 - Part 2: Prompt Chaining (5 Marks)
------------------------------------------------------
Given a topic, this program runs a THREE-STEP chained LLM workflow:

    Step 1: Generate a short summary of the topic
    Step 2: Extract key points from that summary
    Step 3: Produce three questions based on the key points

Each step's output feeds into the next step's prompt -- that's the "chain".

Reuses the same get_llm_response() pattern from Part 1.
Change BACKEND to "openai", "gemini", or "ollama" as needed.
"""

import os

BACKEND = "openai"   # options: "openai", "gemini", "ollama"


def get_llm_response(prompt: str) -> str:
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
        return model.generate_content(prompt).text

    elif BACKEND == "ollama":
        import ollama
        response = ollama.chat(model="llama3",
                                messages=[{"role": "user", "content": prompt}])
        return response["message"]["content"]

    else:
        raise ValueError(f"Unknown BACKEND: {BACKEND}")


def step1_summarize(topic: str) -> str:
    prompt = f"Write a concise 4-5 sentence summary about the topic: '{topic}'."
    return get_llm_response(prompt)


def step2_extract_key_points(summary: str) -> str:
    prompt = (
        "From the following summary, extract the key points as a short "
        "bullet list (max 5 bullets):\n\n"
        f"{summary}"
    )
    return get_llm_response(prompt)


def step3_generate_questions(key_points: str) -> str:
    prompt = (
        "Based on the following key points, write exactly THREE thoughtful "
        "questions someone could ask to test understanding of the topic:\n\n"
        f"{key_points}"
    )
    return get_llm_response(prompt)


def run_chain(topic: str):
    print(f"\n=== Running prompt chain for topic: '{topic}' ===\n")

    summary = step1_summarize(topic)
    print("--- Step 1: Summary ---")
    print(summary, "\n")

    key_points = step2_extract_key_points(summary)
    print("--- Step 2: Key Points ---")
    print(key_points, "\n")

    questions = step3_generate_questions(key_points)
    print("--- Step 3: Three Questions ---")
    print(questions, "\n")

    return {
        "topic": topic,
        "summary": summary,
        "key_points": key_points,
        "questions": questions,
    }


def main():
    print("=== Prompt Chaining Demo ===")
    print(f"(using backend: {BACKEND})\n")
    topic = input("Enter a topic: ").strip()
    if not topic:
        topic = "Artificial Intelligence"
        print(f"No topic entered, using default: '{topic}'")

    try:
        run_chain(topic)
    except Exception as e:
        print(f"[Error] {e}")


if __name__ == "__main__":
    main()
