import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { config } from "./config.ts";
import {
  arrayBufferToBase64,
  callGemini,
  GeminiApiError,
  parseGeminiJSON,
  truncate,
} from "./gemini.ts";
import {
  DEMO_FLASHCARDS,
  DEMO_IMAGE,
  DEMO_INTERVIEW,
  DEMO_PDF_CHAPTERS,
  DEMO_PDF_TEXT,
  DEMO_QUIZ,
  DEMO_YOUTUBE,
} from "./demo.ts";

const app = new Hono();

app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const PDFREST_BASE = "https://api.pdfrest.com";

function geminiErrorResponse(err: unknown) {
  if (err instanceof GeminiApiError) {
    return { code: err.code, error: err.message, httpStatus: err.httpStatus };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { code: "GEMINI_ERROR", error: message, httpStatus: 500 };
}

/** Extract plain text from a PDF using PDFrest */
async function extractTextFromPDF(
  fileBytes: ArrayBuffer,
  filename: string,
): Promise<string> {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([fileBytes], { type: "application/pdf" }),
    filename,
  );
  formData.append("output_type", "json");

  if (!config.pdfrestApiKey) {
    throw new GeminiApiError(
      "MISSING_API_KEY",
      "PDFREST_API_KEY is not configured. Cannot extract text from PDF uploads.",
      503,
    );
  }

  const response = await fetch(`${PDFREST_BASE}/extracted-text`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Api-Key": config.pdfrestApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PDFrest error ${response.status}: ${err.slice(0, 300)}`);
  }

  const data = await response.json();

  // Handle multiple possible response shapes
  if (typeof data?.output?.text === "string") return data.output.text;
  if (typeof data?.text === "string") return data.text;

  // Reconstruct from word arrays
  const pages: any[] =
    data?.output?.pages ?? data?.pages ?? [];
  if (pages.length > 0) {
    return pages
      .map((p: any) =>
        Array.isArray(p.words)
          ? p.words.map((w: any) => w.text ?? "").join(" ")
          : ""
      )
      .join("\n");
  }

  return JSON.stringify(data).slice(0, 4000);
}

