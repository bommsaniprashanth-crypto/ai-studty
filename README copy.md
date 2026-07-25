# Coding Assignment 1 – Applied Agentic AI (LLM & RAG)

## Files
| File | Part | Marks |
|---|---|---|
| `1_llm_workflow.py` | Basic LLM chat loop | 5 |
| `2_prompt_chaining.py` | Summary → Key Points → 3 Questions | 5 |
| `3_agentic_ai.py` | Plan → Execute → Output agent | 5 |
| `4_rag_qa.py` | RAG Q&A over a PDF/TXT file | 5 |
| `document.txt` | Sample source document for Part 4 (swap in your own PDF/TXT) | — |

## Setup
```bash
pip install -r requirements.txt
```

Set an API key (only needed for the backend you use):
```bash
export OPENAI_API_KEY="sk-..."          # if BACKEND = "openai"
export GOOGLE_API_KEY="..."             # if BACKEND = "gemini"
# Ollama needs no key — just `ollama pull llama3` first, and Ollama running locally
```

Each script has a `BACKEND = "openai"` line near the top — change it to
`"gemini"` or `"ollama"` if you prefer those instead.

## Run each part
```bash
python 1_llm_workflow.py
python 2_prompt_chaining.py
python 3_agentic_ai.py
python 4_rag_qa.py
```

For Part 4, when prompted for a document path you can press Enter to use
the included `document.txt`, or provide the path to your own `.pdf`/`.txt` file.

## How each part meets the requirement

1. **LLM Workflow** – takes free-text input from the terminal, sends it to
   the chosen LLM, prints the response, loops until the user types `exit`.
2. **Prompt Chaining** – three sequential LLM calls where each call's output
   becomes part of the next call's prompt (summary → key points → questions).
3. **Agentic AI** – `SimpleAgent.plan()` asks the LLM to break a task into
   numbered steps; `SimpleAgent.run()` then executes each step in order,
   passing prior results forward as context, and prints the final combined
   output.
4. **RAG QA** – loads a document, splits it into overlapping text chunks,
   indexes chunks with TF-IDF, retrieves the top-matching chunks for each
   question, and asks the LLM to answer using only that retrieved context.
