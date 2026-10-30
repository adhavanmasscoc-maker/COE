const fs = require('fs');
const path = require('path');
const dataset = require('./chemistry_100_questions.json');
const allQs = [...dataset.set1, ...dataset.set2];

let qMap = {
  // Class 10 Mathematics Core Questions
  'If n(A x B) = 12 and n(A) = 4, then n(B) is equal to:':
    'n(A x B) = 12 மற்றும் n(A) = 4 எனில், n(B) இன் மதிப்பு:',
  'The modular arithmetic expression 17 ≡ x (mod 5) yields x as:':
    '17 ≡ x (மட்டு 5) என்ற மட்டு எண் கணித சமன்பாட்டில் x-ன் மதிப்பு:',
  'If a, b, c are in A.P., then (a - b) / (b - c) is equal to:':
    'a, b, c என்பன ஒரு கூட்டுத் தொடர்வரிசையில் இருப்பின் (a - b) / (b - c) இன் மதிப்பு:',
  'If the ordered pairs (a + 2, 4) and (5, 2a + b) are equal, then (a, b) is:':
    '(a + 2, 4) மற்றும் (5, 2a + b) ஆகிய வரிசைச் சோடிகள் சமம் எனில் (a, b) என்பது:',
  'If the HCF of 65 and 117 is expressible in the form 65m - 117, then the value of m is:':
    '65 மற்றும் 117-ன் மீ.பொ.வ-வை 65m - 117 என எழுதினால், m-ன் மதிப்பு:',
  'If ΔABC ~ ΔPQR such that Area(ΔABC) = 9 cm² and Area(ΔPQR) = 16 cm² with BC = 2.1 cm, then QR is:':
    'ΔABC ~ ΔPQR மற்றும் பரப்பளவு(ΔABC) = 9 செ.மீ², பரப்பளவு(ΔPQR) = 16 செ.மீ² மற்றும் BC = 2.1 செ.மீ எனில், QR-ன் மதிப்பு:',
  'If ΔABC ~ ΔPQR such that Area(ΔABC) = 9 cm2 and Area(ΔPQR) = 16 cm2 with BC = 2.1 cm, then QR is:':
    'ΔABC ~ ΔPQR மற்றும் பரப்பளவு(ΔABC) = 9 செ.மீ², பரப்பளவு(ΔPQR) = 16 செ.மீ² மற்றும் BC = 2.1 செ.மீ எனில், QR-ன் மதிப்பு:',
  'The slope of the line which is perpendicular to a line with slope 2/3 is:':
    'சாய்வு 2/3 கொண்ட நேர்க்கோட்டிற்கு செங்குத்தான கோட்டின் சாய்வு:',
  'If the points (3, p), (5, 7) and (6, 6) are collinear, then p is:':
    '(3, p), (5, 7) மற்றும் (6, 6) ஆகிய புள்ளிகள் ஒரே நேர்க்கோட்டில் அமைந்தால், p-ன் மதிப்பு:',
  'The value of sin²θ + 1 / (1 + tan²θ) is equal to:':
    'sin²θ + 1 / (1 + tan²θ) என்பதன் மதிப்பு:',
  'A tower is 60 m high. Its shadow is x metres when the sun\'s altitude is 45°. The value of x is:':
    'ஒரு கோபுரத்தின் உயரம் 60 மீ. சூரியனின் ஏற்றக் கோணம் 45° ஆக இருக்கும் போது அதன் நிழலின் நீளம் x மீ எனில், x-ன் மதிப்பு:',
  'The total surface area of a hemisphere of radius r is:':
    'ஆரம் r கொண்ட ஓர் அரைக்கோளத்தின் மொத்தப் புறப்பரப்பளவு:',
  'The ratio of the volumes of two spheres of radii r1 and r2 is:':
    'ஆரங்கள் r1 மற்றும் r2 கொண்ட இரு கோளங்களின் கனஅளவுகளின் விகிதம்:',
  'Which of the following is not a measure of dispersion?':
    'பின்வருவனவற்றுள் எது பரவல் அளவை அல்ல?',
  'If P(A) = 0.37, P(B) = 0.42, and P(A ∩ B) = 0.09, then P(A ∪ B) is:':
    'P(A) = 0.37, P(B) = 0.42, மற்றும் P(A ∩ B) = 0.09 எனில், P(A ∪ B) இன் மதிப்பு:',
  // Physics Questions
  'The electric flux through a closed surface depends upon:':
    'ஒரு மூடிய பரப்பின் வழியே பாயும் மின்பாயம் எதனைச் சார்ந்தது?',
  'Kirchhoff\'s first law (junction rule) expresses the conservation of:':
    'கிர்க்காஃபின் முதல் விதி (சந்தி விதி) எதன் மாறா விதியை விளக்குகிறது?',
  'A step-up transformer converts:':
    'ஒரு ஏற்று மின்மாற்றி மாற்றுவது:',
  'Which of the following electromagnetic waves has the highest frequency?':
    'பின்வரும் மின்காந்த அலைகளில் மிக அதிக அதிர்வெண் கொண்டது எது?',
  'The phenomenon responsible for the twinkling of stars is:':
    'விண்மீன்கள் மின்னுவதற்கு காரணமான நிகழ்வு:',
  'The work function of a metal depends on:':
    'ஒரு உலோகத்தின் வெளியேற்று ஆற்றல் எதனைப் பொறுத்தது?',
  'In nuclear fission of U-235, the average number of neutrons released per fission is about:':
    'U-235 இன் அணுக்கரு பிளவில் ஒரு பிளவிற்கு வெளிப்படும் சராசரி நியூட்ரான்களின் எண்ணிக்கை:',
  'In an unbiased p-n junction, the width of the depletion region is of the order of:':
    'பின்னோக்கு சார்பற்ற p-n சந்தியில், விலக்கப்பட்ட பகுதியின் அகலம் எந்த அளவில் இருக்கும்?',
  'The ratio of magnetic length to geometric length of a bar magnet is approximately:':
    'ஒரு சட்ட காந்தத்தின் காந்த நீளத்திற்கும் வடிவியல் நீளத்திற்கும் இடையேயான விகிதம் தோராயமாக:',
  'Self-inductance of a coil does not depend on:':
    'ஒரு கம்பிச்சுருளின் தன் மின் தூண்டல் எண் எதனைச் சார்ந்தது அல்ல?',
  'Light waves can be polarized because they are:':
    'ஒளி அலைகள் தளவிளைவுக்கு உட்படுத்தப்படலாம் ஏனெனில் அவை:',
  'The de Broglie wavelength of an electron accelerated through V volts is given by:':
    'V வோல்ட் மின்னழுத்தத்தால் முடுக்கப்படும் எலக்ட்ரானின் டி-பிராய் அலைநீளம்:',
  'The mass defect per nucleon in a nucleus is called its:':
    'ஓர் அணுக்கருவின் ஒரு நியூக்ளியானுக்கான நிறை குறைபாடு இவ்வாறு அழைக்கப்படுகிறது:',
  'A zener diode is primarily used as a:':
    'ஜீனர் டையோடு முதன்மையாக எதற்காகப் பயன்படுகிறது?',
  'Which modulation technique is most immune to atmospheric noise?':
    'வளிமண்டல இரைச்சலால் பாதிக்கப்படாத பண்பேற்ற முறை எது?',
  // Computer Science Questions
  'Which of the following is an organized collection of data?':
    'பின்வருவனவற்றுள் ஒழுங்கமைக்கப்பட்ட தரவுகளின் தொகுப்பு எது?',
  'The private members of a class can be accessed from outside the class using:':
    'ஒரு இனக்குழுவின் பிரைவேட் உறுப்புகளை இனக்குழுவிற்கு வெளியே இருந்து அணுகுவது:',
  'Which of the following algorithm design techniques uses a top-down approach?':
    'பின்வரும் நெறிமுறை வடிவமைப்பு நுட்பங்களில் மேலிருந்து கீழ் அணுகுமுறையைப் பயன்படுத்துவது எது?',
  'What is the worst-case time complexity of Bubble Sort?':
    'குமிழி வரிசையாக்கத்தின் (Bubble Sort) மோசமான நிலை நேரச் சிக்கல் என்ன?',
  'Which operator is used for Exponentiation in Python?':
    'பைத்தானில் அடுக்குக் குறியீட்டுக்கு (Exponentiation) பயன்படும் செயற்குறி எது?',
  'Which control statement in Python is used as a placeholder for future code?':
    'பைத்தானில் எதிர்காலக் குறியீட்டிற்கான ஒதுக்கிடமாகப் பயன்படும் கட்டுப்பாட்டு கூற்று எது?',
  'In Python, which function is used to find the length of a string/list?':
    'பைத்தானில் சரம்/பட்டியலின் நீளத்தைக் கண்டறியப் பயன்படும் செயற்கூறு எது?',
  'Which data type in Python is immutable?':
    'பைத்தானில் மாற்ற முடியாத (immutable) தரவு வகை எது?',
  'Which class method is automatically executed when an object of a class is created in Python?':
    'பைத்தானில் ஒரு இனக்குழுவின் பொருள் உருவாக்கப்படும் போது தானாகவே இயங்கும் முறை எது?',
  'What is the full form of DBMS?':
    'DBMS என்பதன் விரிவாக்கம் என்ன?',
  'Which key uniquely identifies each record in a relational table?':
    'உறவுநிலை அட்டவணையில் ஒவ்வொரு பதிவையும் தனித்துவமாக அடையாளம் காணும் சாவி எது?',
  'Which SQL command is used to remove a table permanently from a database?':
    'தரவுத்தளத்திலிருந்து ஒரு அட்டவணையை நிரந்தரமாக நீக்கப் பயன்படும் SQL கட்டளை எது?',
  'Which CSV module function is used to write data into a CSV file line by line?':
    'CSV கோப்பில் வரியாகத் தரவை எழுதப் பயன்படும் CSV தொகுதியின் செயற்கூறு எது?',
  'Which Python module provides functions for interfacing with the operating system?':
    'இயக்க முறைமையுடன் இடைமுகம் செய்ய செயற்கூறுகளை வழங்கும் பைத்தான் தொகுதி எது?',
  'Which SQL function returns the largest value of the selected column?':
    'தேர்ந்தெடுக்கப்பட்ட நெடுவரிசையின் மிகப்பெரிய மதிப்பைத் தரும் SQL செயற்கூறு எது?'
};

