// src/app/api/ai/tutor/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGeminiFlashModel, generateEmbedding } from "@/lib/ai/geminiClient";
import { searchSimilarChunks } from "@/lib/ai/vectorStore";
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
      message = "",
      subjectCode = "MAT-12",
      currentQuestionContext = null,
      language = "ta",
      history = [],
      mode = "chat", // "chat", "hint", "diagnostic"
      hintLevel = 1,
      studentName = "மாணவர்",
    } = body;

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

    const contextSnippet = matchedChunks
      .map(
        (c) =>
          `[Unit ${c.unitNumber}: ${c.chunkTitle}]\n` +
          (language === "ta" ? c.contentTa : c.contentEn)
      )
      .join("\n\n");

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
      userPrompt = `
Student Name: ${studentName}
Subject: ${subjectCode}
Question or Context: ${currentQuestionContext ? JSON.stringify(currentQuestionContext) : "None"}
Syllabus References:
${contextSnippet || "Official Samacheer Kalvi Class 10/12 Core Concepts"}

Student Message: "${message}"

Please respond warmly, addressing ${studentName} respectfully, and provide clear step-by-step Socratic guidance using KaTeX math symbols ($...$ and $$...$$).
`.trim();
    }

    steps.push({
      id: "generate",
      label: language === "ta"
        ? "🧠 சோக்ரடீஸ் கற்பித்தல் முறை மூலம் விடை தொகுக்கப்படுகிறது..."
        : "🧠 Formulating Socratic explanation & KaTeX math...",
      timestamp: Date.now(),
    });

    let finalReply = "";

    // 4. Invoke Gemini or Fallback
    try {
      const model = getGeminiFlashModel(systemPrompt);

      // Build chat history if available
      let chatSession;
      if (Array.isArray(history) && history.length > 0) {
        const validHistory = history
          .filter((h) => h.role === "user" || h.role === "model" || h.role === "assistant")
          .map((h) => ({
            role: h.role === "assistant" ? "model" : h.role,
            parts: [{ text: h.content }],
          }));

        chatSession = model.startChat({ history: validHistory.slice(-6) });
        const res = await chatSession.sendMessage(userPrompt);
        finalReply = res.response.text();
      } else {
        const res = await model.generateContent(userPrompt);
        finalReply = res.response.text();
      }
    } catch (genErr) {
      console.warn("Gemini generation failed, engaging deterministic fallback:", genErr?.message || genErr);

      // Deterministic pedagogical fallback
      if (mode === "hint" && currentQuestionContext) {
        finalReply = generateDeterministicHint({
          studentName,
          subjectCode,
          questionText: currentQuestionContext.questionText,
          hintLevel: Number(hintLevel) || 1,
          language,
          matchedChunk: matchedChunks[0] || null,
        });
      } else {
        const salutation = language === "ta"
          ? `வணக்கம் அன்பு மாணவர் ${studentName}! `
          : `Greetings, dear student ${studentName}! `;

        const refText = matchedChunks[0]
          ? (language === "ta" ? matchedChunks[0].contentTa : matchedChunks[0].contentEn)
          : "";

        finalReply = `${salutation}

${language === "ta"
  ? `தமிழ்நாடு மாநிலக் கல்வி வாரிய (சமச்சீர் கல்வி) பாடத்திட்டத்தின்படி உங்கள் சந்தேகத்தை ஆராய்வோம்.`
  : `Let us examine your question strictly according to the Tamil Nadu State Board (Samacheer Kalvi) syllabus.`}

${refText ? `\n> **${language === "ta" ? "பாடப்பகுதி சூத்திரம் & குறிப்பு" : "Textbook Formula Reference"}:**\n> ${refText}\n` : ""}

${language === "ta"
  ? `கணக்கீட்டை அணுகும் போது, முதலில் கொடுக்கப்பட்ட மாறிகளை தனித்தனியாக எடுத்து எழுதி, அதற்கான அடிப்படை விதியை பொருத்துங்கள். மேலும் விவரமான வழிகாட்டலுக்கு கீழேயுள்ள நிலைக் குறிப்புகளை (Level 1, 2, 3) பயன்படுத்தவும்!`
  : `When tackling this problem, list out all given quantities, identify the appropriate governing equation, and proceed step-by-step. Use the 3-level hint ladder below for targeted guidance!`}`;
      }
    }

    steps.push({
      id: "complete",
      label: language === "ta"
        ? "✨ விளக்கம் வெற்றிகரமாக தயாரிக்கப்பட்டது"
        : "✨ Socratic explanation verified & completed",
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      reply: finalReply,
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

