/**
 * Official Tamil Nadu Samacheer Kalvi Dual-Language Question Dictionary & Translator
 * Translates questions and standard mathematical/scientific phrases into natural Tamil.
 */

export const QUESTION_TRANSLATION_MAP = {
  // Class 10 Mathematics Core Questions
  "If n(A x B) = 12 and n(A) = 4, then n(B) is equal to:":
    "n(A x B) = 12 மற்றும் n(A) = 4 எனில், n(B) இன் மதிப்பு:",
  "The modular arithmetic expression 17 ≡ x (mod 5) yields x as:":
    "17 ≡ x (மட்டு 5) என்ற மட்டு எண் கணித சமன்பாட்டில் x-ன் மதிப்பு:",
  "If a, b, c are in A.P., then (a - b) / (b - c) is equal to:":
    "a, b, c என்பன ஒரு கூட்டுத் தொடர்வரிசையில் இருப்பின் (a - b) / (b - c) இன் மதிப்பு:",
  "If the ordered pairs (a + 2, 4) and (5, 2a + b) are equal, then (a, b) is:":
    "(a + 2, 4) மற்றும் (5, 2a + b) ஆகிய வரிசைச் சோடிகள் சமம் எனில் (a, b) என்பது:",
  "If the HCF of 65 and 117 is expressible in the form 65m - 117, then the value of m is:":
    "65 மற்றும் 117-ன் மீ.பொ.வ-வை 65m - 117 என எழுதினால், m-ன் மதிப்பு:",
  "If ΔABC ~ ΔPQR such that Area(ΔABC) = 9 cm2 and Area(ΔPQR) = 16 cm2 with BC = 2.1 cm, then QR is:":
    "ΔABC ~ ΔPQR மற்றும் பரப்பளவு(ΔABC) = 9 செ.மீ², பரப்பளவு(ΔPQR) = 16 செ.மீ² மற்றும் BC = 2.1 செ.மீ எனில், QR-ன் மதிப்பு:",
  "If 4ABC ~ APQR such that Area(4ABC) = 9 cm2 and Area(APQR) = 16 cm2 with BC = 2.1 cm, then QR is:":
    "ΔABC ~ ΔPQR மற்றும் பரப்பளவு(ΔABC) = 9 செ.மீ², பரப்பளவு(ΔPQR) = 16 செ.மீ² மற்றும் BC = 2.1 செ.மீ எனில், QR-ன் மதிப்பு:",
  "In an A.P., if the p-th term is q and the q-th term is p, then its (p + q)-th term is:":
    "ஒரு கூட்டுத் தொடர்வரிசையில் p-வது உறுப்பு q மற்றும் q-வது உறுப்பு p எனில், அதன் (p + q)-வது உறுப்பு:",
  "The slope of a line which is perpendicular to the line joining (0, 0) and (-8, 8) is:":
    "(0, 0) மற்றும் (-8, 8) ஆகிய புள்ளிகளை இணைக்கும் கோட்டிற்கு செங்குத்தான கோட்டின் சாய்வு:",
  "If sin θ + cos θ = a and sec θ + cosec θ = b, then the value of b(a² - 1) is:":
    "sin θ + cos θ = a மற்றும் sec θ + cosec θ = b எனில், b(a² - 1)-ன் மதிப்பு:",
  "The total surface area of a cylinder whose radius is 1/3 of its height is:":
    "ஒரு உருளையின் ஆரம் அதன் உயரத்தில் 1/3 பங்கு எனில், அதன் மொத்தப் புறப்பரப்பளவு:",
  "The range of the data 8, 8, 8, 8, 8... 8 is:":
    "8, 8, 8, 8, 8... 8 என்ற தரவுகளின் வீச்சு:",
  "If a letter is chosen at random from the English alphabet, the probability that it is a letter of the word 'MATHEMATICS' is:":
    "ஆங்கில எழுத்துக்களிலிருந்து ஒரு எழுத்து சமவாய்ப்பு முறையில் தேர்ந்தெடுக்கப்பட்டால், அது 'MATHEMATICS' என்ற சொல்லிலுள்ள எழுத்தாக இருப்பதற்கான நிகழ்தகவு:",
  "If the ratio of the volume of two spheres is 8:27, then the ratio of their surface areas is:":
    "இரண்டு கோளங்களின் கனஅளவுகளின் விகிதம் 8:27 எனில், அவற்றின் புறப்பரப்பளவுகளின் விகிதம்:",
  "The coordinates of the point which divides the line segment joining (1, -2) and (4, 7) internally in the ratio 1:2 is:":
    "(1, -2) மற்றும் (4, 7) ஆகிய புள்ளிகளை இணைக்கும் கோட்டுத்துண்டை 1:2 என்ற விகிதத்தில் உட்புறமாகப் பிரிக்கும் புள்ளியின் ஆயத்தொலைவுகள்:",
};

export const COMMON_PHRASE_TRANSLATIONS = [
  { en: /is equal to:/gi, ta: "இன் மதிப்பு:" },
  { en: /then the value of/gi, ta: "எனில் இதன் மதிப்பு" },
  { en: /find the value of/gi, ta: "மதிப்பினைக் காண்க:" },
  { en: /are in A\.P\./gi, ta: "ஒரு கூட்டுத் தொடர்வரிசையில் உள்ளன" },
  { en: /are in G\.P\./gi, ta: "ஒரு பெருக்குத் தொடர்வரிசையில் உள்ளன" },
  { en: /Area of/gi, ta: "பரப்பளவு" },
  { en: /Volume of/gi, ta: "கனஅளவு" },
  { en: /cm2/gi, ta: "செ.மீ²" },
  { en: /cm3/gi, ta: "செ.மீ³" },
];

/**
 * Returns Tamil translation of a question if available or automatically translates key terms.
 */
export function translateQuestion(text, lang = "en") {
  if (!text || (lang !== "ta" && lang !== "Tamil")) return text;

  const trimmed = text.trim();
  if (QUESTION_TRANSLATION_MAP[trimmed]) {
    return QUESTION_TRANSLATION_MAP[trimmed];
  }

  // Check if text already contains Tamil Unicode characters
  const hasTamil = /[\u0B80-\u0BFF]/.test(trimmed);
  if (hasTamil) return trimmed;

  // Partial phrase replacement for mathematical questions
  let translated = trimmed;
  for (const { en, ta } of COMMON_PHRASE_TRANSLATIONS) {
    translated = translated.replace(en, ta);
  }

  return translated;
}