/** Background: Generate all AI outputs for an uploaded PDF */
async function processPDFInBackground(
  docId: string,
  text: string,
): Promise<void> {
  const ctx = truncate(text);

  try {
    if (config.demoMode) {
      await kv.set(`pdf:summary:${docId}`, { chapters: DEMO_PDF_CHAPTERS, demoMode: true });
      await kv.set(`pdf:flashcards:${docId}`, { flashcards: DEMO_FLASHCARDS, demoMode: true });
      await kv.set(`pdf:quiz:${docId}:5:medium`, { questions: DEMO_QUIZ, demoMode: true });
      await kv.set(`pdf:interview:${docId}`, { questions: DEMO_INTERVIEW, demoMode: true });
      await kv.set(`pdf:text:${docId}`, { text: truncate(text || DEMO_PDF_TEXT, 20000) });
      const meta = (await kv.get(`pdf:meta:${docId}`)) ?? {};
      await kv.set(`pdf:meta:${docId}`, {
        ...meta,
        status: "ready",
        progress: 100,
        demoMode: true,
      });
      return;
    }

    // 1. Summary / Chapters
    const summaryRaw = await callGemini(`You are an expert study assistant. Analyze this document and produce a structured chapter-by-chapter summary.

Document text:
${ctx}

Return a JSON array of 3 to 5 chapters. Each chapter object must have exactly:
- "id": string like "ch1", "ch2" etc.
- "title": descriptive chapter title starting with "Chapter N:"
- "concepts": array of 4 to 6 key concept strings (short terms)
- "content": 3-5 sentence explanation of what the chapter covers, written for a student.

Return ONLY the JSON array. No markdown fences, no extra text.`);
    const chapters = parseGeminiJSON(summaryRaw, []);
    await kv.set(`pdf:summary:${docId}`, { chapters });

    // 2. Flashcards
    const flashcardsRaw = await callGemini(`Create 8 high-quality Anki-style flashcards based on this document.

Document text:
${ctx}

Return a JSON array of 8 objects, each with exactly:
- "id": string "1" through "8"
- "front": concise question or key term
- "back": comprehensive answer or definition (2-3 sentences)

Return ONLY the JSON array. No markdown fences.`);
    const flashcards = parseGeminiJSON(flashcardsRaw, []);
    await kv.set(`pdf:flashcards:${docId}`, { flashcards });

    // 3. MCQ Quiz
    const quizRaw = await callGemini(`Create 5 multiple-choice quiz questions based on this document.

Document text:
${ctx}

Return a JSON array of 5 objects, each with exactly:
- "id": string "1" through "5"
- "question": the full question text
- "options": array of exactly 4 answer strings
- "correctIndex": integer 0-3 (index of the correct answer in options)
- "explanation": one sentence explaining why the answer is correct

Return ONLY the JSON array. No markdown fences.`);
    const quiz = parseGeminiJSON(quizRaw, []);
    await kv.set(`pdf:quiz:${docId}:5:medium`, { questions: quiz });

    // 4. Interview Questions
    const interviewRaw = await callGemini(`Generate 5 technical interview questions based on this document.

Document text:
${ctx}

Return a JSON array of 5 objects, each with exactly:
- "id": string "iq1" through "iq5"
- "question": a detailed, open-ended technical interview question
- "answer": a comprehensive model answer of 3-5 sentences

Return ONLY the JSON array. No markdown fences.`);
    const interviewQs = parseGeminiJSON(interviewRaw, []);
    await kv.set(`pdf:interview:${docId}`, { questions: interviewQs });

    // 5. Store full text for chat and mark ready
    await kv.set(`pdf:text:${docId}`, { text: truncate(text, 20000) });
    const meta = (await kv.get(`pdf:meta:${docId}`)) ?? {};
    await kv.set(`pdf:meta:${docId}`, {
      ...meta,
      status: "ready",
      progress: 100,
    });
  } catch (err: unknown) {
    const { code, error, httpStatus } = geminiErrorResponse(err);
    console.error("[processPDFInBackground] Error:", error);
    const meta = (await kv.get(`pdf:meta:${docId}`)) ?? {};
    await kv.set(`pdf:meta:${docId}`, {
      ...meta,
      status: "error",
      errorMessage: error,
      errorCode: code,
      httpStatus,
    });
  }
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────

app.get("/make-server-32a97fea/health", (c) =>
  c.json({
    status: "ok",
    geminiConfigured: !config.demoMode,
    demoMode: config.demoMode,
    pdfrestConfigured: !!config.pdfrestApiKey,
    geminiModel: config.geminiModel,
  })
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

app.post("/make-server-32a97fea/auth/login", async (c) => {
  const body = await c.req.json();
  const { email } = body;
  const existing = await kv.get(`user:email:${email}`);
  if (!existing) return c.json({ error: "User not found" }, 404);
  return c.json({ user: existing, token: "mock-token" });
});

app.post("/make-server-32a97fea/auth/signup", async (c) => {
  const body = await c.req.json();
  const { name, email } = body;
  const userId = `user_${Date.now()}`;
  const user = {
    id: userId,
    name,
    email,
    track: "cybersecurity",
    weeklyGoalHours: 10,
    streak: 0,
    totalStudyHours: 0,
    xp: 0,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`user:${userId}`, user);
  await kv.set(`user:email:${email}`, user);
  return c.json({ user });
});

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

app.get("/make-server-32a97fea/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const user = await kv.get(`user:${userId}`);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user);
});

app.put("/make-server-32a97fea/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const updates = await c.req.json();
  const existing = (await kv.get(`user:${userId}`)) ?? {};
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await kv.set(`user:${userId}`, updated);
  return c.json(updated);
});

// ─── PROGRESS & ACTIVITY ──────────────────────────────────────────────────────

app.get("/make-server-32a97fea/progress/:userId", async (c) => {
  const userId = c.req.param("userId");
  const progress = (await kv.get(`progress:${userId}`)) ?? {
    weeklyData: [],
    subjectData: [],
    heatmap: [],
    weakTopics: [],
    totalStudyHours: 0,
    avgQuizScore: 0,
    quizzesTaken: 0,
    bestStreak: 0,
  };
  return c.json(progress);
});

