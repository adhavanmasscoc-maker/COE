import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT" || !session.profileId) {
      return NextResponse.json(
        { error: "Student authentication required to track study progress." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chapterId, isCompleted } = body;

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required." }, { status: 400 });
    }

    const progress = await db.chapterProgress.upsert({
      where: {
        studentId_chapterId: {
          studentId: session.profileId,
          chapterId,
        },
      },
      update: {
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        studentId: session.profileId,
        chapterId,
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      chapterId: progress.chapterId,
      isCompleted: progress.isCompleted,
      message: isCompleted ? "Chapter marked as completed!" : "Chapter marked as pending revision.",
    });
  } catch (error) {
    console.error("Chapter progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update study progress in database." },
      { status: 500 }
    );
  }
}
