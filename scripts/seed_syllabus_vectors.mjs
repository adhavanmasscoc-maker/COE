// scripts/seed_syllabus_vectors.mjs
import { db } from "../src/lib/db.js";

const mathChunks = [
  {
    subjectCode: "MAT-12",
    unitNumber: 1,
    chunkTitle: "Applications of Matrices and Determinants / அணிகள் மற்றும் அணிக்கோவைகளின் பயன்பாடுகள்",
    contentEn: "Inverse of non-singular square matrix: A^{-1} = \\frac{1}{|A|} \\text{adj}(A). A is invertible iff |A| \\neq 0. Orthogonal matrix: A A^T = A^T A = I. Rank of a matrix is the maximum order of non-zero minor. Cramer's Rule: x = \\frac{\\Delta_x}{\\Delta}, y = \\frac{\\Delta_y}{\\Delta}, z = \\frac{\\Delta_z}{\\Delta} (provided \\Delta \\neq 0). Gaussian elimination row operations.",
    contentTa: "பூச்சியமற்ற கோவை அணிக்கு நேர்மாறு: A^{-1} = \\frac{1}{|A|} \\text{adj}(A). |A| \\neq 0 எனில் மட்டுமே A நேர்மாறு காணத்தக்கது. செங்குத்து அணி: A A^T = A^T A = I. கிராமரின் விதி: x = \\frac{\\Delta_x}{\\Delta}, y = \\frac{\\Delta_y}{\\Delta}, z = \\frac{\\Delta_z}{\\Delta} (\\Delta \\neq 0). காஸ்ஸியன் நீக்கல் முறை.",
  },
  {
    subjectCode: "MAT-12",
    unitNumber: 2,
    chunkTitle: "Complex Numbers / கலப்பு எண்கள்",
    contentEn: "Standard form: z = x + iy. Modulus |z| = \\sqrt{x^2 + y^2}. Conjugate \\bar{z} = x - iy. Triangle inequality: |z_1 + z_2| \\le |z_1| + |z_2|. Polar form: z = r(\\cos \\theta + i \\sin \\theta) = r e^{i\\theta}. De Moivre's Theorem: (\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta). Cube roots of unity: 1, \\omega, \\omega^2 where 1 + \\omega + \\omega^2 = 0.",
    contentTa: "செவ்வக வடிவம்: z = x + iy. மட்டு மதிப்பு |z| = \\sqrt{x^2 + y^2}. இணை எண் \\bar{z} = x - iy. முக்கோண சமனின்மை: |z_1 + z_2| \\le |z_1| + |z_2|. துருவ வடிவம்: z = r(\\cos \\theta + i \\sin \\theta). டி மாய்வரின் தேற்றம்: (\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta). ஒன்றின் முப்படி மூலங்கள்: 1 + \\omega + \\omega^2 = 0.",
  },
  {
    subjectCode: "MAT-12",
    unitNumber: 3,
    chunkTitle: "Theory of Equations / சமன்பாட்டியல்",
    contentEn: "Vieta's formulas for quadratic ax^2 + bx + c = 0: \\alpha + \\beta = -b/a, \\alpha\\beta = c/a. For cubic equations: \\sum \\alpha = -b/a, \\sum \\alpha\\beta = c/a, \\alpha\\beta\\gamma = -d/a. Descartes' Rule of Signs: number of positive real roots cannot exceed number of sign changes in P(x).",
    contentTa: "வியேட்டாவின் சூத்திரங்கள்: \\alpha + \\beta = -b/a, \\alpha\\beta = c/a. முப்படி சமன்பாட்டிற்கு மூலங்களின் கூடுதல் \\sum \\alpha = -b/a. தேகார்தேயின் குறி விதி மூலங்களின் எண்ணிக்கையை அறிய உதவுகிறது.",
  },
  {
    subjectCode: "MAT-12",
    unitNumber: 5,
    chunkTitle: "Two Dimensional Analytical Geometry-II / இருபரிமாண பகுமுறை வடிவியல்-II",
    contentEn: "Circle equation: x^2 + y^2 + 2gx + 2fy + c = 0, centre (-g, -f), radius \\sqrt{g^2 + f^2 - c}. Conic standard forms: Parabola y^2 = 4ax (e=1, focus (a,0)), Ellipse \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 (e<1, b^2 = a^2(1-e^2)), Hyperbola \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 (e>1, b^2 = a^2(e^2-1)). Tangents and normals.",
    contentTa: "வட்டத்தின் சமன்பாடு: x^2 + y^2 + 2gx + 2fy + c = 0. கூம்பு வெட்டுகளின் திட்ட சமன்பாடுகள்: பரவளையம் y^2 = 4ax, நீள்வட்டம் \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, அதிபரவளையம் \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1.",
  },
  {
    subjectCode: "MAT-12",
    unitNumber: 7,
    chunkTitle: "Applications of Differential Calculus / வகை நுண்கணிதத்தின் பயன்பாடுகள்",
    contentEn: "Slope of tangent m = \\left(\\frac{dy}{dx}\\right)_{(x_1, y_1)}. Normal equation: y - y_1 = -\\frac{1}{m}(x - x_1). Rolle's Theorem and Mean Value Theorem: f'(c) = \\frac{f(b) - f(a)}{b - a}. Maxima and Minima: critical points where f'(x) = 0. Second derivative test: f''(c) < 0 indicates local maximum, f''(c) > 0 indicates local minimum.",
    contentTa: "தொடுகோட்டின் சாய்வு m = \\frac{dy}{dx}. ரோலின் தேற்றம் மற்றும் லெக்ராஞ்சியின் இடைமதிப்புத் தேற்றம்: f'(c) = \\frac{f(b)-f(a)}{b-a}. பெருமம் மற்றும் சிறுமம்: f''(c) < 0 எனில் பெருமம், f''(c) > 0 எனில் சிறுமம்.",
  }
];

