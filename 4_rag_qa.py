"""
Coding Assignment 1 - Part 4: RAG-Based Question Answering (5 Marks)
------------------------------------------------------
A basic Retrieval-Augmented Generation (RAG) app:

    1. Loads a document (.pdf or .txt)
    2. Splits it into overlapping chunks
    3. Builds a TF-IDF index over the chunks (simple, no API cost, works
       offline for the retrieval step)
    4. For each user query: retrieves the most relevant chunk(s), then
       asks the LLM to answer the question USING ONLY those chunks

Install:
    pip install scikit-learn pypdf openai
    (add google-generativeai or ollama if using those backends)
"""

import os
import re

BACKEND = "openai"   # options: "openai", "gemini", "ollama"

DOCUMENT_PATH = "document.txt"   # <-- change to your .pdf or .txt file
CHUNK_SIZE = 500                 # characters per chunk
CHUNK_OVERLAP = 100              # overlap between consecutive chunks
TOP_K = 3                        # number of chunks to retrieve per query


# ---------------------------------------------------------------------------
# LLM call (same pattern as Parts 1-3)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# 1. Load document (PDF or TXT)
# ---------------------------------------------------------------------------
def load_document(path: str) -> str:
    if path.lower().endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    return text


# ---------------------------------------------------------------------------
# 2. Chunk the document
# ---------------------------------------------------------------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    text = re.sub(r"\s+", " ", text).strip()
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c for c in chunks if c.strip()]


# ---------------------------------------------------------------------------
# 3. Build a simple TF-IDF retriever
# ---------------------------------------------------------------------------
class SimpleRetriever:
    def __init__(self, chunks: list):
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.chunks = chunks
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform(chunks)

    def retrieve(self, query: str, top_k: int = TOP_K) -> list:
        from sklearn.metrics.pairwise import cosine_similarity
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.matrix)[0]
        top_indices = scores.argsort()[::-1][:top_k]
        return [self.chunks[i] for i in top_indices if scores[i] > 0]


# ---------------------------------------------------------------------------
# 4. Answer a query using retrieved context
# ---------------------------------------------------------------------------
def answer_query(retriever: SimpleRetriever, query: str) -> str:
    relevant_chunks = retriever.retrieve(query)

    if not relevant_chunks:
        return "I couldn't find relevant information in the document for that question."

    context = "\n\n---\n\n".join(relevant_chunks)
    prompt = (
        "Answer the question using ONLY the context below. If the answer "
        "isn't in the context, say you don't know.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {query}\n\n"
        "Answer:"
    )
    return get_llm_response(prompt)


def main():
    print("=== Basic RAG Question Answering ===")
    print(f"(using backend: {BACKEND})\n")

    doc_path = input(f"Enter document path [{DOCUMENT_PATH}]: ").strip() or DOCUMENT_PATH

    if not os.path.exists(doc_path):
        print(f"[Error] File not found: {doc_path}")
        print("Create a .txt or .pdf file at that path, or enter a valid path.")
        return

    print(f"\nLoading and indexing '{doc_path}'...")
    text = load_document(doc_path)
    chunks = chunk_text(text)
    print(f"Document split into {len(chunks)} chunks.")

    retriever = SimpleRetriever(chunks)
    print("Index built. Ask questions about the document (type 'exit' to quit).\n")

    while True:
        query = input("Your question: ").strip()
        if query.lower() in ("exit", "quit"):
            print("Goodbye!")
            break
        if not query:
            continue

        try:
            answer = answer_query(retriever, query)
            print(f"\nAnswer: {answer}\n")
        except Exception as e:
            print(f"[Error] {e}\n")


if __name__ == "__main__":
    main()
