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
    const {
      subjectId,
      prepClass,
      examYear,
      title,
      board = "Tamil Nadu State Board",
      sourceInfo,
      paperType = "PUBLIC_EXAM",
      maxMarks = 100,
      durationMinutes = 150,
      isPublished = false,
    } = body;

    if (!subjectId || !title || !examYear) {
      return NextResponse.json(
        { error: "Subject, title, and exam year are required." },
        { status: 400 }
      );
    }

    const newPaper = await db.questionPaper.create({
      data: {
        subjectId,
        prepClass: parseInt(prepClass, 10),
        examYear: parseInt(examYear, 10),
        title: title.trim(),
        board: board.trim(),
        sourceInfo: sourceInfo ? sourceInfo.trim() : "Directorate of Government Examinations (DGE), Tamil Nadu",
        paperType,
        maxMarks: parseInt(maxMarks, 10),
        durationMinutes: parseInt(durationMinutes, 10),
        isPublished: Boolean(isPublished),
      },
      include: {
        subject: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Question paper "${newPaper.title}" added successfully.`,
      paper: newPaper,
    });
  } catch (error) {
    console.error("Create question paper error:", error);
    return NextResponse.json(
      { error: "Failed to create question paper in database." },
      { status: 500 }
    );
  }
}