app.post("/make-server-32a97fea/progress/:userId/activity", async (c) => {
  const userId = c.req.param("userId");
  const activity = await c.req.json();
  const existing = (await kv.get(`progress:${userId}`)) ?? {
    weeklyData: [],
    totalStudyHours: 0,
    avgQuizScore: 0,
    quizzesTaken: 0,
  };
  const updated = {
    ...existing,
    totalStudyHours:
      (existing.totalStudyHours || 0) + (activity.durationMinutes || 0) / 60,
    lastActivityAt: new Date().toISOString(),
  };
  if (activity.score !== undefined) {
    const prev = existing.avgQuizScore * existing.quizzesTaken;
    updated.quizzesTaken = (existing.quizzesTaken || 0) + 1;
    updated.avgQuizScore = (prev + activity.score) / updated.quizzesTaken;
  }
  await kv.set(`progress:${userId}`, updated);
  return c.json({ ok: true });
});

// ─── GOALS ────────────────────────────────────────────────────────────────────

app.get("/make-server-32a97fea/goals/:userId", async (c) => {
  const userId = c.req.param("userId");
  const goals = (await kv.get(`goals:${userId}`)) ?? [];
  return c.json(goals);
});

app.post("/make-server-32a97fea/goals/:userId", async (c) => {
  const userId = c.req.param("userId");
  const goal = await c.req.json();
  const goals = (await kv.get(`goals:${userId}`)) ?? [];
  const newGoal = {
    ...goal,
    id: `goal_${Date.now()}`,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  goals.push(newGoal);
  await kv.set(`goals:${userId}`, goals);
  return c.json(newGoal);
});

app.put("/make-server-32a97fea/goals/:userId/:goalId", async (c) => {
  const { userId, goalId } = c.req.param();
  const updates = await c.req.json();
  const goals = (await kv.get(`goals:${userId}`)) ?? [];
  const updated = goals.map((g: any) =>
    g.id === goalId ? { ...g, ...updates } : g
  );
  await kv.set(`goals:${userId}`, updated);
  return c.json({ ok: true });
});

app.delete("/make-server-32a97fea/goals/:userId/:goalId", async (c) => {
  const { userId, goalId } = c.req.param();
  const goals = (await kv.get(`goals:${userId}`)) ?? [];
  await kv.set(
    `goals:${userId}`,
    goals.filter((g: any) => g.id !== goalId),
  );
  return c.json({ ok: true });
});

// ─── MODULE 2: PDF LEARNING ENGINE ───────────────────────────────────────────

// POST /pdf/upload — accepts multipart/form-data with field "file"
app.post("/make-server-32a97fea/pdf/upload", async (c) => {
  const docId = `doc_${Date.now()}`;
  let filename = "document.pdf";
  let text = "";

  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
      filename = file.name || filename;

      if (!filename.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        return c.json({
          docId,
          status: "error",
          errorCode: "UNSUPPORTED_FORMAT",
          errorMessage: "Unsupported format. Only PDF files are accepted.",
        }, 400);
      }

      if (file.size > config.maxPdfBytes) {
        return c.json({
          docId,
          status: "error",
          errorCode: "FILE_TOO_LARGE",
          errorMessage: `File too large. Maximum PDF size is ${Math.round(config.maxPdfBytes / (1024 * 1024))}MB.`,
        }, 413);
      }

      const bytes = await file.arrayBuffer();

      // Store metadata as processing immediately
      await kv.set(`pdf:meta:${docId}`, {
        docId,
        filename,
        pageCount: 0,
        uploadedAt: new Date().toISOString(),
        status: "processing",
        progress: 10,
      });

      // Extract text via PDFrest (skip in demo mode if PDFrest unavailable)
      if (config.demoMode) {
        text = DEMO_PDF_TEXT;
      } else {
        text = await extractTextFromPDF(bytes, filename);
      }

      // Update progress
      await kv.set(`pdf:meta:${docId}`, {
        docId,
        filename,
        pageCount: Math.ceil(text.length / 2500), // rough estimate
        uploadedAt: new Date().toISOString(),
        status: "processing",
        progress: 30,
      });

      // Process AI content in background (non-blocking)
      processPDFInBackground(docId, text).catch((e) =>
        console.error("Background PDF processing failed:", e.message)
      );
    } else {
      // No file uploaded — mark as error
      await kv.set(`pdf:meta:${docId}`, {
        docId,
        filename,
        pageCount: 0,
        uploadedAt: new Date().toISOString(),
        status: "error",
        errorMessage: "No file received",
      });
    }
  } catch (err: unknown) {
    const { code, error } = geminiErrorResponse(err);
    console.error("[pdf/upload] Error:", error);
    await kv.set(`pdf:meta:${docId}`, {
      docId,
      filename,
      pageCount: 0,
      uploadedAt: new Date().toISOString(),
      status: "error",
      errorMessage: error,
      errorCode: code,
    });
  }

  const meta = await kv.get(`pdf:meta:${docId}`);
  return c.json(meta);
});

