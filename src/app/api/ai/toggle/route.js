// src/app/api/ai/toggle/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const { enabled } = await request.json();
    const strVal = enabled ? "true" : "false";

    await db.systemSetting.upsert({
      where: { key: "ai_tutor_enabled" },
      update: { value: strVal },
      create: {
        id: "ai_tutor_setting",
        key: "ai_tutor_enabled",
        value: strVal,
      },
    });

    return NextResponse.json({
      success: true,
      enabled: Boolean(enabled),
      message: `AI Tutor feature is now ${enabled ? "ENABLED" : "DISABLED"} across the portal.`,
    });
  } catch (error) {
    console.error("Failed to toggle AI feature:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update setting" },
      { status: 500 }
    );
  }
}

