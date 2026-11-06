/**
 * src/lib/ai/vectorStore.js
 * In-memory cosine similarity and vector search for Tamil Nadu Samacheer Kalvi syllabus.
 */

/**
 * Computes cosine similarity between two normalized float vectors.
 * 
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Value between -1.0 and 1.0 (or 0 if invalid)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Searches stored textbook vectors for the most relevant context chunks.
 * Falls back to keyword search if queryEmbedding is null/empty or vector count is 0.
 *
 * @param {object} prisma - Prisma Client instance
 * @param {string} subjectCode - e.g. "MAT-12", "CHE-12", "PHY-12", "MAT-10"
 * @param {number[]|null} queryEmbedding - 768-dim float vector from text-embedding-004
 * @param {number} limit - Number of top chunks to return
 * @param {string} fallbackQuery - Optional text query for keyword fallback
 * @returns {Promise<Array>} Scored top chunks
 */
export async function searchSimilarChunks(prisma, subjectCode, queryEmbedding, limit = 3, fallbackQuery = "") {
  try {
    const records = await prisma.syllabusVector.findMany({
      where: subjectCode ? { subjectCode } : undefined,
      select: {
        id: true,
        subjectCode: true,
        unitNumber: true,
        chunkTitle: true,
        contentEn: true,
        contentTa: true,
        embedding: true,
      },
    });

    if (!records || records.length === 0) {
      return searchDeterministicSyllabus(subjectCode, fallbackQuery, limit);
    }

    if (queryEmbedding && Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
      const scored = records.map((record) => {
        let vector = [];
        try {
          vector = typeof record.embedding === "string" ? JSON.parse(record.embedding) : record.embedding;
        } catch {
          vector = [];
        }
        return {
          id: record.id,
          subjectCode: record.subjectCode,
          unitNumber: record.unitNumber,
          chunkTitle: record.chunkTitle,
          contentEn: record.contentEn,
          contentTa: record.contentTa,
          similarity: cosineSimilarity(queryEmbedding, vector),
        };
      });

      return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
    }

    // Fallback: token/keyword matching
    return scoreByKeywords(records, fallbackQuery, limit);
  } catch (error) {
    console.error("searchSimilarChunks error:", error);
    return searchDeterministicSyllabus(subjectCode, fallbackQuery, limit);
  }
}

/**
 * Score records by keyword frequency.
 */
