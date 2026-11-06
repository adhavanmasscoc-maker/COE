// src/lib/ai/geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Checks whether the AI tutor and embedding feature is enabled.
 */
export function isAiFeatureEnabled() {
  const envVal = process.env.AI_FEATURE_ENABLED;
  if (envVal === "false" || envVal === "0" || envVal === "off") {
    return false;
  }
  return true;
}

/**
 * Generative Model: Gemini 1.5 Flash (with fallback to 2.0 Flash)
 * Handles Socratic tutoring, diagnostic post-mortems, and dynamic question synthesis.
 *
 * @param {string} customSystemInstruction
 * @returns GenerativeModel
 */
export function getGeminiFlashModel(customSystemInstruction = "") {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in your environment.");
  }

  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: customSystemInstruction || undefined,
    generationConfig: {
      temperature: 0.3, // Lower temperature to minimize hallucination on exam facts
      topP: 0.8,
      maxOutputTokens: 1500,
    },
  });
}

/**
 * Embedding Model: text-embedding-004
 * Generates 768-dimensional normalized float vectors for syllabus retrieval.
 *
 * @param {string} text - The input chunk or question to vectorize.
 * @returns {Promise<number[]>} - Array of 768 floating-point numbers.
 */
export async function generateEmbedding(text) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text.slice(0, 2048));
    return result.embedding.values;
  } catch (error) {
    console.error("text-embedding-004 generation failed:", error?.message || error);
    throw error;
  }
}