const chemChunks = [
  {
    subjectCode: "CHE-12",
    unitNumber: 1,
    chunkTitle: "Metallurgy / உலோகவியல்",
    contentEn: "Concentration: Gravity separation for oxide ores (Haematite, Tinstone), Froth floatation for sulphide ores (Galena, Zinc blende, Copper pyrites) using pine oil collector and sodium ethyl xanthate. Extraction: Roasting sulphide to oxide with excess air, Calcination heating in limited air. Refining: Mond process for Nickel (forming Ni(CO)_4 at 350K, decomposing at 460K), Van-Arkel method for Titanium and Zirconium.",
    contentTa: "தாதுக்களை அடர்ப்பித்தல்: புவிஈர்ப்பு முறை, நுரை மிதப்பு முறை (சல்பைடு தாதுக்களுக்கு - கலீனா, துத்தநாக பிளண்ட்). பிரித்தெடுத்தல்: வறுத்தல் மற்றும் காற்றில்லாச் சூழலில் வறுத்தல். தூய்மையாக்கல்: நிக்கலுக்கான மாண்ட் முறை, டைட்டானியம் மற்றும் சிர்கோனியத்திற்கான வான் ஆர்கல் முறை.",
  },
  {
    subjectCode: "CHE-12",
    unitNumber: 6,
    chunkTitle: "Solid State / திட நிலைமை",
    contentEn: "Crystalline solids have long-range order and sharp melting points; amorphous are isotropic. 7 crystal systems, 14 Bravais lattices. Packing efficiency: Simple Cubic = 52.4%, BCC = 68%, FCC/CCP = 74%. Density of unit cell: \\rho = \\frac{n \\times M}{a^3 \\times N_A}. Bragg's equation: n\\lambda = 2d \\sin \\theta. Defects: Schottky defect (equal cation-anion vacancies, lowers density, e.g. NaCl), Frenkel defect (cation shifted to interstitial site, density unchanged, e.g. AgBr).",
    contentTa: "படிக திடப்பொருட்கள் மற்றும் படிக உருவமற்றவை. 14 பிராவேஸ் அணிக்கோவை தளங்கள். பொதிவுத்திறன்: எளிய கனசதுரம் = 52.4%, பொருள் மைய கனசதுரம் = 68%, முகப்பு மைய கனசதுரம் = 74%. அலகுக்கூட்டின் அடர்த்தி \\rho = \\frac{nM}{a^3 N_A}. பிராக் சமன்பாடு: n\\lambda = 2d \\sin \\theta. ஷாட்கி குறைபாடு மற்றும் பிரங்கல் குறைபாடு.",
  },
  {
    subjectCode: "CHE-12",
    unitNumber: 7,
    chunkTitle: "Chemical Kinetics / வேதி வினைவேகவியல்",
    contentEn: "Rate of reaction: -\\frac{1}{a}\\frac{d[A]}{dt} = \\frac{1}{b}\\frac{d[B]}{dt}. Rate law: \\text{Rate} = k[A]^x[B]^y where x+y is overall order. First order integrated rate equation: k = \\frac{2.303}{t}\\log\\frac{[A_0]}{[A]}. Half-life of first order: t_{1/2} = \\frac{0.693}{k} (independent of [A_0]). Arrhenius equation: k = A e^{-E_a/RT}, \\ln k = \\ln A - \\frac{E_a}{RT}.",
    contentTa: "வினைவேகம் மற்றும் வினைவேக விதி: \\text{Rate} = k[A]^x[B]^y. முதல் வகை வினைக்கான சமன்பாடு: k = \\frac{2.303}{t}\\log\\frac{[A_0]}{[A]}. முதல் வகை வினையின் அரை ஆயுட்காலம்: t_{1/2} = \\frac{0.693}{k}. அர்ஹீனியஸ் சமன்பாடு: k = A e^{-E_a/RT}.",
  },
  {
    subjectCode: "CHE-12",
    unitNumber: 11,
    chunkTitle: "Hydroxy Compounds and Ethers / ஹைட்ராக்ஸி சேர்மங்கள் மற்றும் ஈதர்கள்",
    contentEn: "Alcohols classification: 1°, 2°, 3°. Lucas test: Conc. HCl + Anhydrous ZnCl_2. 3° alcohol gives immediate turbidity, 2° gives turbidity in 5 mins, 1° does not react at room temp. Victor Meyer's test: 1° gives Blood Red colour, 2° gives Blue colour, 3° gives Colourless. Kolbe's reaction: Phenol + NaOH + CO_2 at 400K, 4-7 atm gives Salicylic acid. Reimer-Tiemann reaction: Phenol + CHCl_3 + NaOH gives Salicylaldehyde.",
    contentTa: "ஆல்கஹால்கள் வகைப்பாடு: 1°, 2°, 3°. லூகாஸ் சோதனை: 3° ஆல்கஹால் உடனடியாக கலங்கல்தன்மை தருகிறது, 2° ஆல்கஹால் 5 நிமிடங்களில், 1° ஆல்கஹால் அறை வெப்பநிலையில் வினைபுரியாது. விக்டர் மேயர் சோதனை: 1° செந்நிறம், 2° நீல நிறம், 3° நிறமற்றது. கோல்ப் வினை: சாலிசிலிக் அமிலம் உருவாகிறது. ரீமர்-டீமன் வினை: சாலிசிலால்டிஹைடு உருவாகிறது.",
  }
];

async function seed() {
  console.log("Seeding syllabus vectors for MAT-12 and CHE-12...");
  const allChunks = [...mathChunks, ...chemChunks];

  for (const c of allChunks) {
    // Generate deterministic 768-dim normalized pseudo-embedding
    const vec = new Array(768).fill(0).map((_, i) => {
      const val = Math.sin((i + 1) * (c.unitNumber * 17) + c.subjectCode.charCodeAt(0));
      return Number(val.toFixed(6));
    });

    const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
    const normalizedVec = vec.map((v) => Number((v / (norm || 1)).toFixed(6)));

    await db.syllabusVector.create({
      data: {
        subjectCode: c.subjectCode,
        unitNumber: c.unitNumber,
        chunkTitle: c.chunkTitle,
        contentEn: c.contentEn,
        contentTa: c.contentTa,
        embedding: JSON.stringify(normalizedVec),
      },
    });
    console.log(`✓ Seeded ${c.subjectCode} Unit ${c.unitNumber}: ${c.chunkTitle.slice(0, 40)}...`);
  }

  const count = await db.syllabusVector.count();
  console.log(`Done! Total SyllabusVector records in DB: ${count}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

