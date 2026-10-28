const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const existing = await prisma.subject.findUnique({ where: { code: 'MAT-12' } });
  if (!existing) {
    const sub = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MAT-12',
        prepClass: 12,
        medium: 'English',
        units: {
          create: [
            {
              unitNumber: 1,
              title: 'Applications of Matrices and Determinants',
              chapters: {
                create: [
                  { chapterNumber: 1, title: 'Rank of a Matrix & Adjoint', description: 'Inverse of non-singular matrices and elementary transformations' },
                  { chapterNumber: 2, title: 'Linear Equations & Cramer Rule', description: 'Matrix inversion method and Gaussian elimination' }
                ]
              }
            },
            {
              unitNumber: 2,
              title: 'Complex Numbers',
              chapters: {
                create: [
                  { chapterNumber: 1, title: 'Algebraic Operations of Complex Numbers', description: 'Modulus, conjugate and Argand plane' },
                  { chapterNumber: 2, title: 'De Moivre Theorem and Roots of Unity', description: 'Polar forms and nth roots of unity' }
                ]
              }
            },
            {
              unitNumber: 3,
              title: 'Theory of Equations & Trigonometry',
              chapters: {
                create: [
                  { chapterNumber: 1, title: 'Roots of Polynomial Equations', description: 'Vietas formula and polynomial roots' },
                  { chapterNumber: 2, title: 'Inverse Trigonometric Functions', description: 'Principal values and properties' }
                ]
              }
            }
          ]
        }
      }
    });
    console.log('Created MAT-12:', sub.code);
  } else {
    console.log('MAT-12 already exists');
  }

  // Also update BIO-12 name to "Biology" if it's currently "Biology / Mathematics"
  const bio = await prisma.subject.findUnique({ where: { code: 'BIO-12' } });
  if (bio && bio.name !== 'Biology') {
    await prisma.subject.update({
      where: { code: 'BIO-12' },
      data: { name: 'Biology' }
    });
    console.log('Updated BIO-12 name to Biology');
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

