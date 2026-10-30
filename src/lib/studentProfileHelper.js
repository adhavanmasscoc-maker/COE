import { db } from "@/lib/db";

/**
 * Self-healing student profile resolver.
 * Looks up student profile by userId, profileId, or username.
 * If missing in the SQLite database (e.g. fresh Vercel serverless lambda or restored session),
 * it automatically re-creates/restores the user and profile using verified JWT session data.
 *
 * @param {Object} session - Verified session payload from getCurrentSession()
 * @param {string} [previewRollNo] - Admin preview override roll number
 * @returns {Promise<Object|null>} The studentProfile with user relation
 */
export async function getOrRestoreStudentProfile(session, previewRollNo = null) {
  if (!session) return null;

  try {
    // 1. If role is ADMIN, check for requested preview roll or fallback default
    if (session.role === "ADMIN") {
      const targetRoll = previewRollNo || "TN2026-0901";
      let profile = await db.studentProfile.findFirst({
        where: { user: { username: targetRoll } },
        include: { user: { select: { username: true, role: true } } },
      });

      if (!profile) {
        // Fallback to any active student profile
        profile = await db.studentProfile.findFirst({
          include: { user: { select: { username: true, role: true } } },
        });
      }

      // If still no profile exists at all in the DB, create a default candidate for the Admin preview
      if (!profile) {
        const dummyUser = await db.user.upsert({
          where: { username: targetRoll },
          update: {},
          create: {
            username: targetRoll,
            passwordHash: "$2a$12$previewAdminPasswordHashPlaceholder",
            role: "STUDENT",
            language: "ta",
            profile: {
              create: {
                fullName: "Adhavan S (Official Candidate)",
                currentClass: 9,
                examPrepClass: 10,
                medium: "Tamil",
                board: "Tamil Nadu Samacheer Kalvi",
                academicYear: "2026–2027",
              },
            },
          },
          include: { profile: true },
        });
        profile = await db.studentProfile.findUnique({
          where: { userId: dummyUser.id },
          include: { user: { select: { username: true, role: true } } },
        });
      }

      return profile;
    }

    // 2. Student Role: Try looking up by userId
    if (session.userId) {
      const profile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { username: true, role: true } } },
      });
      if (profile) return profile;
    }

    // 3. Try looking up by profileId
    if (session.profileId) {
      const profile = await db.studentProfile.findUnique({
        where: { id: session.profileId },
        include: { user: { select: { username: true, role: true } } },
      });
      if (profile) return profile;
    }

    // 4. Try looking up by username (Roll No)
    const rollNo = session.username || previewRollNo;
    if (rollNo) {
      const profile = await db.studentProfile.findFirst({
        where: { user: { username: rollNo } },
        include: { user: { select: { username: true, role: true } } },
      });
      if (profile) return profile;
    }

    // 5. Self-Healing: The student has a cryptographically verified JWT token signed by our server,
    // but the local SQLite instance on Vercel is missing their record. Re-create it!
    if (rollNo) {
      const currentClass = parseInt(session.currentClass, 10) || 10;
      const examPrepClass = parseInt(session.examPrepClass, 10) || 10;
      const medium = session.medium || (session.language === "ta" ? "Tamil" : "English");
      const fullName = session.fullName || rollNo;

      let user = await db.user.findUnique({
        where: { username: rollNo },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            id: session.userId || undefined,
            username: rollNo,
            passwordHash: "$2a$12$restoredSessionFromVerifiedJWTTokenHash",
            role: "STUDENT",
            language: session.language === "ta" ? "ta" : "en",
          },
        });
      }

      const newProfile = await db.studentProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          id: session.profileId || undefined,
          userId: user.id,
          fullName: fullName,
          currentClass: currentClass,
          examPrepClass: examPrepClass,
          medium: medium,
          board: session.board || "Tamil Nadu Samacheer Kalvi",
          academicYear: "2026–2027",
        },
        include: { user: { select: { username: true, role: true } } },
      });

      return newProfile;
    }
  } catch (err) {
    console.error("[getOrRestoreStudentProfile] Error resolving profile:", err);
  }

  return null;
}
