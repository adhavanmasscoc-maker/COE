import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { userId, profileId, currentClass, examPrepClass } = await request.json();

    if (!userId || !profileId || !currentClass || !examPrepClass) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Update user role from PENDING → STUDENT
    await db.user.update({
      where: { id: userId },
      data: { role: "STUDENT" },
    });

    // 2. Update profile with COE-assigned class info
    await db.studentProfile.update({
      where: { id: profileId },
      data: {
        currentClass: parseInt(currentClass),
        examPrepClass: parseInt(examPrepClass),
      },
    });

    // 3. Auto-assign 5 default subjects for this prep class
    const subjects = await db.subject.findMany({
      where: { prepClass: parseInt(examPrepClass) },
      take: 5,
    });

    if (subjects.length > 0) {
      const existing = await db.studentSubject.findMany({
        where: { studentId: profileId },
        select: { subjectId: true },
      });
      const existingIds = new Set(existing.map((e) => e.subjectId));

      const toCreate = subjects
        .filter((s) => !existingIds.has(s.id))
        .map((s) => ({ studentId: profileId, subjectId: s.id }));

      if (toCreate.length > 0) {
        await db.studentSubject.createMany({ data: toCreate, skipDuplicates: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Student approved and assigned to Class ${examPrepClass} programme.`,
    });
  } catch (error) {
    console.error("[Approve Student Error]", error);
    return NextResponse.json({ error: "Failed to approve student." }, { status: 500 });
  }
}