// GET /pdf/:docId/status
app.get("/make-server-32a97fea/pdf/:docId/status", async (c) => {
  const docId = c.req.param("docId");
  const meta = await kv.get(`pdf:meta:${docId}`);
  if (!meta) return c.json({ error: "Document not found" }, 404);
  return c.json({ status: meta.status, progress: meta.progress ?? 0, errorMessage: meta.errorMessage });
});

// GET /pdf/:docId/summary
app.get("/make-server-32a97fea/pdf/:docId/summary", async (c) => {
  const docId = c.req.param("docId");
  const cached = await kv.get(`pdf:summary:${docId}`);
  if (cached) return c.json(cached);
  return c.json({ error: "Summary not yet generated" }, 202);
});

// GET /pdf/:docId/flashcards
app.get("/make-server-32a97fea/pdf/:docId/flashcards", async (c) => {
  const docId = c.req.param("docId");
  const cached = await kv.get(`pdf:flashcards:${docId}`);
  if (cached) return c.json(cached);
  return c.json({ flashcards: [] });
});

// GET /pdf/:docId/quiz
app.get("/make-server-32a97fea/pdf/:docId/quiz", async (c) => {
  const docId = c.req.param("docId");
  const count = Number(c.req.query("count") ?? 5);
  const difficulty = c.req.query("difficulty") ?? "medium";
  const cacheKey = `pdf:quiz:${docId}:${count}:${difficulty}`;
  const cached = await kv.get(cacheKey);
  if (cached) return c.json(cached);
  return c.json({ questions: [] });
});

// GET /pdf/:docId/interview-questions
app.get("/make-server-32a97fea/pdf/:docId/interview-questions", async (c) => {
  const docId = c.req.param("docId");
  const cached = await kv.get(`pdf:interview:${docId}`);
  if (cached) return c.json(cached);
  return c.json({ questions: [] });
});

// POST /pdf/:docId/chat
app.post("/make-server-32a97fea/pdf/:docId/chat", async (c) => {
  const docId = c.req.param("docId");
  const { message, history } = await c.req.json();

  // Retrieve stored document text for context
  const stored = await kv.get(`pdf:text:${docId}`);
  const docText = stored?.text ? truncate(stored.text, 6000) : "No document context available.";

  // Build conversation history string
  const historyStr = (history ?? [])
    .slice(-6)
    .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  try {
    const reply = await callGemini(`You are an expert AI study tutor. Answer the student's question based on the document provided.
Always cite the relevant concept or section in your answer. Be concise but thorough.

Document context:
${docText}

${historyStr ? `Conversation history:\n${historyStr}\n` : ""}
Student question: ${message}

Reply directly and helpfully. Reference specific parts of the document when relevant.`);

    // Extract simple citations from reply
    const citations: string[] = [];
    const pageRefs = reply.match(/page\s*\d+/gi) ?? [];
    const sectionRefs = reply.match(/section\s*\d+/gi) ?? [];
    [...pageRefs, ...sectionRefs].forEach((ref) =>
      citations.push(`PDF ${ref}`)
    );

    return c.json({ reply, citations, demoMode: config.demoMode });
  } catch (err: unknown) {
    const { code, error } = geminiErrorResponse(err);
    if (config.demoMode) {
      return c.json({
        reply: "Demo mode: I would answer based on your uploaded PDF once GEMINI_API_KEY is configured.",
        citations: [],
        demoMode: true,
      });
    }
    return c.json({
      reply: `I encountered an error: ${error}`,
      citations: [],
      errorCode: code,
    }, code === "INVALID_API_KEY" ? 401 : code === "RATE_LIMIT" ? 429 : 500);
  }
});

// ─── MODULE 3: IMAGE / DIAGRAM ANALYZER ──────────────────────────────────────

