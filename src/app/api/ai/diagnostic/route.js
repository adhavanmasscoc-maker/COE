// src/app/api/ai/diagnostic/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { priorityRanking } from "@/lib/algorithms/priorityRanking";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rollNo = searchParams.get("rollNo") || "TN2026-0901";
    const subjectCode = searchParams.get("subjectCode") || "MAT-12";

    // 1. Fetch student profile
    const user = await db.user.findFirst({
      where: { username: rollNo },
      include: {
        profile: {
          include: {
            practiceAttempts: {
              where: { subjectCode },
              orderBy: { createdAt: "desc" },
              take: 5,
            },
            chapterProgress: {
              include: { chapter: true },
            },
          },
        },
      },
    });

    const studentName = user?.profile?.fullName || "Student";

    // Standard syllabus units for diagnostics
    const unitsMap = {
      "MAT-12": [
        { unit: 1, title: "Matrices & Determinants", titleTa: "அணிகள் & அணிக்கோவைகள்", weight: 85 },
        { unit: 2, title: "Complex Numbers", titleTa: "கலப்பு எண்கள்", weight: 70 },
        { unit: 3, title: "Theory of Equations", titleTa: "சமன்பாட்டியல்", weight: 65 },
        { unit: 5, title: "Analytical Geometry-II", titleTa: "இருபரிமாண பகுமுறை வடிவியல்-II", weight: 55 },
        { unit: 7, title: "Differential Calculus", titleTa: "வகை நுண்கணிதத்தின் பயன்பாடுகள்", weight: 45 },
        { unit: 11, title: "Probability Distributions", titleTa: "நிகழ்தகவு பரவல்கள்", weight: 60 },
      ],
      "CHE-12": [
        { unit: 1, title: "Metallurgy", titleTa: "உலோகவியல்", weight: 80 },
        { unit: 2, title: "p-Block Elements-I", titleTa: "p-தொகுதி தனிமங்கள்-I", weight: 60 },
        { unit: 6, title: "Solid State", titleTa: "திட நிலைமை", weight: 75 },
        { unit: 7, title: "Chemical Kinetics", titleTa: "வேதி வினைவேகவியல்", weight: 50 },
        { unit: 11, title: "Hydroxy Compounds & Ethers", titleTa: "ஹைட்ராக்ஸி சேர்மங்கள் & ஈதர்கள்", weight: 40 },
      ],
    };

    const targetUnits = unitsMap[subjectCode] || unitsMap["MAT-12"];

    // Identify weak units (lowest accuracy/weight)
    const sortedWeak = [...targetUnits].sort((a, b) => a.weight - b.weight);

    return NextResponse.json({
      success: true,
      studentName,
      subjectCode,
      weakestUnits: sortedWeak.slice(0, 3),
      allUnits: targetUnits,
      diagnosticSummary: {
        urgentChapter: sortedWeak[0]?.title,
        recommendedAction: `Focus 30 minutes on ${sortedWeak[0]?.title} before attending your next practice test.`,
        readinessScore: 68.5,
      },
      poweredBy: "aknex-official.vercel.app",
    });
  } catch (error) {
    console.error("Diagnostic route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Diagnostic failure" },
      { status: 500 }
    );
  }
}

