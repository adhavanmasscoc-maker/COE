// src/lib/ai/aknexAiRouter.js
import { db } from "@/lib/db";
import { getGeminiFlashModel } from "@/lib/ai/geminiClient";

// Short in-memory cache to prevent database load while allowing near-instant config changes
let cachedConfig = null;
let lastConfigFetch = 0;
const CONFIG_CACHE_TTL_MS = 15000; // 15 seconds: changes in DB reflect in 15s without redeploy

/**
 * Fetch dynamic AI configuration from Turso libSQL SystemSetting table
 * or fall back to environment variables.
 */
export async function getAknexAiConfig() {
  const now = Date.now();
  if (cachedConfig && now - lastConfigFetch < CONFIG_CACHE_TTL_MS) {
    return cachedConfig;
  }

  let dbEndpoint = null;
  let dbModel = null;
  let dbKey = null;
  let dbMode = null;

  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ["aknex_ai_endpoint", "aknex_ai_model", "aknex_ai_key", "aknex_ai_mode"],
        },
      },
    });

    for (const s of settings) {
      if (s.key === "aknex_ai_endpoint") dbEndpoint = s.value;
      if (s.key === "aknex_ai_model") dbModel = s.value;
      if (s.key === "aknex_ai_key") dbKey = s.value;
      if (s.key === "aknex_ai_mode") dbMode = s.value;
    }
  } catch (err) {
    // If DB read fails, use env vars
    console.warn("Could not read AI settings from DB, using env fallback:", err?.message);
  }

  const endpoint = dbEndpoint || process.env.AKNEX_AI_ENDPOINT || process.env.AKNEX_AI_API_URL || null;
  const model = dbModel || process.env.AKNEX_AI_MODEL || "gemini-1.5-flash";
  const apiKey = dbKey || process.env.AKNEX_AI_KEY || "";
  const mode = dbMode || process.env.AKNEX_AI_MODE || (endpoint ? "aknex_endpoint" : "gemini_direct");

  cachedConfig = {
    endpoint: endpoint ? endpoint.trim() : null,
    model: model ? model.trim() : "gemini-1.5-flash",
    apiKey: apiKey ? apiKey.trim() : "",
    mode, // "aknex_endpoint", "gemini_direct", "hybrid"
    provider: endpoint ? "aknex_endpoint" : "gemini_direct",
    lastFetched: now,
  };

  lastConfigFetch = now;
  return cachedConfig;
}

/**
 * Invalidate in-memory cache when settings are saved in admin UI
 */
export function invalidateAiConfigCache() {
  cachedConfig = null;
  lastConfigFetch = 0;
}

/**
 * Dispatches AI inference dynamically:
 * 1. Checks if a remote/fine-tuned AKNEX AI endpoint is configured.
 * 2. If configured, calls the remote endpoint over HTTP POST with full Socratic context.
 * 3. If remote fails, times out, or isn't set, falls back to direct Gemini 1.5 Flash.
 *
 * @param {Object} params
 * @returns {Promise<{ text: string, provider: string, model: string, endpoint?: string, latencyMs: number }>}
 */
export async function routeAiInference({
  systemPrompt = "",
  userPrompt = "",
  message = "",
  history = [],
  subjectCode = "MAT-12",
  language = "ta",
  mode = "chat",
  hintLevel = 1,
  studentName = "மாணவர்",
  currentQuestionContext = null,
  contextSnippet = "",
}) {
  const startTime = Date.now();
  const config = await getAknexAiConfig();

  // 1. Attempt External AKNEX AI Endpoint if configured
  if (config.endpoint && config.mode !== "gemini_direct") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second ceiling

      const headers = {
        "Content-Type": "application/json",
      };
      if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
        headers["x-api-key"] = config.apiKey;
      }

      const payload = {
        prompt: userPrompt,
        systemPrompt,
        message,
        history,
        subjectCode,
        language,
        mode,
        hintLevel,
        studentName,
        currentQuestionContext,
        contextSnippet,
        model: config.model,
      };

      const res = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.text ||
          data.reply ||
          data.content ||
          data.response?.text ||
          data.choices?.[0]?.message?.content ||
          "";

        if (replyText && typeof replyText === "string" && replyText.trim().length > 0) {
          return {
            text: replyText.trim(),
            provider: "aknex_endpoint",
            model: config.model,
            endpoint: config.endpoint,
            latencyMs: Date.now() - startTime,
          };
        }
      } else {
        console.warn(`AKNEX AI endpoint HTTP ${res.status}: falling back to direct Gemini.`);
      }
    } catch (endpointErr) {
      console.warn("AKNEX AI endpoint request failed, engaging direct Gemini fallback:", endpointErr?.message || endpointErr);
    }
  }

  // 2. Fallback: Direct Gemini API
  try {
    const modelInstance = getGeminiFlashModel(systemPrompt, config.model);

    let replyText = "";
    if (Array.isArray(history) && history.length > 0) {
      const validHistory = history
        .filter((h) => h.role === "user" || h.role === "model" || h.role === "assistant")
        .map((h) => ({
          role: h.role === "assistant" ? "model" : h.role,
          parts: [{ text: h.content }],
        }));

      const chatSession = modelInstance.startChat({ history: validHistory.slice(-6) });
      const res = await chatSession.sendMessage(userPrompt);
      replyText = res.response.text();
    } else {
      const res = await modelInstance.generateContent(userPrompt);
      replyText = res.response.text();
    }

    return {
      text: replyText.trim(),
      provider: "gemini_direct",
      model: config.model,
      latencyMs: Date.now() - startTime,
    };
  } catch (geminiErr) {
    console.warn("Direct Gemini inference failed:", geminiErr?.message || geminiErr);
    throw geminiErr; // Let caller catch and engage deterministic Socratic fallback
  }
}