// POST /image/analyze — accepts multipart/form-data with field "image" or "file"
app.post("/make-server-32a97fea/image/analyze", async (c) => {
  const analysisId = `img_${Date.now()}`;

  // Store initial processing state
  await kv.set(`image:${analysisId}`, {
    analysisId,
    status: "processing",
    annotations: [],
    explanations: [],
    notes: "",
    concepts: [],
    quiz: [],
    analyzedAt: new Date().toISOString(),
  });

  try {
    const formData = await c.req.formData();
    const file =
      (formData.get("image") as File | null) ??
      (formData.get("file") as File | null);

    if (!file || file.size === 0) {
      await kv.set(`image:${analysisId}`, {
        analysisId,
        status: "error",
        errorCode: "NO_FILE",
        errorMessage: "No image file received",
      });
      return c.json({ analysisId, status: "error", errorCode: "NO_FILE", errorMessage: "No image file received" }, 400);
    }

    const mimeType = (file.type || "image/png").toLowerCase();
    if (!config.supportedImageTypes.has(mimeType)) {
      await kv.set(`image:${analysisId}`, {
        analysisId,
        status: "error",
        errorCode: "UNSUPPORTED_FORMAT",
        errorMessage: `Unsupported image format "${mimeType}". Supported: PNG, JPEG, WebP, GIF.`,
      });
      return c.json({
        analysisId,
        status: "error",
        errorCode: "UNSUPPORTED_FORMAT",
        errorMessage: `Unsupported image format. Supported: PNG, JPEG, WebP, GIF.`,
      }, 400);
    }

    if (file.size > config.maxImageBytes) {
      await kv.set(`image:${analysisId}`, {
        analysisId,
        status: "error",
        errorCode: "FILE_TOO_LARGE",
        errorMessage: `Image too large. Maximum size is ${Math.round(config.maxImageBytes / (1024 * 1024))}MB.`,
      });
      return c.json({
        analysisId,
        status: "error",
        errorCode: "FILE_TOO_LARGE",
        errorMessage: `Image too large. Maximum size is ${Math.round(config.maxImageBytes / (1024 * 1024))}MB.`,
      }, 413);
    }

    const bytes = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(bytes);

    // Process in background
    (async () => {
      try {
        if (config.demoMode) {
          await kv.set(`image:${analysisId}`, {
            analysisId,
            status: "ready",
            demoMode: true,
            ...DEMO_IMAGE,
            analyzedAt: new Date().toISOString(),
          });
          return;
        }

        // 1. Identify components with coordinates
        const annotationRaw = await callGemini(
          `Analyze this diagram or image carefully. Identify the key components, nodes, or elements.

For each component you find, return a JSON array where each item has:
- "id": integer starting from 1
- "label": short name of the component (e.g., "Firewall", "Database", "Client")
- "color": a hex color code for this component (use varied, visually distinct colors)
- "x": approximate x position as a percentage (0-100) of image width where this label should be placed
- "y": approximate y position as a percentage (0-100) of image height where this label should be placed

Return ONLY the JSON array, no markdown fences.`,
          {
            imageBase64: base64,
            mimeType,
            model: config.geminiVisionModel,
          },
        );
        const annotations = parseGeminiJSON(annotationRaw, []);

        if (!Array.isArray(annotations) || annotations.length === 0) {
          throw new GeminiApiError(
            "NO_CONTENT_DETECTED",
            "No diagram components or readable text detected in this image.",
            422,
          );
        }

        // 2. Detailed explanations for each component
        const explanationRaw = await callGemini(
          `You previously identified these components in this diagram: ${annotations.map((a: any) => a.label).join(", ")}.

Now write a detailed technical explanation for each component.

Return a JSON array where each item has:
- "id": integer matching the component id
- "label": component name
- "color": same hex color as before
- "text": 2-3 sentence explanation of this component's role, function, and connections in the diagram

Return ONLY the JSON array, no markdown fences.`,
          {
            imageBase64: base64,
            mimeType,
            model: config.geminiVisionModel,
          },
        );
        const explanations = parseGeminiJSON(explanationRaw, []);

        // 3. Structured notes
        const notes = await callGemini(
          `Based on this diagram, write structured study notes.

Format:
- Start with the main topic (bold with **)
- List 4-6 key architectural/conceptual points as bullet points using "- **Label:** description" format
- Keep each point to one sentence

Return plain text only, no JSON.`,
          {
            imageBase64: base64,
            mimeType,
            model: config.geminiVisionModel,
          },
        );

        // 4. Key concepts
        const conceptsRaw = await callGemini(
          `List 10-15 key concepts, terms, or technologies visible or implied in this diagram.

Return a JSON array of strings only. Example: ["Load Balancer", "TCP/IP", "DMZ"]

Return ONLY the JSON array, no markdown fences.`,
          {
            imageBase64: base64,
            mimeType,
            model: config.geminiVisionModel,
          },
        );
        const concepts = parseGeminiJSON(conceptsRaw, []);

        // 5. MCQ Quiz
        const quizRaw = await callGemini(
          `Create 3 multiple-choice quiz questions based on this diagram.

Return a JSON array of 3 objects, each with exactly:
- "id": string "iq1", "iq2", "iq3"
- "question": the full question text
- "options": array of exactly 4 answer strings
- "correctIndex": integer 0-3
- "explanation": one sentence explanation

Return ONLY the JSON array, no markdown fences.`,
          {
            imageBase64: base64,
            mimeType,
            model: config.geminiVisionModel,
          },
        );
        const quiz = parseGeminiJSON(quizRaw, []);

        await kv.set(`image:${analysisId}`, {
          analysisId,
          status: "ready",
          annotations,
          explanations,
          notes,
          concepts,
          quiz,
          analyzedAt: new Date().toISOString(),
        });
      } catch (err: unknown) {
        const { code, error } = geminiErrorResponse(err);
        console.error("[image/analyze] Background error:", error);
        await kv.set(`image:${analysisId}`, {
          analysisId,
          status: "error",
          errorCode: code,
          errorMessage: error,
          annotations: [],
          explanations: [],
          notes: "",
          concepts: [],
          quiz: [],
        });
      }
    })();
  } catch (err: any) {
    console.error("[image/analyze] Upload error:", err.message);
    await kv.set(`image:${analysisId}`, {
      analysisId,
      status: "error",
      errorMessage: err.message,
    });
  }

  return c.json({ analysisId, status: "processing" });
});

