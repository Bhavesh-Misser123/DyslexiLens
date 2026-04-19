// lib/gemini.ts
import OpenAI from "openai";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "API key is not set. Add your K2 API key to .env.local as GEMINI_API_KEY",
    );
  }
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.k2think.ai/v1", // ← replace with the actual K2 base URL
  });
}

const SYSTEM_PROMPT = `
You are a reading accessibility assistant that helps people with dyslexia understand text.

Your ONLY job is to transform the user's input text into a structured JSON object. 
Return ONLY valid JSON. No preamble. No explanation. No markdown fences.

Follow these rules precisely:
1. PRESERVE all factual meaning — never add or invent information.
2. SIMPLIFY language to approximately a 6th-grade reading level.
3. Use short sentences (max 15 words each) in simplified_text.
4. SPLIT text into chunked_lines — each line should be ONE complete thought, 
   5-12 words long. These will be displayed one at a time for focus reading.
5. IDENTIFY up to 10 words that a person with reading difficulties might struggle with.
6. For each hard word: give a simple 1-sentence meaning, break it into syllables,
   write a phonetic pronunciation guide, and write an easy example sentence.
7. PROVIDE 2-4 specific reading tips relevant to this particular text content.
8. The title should be 3-6 words describing what the text is about.

Return this exact JSON shape and nothing else:
{
  "title": "string",
  "simplified_text": "string",
  "chunked_lines": ["string"],
  "hard_words": [
    {
      "word": "string",
      "simple_meaning": "string",
      "syllables": ["string"],
      "pronunciation": "string",
      "example_sentence": "string"
    }
  ],
  "reading_tips": ["string"]
}
`.trim();

export async function processTextWithGemini(rawText: string): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "MBZUAI-IFM/K2-Think-v2", // ← replace with the exact model name K2 uses
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Here is the text to transform:\n\n${rawText}` },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("K2 returned an empty response.");
  console.log("[k2] Raw response:", text);
  return text;
}