function scoreByKeywords(records, query, limit) {
  if (!query) return records.slice(0, limit);
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scored = records.map(record => {
    const hay = `${record.chunkTitle} ${record.contentEn} ${record.contentTa}`.toLowerCase();
    let hits = 0;
    terms.forEach(term => {
      if (hay.includes(term)) hits++;
    });
    return {
      ...record,
      similarity: hits / Math.max(1, terms.length),
    };
  });

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/**
 * In-memory deterministic syllabus chunks for fallback when DB vectors are empty.
 */
export function searchDeterministicSyllabus(subjectCode, query = "", limit = 3) {
  const norm = (subjectCode || "").toUpperCase();

  const maths12Chunks = [
    {
      id: "mat12-u1",
      subjectCode: "MAT-12",
      unitNumber: 1,
      chunkTitle: "Applications of Matrices and Determinants / அணிகள் மற்றும் அணிக்கோவைகளின் பயன்பாடுகள்",
      contentEn: "Inverse of non-singular square matrix: A^{-1} = \\frac{1}{|A|} \\text{adj}(A). A is invertible iff |A| \\neq 0. Orthogonal matrix: A A^T = A^T A = I. Rank of a matrix is the maximum order of non-zero minor. Cramer's Rule: x = \\frac{\\Delta_x}{\\Delta}, y = \\frac{\\Delta_y}{\\Delta}, z = \\frac{\\Delta_z}{\\Delta} (provided \\Delta \\neq 0).",
      contentTa: "பூச்சியமற்ற கோவை அணிக்கு நேர்மாறு: A^{-1} = \\frac{1}{|A|} \\text{adj}(A). |A| \\neq 0 எனில் மட்டுமே A நேர்மாறு காணத்தக்கது. செங்குத்து அணி: A A^T = A^T A = I. கிராமரின் விதி: x = \\frac{\\Delta_x}{\\Delta}, y = \\frac{\\Delta_y}{\\Delta}, z = \\frac{\\Delta_z}{\\Delta} (\\Delta \\neq 0).",
      similarity: 0.95
    },
    {
      id: "mat12-u2",
      subjectCode: "MAT-12",
      unitNumber: 2,
      chunkTitle: "Complex Numbers / கலப்பு எண்கள்",
      contentEn: "Standard form: z = x + iy. Modulus |z| = \\sqrt{x^2 + y^2}. Conjugate \\bar{z} = x - iy. Triangle inequality: |z_1 + z_2| \\le |z_1| + |z_2|. Polar form: z = r(\\cos \\theta + i \\sin \\theta) = r e^{i\\theta}. De Moivre's Theorem: (\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta).",
      contentTa: "செவ்வக வடிவம்: z = x + iy. மட்டு மதிப்பு |z| = \\sqrt{x^2 + y^2}. இணை எண் \\bar{z} = x - iy. முக்கோண சமனின்மை: |z_1 + z_2| \\le |z_1| + |z_2|. துருவ வடிவம்: z = r(\\cos \\theta + i \\sin \\theta). டி மாய்வரின் தேற்றம்: (\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta).",
      similarity: 0.90
    },
    {
      id: "mat12-u3",
      subjectCode: "MAT-12",
      unitNumber: 3,
      chunkTitle: "Theory of Equations / சமன்பாட்டியல்",
      contentEn: "Vieta's formulas for ax^2 + bx + c = 0: \\alpha + \\beta = -b/a, \\alpha\\beta = c/a. For cubic equations: \\sum \\alpha = -b/a, \\sum \\alpha\\beta = c/a, \\alpha\\beta\\gamma = -d/a. Descartes' Rule of Signs determines maximum number of positive and negative real roots.",
      contentTa: "வியேட்டாவின் சூத்திரங்கள்: \\alpha + \\beta = -b/a, \\alpha\\beta = c/a. முப்படி சமன்பாட்டிற்கு மூலங்களின் கூடுதல் \\sum \\alpha = -b/a. தேகார்தேயின் குறி விதி மூலங்களின் எண்ணிக்கையை அறிய உதவுகிறது.",
      similarity: 0.85
    },
    {
      id: "mat12-u5",
      subjectCode: "MAT-12",
      unitNumber: 5,
      chunkTitle: "Two Dimensional Analytical Geometry-II / இருபரிமாண பகுமுறை வடிவியல்-II",
      contentEn: "Circle standard equation: x^2 + y^2 = r^2. General second-degree equation Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0. Conic eccentricity e: Circle e = 0, Parabola e = 1, Ellipse e < 1, Hyperbola e > 1. Tangent equation at (x_1, y_1): xx_1 + yy_1 = r^2.",
      contentTa: "வட்டத்தின் சமன்பாடு: x^2 + y^2 = r^2. கூம்பு வெட்டுகளின் மையத்தொலைத் தகவு e: வட்டம் e = 0, பரவளையம் e = 1, நீள்வட்டம் e < 1, அதிபரவளையம் e > 1.",
      similarity: 0.80
    }
  ];

  const chem12Chunks = [
    {
      id: "che12-u1",
      subjectCode: "CHE-12",
      unitNumber: 1,
      chunkTitle: "Metallurgy / உலோகவியல்",
      contentEn: "Concentration of ores: Gravity separation for oxide ores, Froth floatation for sulphide ores (using pine oil and collectors), Leaching (Cyanide, Ammonia, Alkali, Acid), Magnetic separation. Extraction: Roasting (sulphide into oxide), Calcination (carbonate/hydrated into oxide), Smelting, Refining (Zone refining for semiconductors Si/Ge, Mond process for Ni, Van Arkel for Ti/Zr).",
      contentTa: "தாதுக்களை அடர்ப்பித்தல்: புவிஈர்ப்பு முறை, நுரை மிதப்பு முறை (சல்பைடு தாதுக்களுக்கு), வேதிக்கழுவுதல், காந்தப் பிரிப்பு முறை. வறுத்தல் மற்றும் காற்றில்லாச் சூழலில் வறுத்தல். தூய்மையாக்கல்: மண்டல தூய்மையாக்கல் (Si, Ge), மாண்ட் முறை (Ni), வான் ஆர்கல் முறை (Ti, Zr).",
      similarity: 0.95
    },
    {
      id: "che12-u2",
      subjectCode: "CHE-12",
      unitNumber: 6,
      chunkTitle: "Solid State / திட நிலைமை",
      contentEn: "Classification of solids: Crystalline vs Amorphous. Unit cell parameters: a, b, c and \\alpha, \\beta, \\gamma. 7 crystal systems and 14 Bravais lattices. Packing efficiency: Simple cubic = 52.4%, Body centered cubic (BCC) = 68%, Face centered cubic (FCC/CCP) = 74%. Bragg's law: n\\lambda = 2d \\sin \\theta. Crystal defects: Schottky defect (stoichiometric, density decreases), Frenkel defect (dislocation, density unchanged).",
      contentTa: "திடப்பொருட்கள் வகைப்பாடு: படிக திடப்பொருட்கள் மற்றும் படிக உருவமற்றவை. அலகுக்கூடு பொதிவுத்திறன்: எளிய கனசதுரம் = 52.4%, பொருள் மைய கனசதுரம் = 68%, முகப்பு மைய கனசதுரம் = 74%. பிராக் சமன்பாடு: n\\lambda = 2d \\sin \\theta. புள்ளி குறைபாடுகள்: ஷாட்கி குறைபாடு, பிரங்கல் குறைபாடு.",
      similarity: 0.90
    },
    {
      id: "che12-u3",
      subjectCode: "CHE-12",
      unitNumber: 7,
      chunkTitle: "Chemical Kinetics / வேதி வினைவேகவியல்",
      contentEn: "Rate of reaction: -\\frac{1}{a}\\frac{d[A]}{dt}. Rate law: \\text{Rate} = k[A]^x[B]^y. Order of reaction is x+y. Molecularity is the number of reacting species in an elementary step. Half-life of first order reaction: t_{1/2} = \\frac{0.693}{k} (independent of initial concentration). Arrhenius equation: k = A e^{-E_a/RT}, \\ln k = \\ln A - \\frac{E_a}{RT}.",
      contentTa: "வினைவேகம் மற்றும் வினைவேக விதி: \\text{Rate} = k[A]^x[B]^y. முதல் வகை வினையின் அரை ஆயுட்காலம்: t_{1/2} = \\frac{0.693}{k}. அர்ஹீனியஸ் சமன்பாடு: k = A e^{-E_a/RT}.",
      similarity: 0.88
    }
  ];

  let pool = norm.startsWith("CHE") ? chem12Chunks : maths12Chunks;
  if (!norm.startsWith("CHE") && !norm.startsWith("MAT")) {
    pool = [...maths12Chunks, ...chem12Chunks];
  }

  if (!query) return pool.slice(0, limit);

  return scoreByKeywords(pool, query, limit);
}

