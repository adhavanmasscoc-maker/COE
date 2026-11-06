// src/app/api/ai/tutor/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai/geminiClient";
import { routeAiInference } from "@/lib/ai/aknexAiRouter";
import { searchSimilarChunks } from "@/lib/ai/vectorStore";
import { searchAcademicEntities, formatEntityForGemini, getAcademicEntity } from "@/lib/ai/jsonDb";
import { aiResponseCache } from "@/lib/ai/lruCache";
import { serializeForAiContext, compressSyllabusChunk } from "@/lib/types/academicSchema";
import {
  buildSystemPrompt,
  buildHintPrompt,
  generateDeterministicHint,
} from "@/lib/ai/promptTemplates";

export async function POST(request) {
  const steps = [];

  try {
    const body = await request.json();
    const {
      questionId,
      studentChoice = "none",
      lang,
      message = "",
      subjectCode: rawSubjectCode = "MAT-12",
      currentQuestionContext: rawContext = null,
      language: rawLang = "ta",
      history = [],
      mode = "chat", // "chat", "hint", "diagnostic", "level_1", "level_2", "level_3"
      hintLevel = 1,
      studentName = "மாணவர்",
    } = body;

    const language = lang || rawLang || "ta";
    let subjectCode = rawSubjectCode;
    let currentQuestionContext = rawContext;

    // 0. Cache Key Check (Identical question/query + studentChoice + language + mode)
    const cacheKey = questionId
      ? `${questionId}:${studentChoice}:${language}:${mode}`
      : `${subjectCode}:${message}:${language}:${mode}`;

    const cachedResponse = aiResponseCache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        text: cachedResponse,
        cached: true,
        steps: [
          {
            id: "cache",
            label: language === "ta" ? "⚡ நினைவகத்திலிருந்து உடனடியாக மீட்டெடுக்கப்பட்டது (LRU Cache)" : "⚡ Retrieved from zero-waste LRU memory cache",
            timestamp: Date.now(),
          },
        ],
      });
    }

    // Look up question if questionId is provided without full context
    if (questionId && !currentQuestionContext) {
      const entity = getAcademicEntity(questionId);
      if (entity && entity.questionPayload) {
        currentQuestionContext = {
          id: entity.id,
          questionText: language === "ta" ? (entity.questionPayload.questionTa || entity.questionPayload.questionEn) : entity.questionPayload.questionEn,
          options: entity.questionPayload.options,
          correctAnswer: entity.questionPayload.correctAnswer,
          userAnswer: studentChoice,
          topic: entity.topic,
        };
        subjectCode = entity.subjectCode || subjectCode;
      }
    }

    // 1. Check feature toggle
    const setting = await db.systemSetting.findUnique({
      where: { key: "ai_tutor_enabled" },
    }).catch(() => null);

    if (setting && setting.value === "false") {
      return NextResponse.json({
        success: false,
        disabled: true,
        error: language === "ta"
          ? "AI ஆசிரியர் தற்காலிகமாக தேர்வு கட்டுப்பாட்டாளரால் (COE) முடக்கப்பட்டுள்ளது."
          : "AI Tutor is temporarily disabled by the Controller of Examinations.",
      }, { status: 403 });
    }

    steps.push({
      id: "scan",
      label: language === "ta" ? "🔍 தமிழ்நாடு பாடத்திட்டம் ஸ்கேன் செய்யப்படுகிறது..." : "🔍 Scanning Samacheer Kalvi syllabus...",
      timestamp: Date.now(),
    });

    // 2. Vector search & syllabus retrieval
    const queryForSearch = currentQuestionContext?.questionText || message || subjectCode;
    let queryEmbedding = null;

    try {
      queryEmbedding = await generateEmbedding(queryForSearch);
      steps.push({
        id: "vector",
        label: language === "ta" ? "⚡ 768-பரிமாண திசையன் தொடர்பு கணக்கிடப்பட்டது" : "⚡ 768-dim vector embedding generated",
        timestamp: Date.now(),
      });
    } catch {
      // Embedding fallback to keyword matching
      queryEmbedding = null;
    }

    const matchedChunks = await searchSimilarChunks(
      db,
      subjectCode,
      queryEmbedding,
      3,
      queryForSearch
    );

    steps.push({
      id: "chunks",
      label: language === "ta"
        ? `📑 ${matchedChunks.length} பாடப்புத்தக பகுதிகள் கண்டறியப்பட்டன`
        : `📑 ${matchedChunks.length} syllabus reference chunks retrieved`,
      timestamp: Date.now(),
    });

    // Ingest structured academic context from json-db
    const structuredEntities = searchAcademicEntities(subjectCode, queryForSearch, { limit: 2 });
    const structuredContext = structuredEntities
      .map((e) => formatEntityForGemini(e, language))
      .filter(Boolean)
      .join("\n\n---\n\n");

    const contextSnippet = [
      matchedChunks
        .map(
          (c) =>
            `[Unit ${c.unitNumber}: ${c.chunkTitle}]\n` +
            (language === "ta" ? c.contentTa : c.contentEn)
        )
        .join("\n\n"),
      structuredContext,
    ]
      .filter(Boolean)
      .join("\n\n=== VERIFIED AI JSON-DB KNOWLEDGE ===\n\n");

    // 3. Construct prompt
    const systemPrompt = buildSystemPrompt({
      studentName,
      language,
      subjectCode,
    });

    let userPrompt = "";
    if (mode === "hint" && currentQuestionContext) {
      userPrompt = buildHintPrompt({
        studentName,
        subjectCode,
        questionText: currentQuestionContext.questionText,
        options: currentQuestionContext.options,
        userAnswer: currentQuestionContext.userAnswer,
        hintLevel: Number(hintLevel) || 1,
        language,
      });
    } else {
      // Detect simple/casual intent to avoid injecting irrelevant syllabus context
      const lowerMsg = (message || "").toLowerCase().trim();
      const isGreeting = /^(hi|hello|hey|வணக்கம்|helo|hai|good\s*(morning|evening|night)|sup|yo)[\s!?.]*$/.test(lowerMsg);
      const isSimpleArithmetic = /^\d+\s*[\+\-\*\/]\s*\d+[\s=?]*$/.test(lowerMsg);

      if (isGreeting) {
        userPrompt = `The student just greeted you. Reply ONLY with a brief, warm, friendly greeting — 1-2 sentences max. Do NOT include any formulas, textbook references, or academic content. Just say hi back naturally.
Student name: ${studentName}
Language: ${language}`;
      } else if (isSimpleArithmetic) {
        userPrompt = `The student asked: "${message}". Answer directly and concisely. Do NOT add textbook context or formulas beyond what's needed.
Student name: ${studentName}
Language: ${language}`;
      } else {
        userPrompt = `
Student Name: ${studentName}
Subject: ${subjectCode}
Question or Context: ${currentQuestionContext ? JSON.stringify(currentQuestionContext) : "None"}
Syllabus References:
${contextSnippet || "Official Samacheer Kalvi Class 10/12 Core Concepts"}

Student Message: "${message}"

Provide a focused, helpful response. If the message is a subject question, give Socratic step-by-step guidance using KaTeX math ($...$). If it is a simple or general question, answer directly without injecting formulas.
`.trim();
      }
    }

    steps.push({
      id: "generate",
      label: language === "ta"
        ? "🧠 சோக்ரடீஸ் கற்பித்தல் முறை மூலம் விடை தொகுக்கப்படுகிறது..."
        : "🧠 Formulating Socratic explanation & KaTeX math...",
      timestamp: Date.now(),
    });

    let finalReply = "";
    let aiProvider = "gemini_direct";
    let aiModel = "gemini-1.5-flash";
    let aiEndpoint = null;

    // 4. Invoke Dynamic AKNEX AI Router (with direct Gemini and offline deterministic fallbacks)
    try {
      const inferenceResult = await routeAiInference({
        systemPrompt,
        userPrompt,
        message,
        history,
        subjectCode,
        language,
        mode,
        hintLevel,
        studentName,
        currentQuestionContext,
        contextSnippet,
      });

      finalReply = inferenceResult.text;
      aiProvider = inferenceResult.provider;
      aiModel = inferenceResult.model;
      aiEndpoint = inferenceResult.endpoint || null;
    } catch (genErr) {
      console.warn("AI routing inference failed, engaging deterministic fallback:", genErr?.message || genErr);
      aiProvider = "deterministic_fallback";

      // Detect simple/casual messages — no formula dump for these
      const lowerMsg = (message || "").toLowerCase().trim();
      const isGreeting = /^(hi|hello|hey|வணக்கம்|helo|hai|good\s*(morning|evening|night)|sup|yo)[\s!?.]*$/.test(lowerMsg);
      const isSimpleMath = /^\d+\s*[\+\-\*\/]\s*\d+[\s=?]*$/.test(lowerMsg);
      const isShortQuery = lowerMsg.length < 15 && !currentQuestionContext;

      if (isGreeting) {
        finalReply = language === "ta"
          ? `வணக்கம் ${studentName}! 😊 உங்கள் சமச்சீர் கல்வி சந்தேகங்களை கேளுங்கள்.`
          : `Hi ${studentName}! 😊 Ask me anything about your Samacheer Kalvi syllabus.`;
      } else if (isSimpleMath) {
        // Evaluate simple arithmetic safely
        try {
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${lowerMsg.replace(/[^0-9+\-*/\s().]/g, "")})`)();
          finalReply = language === "ta"
            ? `${studentName}, விடை: **${result}** ✓`
            : `${studentName}, the answer is **${result}** ✓`;
        } catch {
          finalReply = language === "ta"
            ? `${studentName}, அந்த கணக்கை சரிபார்க்க முடியவில்லை.`
            : `${studentName}, I couldn't evaluate that expression.`;
        }
      } else if (isShortQuery) {
        finalReply = language === "ta"
          ? `${studentName}, கொஞ்சம் விரிவாக கேளுங்கள் — எந்த பாடம் அல்லது வினா என்று சொல்லுங்கள்!`
          : `${studentName}, could you elaborate a bit more? Let me know the subject or specific question!`;
      } else if (mode === "hint" && currentQuestionContext) {
        finalReply = generateDeterministicHint({
          studentName,
          subjectCode,
          questionText: currentQuestionContext.questionText,
          hintLevel: Number(hintLevel) || 1,
          language,
          matchedChunk: matchedChunks[0] || null,
        });
      } else {
        const refText = matchedChunks[0]
          ? (language === "ta" ? matchedChunks[0].contentTa : matchedChunks[0].contentEn)
          : "";

        finalReply = language === "ta"
          ? `${studentName}, தமிழ்நாடு சமச்சீர் கல்வி பாடத்திட்டத்தின்படி உங்கள் கேள்விக்கு பதிலளிக்கிறேன்.${refText ? `\n\n> **பாடப்பகுதி குறிப்பு:**\n> ${refText.slice(0, 300)}` : ""}\n\nமேலும் விவரமாக கேட்டால் படிப்படியான விளக்கம் தருகிறேன்!`
          : `${studentName}, I'm here to help with your Samacheer Kalvi syllabus.${refText ? `\n\n> **Textbook Reference:**\n> ${refText.slice(0, 300)}` : ""}\n\nAsk a specific question for a step-by-step explanation!`;
      }
    }

    steps.push({
      id: "complete",
      label: language === "ta"
        ? "✨ விளக்கம் வெற்றிகரமாக தயாரிக்கப்பட்டது"
        : "✨ Socratic explanation verified & completed",
      timestamp: Date.now(),
    });

    // Store in LRU cache
    if (finalReply && cacheKey) {
      aiResponseCache.set(cacheKey, finalReply);
    }

    return NextResponse.json({
      success: true,
      text: finalReply,
      reply: finalReply,
      cached: false,
      provider: aiProvider,
      model: aiModel,
      endpoint: aiEndpoint,
      sources: matchedChunks.map((c) => ({
        unit: c.unitNumber,
        title: c.chunkTitle,
        similarity: Math.round((c.similarity || 0) * 100),
      })),
      steps,
      poweredBy: "aknex-official.vercel.app",
    });
  } catch (error) {
    console.error("AI Tutor API route exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process tutor query",
        steps,
      },
      { status: 500 }
    );
  }
}

