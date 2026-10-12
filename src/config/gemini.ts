
import "dotenv/config";
import type { GoogleGenAI } from "@google/genai" with { "resolution-mode": "import" };

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

let geminiPromise: Promise<GoogleGenAI> | undefined;

export function getGemini(): Promise<GoogleGenAI> {
  if (!geminiPromise) {
    geminiPromise = import("@google/genai").then(
      ({ GoogleGenAI }) =>
        new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY!,
        }),
    );
  }

  return geminiPromise;
}
