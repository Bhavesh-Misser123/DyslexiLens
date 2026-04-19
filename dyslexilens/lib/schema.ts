// lib/schema.ts
// ─────────────────────────────────────────────────────────────
// Runtime validation for the Gemini JSON response.
// We don't use a schema library to keep dependencies lean.
// ─────────────────────────────────────────────────────────────

import type { DyslexiaResult, HardWord } from "@/types/dyslexia";

/** Safe fallback returned when parsing fails */
export const FALLBACK_RESULT: DyslexiaResult = {
  title:           "Could not process text",
  simplified_text: "We had trouble processing your text. Please try again.",
  chunked_lines:   ["We had trouble processing your text.", "Please try again."],
  hard_words:      [],
  reading_tips:    ["Try uploading a clearer image with good lighting."],
};

function stripCodeFences(raw: string): string {
  // Remove <think>...</think> blocks if present
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Remove markdown code fences
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // K2 sometimes outputs reasoning text then multiple JSON blocks.
  // Find the LAST valid {...} block in the response.
  const matches = [...cleaned.matchAll(/\{[\s\S]*?\}(?=\s*$|\s*\{)/g)];
  
  // Walk backwards through the string to find the last top-level { ... }
  let depth = 0;
  let end = -1;
  let start = -1;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (cleaned[i] === "}") {
      if (depth === 0) end = i;
      depth++;
    } else if (cleaned[i] === "{") {
      depth--;
      if (depth === 0) {
        start = i;
        break;
      }
    }
  }

  if (start !== -1 && end !== -1) {
    return cleaned.slice(start, end + 1);
  }

  return cleaned;
}

/** Type-guard: checks a single HardWord object */
function isHardWord(obj: unknown): obj is HardWord {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.word             === "string" &&
    typeof o.simple_meaning   === "string" &&
    Array.isArray(o.syllables) &&
    typeof o.pronunciation    === "string" &&
    typeof o.example_sentence === "string"
  );
}

/** Type-guard: checks the full DyslexiaResult shape */
function isDyslexiaResult(obj: unknown): obj is DyslexiaResult {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.title            === "string" &&
    typeof o.simplified_text  === "string" &&
    Array.isArray(o.chunked_lines) &&
    (o.chunked_lines as unknown[]).every((l) => typeof l === "string") &&
    Array.isArray(o.hard_words) &&
    (o.hard_words as unknown[]).every(isHardWord) &&
    Array.isArray(o.reading_tips) &&
    (o.reading_tips as unknown[]).every((t) => typeof t === "string")
  );
}

/**
 * Parses the raw Gemini text response into a validated DyslexiaResult.
 * Returns FALLBACK_RESULT if anything is malformed.
 */
export function parseGeminiResponse(raw: string): DyslexiaResult {
  try {
    const cleaned = stripCodeFences(raw);
    const parsed  = JSON.parse(cleaned);

    if (isDyslexiaResult(parsed)) {
      return parsed;
    }

    console.warn("[schema] Gemini response failed type-guard. Raw:", raw);
    return FALLBACK_RESULT;
  } catch (err) {
    console.error("[schema] JSON parse error:", err);
    return FALLBACK_RESULT;
  }
}
