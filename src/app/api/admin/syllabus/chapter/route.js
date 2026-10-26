import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const body = await request.json();
    const { unitId, chapterNumber, title, description } = body;

    if (!unitId || !title) {
      return NextResponse.json(
        { error: "Unit ID and chapter title are required." },
        { status: 400 }
      );
    }

    const newChapter = await db.syllabusChapter.create({
      data: {
        unitId,
        chapterNumber: parseInt(chapterNumber || "1", 10),
        title: title.trim(),
        description: description ? description.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Chapter "${newChapter.title}" added to syllabus.`,
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Create syllabus chapter error:", error);
    return NextResponse.json(
      { error: "Failed to add chapter to database." },
      { status: 500 }
    );
  }
}
