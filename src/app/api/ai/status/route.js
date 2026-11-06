// src/app/api/ai/status/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAknexAiConfig } from "@/lib/ai/aknexAiRouter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check DB system setting first
    let dbSetting = null;
    try {
      dbSetting = await db.systemSetting.findUnique({
        where: { key: "ai_tutor_enabled" },
      });
    } catch {
      dbSetting = null;
    }

    let enabled = true;
    if (dbSetting) {
      enabled = dbSetting.value === "true" || dbSetting.value === "1";
    } else if (process.env.AI_FEATURE_ENABLED !== undefined) {
      enabled = process.env.AI_FEATURE_ENABLED !== "false" && process.env.AI_FEATURE_ENABLED !== "0";
    }

    const config = await getAknexAiConfig();
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

    return NextResponse.json({
      success: true,
      enabled,
      hasApiKey,
      poweredBy: "aknex-official.vercel.app",
      routing: {
        provider: config.provider,
        endpoint: config.endpoint,
        model: config.model,
        mode: config.mode,
      },
      models: {
        generative: config.model || "gemini-1.5-flash",
        embedding: "text-embedding-004",
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      enabled: true, // Default to true so student views are not blocked
      hasApiKey: false,
      error: error?.message,
    });
  }
}

