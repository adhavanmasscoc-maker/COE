// src/app/api/ai/config/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAknexAiConfig, invalidateAiConfigCache } from "@/lib/ai/aknexAiRouter";

export const dynamic = "force-dynamic";

/**
 * GET: Returns active dynamic AI configuration & routing status
 */
export async function GET() {
  try {
    const config = await getAknexAiConfig();

    return NextResponse.json({
      success: true,
      endpoint: config.endpoint,
      model: config.model,
      provider: config.provider,
      mode: config.mode,
      hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
      lastUpdated: config.lastFetched,
      poweredBy: "aknex-official.vercel.app",
    });
  } catch (error) {
    console.error("Failed to read AI config:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to read AI configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST: Dynamically updates fine-tuned AI endpoint, model ID, or API key in Turso libSQL
 * ZERO VERCEL REDEPLOYMENT REQUIRED!
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      endpoint,
      model,
      apiKey,
      mode, // "aknex_endpoint" | "gemini_direct" | "hybrid"
    } = body;

    const updates = [];

    if (endpoint !== undefined) {
      updates.push(
        db.systemSetting.upsert({
          where: { key: "aknex_ai_endpoint" },
          update: { value: (endpoint || "").trim() },
          create: {
            id: "setting_aknex_ai_endpoint",
            key: "aknex_ai_endpoint",
            value: (endpoint || "").trim(),
          },
        })
      );
    }

    if (model !== undefined) {
      updates.push(
        db.systemSetting.upsert({
          where: { key: "aknex_ai_model" },
          update: { value: (model || "gemini-1.5-flash").trim() },
          create: {
            id: "setting_aknex_ai_model",
            key: "aknex_ai_model",
            value: (model || "gemini-1.5-flash").trim(),
          },
        })
      );
    }

    if (apiKey !== undefined) {
      updates.push(
        db.systemSetting.upsert({
          where: { key: "aknex_ai_key" },
          update: { value: (apiKey || "").trim() },
          create: {
            id: "setting_aknex_ai_key",
            key: "aknex_ai_key",
            value: (apiKey || "").trim(),
          },
        })
      );
    }

    if (mode !== undefined) {
      updates.push(
        db.systemSetting.upsert({
          where: { key: "aknex_ai_mode" },
          update: { value: (mode || "hybrid").trim() },
          create: {
            id: "setting_aknex_ai_mode",
            key: "aknex_ai_mode",
            value: (mode || "hybrid").trim(),
          },
        })
      );
    }

    await Promise.all(updates);

    // Invalidate in-memory cache so changes take effect immediately
    invalidateAiConfigCache();

    const updatedConfig = await getAknexAiConfig();

    return NextResponse.json({
      success: true,
      message: "AKNEX AI routing configuration updated successfully in database. Zero Vercel redeployment required!",
      config: {
        endpoint: updatedConfig.endpoint,
        model: updatedConfig.model,
        provider: updatedConfig.provider,
        mode: updatedConfig.mode,
      },
    });
  } catch (error) {
    console.error("Failed to update AI config:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update AI configuration" },
      { status: 500 }
    );
  }
}

