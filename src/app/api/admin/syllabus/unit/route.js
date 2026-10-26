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
    const { subjectId, unitNumber, title } = body;

    if (!subjectId || !title) {
      return NextResponse.json(
        { error: "Subject ID and unit title are required." },
        { status: 400 }
      );
    }

    const newUnit = await db.syllabusUnit.create({
      data: {
        subjectId,
        unitNumber: parseInt(unitNumber || "1", 10),
        title: title.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Unit "${newUnit.title}" created successfully.`,
      unit: newUnit,
    });
  } catch (error) {
    console.error("Create syllabus unit error:", error);
    return NextResponse.json(
      { error: "Failed to create syllabus unit in database." },
      { status: 500 }
    );
  }
}
