/**
 * Environment configuration loader for the AI Study Assistant backend.
 * Validates required keys at startup and surfaces clear errors (never silent).
 */

const PLACEHOLDER_VALUES = new Set(["", "your_key_here", "your_pdfrest_key_here"]);

function readEnv(name: string): string {
  return (Deno.env.get(name) ?? "").trim();
}

export interface AppConfig {
  geminiApiKey: string;
  pdfrestApiKey: string;
  geminiModel: string;
  geminiVisionModel: string;
  demoMode: boolean;
  maxPdfBytes: number;
  maxImageBytes: number;
  supportedImageTypes: ReadonlySet<string>;
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_VALUES.has(value);
}

export function loadConfig(): AppConfig {
  const geminiApiKey = readEnv("GEMINI_API_KEY");
  const pdfrestApiKey = readEnv("PDFREST_API_KEY");
  const allowDemoMode = readEnv("ALLOW_DEMO_MODE") === "true";
  const demoMode = isPlaceholder(geminiApiKey);

  if (demoMode) {
    const message =
      "GEMINI_API_KEY is missing or not configured. " +
      "Set GEMINI_API_KEY in Supabase Edge Function secrets (supabase secrets set GEMINI_API_KEY=...) " +
      "or in your local .env file. " +
      "AI modules (PDF, Image, YouTube) will use demo/offline responses until a valid key is provided.";

    if (!allowDemoMode) {
      throw new Error(message);
    }

    console.error(`\n[CONFIG ERROR] ${message}\n`);
  }

  if (isPlaceholder(pdfrestApiKey)) {
    console.warn(
      "[CONFIG WARN] PDFREST_API_KEY is not configured. PDF text extraction may fail for uploaded documents.",
    );
  }

  return {
    geminiApiKey,
    pdfrestApiKey,
    geminiModel: readEnv("GEMINI_MODEL") || "gemini-1.5-flash",
    geminiVisionModel: readEnv("GEMINI_VISION_MODEL") || "gemini-1.5-flash",
    demoMode,
    maxPdfBytes: 50 * 1024 * 1024,
    maxImageBytes: 10 * 1024 * 1024,
    supportedImageTypes: new Set([
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ]),
  };
}

export const config = loadConfig();
