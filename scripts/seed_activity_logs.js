const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedActivityLogs() {
  console.log("=== Seeding Realistic Student Activity & Device Telemetry Logs ===");

  const brother = await prisma.studentProfile.findFirst({
    where: { user: { username: "TN2026-0901" } },
    include: { user: true },
  });

  const sister = await prisma.studentProfile.findFirst({
    where: { user: { username: "TN2026-1102" } },
    include: { user: true },
  });

  const now = new Date();
  const logsToCreate = [
    // Sister (Nithya) - Verified Mobile Session (Android Chrome)
    {
      studentId: sister?.id || null,
      rollNo: "TN2026-1102",
      studentName: sister?.fullName || "Nithya S",
      dob: "2009-08-22",
      ipAddress: "157.48.192.45",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "LOGIN",
      details: "Candidate authenticated from verified mobile device.",
      loginTime: new Date(now.getTime() - 45 * 60 * 1000),
      lastLoginTime: new Date(now.getTime() - 28 * 60 * 60 * 1000),
      durationSeconds: 2700,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    },
    {
      studentId: sister?.id || null,
      rollNo: "TN2026-1102",
      studentName: sister?.fullName || "Nithya S",
      dob: "2009-08-22",
      ipAddress: "157.48.192.45",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "CLICK",
      details: 'Candidate selected: "Option A (Database)" on Question 1 in CSC-12 2026 Public Exam.',
      loginTime: new Date(now.getTime() - 45 * 60 * 1000),
      durationSeconds: 2500,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 42 * 60 * 1000),
    },
    {
      studentId: sister?.id || null,
      rollNo: "TN2026-1102",
      studentName: sister?.fullName || "Nithya S",
      dob: "2009-08-22",
      ipAddress: "157.48.192.45",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "CLICK",
      details: 'Candidate selected: "Option B (**)" on Question 5 (Exponentiation operator).',
      loginTime: new Date(now.getTime() - 45 * 60 * 1000),
      durationSeconds: 2200,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 36 * 60 * 1000),
    },
    {
      studentId: sister?.id || null,
      rollNo: "TN2026-1102",
      studentName: sister?.fullName || "Nithya S",
      dob: "2009-08-22",
      ipAddress: "157.48.192.45",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "PAGE_VIEW",
      details: "Candidate navigated to Practice Paper: Class 12 Computer Science (2025 Paper).",
      loginTime: new Date(now.getTime() - 45 * 60 * 1000),
      durationSeconds: 1800,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      studentId: sister?.id || null,
      rollNo: "TN2026-1102",
      studentName: sister?.fullName || "Nithya S",
      dob: "2009-08-22",
      ipAddress: "157.48.192.45",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "LOGOUT",
      details: "Candidate cleanly logged out after completing syllabus review.",
      loginTime: new Date(now.getTime() - 45 * 60 * 1000),
      logoutTime: new Date(now.getTime() - 15 * 60 * 1000),
      durationSeconds: 1800,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    },

    // Brother (Adhavan) - Mobile Session with Tab Switch Anti-Cheat Alert
    {
      studentId: brother?.id || null,
      rollNo: "TN2026-0901",
      studentName: brother?.fullName || "Adhavan S",
      dob: "2011-05-14",
      ipAddress: "49.37.201.88",
      deviceType: "📱 Mobile (iOS (iPhone) / Safari)",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      isMobile: true,
      action: "LOGIN",
      details: "Candidate authenticated from registered iPhone.",
      loginTime: new Date(now.getTime() - 25 * 60 * 1000),
      lastLoginTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      durationSeconds: 1500,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 25 * 60 * 1000),
    },
    {
      studentId: brother?.id || null,
      rollNo: "TN2026-0901",
      studentName: brother?.fullName || "Adhavan S",
      dob: "2011-05-14",
      ipAddress: "49.37.201.88",
      deviceType: "📱 Mobile (iOS (iPhone) / Safari)",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      isMobile: true,
      action: "CLICK",
      details: 'Candidate started examination paper: "MAT-10 Mathematics Model Exam".',
      loginTime: new Date(now.getTime() - 25 * 60 * 1000),
      durationSeconds: 1300,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 22 * 60 * 1000),
    },
    {
      studentId: brother?.id || null,
      rollNo: "TN2026-0901",
      studentName: brother?.fullName || "Adhavan S",
      dob: "2011-05-14",
      ipAddress: "49.37.201.88",
      deviceType: "📱 Mobile (iOS (iPhone) / Safari)",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      isMobile: true,
      action: "TAB_SWITCH_ALERT",
      details: "Candidate minimized browser window / switched application for 8 seconds (Anti-Cheat Help Trigger #1).",
      loginTime: new Date(now.getTime() - 25 * 60 * 1000),
      durationSeconds: 900,
      tabSwitchCount: 1,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
    {
      studentId: brother?.id || null,
      rollNo: "TN2026-0901",
      studentName: brother?.fullName || "Adhavan S",
      dob: "2011-05-14",
      ipAddress: "49.37.201.88",
      deviceType: "📱 Mobile (iOS (iPhone) / Safari)",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      isMobile: true,
      action: "CLICK",
      details: 'Candidate selected: "Option C (12)" on Question 1 in Mathematics.',
      loginTime: new Date(now.getTime() - 25 * 60 * 1000),
      durationSeconds: 600,
      tabSwitchCount: 1,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },

    // Candidate 1234 (Newly Registered) - Active Session
    {
      rollNo: "1234",
      studentName: "Kavitha S",
      dob: "2011-06-15",
      ipAddress: "106.208.71.12",
      deviceType: "📱 Mobile (Android Mobile / Chrome)",
      userAgent: "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      action: "PAGE_VIEW",
      details: "Candidate visited registration acknowledgment and syllabus dashboard.",
      loginTime: new Date(now.getTime() - 8 * 60 * 1000),
      durationSeconds: 480,
      tabSwitchCount: 0,
      createdAt: new Date(now.getTime() - 8 * 60 * 1000),
    },

    // External Desktop User - Flagged for COE Review
    {
      rollNo: "TN2026-9999",
      studentName: "Test Candidate",
      dob: "2009-12-01",
      ipAddress: "182.73.241.10",
      deviceType: "💻 Desktop (Windows PC / Microsoft Edge)",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
      isMobile: false,
      action: "CLICK",
      details: "Candidate attempted exam entry from desktop workstation (Flagged: Mobile device required).",
      loginTime: new Date(now.getTime() - 5 * 60 * 1000),
      durationSeconds: 300,
      tabSwitchCount: 2,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
  ];

  for (const log of logsToCreate) {
    await prisma.studentActivityLog.create({ data: log });
  }

  console.log(`✅ Seeded ${logsToCreate.length} student activity, device IP, and anti-cheat telemetry records!`);
}

module.exports = { seedActivityLogs };

if (require.main === module) {
  seedActivityLogs().then(() => prisma.$disconnect()).catch((e) => {
    console.error("Seeding error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
}