// GET /image/:analysisId
app.get("/make-server-32a97fea/image/:analysisId", async (c) => {
  const analysisId = c.req.param("analysisId");
  const result = await kv.get(`image:${analysisId}`);
  if (!result) return c.json({ error: "Analysis not found" }, 404);
  return c.json(result);
});

// ─── MODULE 4: YOUTUBE ANALYZER ──────────────────────────────────────────────

// POST /youtube/analyze
app.post("/make-server-32a97fea/youtube/analyze", async (c) => {
  const { url } = await c.req.json();

  if (!url || typeof url !== "string") {
    return c.json({ error: "YouTube URL is required", errorCode: "INVALID_URL" }, 400);
  }

  // Extract video ID
  const videoId =
    url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/)?.[1] ?? "";
  if (!videoId || videoId.length !== 11) {
    return c.json({
      error: "Invalid YouTube URL. Use a link like https://youtube.com/watch?v=VIDEO_ID",
      errorCode: "INVALID_URL",
    }, 400);
  }

  const cacheKey = `youtube:${videoId}`;

  // Return cached if available
  const cached = await kv.get(cacheKey);
  if (cached) return c.json(cached);

  // Store initial state
  const initial = {
    videoId,
    url,
    title: "Analyzing...",
    channel: "",
    duration: "",
    status: "processing",
    timestamps: [],
    summary: "",
    topics: [],
    quiz: [],
    analyzedAt: new Date().toISOString(),
  };
  await kv.set(cacheKey, initial);

  // Background processing
  (async () => {
    try {
      if (config.demoMode) {
        await kv.set(cacheKey, {
          videoId,
          url,
          ...DEMO_YOUTUBE,
          status: "ready",
          topics: DEMO_YOUTUBE.timestamps.map((t) => t.topic),
          demoMode: true,
          analyzedAt: new Date().toISOString(),
        });
        return;
      }

      // 1. Fetch video metadata via oEmbed
      let title = "YouTube Video";
      let channel = "";
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          title = oembed.title ?? title;
          channel = oembed.author_name ?? "";
        }
      } catch { /* non-fatal */ }

      // 2. Fetch transcript via youtube-transcript
      let transcriptText = "";
      try {
        const { YoutubeTranscript } = await import("npm:youtube-transcript");
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcript
          .map((t: { offset: number; text: string }) =>
            `[${formatSeconds(t.offset / 1000)}] ${t.text}`
          )
          .join(" ");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("Transcript fetch failed:", msg);
        throw new GeminiApiError(
          "NO_CONTENT_DETECTED",
          "Could not fetch a transcript for this video. Captions may be disabled or unavailable.",
          422,
        );
      }

      if (!transcriptText.trim()) {
        throw new GeminiApiError(
          "NO_CONTENT_DETECTED",
          "No transcript content found for this video.",
          422,
        );
      }

      const ctx = truncate(transcriptText, 14000);
      await kv.set(`youtube:transcript:${videoId}`, { text: ctx });

      // 3. Generate timestamped notes
      const timestampsRaw = await callGemini(`You are an expert lecture analyst. Based on this YouTube video transcript, create 6-8 timestamped study notes.

Transcript:
${ctx}

Return a JSON array of 6-8 objects, each with exactly:
- "time": timestamp string in "M:SS" or "MM:SS" format extracted from the transcript
- "topic": short topic title (5-8 words)
- "note": 1-2 sentence key insight or takeaway from that part of the lecture

Return ONLY the JSON array, no markdown fences.`);
      const timestamps = parseGeminiJSON(timestampsRaw, []);

      // 4. Generate summary
      const summary = await callGemini(`Summarize this YouTube lecture for a student.

Transcript:
${ctx}

Write a structured summary with:
- ## Title of the Video
- A one-paragraph overview
- ### Main Topics Covered
- Bullet points (using "- **Topic:** explanation" format) for 4-6 key topics
- ### Key Insight
- One paragraph on the most important takeaway

Return plain text only, formatted with markdown headers and bullets.`);

      // 5. Generate quiz
      const quizRaw = await callGemini(`Create 5 multiple-choice quiz questions based on this YouTube lecture.

Transcript:
${ctx}

Return a JSON array of 5 objects, each with exactly:
- "id": string "yt1" through "yt5"
- "question": the full question (reference specific timestamps or topics when relevant)
- "options": array of exactly 4 answer strings
- "correctIndex": integer 0-3
- "explanation": one sentence explaining the correct answer

Return ONLY the JSON array, no markdown fences.`);
      const quiz = parseGeminiJSON(quizRaw, []);

      const result = {
        videoId,
        url,
        title,
        channel,
        duration: "",
        status: "ready",
        timestamps,
        summary,
        topics: timestamps.map((t: any) => t.topic),
        quiz,
        analyzedAt: new Date().toISOString(),
      };

      await kv.set(cacheKey, result);
    } catch (err: unknown) {
      const { code, error } = geminiErrorResponse(err);
      console.error("[youtube/analyze] Background error:", error);
      const existing = (await kv.get(cacheKey)) ?? initial;
      await kv.set(cacheKey, {
        ...existing,
        status: "error",
        errorMessage: error,
        errorCode: code,
      });
    }
  })();

  return c.json({ ...initial, demoMode: config.demoMode });
});

