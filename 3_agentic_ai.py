"""
Coding Assignment 1 - Part 3: Agentic AI (5 Marks)
------------------------------------------------------
A simple AI agent that:
    1. Accepts a task/goal from the user
    2. PLANS the steps needed to complete it (asks the LLM to break the
       task into an ordered list of steps)
    3. EXECUTES each step one by one (asks the LLM to actually carry out
       that step, using the results of previous steps as context)
    4. Displays the final combined output

This is a minimal, from-scratch version of the "plan -> act -> observe"
loop that real agent frameworks (LangChain agents, AutoGPT, etc.) use.

Change BACKEND to "openai", "gemini", or "ollama" as needed.
"""

import os
import re

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


class SimpleAgent:
    """A minimal plan -> execute -> output agent."""

    def __init__(self, max_steps: int = 5):
        self.max_steps = max_steps

    def plan(self, task: str) -> list:
        """Ask the LLM to break the task into an ordered list of steps."""
        prompt = (
            f"You are a planning assistant. Break the following task into "
            f"{self.max_steps} or fewer clear, numbered, actionable steps. "
            f"Reply with ONLY a numbered list, one step per line, nothing else.\n\n"
            f"Task: {task}"
        )
        raw_plan = get_llm_response(prompt)

        # Parse numbered lines like "1. Do X" into a clean list of steps
        steps = []
        for line in raw_plan.splitlines():
            line = line.strip()
            match = re.match(r"^\d+[\.\)]\s*(.+)", line)
            if match:
                steps.append(match.group(1).strip())
        if not steps:  # fallback if parsing fails
            steps = [s.strip("- ").strip() for s in raw_plan.splitlines() if s.strip()]
        return steps

    def execute_step(self, task: str, step: str, prior_results: list) -> str:
        """Execute a single step, given context of what's been done so far."""
        context = "\n".join(
            f"Step {i+1} ({s}) -> {r}" for i, (s, r) in enumerate(prior_results)
        )
        prompt = (
            f"Overall task: {task}\n\n"
            f"Progress so far:\n{context if context else '(none yet)'}\n\n"
            f"Now execute this specific step and give a direct, useful result "
            f"(not just a restatement of the step):\n"
            f"Step: {step}"
        )
        return get_llm_response(prompt)

    def run(self, task: str) -> dict:
        print(f"\n=== Agent received task ===\n{task}\n")

        print("--- Planning phase ---")
        steps = self.plan(task)
        for i, step in enumerate(steps, 1):
            print(f"  {i}. {step}")

        print("\n--- Execution phase ---")
        results = []
        for i, step in enumerate(steps, 1):
            print(f"\n[Executing step {i}/{len(steps)}] {step}")
            result = self.execute_step(task, step, results)
            print(f"-> {result}")
            results.append((step, result))

        final_output = "\n\n".join(
            f"Step {i+1}: {s}\nResult: {r}" for i, (s, r) in enumerate(results)
        )

        print("\n=== FINAL OUTPUT ===")
        print(final_output)

        return {"task": task, "steps": steps, "results": results, "final_output": final_output}


def main():
    print("=== Simple Agentic AI Demo ===")
    print(f"(using backend: {BACKEND})\n")
    task = input("Enter a task for the agent: ").strip()
    if not task:
        task = "Plan a 3-day study schedule for learning Python basics"
        print(f"No task entered, using default: '{task}'")

    agent = SimpleAgent(max_steps=5)
    try:
        agent.run(task)
    except Exception as e:
        print(f"[Error] {e}")


if __name__ == "__main__":
    main()
