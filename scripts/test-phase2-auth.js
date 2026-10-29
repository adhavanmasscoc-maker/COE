const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return cleaned;
  }
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
  const ymdMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

async function testAuth() {
  const rollNo = 'TN2026-TEST99';
  const rawDob = '28-10-2008';
  
  await prisma.user.deleteMany({ where: { username: rollNo } });
  
  const normalizedDob = normalizeDate(rawDob);
  const hash = await bcrypt.hash(normalizedDob, 12);
  
  const user = await prisma.user.create({
    data: {
      username: rollNo,
      passwordHash: hash,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Test Candidate Anitha',
          currentClass: 12,
          examPrepClass: 12,
          medium: 'Tamil',
          board: 'Tamil Nadu Samacheer Kalvi'
        }
      }
    },
    include: { profile: true }
  });
  console.log('User created:', user.username, 'Role:', user.role);
  
  // Test 1: login with exact raw format: '28-10-2008'
  const norm1 = normalizeDate(rawDob);
  const match1 = await bcrypt.compare(norm1, user.passwordHash);
  console.log('Test 1 (DD-MM-YYYY normalized to ISO compare):', match1 ? 'PASS' : 'FAIL');
  
  // Test 2: login with ISO format '2008-10-28'
  const norm2 = normalizeDate('2008-10-28');
  const match2 = await bcrypt.compare(norm2, user.passwordHash);
  console.log('Test 2 (ISO format compare):', match2 ? 'PASS' : 'FAIL');

  // Test 3: login with slash format '28/10/2008'
  const norm3 = normalizeDate('28/10/2008');
  const match3 = await bcrypt.compare(norm3, user.passwordHash);
  console.log('Test 3 (Slash format compare):', match3 ? 'PASS' : 'FAIL');
  
  // Test 4: wrong password
  const norm4 = normalizeDate('1999-01-01');
  const match4 = await bcrypt.compare(norm4, user.passwordHash);
  console.log('Test 4 (Wrong password rejected):', !match4 ? 'PASS' : 'FAIL');
  
  await prisma.user.deleteMany({ where: { username: rollNo } });
  console.log('Phase 2 verification script completed successfully.');
}

testAuth().catch(console.error).finally(() => prisma.$disconnect());