let optMap = {
  'Low voltage into high voltage': 'குறைந்த மின்னழுத்தத்தை அதிக மின்னழுத்தமாக',
  'Charge': 'மின்னூட்டம்',
  'Energy': 'ஆற்றல்',
  'Momentum': 'உந்தம்',
  'Mass': 'நிறை',
  'Gamma rays': 'காமா கதிர்கள்',
  'X-rays': 'எக்ஸ்-கதிர்கள்',
  'Atmospheric refraction': 'வளிமண்டல ஒளிவிலகல்',
  'Dispersion': 'நிறப்பிரிகை',
  'Refraction': 'ஒளிவிலகல்',
  'Scattering': 'ஒளிச்சிதறல்',
  'Tuple': 'Tuple (மாறா வரிசை)',
  'List': 'List (பட்டியல்)',
  'Dictionary': 'Dictionary (அகராதி)',
  'Set': 'Set (கணம்)',
  'PRIMARY KEY': 'முதன்மைச் சாவி (PRIMARY KEY)',
  'FOREIGN KEY': 'வெளிநாட்டுச் சாவி (FOREIGN KEY)',
  'CANDIDATE KEY': 'வேட்பாளர் சாவி (CANDIDATE KEY)',
  'DROP TABLE': 'DROP TABLE',
  'DELETE TABLE': 'DELETE TABLE',
  'TRUNCATE TABLE': 'TRUNCATE TABLE',
  'REMOVE TABLE': 'REMOVE TABLE',
  'Yes': 'ஆம்',
  'No': 'இல்லை',
  'Always True': 'எப்பொழுதும் உண்மை',
  'Always False': 'எப்பொழுதும் தவறு'
};