// GET /youtube/:videoId
app.get("/make-server-32a97fea/youtube/:videoId", async (c) => {
  const videoId = c.req.param("videoId");
  const result = await kv.get(`youtube:${videoId}`);
  if (!result) return c.json({ error: "Video analysis not found" }, 404);
  return c.json(result);
});

// POST /youtube/:videoId/chat — Q&A grounded in lecture transcript
app.post("/make-server-32a97fea/youtube/:videoId/chat", async (c) => {
  const videoId = c.req.param("videoId");
  const { message, history } = await c.req.json();

  const stored = await kv.get(`youtube:transcript:${videoId}`);
  const analysis = await kv.get(`youtube:${videoId}`);
  const transcript = stored?.text ?? analysis?.summary ?? "No transcript available.";

  const historyStr = (history ?? [])
    .slice(-6)
    .map((m: { role: string; content: string }) =>
      `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`
    )
    .join("\n");

  try {
    if (config.demoMode) {
      return c.json({
        reply:
          "Demo mode: configure GEMINI_API_KEY to chat about this lecture with AI grounded in the transcript.",
        demoMode: true,
      });
    }

    const reply = await callGemini(`You are an expert AI study tutor. Answer based on this YouTube lecture transcript.
Reference timestamps or topics when helpful. Be concise and pedagogical.

Transcript:
${truncate(transcript, 8000)}

${historyStr ? `Conversation history:\n${historyStr}\n` : ""}
Student question: ${message}

Reply directly.`);

    return c.json({ reply, demoMode: false });
  } catch (err: unknown) {
    const { code, error } = geminiErrorResponse(err);
    return c.json({ reply: `Error: ${error}`, errorCode: code }, code === "RATE_LIMIT" ? 429 : 500);
  }
});

