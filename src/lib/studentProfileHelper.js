import { db } from "@/lib/db";

/**
 * Self-healing student profile resolver.
 * Looks up student profile by userId, profileId, or username.
 * If missing or if the database is in a serverless cold-start / read-only condition,
 * it restores or returns a synthesized profile matching the verified JWT session.
 *
 * @param {Object} session - Verified session payload from getCurrentSession()
 * @param {string} [previewRollNo] - Admin preview override roll number
 * @returns {Promise<Object|null>} The studentProfile with user relation
 */
export async function getOrRestoreStudentProfile(session, previewRollNo = null) {
  if (!session && !previewRollNo) return null;

  try {
    if (!session && previewRollNo) {
      const profile = await db.studentProfile.findFirst({
        where: { user: { username: previewRollNo } },
        include: { user: { select: { id: true, username: true, role: true, language: true } } },
      }).catch(() => null);
      return profile;
    }
  } catch {}

  try {
    // 1. If role is ADMIN, check for requested preview roll or fallback default
    if (session.role === "ADMIN") {
      const targetRoll = previewRollNo || "TN2026-0901";
      let profile = await db.studentProfile.findFirst({
        where: { user: { username: targetRoll } },
        include: { user: { select: { id: true, username: true, role: true, language: true } } },
      }).catch(() => null);

      if (!profile) {
        // Fallback to any active student profile
        profile = await db.studentProfile.findFirst({
          include: { user: { select: { id: true, username: true, role: true, language: true } } },
        }).catch(() => null);
      }

      // If still no profile exists at all in the DB, create a default candidate for the Admin preview
      if (!profile) {
        try {
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
            include: { user: { select: { id: true, username: true, role: true, language: true } } },
          });
        } catch (adminErr) {
          console.warn("[getOrRestoreStudentProfile] Admin provision fallback:", adminErr.message);
        }
      }

      if (profile) return profile;
    }

    // 2. Student Role: Try looking up by userId
    if (session.userId) {
      const profile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { id: true, username: true, role: true, language: true } } },
      }).catch(() => null);
      if (profile) return profile;
    }

    // 3. Try looking up by profileId
    if (session.profileId) {
      const profile = await db.studentProfile.findUnique({
        where: { id: session.profileId },
        include: { user: { select: { id: true, username: true, role: true, language: true } } },
      }).catch(() => null);
      if (profile) return profile;
    }

    // 4. Try looking up by username (Roll No)
    const rollNo = session.username || previewRollNo;
    if (rollNo) {
      const profile = await db.studentProfile.findFirst({
        where: { user: { username: rollNo } },
        include: { user: { select: { id: true, username: true, role: true, language: true } } },
      }).catch(() => null);
      if (profile) return profile;
    }

    // 5. Self-Healing: The student has a verified JWT token signed by our server,
    // re-create the record in the database if possible.
    if (rollNo) {
      const currentClass = parseInt(session.currentClass, 10) || 10;
      const examPrepClass = parseInt(session.examPrepClass, 10) || 10;
      const medium = session.medium || (session.language === "ta" ? "Tamil" : "English");
      const fullName = session.fullName || rollNo;

      let user = await db.user.findUnique({
        where: { username: rollNo },
      }).catch(() => null);

      if (!user) {
        user = await db.user.create({
          data: {
            id: session.userId || undefined,
            username: rollNo,
            passwordHash: "$2a$12$restoredSessionFromVerifiedJWTTokenHash",
            role: "STUDENT",
            language: session.language === "ta" ? "ta" : "en",
          },
        }).catch(() => null);
      }

      if (user) {
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
          include: { user: { select: { id: true, username: true, role: true, language: true } } },
        }).catch(() => null);

        if (newProfile) return newProfile;
      }
    }
  } catch (err) {
    console.error("[getOrRestoreStudentProfile] Error resolving profile:", err);
  }

  // 6. Resilient In-Memory Fallback:
  // If the database write was locked or missing, NEVER fail a student who holds a verified JWT.
  if (session && (session.username || session.userId || session.profileId)) {
    const rollNo = session.username || previewRollNo || "CANDIDATE";
    const currentClass = parseInt(session.currentClass, 10) || 10;
    const examPrepClass = parseInt(session.examPrepClass, 10) || 10;
    const medium = session.medium || (session.language === "ta" ? "Tamil" : "English");
    const fullName = session.fullName || rollNo;
    const userId = session.userId || `synth_u_${rollNo}`;
    const profileId = session.profileId || `synth_p_${rollNo}`;

    return {
      id: profileId,
      userId: userId,
      fullName,
      currentClass,
      examPrepClass,
      medium,
      board: session.board || "Tamil Nadu Samacheer Kalvi",
      academicYear: "2026–2027",
      user: {
        id: userId,
        username: rollNo,
        role: session.role || "STUDENT",
        language: session.language === "ta" ? "ta" : "en",
      },
    };
  }

  return null;
}