allQs.forEach(q => {
  qMap[q.question_en.trim()] = q.question_ta.trim();
  ['a', 'b', 'c', 'd'].forEach(k => {
    const en = q.options_en[k].trim();
    const ta = q.options_ta[k].trim();
    if (en && ta) optMap[en] = ta;
  });
});

const out = `/**
 * Official Tamil Nadu Samacheer Kalvi Dual-Language Question & Options Dictionary
 * Translates questions and options into natural Tamil for Board Exam compliance.
 */

export const QUESTION_TRANSLATION_MAP = ${JSON.stringify(qMap, null, 2)};

export const OPTION_TRANSLATION_MAP = ${JSON.stringify(optMap, null, 2)};

export const COMMON_PHRASE_TRANSLATIONS = [
  { en: /is equal to:/gi, ta: "இன் மதிப்பு:" },
  { en: /then the value of/gi, ta: "எனில் இதன் மதிப்பு" },
  { en: /find the value of/gi, ta: "மதிப்பினைக் காண்க:" },
  { en: /are in A\\.P\\./gi, ta: "ஒரு கூட்டுத் தொடர்வரிசையில் உள்ளன" },
  { en: /are in G\\.P\\./gi, ta: "ஒரு பெருக்குத் தொடர்வரிசையில் உள்ளன" },
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
  const hasTamil = /[\\u0B80-\\u0BFF]/.test(trimmed);
  if (hasTamil) return trimmed;

  // Partial phrase replacement for mathematical questions
  let translated = trimmed;
  for (const { en, ta } of COMMON_PHRASE_TRANSLATIONS) {
    translated = translated.replace(en, ta);
  }

  return translated;
}

/**
 * Returns Tamil translation of an option if available.
 */
export function translateOption(text, lang = "en") {
  if (!text || (lang !== "ta" && lang !== "Tamil")) return text;

  const trimmed = String(text).trim();
  if (OPTION_TRANSLATION_MAP[trimmed]) {
    return OPTION_TRANSLATION_MAP[trimmed];
  }

  const hasTamil = /[\\u0B80-\\u0BFF]/.test(trimmed);
  if (hasTamil) return trimmed;

  return trimmed;
}
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/questionTranslations.js'), out, 'utf-8');
console.log('✅ Generated src/lib/questionTranslations.js with', Object.keys(qMap).length, 'questions and', Object.keys(optMap).length, 'options!');