// ─── AI TUTOR ─────────────────────────────────────────────────────────────────

app.post("/make-server-32a97fea/tutor/chat", async (c) => {
  const { userId, message, context, history } = await c.req.json();

  // Retrieve relevant context from KV if it's a docId or videoId
  let contextContent = `Topic: ${context}`;
  if (context?.startsWith("doc_")) {
    const stored = await kv.get(`pdf:text:${context}`);
    if (stored?.text) contextContent = `PDF Document:\n${truncate(stored.text, 4000)}`;
  } else if (context?.startsWith("youtube:")) {
    const videoId = context.replace("youtube:", "");
    const stored = await kv.get(`youtube:${videoId}`);
    if (stored?.summary) contextContent = `YouTube Lecture Summary:\n${stored.summary}`;
  }

  // Build history string
  const historyStr = (history ?? [])
    .slice(-8)
    .map((m: any) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  try {
    if (config.demoMode) {
      return c.json({
        reply:
          "Demo mode: configure GEMINI_API_KEY to use the live AI tutor. I can still help with general study tips!",
        suggestions: ["Explain with an example", "What should I study next?"],
        demoMode: true,
      });
    }

    const reply = await callGemini(`You are an expert AI study tutor. Be encouraging, pedagogical, and concise.
If asked for a quiz, provide one. If asked to explain, use analogies. Always relate to the student's study context.

Context:
${contextContent}

${historyStr ? `Conversation so far:\n${historyStr}\n` : ""}
Student: ${message}

Tutor:`);

    // Save to conversation history
    const convKey = `tutor:conv:${userId}`;
    const conv = (await kv.get(convKey)) ?? [];
    conv.push({ role: "user", content: message, timestamp: new Date().toISOString() });
    conv.push({ role: "assistant", content: reply, timestamp: new Date().toISOString() });
    if (conv.length > 50) conv.splice(0, conv.length - 50);
    await kv.set(convKey, conv);

    return c.json({
      reply,
      suggestions: [
        "Give me a quiz on this",
        "Explain with an example",
        "What should I study next?",
      ],
      demoMode: false,
    });
  } catch (err: unknown) {
    const { code, error } = geminiErrorResponse(err);
    return c.json({
      reply: `I'm having trouble connecting right now (${error}). Please check if GEMINI_API_KEY is configured.`,
      suggestions: [],
      errorCode: code,
    }, code === "INVALID_API_KEY" ? 401 : code === "RATE_LIMIT" ? 429 : 500);
  }
});

app.get("/make-server-32a97fea/tutor/history/:userId", async (c) => {
  const userId = c.req.param("userId");
  const history = (await kv.get(`tutor:conv:${userId}`)) ?? [];
  return c.json(history);
});

// ─── ROADMAP ──────────────────────────────────────────────────────────────────

app.get("/make-server-32a97fea/roadmap/:userId", async (c) => {
  const userId = c.req.param("userId");
  const user = await kv.get(`user:${userId}`);
  const track = user?.track ?? "cybersecurity";
  const roadmap = await kv.get(`roadmap:${track}`);
  if (roadmap) return c.json(roadmap);
  return c.json({ track, milestones: [] });
});

app.put(
  "/make-server-32a97fea/roadmap/:userId/milestone/:milestoneId",
  async (c) => {
    const { userId, milestoneId } = c.req.param();
    const { status } = await c.req.json();
    const key = `roadmap:progress:${userId}`;
    const existing = (await kv.get(key)) ?? {};
    existing[milestoneId] = status;
    await kv.set(key, existing);
    return c.json({ ok: true });
  },
);

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

Deno.serve(app.fetch);
