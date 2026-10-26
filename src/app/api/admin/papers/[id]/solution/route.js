import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id: questionPaperId } = params;
    const body = await request.json();
    const { title, content, solutionType = "TEXT_STEP_BY_STEP", isPublished = false } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Solution title and content are required." },
        { status: 400 }
      );
    }

    const solution = await db.workedSolution.upsert({
      where: { questionPaperId },
      update: {
        title: title.trim(),
        content: content.trim(),
        solutionType,
        isPublished: Boolean(isPublished),
      },
      create: {
        questionPaperId,
        title: title.trim(),
        content: content.trim(),
        solutionType,
        isPublished: Boolean(isPublished),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Worked solution saved successfully.",
      solution,
    });
  } catch (error) {
    console.error("Save worked solution error:", error);
    return NextResponse.json(
      { error: "Failed to save worked solution in database." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id: questionPaperId } = params;
    const body = await request.json();
    const { isPublished } = body;

    const solution = await db.workedSolution.update({
      where: { questionPaperId },
      data: { isPublished: Boolean(isPublished) },
    });

    return NextResponse.json({
      success: true,
      message: `Worked solution is now ${solution.isPublished ? "PUBLISHED to Student Portal" : "SAVED as DRAFT (Hidden)"}.`,
      solution,
    });
  } catch (error) {
    console.error("Toggle worked solution publication error:", error);
    return NextResponse.json(
      { error: "Failed to update solution publication status." },
      { status: 500 }
    );
  }
}
