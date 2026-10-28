import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { fullName, rollNo, medium, currentClass, examPrepClass } = body;

    const profile = await db.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const updateData = {};
    if (fullName !== undefined && fullName.trim()) updateData.fullName = fullName.trim();
    if (medium !== undefined) updateData.medium = medium;
    if (currentClass !== undefined) updateData.currentClass = parseInt(currentClass, 10);
    if (examPrepClass !== undefined) updateData.examPrepClass = parseInt(examPrepClass, 10);

    const updatedProfile = await db.studentProfile.update({
      where: { id },
      data: updateData,
    });

    // If rollNo changed, update the user.username as well
    if (rollNo && rollNo.trim().toUpperCase() !== profile.user.username) {
      const cleanRoll = rollNo.trim().toUpperCase();
      // Check collision
      const exists = await db.user.findUnique({ where: { username: cleanRoll } });
      if (exists && exists.id !== profile.userId) {
        return NextResponse.json(
          { error: `Roll Number ${cleanRoll} is already taken by another account.` },
          { status: 409 }
        );
      }
      await db.user.update({
        where: { id: profile.userId },
        data: { username: cleanRoll },
      });
    }

    // If prep class changed, re-assign subjects if needed
    if (examPrepClass !== undefined && parseInt(examPrepClass, 10) !== profile.examPrepClass) {
      const newPrep = parseInt(examPrepClass, 10);
      const defaultCodes = newPrep === 10
        ? ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"]
        : ["TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12"];

      const subs = await db.subject.findMany({ where: { code: { in: defaultCodes } } });
      // Remove old subjects
      await db.studentSubject.deleteMany({ where: { studentId: id } });
      // Add new subjects
      for (const s of subs) {
        await db.studentSubject.create({
          data: { studentId: id, subjectId: s.id },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated profile for ${updatedProfile.fullName} successfully.`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate profile in database." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = params;

    const profile = await db.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      // Maybe id is userId?
      const user = await db.user.findUnique({
        where: { id },
        include: { profile: true },
      });
      if (!user) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
      }

      const pId = user.profile?.id;
      if (pId) {
        await db.examSubmission.deleteMany({ where: { studentId: pId } }).catch(() => {});
        await db.examResult.deleteMany({ where: { studentId: pId } }).catch(() => {});
        await db.chapterProgress.deleteMany({ where: { studentId: pId } }).catch(() => {});
        await db.studentSubject.deleteMany({ where: { studentId: pId } }).catch(() => {});
        await db.incidentLog.deleteMany({ where: { studentId: pId } }).catch(() => {});
        await db.studentProfile.delete({ where: { id: pId } }).catch(() => {});
      }
      await db.user.delete({ where: { id: user.id } });

      return NextResponse.json({
        success: true,
        message: `Student ${user.username} deleted successfully.`,
      });
    }

    const userId = profile.userId;

    // Safely delete cascade in correct order
    await db.examSubmission.deleteMany({ where: { studentId: id } }).catch(() => {});
    await db.examResult.deleteMany({ where: { studentId: id } }).catch(() => {});
    await db.chapterProgress.deleteMany({ where: { studentId: id } }).catch(() => {});
    await db.studentSubject.deleteMany({ where: { studentId: id } }).catch(() => {});
    await db.incidentLog.deleteMany({ where: { studentId: id } }).catch(() => {});
    await db.studentProfile.delete({ where: { id } }).catch(() => {});
    if (userId) {
      await db.user.delete({ where: { id: userId } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Student ${profile.fullName} (${profile.user?.username || id}) deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete student from database." },
      { status: 500 }
    );
  }
}
