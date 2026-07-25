import { config } from "./config.ts";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiApiError extends Error {
  constructor(
    public code:
      | "MISSING_API_KEY"
      | "INVALID_API_KEY"
      | "RATE_LIMIT"
      | "PAYLOAD_TOO_LARGE"
      | "UNSUPPORTED_FORMAT"
      | "NO_CONTENT_DETECTED"
      | "GEMINI_ERROR",
    message: string,
    public httpStatus = 500,
  ) {
    super(message);
    this.name = "GeminiApiError";
  }
}

export function assertGeminiConfigured(): void {
  if (config.demoMode) {
    throw new GeminiApiError(
      "MISSING_API_KEY",
      "GEMINI_API_KEY is not configured. Set it in .env or Supabase secrets to enable live AI analysis.",
      503,
    );
  }
}

function mapGeminiHttpError(status: number, body: string): GeminiApiError {
  const lower = body.toLowerCase();

  if (status === 401 || status === 403 || lower.includes("api key")) {
    return new GeminiApiError(
      "INVALID_API_KEY",
      "Invalid or unauthorized Gemini API key. Check GEMINI_API_KEY in your environment.",
      status,
    );
  }
  if (status === 429 || lower.includes("quota") || lower.includes("rate limit")) {
    return new GeminiApiError(
      "RATE_LIMIT",
      "Gemini API rate limit exceeded. Please wait a moment and try again.",
      429,
    );
  }
  if (status === 413 || lower.includes("too large") || lower.includes("payload")) {
    return new GeminiApiError(
      "PAYLOAD_TOO_LARGE",
      "The input is too large for the Gemini API. Try a smaller file or shorter document.",
      413,
    );
  }
  if (lower.includes("unsupported") || lower.includes("mime")) {
    return new GeminiApiError(
      "UNSUPPORTED_FORMAT",
      "Unsupported file or image format for Gemini.",
      400,
    );
  }

  return new GeminiApiError(
    "GEMINI_ERROR",
    `Gemini API error ${status}: ${body.slice(0, 300)}`,
    status,
  );
}

/** Encode binary data to base64 without blowing the call stack on large files. */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function callGemini(
  prompt: string,
  options?: {
    imageBase64?: string;
    mimeType?: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  assertGeminiConfigured();

  const parts: Array<Record<string, unknown>> = [];
  if (options?.imageBase64 && options?.mimeType) {
    parts.push({
      inline_data: { mime_type: options.mimeType, data: options.imageBase64 },
    });
  }
  parts.push({ text: prompt });

  const model = options?.model ?? config.geminiModel;
  const response = await fetch(
    `${GEMINI_BASE}/${model}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: options?.temperature ?? 0.4,
          maxOutputTokens: options?.maxOutputTokens ?? 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw mapGeminiHttpError(response.status, err);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text.trim()) {
    throw new GeminiApiError(
      "NO_CONTENT_DETECTED",
      "Gemini returned an empty response. The input may not contain readable text or diagram content.",
      422,
    );
  }

  return text;
}

export function parseGeminiJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```|```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.warn("Failed to parse Gemini JSON:", raw.slice(0, 200));
    return fallback;
  }
}

export function truncate(text: string, maxChars = 14000): string {
  return text.length > maxChars
    ? text.slice(0, maxChars) + "\n...[truncated]"
    : text;
}
