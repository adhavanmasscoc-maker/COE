import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function checkSubjects() {
  const subs = await prisma.subject.findMany({
    orderBy: [{ prepClass: 'asc' }, { code: 'asc' }]
  });
  console.log('Total subjects:', subs.length);
  subs.forEach(s => {
    console.log({
      id: s.id,
      code: s.code,
      name: s.name,
      nameTa: s.nameTa,
      prepClass: s.prepClass,
      category: s.category
    });
  });
}
checkSubjects().catch(console.error).finally(() => prisma.$disconnect());

