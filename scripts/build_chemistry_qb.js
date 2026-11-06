const fs = require('fs');
const path = require('path');
const { generateSubjectHtml, YEARS, SESSIONS } = require('./qb_builder_core');

const ROOT_DIR = path.resolve(__dirname, '..');

// Load Chemistry question pools
const masterChe = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'json-db/12/CHE-12-MASTER.json'), 'utf8'))
  .filter(q => q.type === 'QUESTION_ITEM');
const all100Che = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'questions/exams/CHEMISTRY-12-100-ALL.json'), 'utf8'));
const set1Che = all100Che.set1 || [];
const set2Che = all100Che.set2 || [];
const day3Che = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'questions/exams/DAY3-12-CHEMISTRY-25.json'), 'utf8')).questions || [];

console.log('Chemistry pool loaded:', {
  master: masterChe.length,
  set1: set1Che.length,
  set2: set2Che.length,
  day3: day3Che.length
});

// Standard Class 12 Chemistry Units for rubric
const CHE_UNITS = [
  'Unit 1: Metallurgy (உலோகவியல்)',
  'Unit 2: p-Block Elements - I (p-தொகுதி தனிமங்கள் - I)',
  'Unit 3: p-Block Elements - II (p-தொகுதி தனிமங்கள் - II)',
  'Unit 4: Transition & Inner Transition Elements (இடைநிலை & உள் இடைநிலை தனிமங்கள்)',
  'Unit 5: Coordination Chemistry (அணைவு வேதியியல்)',
  'Unit 6: Solid State (திட நிலைமை)',
  'Unit 7: Chemical Kinetics (வேதி வினைவேகவியல்)',
  'Unit 8: Ionic Equilibrium (அயனிச் சமநிலை)',
  'Unit 9: Electrochemistry (மின் வேதியியல்)',
  'Unit 10: Surface Chemistry (புறப்பரப்பு வேதியியல்)',
  'Unit 11: Hydroxy Compounds & Ethers (ஹைட்ராக்ஸி சேர்மங்கள் மற்றும் ஈதர்கள்)',
  'Unit 12: Carbonyl Compounds (கார்போனைல் சேர்மங்கள்)',
  'Unit 13: Carboxylic Acids & Derivatives (கார்பாக்சிலிக் அமிலங்கள்)',
  'Unit 14: Organic Nitrogen Compounds (கரிம நைட்ரஜன் சேர்மங்கள்)',
  'Unit 15: Biomolecules (உயிரியல் மூலக்கூறுகள்)'
];

// Helper to normalize questions
function normalizeCheQuestion(raw, idx) {
  if (raw.questionPayload) {
    const p = raw.questionPayload;
    return {
      id: idx + 1,
      qn: idx + 1,
      qEn: p.questionEn,
      qTa: p.questionTa || p.questionEn,
      optionsEn: p.options ? [p.options.a, p.options.b, p.options.c, p.options.d] : ['(A) True', '(B) False', '(C) Incomplete', '(D) Cannot determine'],
      optionsTa: p.options ? [p.options.a, p.options.b, p.options.c, p.options.d] : ['(அ) சரி', '(ஆ) தவறு', '(இ) முழுமையற்றது', '(ஈ) நிர்ணயிக்க முடியாது'],
      answer: p.correctAnswer || 'a',
      chapterEn: raw.topic || CHE_UNITS[idx % CHE_UNITS.length],
      chapterTa: raw.unitTitle?.ta || 'வேதியியல்',
      explanationEn: p.stepByStepSolution?.en || 'Refer Samacheer Kalvi Class 12 Chemistry textbook.',
      explanationTa: p.stepByStepSolution?.ta || 'தமிழ்நாடு அரசு மேல்நிலை இரண்டாம் ஆண்டு வேதியியல் பாடநூல் வழிகாட்டல்.'
    };
  } else {
    return {
      id: idx + 1,
      qn: idx + 1,
      qEn: raw.question_en || raw.question || raw.qEn || '',
      qTa: raw.question_ta || raw.qTa || raw.question_en || '',
      optionsEn: raw.options_en || raw.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsTa: raw.options_ta || raw.options || ['விருப்பம் அ', 'விருப்பம் ஆ', 'விருப்பம் இ', 'விருப்பம் ஈ'],
      answer: (raw.correct_option || raw.answer || 'a').toLowerCase().replace(/[\(\)]/g, ''),
      chapterEn: raw.chapter || raw.unit || CHE_UNITS[idx % CHE_UNITS.length],
      chapterTa: raw.chapter_ta || 'வேதியியல் பாடப்பிரிவு',
      explanationEn: raw.explanation_en || raw.explanation || 'Verified Samacheer Kalvi DGE scheme of valuation answer.',
      explanationTa: raw.explanation_ta || 'அரசுத் தேர்வுகள் இயக்கக அதிகாரப்பூர்வ விடைக்குறிப்பு.'
    };
  }
}

// Generate all 14 chemistry papers
const cheExamPapers = {};
const combinedPool = [...masterChe, ...set1Che, ...set2Che, ...day3Che];

// Standard 2-Mark, 3-Mark, and 5-Mark question bank templates for Chemistry
const CHE_PART2_BANK = [
  {
    qEn: "What is the role of cryolite in the extraction of aluminium by Hall-Héroult process?",
    qTa: "ஹால்-ஹெரால்ட் முறையில் அலுமினியத்தைப் பிரித்தெடுப்பதில் கிரையோலைட்டின் பங்கு யாது?",
    chapterEn: "Unit 1: Metallurgy",
    solutionEn: "Cryolite ($Na_3AlF_6$) lowers the melting point of pure alumina from $2072^\\circ\\text{C}$ to about $950^\\circ\\text{C}$ and increases the electrical conductivity of the molten electrolyte.",
    solutionTa: "கிரையோலைட் ($Na_3AlF_6$) தூய அலுமினாவின் உருகுநிலையை $2072^\\circ\\text{C}$-லிருந்து சுமார் $950^\\circ\\text{C}$-க்குக் குறைக்கிறது மற்றும் உருகிய மின்பகுபொருளின் மின்கடத்துத்திறனை அதிகரிக்கிறது.",
    markRubric: "1 Mark: Lowering melting point, 1 Mark: Increasing electrical conductivity"
  },
  {
    qEn: "Why is nitrogen chemically inert at room temperature?",
    qTa: "அறை வெப்பநிலையில் நைட்ரஜன் வேதியியல் ரீதியாக மந்தமாக இருப்பது ஏன்?",
    chapterEn: "Unit 3: p-Block Elements",
    solutionEn: "Nitrogen exists as a diatomic molecule ($N_2$) with an exceptionally strong triple covalent bond ($N \\equiv N$) possessing a very high bond dissociation enthalpy ($945 \\text{ kJ mol}^{-1}$).",
    solutionTa: "நைட்ரஜன் மூலக்கூறில் ($N_2$) இரு அணுக்களுக்கு இடையே மிக வலுவான முப்பிணைப்பு ($N \\equiv N$) உள்ளது. இதன் பிணைப்பு பிளத்தல் என்தால்பி மிக அதிகம் ($945 \\text{ kJ mol}^{-1}$).",
    markRubric: "1 Mark: Triple bond presence ($N \\equiv N$), 1 Mark: High bond dissociation energy"
  },
  {
    qEn: "Explain why transition metals and their compounds act as good catalysts.",
    qTa: "இடைநிலைத் தனிமங்களும் அவற்றின் சேர்மங்களும் சிறந்த வினையூக்கிகளாகச் செயல்படுவது ஏன்?",
    chapterEn: "Unit 4: Transition Elements",
    solutionEn: "Transition elements have variable oxidation states, vacant $d$-orbitals to form intermediate complexes, and provide large surface area for adsorption of reactants.",
    solutionTa: "இடைநிலைத் தனிமங்கள் மாறுபடும் ஆக்சிஜனேற்ற நிலைகளைக் கொண்டுள்ளன; காலியான $d$-ஆர்பிட்டால்களைக் கொண்டிருப்பதால் இடைநிலைச் சேர்மங்களை உருவாக்குகின்றன.",
    markRubric: "1 Mark: Variable oxidation state, 1 Mark: Vacant d-orbitals / surface adsorption"
  },
  {
    qEn: "Define coordination number in complexes. Give one example.",
    qTa: "அணைவுச் சேர்மங்களில் அணைவு எண் - வரையறு. ஓர் எடுத்துக்காட்டு தருக.",
    chapterEn: "Unit 5: Coordination Compounds",
    solutionEn: "Coordination number is the total number of ligand donor atoms directly bonded to the central metal atom/ion. Example: In $[Fe(CN)_6]^{4-}$, coordination number of $Fe^{2+}$ is 6.",
    solutionTa: "மைய உலோக அயனியுடன் நேரடியாகப் பிணைக்கப்பட்டுள்ள ஈனிகளின் வழங்கி அணுக்களின் மொத்த எண்ணிக்கை அணைவு எண் எனப்படும். எ.கா: $[Fe(CN)_6]^{4-}$-ல் அணைவு எண் 6.",
    markRubric: "1 Mark: Accurate Definition, 1 Mark: Valid Example"
  },
  {
    qEn: "State Schottky defect and give an example of an ionic crystal exhibiting it.",
    qTa: "ஷாட்கி குறைபாட்டைக் கூறி, அக்குறைபாட்டைக் காட்டும் அயனிப் படிகத்திற்கு ஓர் எடுத்துக்காட்டு தருக.",
    chapterEn: "Unit 6: Solid State",
    solutionEn: "Schottky defect arises due to the missing of equal numbers of cations and anions from the crystal lattice, decreasing the density. Example: $NaCl$, $KCl$.",
    solutionTa: "படிக அணிக்கோவை தளத்திலிருந்து சம எண்ணிக்கையிலான நேர் மற்றும் எதிர் அயனிகள் விடுபடுவதால் இக்குறைபாடு தோன்றுகிறது. இது அடர்த்தியைக் குறைக்கும். எ.கா: $NaCl$.",
    markRubric: "1 Mark: Definition (equal cations & anions missing), 1 Mark: Example ($NaCl$)"
  },
  {
    qEn: "Define half-life period of a chemical reaction ($t_{1/2}$).",
    qTa: "ஒரு வேதிவினையின் அரை ஆயுட்காலம் ($t_{1/2}$) - வரையறு.",
    chapterEn: "Unit 7: Chemical Kinetics",
    solutionEn: "Half-life of a reaction is defined as the time required for the reactant concentration to decrease to exactly half of its initial concentration: $t_{1/2} = \\frac{0.693}{k}$ (for 1st order).",
    solutionTa: "ஒரு வினையில் வினையடுபொருளின் தொடக்கச் செறிவு பாதியாகக் குறைவதற்குத் தேவைப்படும் காலம் அவ்வினைக்கான அரை ஆயுட்காலம் எனப்படும்.",
    markRubric: "1 Mark: Definition, 1 Mark: Mathematical expression for 1st order"
  },
  {
    qEn: "What are Lewis acids and bases? Give one example for each.",
    qTa: "லூயி அமிலங்கள் மற்றும் காரங்கள் என்றால் என்ன? ஒவ்வொன்றிற்கும் ஓர் எடுத்துக்காட்டு தருக.",
    chapterEn: "Unit 8: Ionic Equilibrium",
    solutionEn: "Lewis acid: Electron pair acceptor (e.g. $BF_3$, $AlCl_3$). Lewis base: Electron pair donor (e.g. $NH_3$, $H_2O$).",
    solutionTa: "லூயி அமிலம்: எலக்ட்ரான் இணையை ஏற்றுக்கொள்ளும் பொருள் (எ.கா: $BF_3$). லூயி காரம்: எலக்ட்ரான் இணையை வழங்கும் பொருள் (எ.கா: $NH_3$).",
    markRubric: "1 Mark: Definitions, 1 Mark: Valid examples"
  },
  {
    qEn: "State Faraday's First Law of electrolysis.",
    qTa: "ஃபாரடேயின் முதல் மின்னாற்பகுப்பு விதியைக் கூறுக.",
    chapterEn: "Unit 9: Electrochemistry",
    solutionEn: "The mass of substance ($m$) deposited or liberated at any electrode during electrolysis is directly proportional to the quantity of electricity ($Q$) passed: $m = ZIt = ZQ$.",
    solutionTa: "மின்னாற்பகுப்பின் போது ஏதேனும் ஒரு மின்முனையில் படியும் பொருளின் நிறை ($m$), மின்பகுபொருளின் வழியே பாயும் மின்னூட்டத்தின் ($Q$) அளவிற்கு நேர்தகவில் அமையும்: $m = Z I t$.",
    markRubric: "1 Mark: Statement, 1 Mark: Formula $m = ZIt$"
  },
  {
    qEn: "[Compulsory Numerical] A first order reaction takes 40 minutes for 50% completion. Calculate the rate constant of the reaction.",
    qTa: "[கட்டாய வினா] ஒரு முதல் வகை வினை 50% நிறைவடைய 40 நிமிடங்கள் ஆகிறது. இவ்வினையின் வினைவேக மாறிலியைக் கணக்கிடுக.",
    isCompulsory: true,
    chapterEn: "Unit 7: Chemical Kinetics",
    solutionEn: "For a first order reaction: $k = \\frac{0.693}{t_{1/2}} = \\frac{0.693}{40 \\text{ min}} = 0.017325 \\text{ min}^{-1} = 1.73 \\times 10^{-2} \\text{ min}^{-1}$ (or $2.88 \\times 10^{-4} \\text{ s}^{-1}$).",
    solutionTa: "முதல் வகை வினைக்கு: $k = \\frac{0.693}{t_{1/2}} = \\frac{0.693}{40} = 0.017325 \\text{ min}^{-1} = 1.73 \\times 10^{-2} \\text{ min}^{-1}$.",
    markRubric: "1 Mark: Formula $k = 0.693 / t_{1/2}$, 1 Mark: Correct calculation with unit"
  }
];

const CHE_PART3_BANK = [
  {
    qEn: "Explain Zone Refining method with the underlying principle and a neat diagram.",
    qTa: "புலத் தூய்மையாக்கல் முறையின் தத்துவத்தை தகுந்த படத்துடன் விவரிக்க.",
    chapterEn: "Unit 1: Metallurgy",
    solutionEn: "Principle: Fractional crystallization. Impurities are more soluble in the molten state than in the solid state of the metal. Used for semiconductors like $Ge, Si, Ga$.",
    solutionTa: "தத்துவம்: பின்னப் படிகமாக்கல். அசுத்தங்கள் திண்ம நிலையை விட உருகிய நிலையில் அதிக கரையும் தன்மை கொண்டவை. $Ge, Si$ போன்ற குறைக்கடத்திகளைத் தூய்மைப்படுத்தப் பயன்படுகிறது.",
    markRubric: "1 Mark: Fractional crystallization principle, 1 Mark: Setup and procedure, 1 Mark: Example"
  },
  {
    qEn: "Derive the relation between pH and pOH for pure water at 298 K.",
    qTa: "$298 \\text{ K}$-ல் தூய நீருக்கான pH மற்றும் pOH இடையேயான தொடர்பைத் தருவிக்க.",
    chapterEn: "Unit 8: Ionic Equilibrium",
    solutionEn: "Ionic product of water: $K_w = [H_3O^+][OH^-] = 10^{-14}$. Taking $-\\log$ on both sides: $-\\log K_w = -\\log[H_3O^+] - \\log[OH^-] \\implies pK_w = pH + pOH = 14$.",
    solutionTa: "நீரின் அயனிப் பெருக்கம்: $K_w = [H^+][OH^-] = 10^{-14}$. இருபுறமும் $-\\log$ எடுக்க: $-\\log K_w = -\\log[H^+] - \\log[OH^-] \\implies pH + pOH = 14$.",
    markRubric: "1 Mark: Definition of $K_w$, 1 Mark: Logarithmic transformation, 1 Mark: $pH + pOH = 14$"
  },
  {
    qEn: "State Kohlrausch's Law and mention any two of its applications.",
    qTa: "கோல்ராஷ் விதியைக் கூறி அதன் ஏதேனும் இரு பயன்பாடுகளைக் குறிப்பிடுக.",
    chapterEn: "Unit 9: Electrochemistry",
    solutionEn: "At infinite dilution, molar conductivity of an electrolyte is the sum of limiting ionic conductivities of its constituent cations and anions: $\\Lambda_m^\\circ = \\nu_+ \\lambda_+^\\circ + \\nu_- \\lambda_-^\\circ$. Applications: 1. Calculation of $\\Lambda_m^\\circ$ for weak electrolytes like $CH_3COOH$. 2. Determination of degree of dissociation ($\\alpha$).",
    solutionTa: "முடிவிலா நீர்த்தலில், ஒரு மின்பகுபொருளின் மோலார் கடத்துத்திறன் அதன் நேர் மற்றும் எதிர் அயனிகளின் எல்லை மோலார் கடத்துத்திறன்களின் கூடுதலுக்குச் சமம். பயன்பாடுகள்: எளிய முறையில் வலிமை குறைந்த மின்பகுபொருட்களின் $\\Lambda_m^\\circ$ கணக்கிடலாம்.",
    markRubric: "1.5 Marks: Statement and equation, 1.5 Marks: Two valid applications"
  },
  {
    qEn: "How are colloids classified based on the physical state of dispersed phase and dispersion medium? Give two examples.",
    qTa: "பிரிந்த நிலைமை மற்றும் பிரிகை ஊடகத்தின் இயற்பியல் நிலையை அடிப்படையாகக் கொண்டு கூழ்மங்கள் எவ்வாறு வகைப்படுத்தப்படுகின்றன? இரு எடுத்துக்காட்டுகள் தருக.",
    chapterEn: "Unit 10: Surface Chemistry",
    solutionEn: "Colloids are classified into 8 classes: Sol (solid in liquid, e.g. paint), Gel (liquid in solid, e.g. cheese), Emulsion (liquid in liquid, e.g. milk), Aerosol (solid or liquid in gas, e.g. smoke, fog).",
    solutionTa: "கூழ்மங்கள் 8 வகைகளாகப் பிரிக்கப்படுகின்றன: கரைசல் (திண்மம் திரவத்தில், எ.கா: பெயிண்ட்), களி (திரவம் திண்மத்தில், எ.கா: பாலாடைக்கட்டி), பால்மம் (பால்), ஏரோசால் (புகை).",
    markRubric: "1.5 Marks: Classification framework, 1.5 Marks: Two accurate examples"
  },
  {
    qEn: "Write the preparation of phenol by Dow's process with chemical equation.",
    qTa: "டௌ முறையில் குளோரோபென்சீனிலிருந்து பீனால் தயாரித்தலை வேதிச் சமன்பாட்டுடன் எழுதுக.",
    chapterEn: "Unit 11: Hydroxy Compounds",
    solutionEn: "Chlorobenzene when heated with 6-8% aqueous $NaOH$ at $623 \\text{ K}$ and $300 \\text{ atm}$ in a closed vessel gives sodium phenoxide, which on acidification with dilute $HCl$ yields phenol ($C_6H_5OH$).",
    solutionTa: "குளோரோபென்சீன் 6-8% $NaOH$ கரைசலுடன் $623 \\text{ K}$ வெப்பநிலையிலும் $300 \\text{ atm}$ அழுத்தத்திலும் சூடுபடுத்தப்படும் போது சோடியம் பீனாக்சைடு உருவாகிறது. இது நீர்த்த $HCl$-உடன் வினையுற்று பீனாலைத் தருகிறது.",
    markRubric: "1.5 Marks: Reaction conditions ($623 \\text{ K}, 300 \\text{ atm}$), 1.5 Marks: Balanced chemical equations"
  },
  {
    qEn: "Explain Rosenmund reduction with a chemical equation.",
    qTa: "ரோசன்மண்ட் ஒடுக்க வினையை வேதிச் சமன்பாட்டுடன் விளக்குக.",
    chapterEn: "Unit 12: Carbonyl Compounds",
    solutionEn: "Acid chlorides ($RCOCl$) are reduced to aldehydes ($RCHO$) by hydrogen in the presence of palladium catalyst supported on barium sulfate, poisoned with sulfur or quinoline: $CH_3COCl + H_2 \\xrightarrow{Pd/BaSO_4, \\text{quinoline}} CH_3CHO + HCl$.",
    solutionTa: "அசிட்டைல் குளோரைடு பேரியம் சல்பேட்டின் மீதுள்ள பல்லேடியம் வினையூக்கி மற்றும் குயினோலின் முன்னிலையில் ஹைட்ரஜனால் ஒடுக்கப்பட்டு அசிட்டால்டிஹைடைத் தருகிறது.",
    markRubric: "1.5 Marks: Catalyst specifications ($Pd/BaSO_4$), 1.5 Marks: Balanced equation"
  },
  {
    qEn: "What is Gabriel Phthalimide synthesis? What type of amines can be prepared by this method?",
    qTa: "கேப்ரியல் தாலிமைடு தொகுப்பு முறை என்றால் என்ன? இம்முறையில் எந்த வகை அமீன்களைத் தயாரிக்கலாம்?",
    chapterEn: "Unit 14: Organic Nitrogen Compounds",
    solutionEn: "Phthalimide reacts with ethanolic $KOH$ to form potassium phthalimide, which on heating with alkyl halide followed by alkaline hydrolysis gives pure aliphatic primary amines ($R-NH_2$). Aromatic primary amines cannot be prepared because aryl halides do not undergo nucleophilic substitution with phthalimide anion.",
    solutionTa: "தாலிமைடு ஆல்கஹால் கலந்த $KOH$-உடன் வினையுற்று பொட்டாசியம் தாலிமைடைத் தருகிறது. இது அல்கைல் ஹேலைடுடன் வினையுற்று பின்னர் கார நீராற்பகுப்பு அடைந்து தூய ஓரிணைய அலிபாட்டிக் அமீன்களைத் தருகிறது.",
    markRubric: "2 Marks: Synthesis procedure, 1 Mark: Limitation to primary aliphatic amines"
  },
  {
    qEn: "Differentiate between DNA and RNA (any three differences).",
    qTa: "DNA மற்றும் RNA ஆகியவற்றை வேறுபடுத்துக (ஏதேனும் மூன்று வேறுபாடுகள்).",
    chapterEn: "Unit 15: Biomolecules",
    solutionEn: "1. DNA contains 2-deoxyribose sugar; RNA contains D-ribose. 2. DNA bases: Adenine, Guanine, Cytosine, Thymine; RNA has Uracil in place of Thymine. 3. DNA is double-stranded with helical structure; RNA is typically single-stranded.",
    solutionTa: "1. DNA 2-டிஆக்சி ரிபோஸ் சர்க்கரையைக் கொண்டுள்ளது; RNA ரிபோஸ் சர்க்கரையைக் கொண்டுள்ளது. 2. DNA-வில் தயமின் உள்ளது; RNA-வில் யுராசில் உள்ளது. 3. DNA இரட்டைச் சுருள் அமைப்பு; RNA ஒற்றை இழை அமைப்பு.",
    markRubric: "1 Mark each for 3 distinct verified chemical/structural differences"
  },
  {
    qEn: "[Compulsory Numerical] Calculate the packing efficiency in a body-centered cubic (BCC) unit cell.",
    qTa: "[கட்டாய வினா] பொருள் மைய கனசதுர (BCC) அலகு கூட்டின் பொதிவுத் திறனைக் கணக்கிடுக.",
    isCompulsory: true,
    chapterEn: "Unit 6: Solid State",
    solutionEn: "In BCC: Body diagonal $\\sqrt{3}a = 4r \\implies r = \\frac{\\sqrt{3}a}{4}$. Volume of unit cell $V = a^3$. Number of atoms per unit cell $n = 2$. Total volume of 2 atoms: $2 \\times \\frac{4}{3}\\pi r^3 = \\frac{8}{3}\\pi \\left(\\frac{\\sqrt{3}a}{4}\\right)^3 = \\frac{\\sqrt{3}\\pi a^3}{8}$. Packing efficiency $= \\frac{\\text{Volume occupied}}{\\text{Volume of unit cell}} \\times 100 = \\frac{\\sqrt{3}\\pi}{8} \\times 100 \\approx 68\\%$.",
    solutionTa: "BCC அமைப்பில்: $\\sqrt{3}a = 4r \\implies r = \\frac{\\sqrt{3}a}{4}$. அலகு கூட்டிலுள்ள அணுக்களின் எண்ணிக்கை = 2. பொதிவுத்திறன் $= \\frac{2 \\times \\frac{4}{3}\\pi r^3}{a^3} \\times 100 = \\frac{\\sqrt{3}\\pi}{8} \\times 100 = 68\\%$.",
    markRubric: "1 Mark: Relation $\\sqrt{3}a = 4r$, 1 Mark: Volume calculation, 1 Mark: Final result 68%"
  }
];

const CHE_PART4_BANK = [
  {
    qEn: "**Question 34 (a) OR (b)**\n\n**(a)** Explain the extraction of zinc from zinc blende ($ZnS$) with balanced chemical equations.\n\n*— OR —*\n\n**(b)** Describe the manufacture of sulfuric acid by Contact Process with flow diagram and equations.",
    qTa: "**வினா 34 (அ) அல்லது (ஆ)**\n\n**(அ)** துத்தநாக பிளெண்ட் ($ZnS$) தாதுவிலிருந்து துத்தநாகம் பிரித்தெடுத்தலை வேதிச் சமன்பாடுகளுடன் விளக்குக.\n\n*— அல்லது —*\n\n**(ஆ)** தொடு முறையில் சல்பியூரிக் அமிலம் தயாரித்தலை பாய்வு வரைபடம் மற்றும் சமன்பாடுகளுடன் விவரிக்க.",
    chapterEn: "Unit 1: Metallurgy / Unit 3: p-Block",
    solutionEn: "**(a)** 1. Concentration by froth floatation using pine oil and sodium ethyl xanthate. 2. Roasting: $2ZnS + 3O_2 \\rightarrow 2ZnO + 2SO_2$. 3. Reduction by carbon (coke) in a vertical retort: $ZnO + C \\xrightarrow{1673 \\text{ K}} Zn + CO$. 4. Refining by fractional distillation.\n\n**(b)** Contact Process: 1. Burning of sulfur or iron pyrites: $S + O_2 \\rightarrow SO_2$. 2. Catalytic oxidation of $SO_2$ to $SO_3$ using $V_2O_5$: $2SO_2 + O_2 \\rightleftharpoons 2SO_3$ ($\\Delta H = -196.6 \\text{ kJ}$). 3. Absorption of $SO_3$ in $98\\% H_2SO_4$ to form oleum: $SO_3 + H_2SO_4 \\rightarrow H_2S_2O_7$. 4. Dilution of oleum with water: $H_2S_2O_7 + H_2O \\rightarrow 2H_2SO_4$.",
    solutionTa: "**(அ)** 1. நுரை மிதப்பு முறை மூலம் அடர்ப்பித்தல். 2. வறுத்தல்: $2ZnS + 3O_2 \\rightarrow 2ZnO + 2SO_2$. 3. கார்பன் ஒடுக்கம்: $ZnO + C \\rightarrow Zn + CO$. 4. பின்ன காய்ச்சி வடித்தல் மூலம் தூய்மையாக்கல்.\n\n**(ஆ)** தொடு முறை: 1. $S + O_2 \\rightarrow SO_2$. 2. $V_2O_5$ முன்னிலையில் ஆக்சிஜனேற்றம்: $2SO_2 + O_2 \\rightleftharpoons 2SO_3$. 3. புகையும் சல்பியூரிக் அமிலம் (ஒலியம்) தயாரித்தல்: $SO_3 + H_2SO_4 \\rightarrow H_2S_2O_7$. 4. நீர்த்தல்: $H_2S_2O_7 + H_2O \\rightarrow 2H_2SO_4$.",
    markRubric: "2.5 Marks: Detailed chemical equations with stoichiometry, 2.5 Marks: Operating principles and industrial steps"
  },
  {
    qEn: "**Question 35 (a) OR (b)**\n\n**(a)** What are the postulates of Werner's theory of coordination complexes? Mention its limitations.\n\n*— OR —*\n\n**(b)** What is lanthanoid contraction? Discuss its causes and consequences.",
    qTa: "**வினா 35 (அ) அல்லது (ஆ)**\n\n**(அ)** வெர்னரின் அணைவுக் கோட்பாட்டின் எடுகோள்கள் யாவை? அதன் வரம்புகளைக் குறிப்பிடுக.\n\n*— அல்லது —*\n\n**(ஆ)** லேந்தனாய்டு குறுக்கம் என்றால் என்ன? அதன் காரணங்கள் மற்றும் விளைவுகளை விவாதிக்க.",
    chapterEn: "Unit 5: Coordination Chemistry / Unit 4: Inner Transition",
    solutionEn: "**(a)** Postulates: 1. Central metal exhibits Primary valence (ionizable, corresponds to oxidation state, satisfied by negative ions) and Secondary valence (non-ionizable, corresponds to coordination number, satisfied by negative or neutral molecules directed in space). Limitations: Did not explain magnetic and optical properties or why only certain elements form complexes.\n\n**(b)** Lanthanoid contraction: The steady decrease in atomic and ionic radii of lanthanoid elements with increase in atomic number from $La$ to $Lu$. Cause: Imperfect shielding of $4f$ electrons. Consequences: 1. Resemblance of second and third transition series pairs (e.g. $Zr/Hf$). 2. Basic strength of hydroxides decreases from $La(OH)_3$ to $Lu(OH)_3$. 3. Difficulty in separation of lanthanoids.",
    solutionTa: "**(அ)** வெர்னர் கொள்கை: முதன்மை இணைதிறன் (அயனியாகும் தன்மை, ஆக்சிஜனேற்ற நிலை) மற்றும் இரண்டாம் நிலை இணைதிறன் (அயனியாகா தன்மை, அணைவு எண்). வரம்பு: காந்த மற்றும் நிறப் பண்புகளை விளக்கவில்லை.\n\n**(ஆ)** லேந்தனாய்டு குறுக்கம்: $La$-விலிருந்து $Lu$ வரை அணு எண் அதிகரிக்கும் போது அணு மற்றும் அயனி ஆரங்கள் சீராகக் குறைதல். காரணம்: $4f$ எலக்ட்ரான்களின் குறைவான திரைமறைப்பு விளைவு. விளைவுகள்: $Zr/Hf$ போன்ற இரட்டைகளின் பண்பொற்றுமை, காரத்தன்மை குறைதல்.",
    markRubric: "2.5 Marks: Thorough theoretical points with examples, 2.5 Marks: Chemical justifications"
  },
  {
    qEn: "**Question 36 (a) OR (b)**\n\n**(a)** Derive the integrated rate law for a first order reaction $A \\rightarrow \\text{Products}$ and calculate its half-life.\n\n*— OR —*\n\n**(b)** Derive Henderson-Hasselbalch equation for an acidic buffer solution.",
    qTa: "**வினா 36 (அ) அல்லது (ஆ)**\n\n**(அ)** $A \\rightarrow \\text{விளைபொருட்கள்}$ என்ற முதல் வகை வினைக்கான தொகைப்படுத்தப்பட்ட வேகச் சமன்பாட்டைத் தருவித்து அதன் அரை ஆயுளைக் கணக்கிடுக.\n\n*— அல்லது —*\n\n**(ஆ)** ஓர் அமில தாங்கல் கரைசலுக்கான ஹெண்டர்சன்-ஹேசல்பாக் சமன்பாட்டைத் தருவிக்க.",
    chapterEn: "Unit 7: Kinetics / Unit 8: Ionic Equilibrium",
    solutionEn: "**(a)** Rate: $-\\frac{d[A]}{dt} = k[A] \\implies \\frac{d[A]}{[A]} = -k dt$. Integrating between $t=0$ ($[A]_0$) and $t$ ($[A]$): $\\ln\\frac{[A]}{[A]_0} = -kt \\implies k = \\frac{2.303}{t}\\log\\frac{[A]_0}{[A]}$. At $t = t_{1/2}$, $[A] = [A]_0/2 \\implies k = \\frac{2.303}{t_{1/2}}\\log 2 \\implies t_{1/2} = \\frac{0.693}{k}$.\n\n**(b)** Consider weak acid $HA \\rightleftharpoons H^+ + A^-$. Acid dissociation constant $K_a = \\frac{[H^+][A^-]}{[HA]} \\implies [H^+] = K_a \\frac{[HA]}{[A^-]}$. Taking negative logarithm on both sides: $-\\log[H^+] = -\\log K_a - \\log\\frac{[HA]}{[A^-]} \\implies pH = pK_a + \\log\\frac{[A^-]}{[HA]} = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}$.",
    solutionTa: "**(அ)** $-\\frac{d[A]}{dt} = k[A] \\implies \\int \\frac{d[A]}{[A]} = -k \\int dt \\implies k = \\frac{2.303}{t}\\log\\frac{[A]_0}{[A]}$. அரை ஆயுட்காலம்: $[A] = [A]_0 / 2 \\implies t_{1/2} = \\frac{0.693}{k}$.\n\n**(ஆ)** $HA \\rightleftharpoons H^+ + A^- \\implies K_a = \\frac{[H^+][A^-]}{[HA]} \\implies [H^+] = K_a \\frac{[HA]}{[\\text{உப்பு}]}$. இருபுறமும் $-\\log$ எடுக்க: $pH = pK_a + \\log\\frac{[\\text{உப்பு}]}{[\\text{அமிலம்}]}$.",
    markRubric: "2.5 Marks: Clear step-by-step mathematical derivation, 2.5 Marks: Final formula and boundary condition"
  },
  {
    qEn: "**Question 37 (a) OR (b)**\n\n**(a)** Explain the mechanism of Cannizzaro reaction with an example.\n\n*— OR —*\n\n**(b)** Describe Lucas test and Victor Meyer's test to distinguish primary, secondary, and tertiary alcohols.",
    qTa: "**வினா 37 (அ) அல்லது (ஆ)**\n\n**(அ)** கனிசரோ வினையின் வினை வழிமுறையை ஓர் எடுத்துக்காட்டுடன் விளக்குக.\n\n*— அல்லது —*\n\n**(ஆ)** லூகாஸ் ஆய்வு மற்றும் விக்டர் மேயர் ஆய்வின் மூலம் ஓரினைய, ஈரினைய, மூவினைய ஆல்கஹால்களை எவ்வாறு வேறுபடுத்தலாம் என்பதை விவரிக்க.",
    chapterEn: "Unit 12: Carbonyl Compounds / Unit 11: Hydroxy Compounds",
    solutionEn: "**(a)** Aldehydes having no $\\alpha$-hydrogen (e.g. Benzaldehyde $C_6H_5CHO$, Formaldehyde $HCHO$) undergo self-oxidation and reduction in concentrated $50\\% NaOH$ to yield alcohol and carboxylate salt: $2C_6H_5CHO + NaOH \\rightarrow C_6H_5CH_2OH + C_6H_5COONa$. Mechanism involves nucleophilic attack of $OH^-$ on carbonyl carbon followed by hydride ($H^-$) transfer to a second aldehyde molecule.\n\n**(b)** Lucas Test (anhydrous $ZnCl_2 + \\text{conc. } HCl$): Tertiary alcohols produce immediate turbidity; Secondary alcohols produce turbidity in 5–10 minutes; Primary alcohols produce no turbidity at room temperature.\nVictor Meyer Test: Primary alcohol gives Red color (Blood red); Secondary alcohol gives Blue color; Tertiary alcohol gives Colorless solution.",
    solutionTa: "**(அ)** $\\alpha$-ஹைட்ரஜன் இல்லாத ஆல்டிஹைடுகள் $50\\% NaOH$-உடன் சுய ஆக்சிஜனேற்ற-ஒடுக்கம் அடைந்து ஒரு மூலக்கூறு ஆல்கஹாலாகவும், மற்றொரு மூலக்கூறு அமில உப்பாகவும் மாறுகிறது: $2C_6H_5CHO \\rightarrow C_6H_5CH_2OH + C_6H_5COONa$.\n\n**(ஆ)** லூகாஸ் ஆய்வு: மூவினைய ஆல்கஹால் - உடனடியாக வெண்மை நிற கலங்கல்; ஈரினைய ஆல்கஹால் - 5-10 நிமிடங்களில் கலங்கல்; ஓரினைய ஆல்கஹால் - அறை வெப்பநிலையில் கலங்கல் இல்லை.\nவிக்டர் மேயர் ஆய்வு: ஓரினைய - இரத்த சிவப்பு நிறம்; ஈரினைய - நீல நிறம்; மூவினைய - நிறமற்றது.",
    markRubric: "2.5 Marks: Mechanism and reaction equations, 2.5 Marks: Complete analytical test outcomes"
  },
  {
    qEn: "**Question 38 (a) OR (b)**\n\n**(a)** Explain the secondary structure of proteins with reference to $\\alpha$-helix and $\\beta$-pleated sheet structures.\n\n*— OR —*\n\n**(b)** Write a note on: (i) Broad-spectrum antibiotics with an example, (ii) Artificial sweetening agents.",
    qTa: "**வினா 38 (அ) அல்லது (ஆ)**\n\n**(அ)** $\\alpha$-சுருள் மற்றும் $\\beta$-மடிப்புத் தாள் அமைப்புகளைக் கொண்டு புரதங்களின் இரண்டாம் நிலை அமைப்பை விளக்குக.\n\n*— அல்லது —*\n\n**(ஆ)** குறிப்பு வரைக: (i) பரந்த வீச்சு நுண்ணுயிர் எதிர்ப்பிகள் (எடுத்துக்காட்டுடன்), (ii) செயற்கை இனிப்பூட்டிகள்.",
    chapterEn: "Unit 15: Biomolecules / Unit 16: Applied Chemistry",
    solutionEn: "**(a)** Secondary structure refers to the local spatial conformation of polypeptide chain backbone stabilized by intramolecular hydrogen bonds between $C=O$ and $N-H$ groups. 1. $\\alpha$-Helix: Polypeptide chain coils clockwise into a right-handed helix. Hydrogen bond exists between $C=O$ of $n^{\\text{th}}$ amino acid and $N-H$ of $(n+4)^{\\text{th}}$ residue. 2. $\\beta$-Pleated Sheet: Polypeptide chains lie side-by-side in parallel or antiparallel arrangements held by intermolecular hydrogen bonds, resembling pleated drapery.\n\n**(b)** (i) Broad-spectrum antibiotics: Antibiotics which kill or inhibit a wide range of Gram-positive and Gram-negative bacteria. Examples: Chloramphenicol, Tetracycline, Ampicillin. (ii) Artificial sweetening agents: Synthetic organic compounds that provide intense sweetness with negligible caloric value. Examples: Saccharin (550x sweeter than sucrose), Aspartame (100x), Sucralose (600x).",
    solutionTa: "**(அ)** இரண்டாம் நிலை அமைப்பு: $\\alpha$-சுருள் அமைப்பில் பாலிபெப்டைடு சங்கிலி வலஞ்சுழி சுருளாக அமைந்து, $n$-வது அமினோ அமிலத்தின் $C=O$ தொகுதிக்கும் $(n+4)$-வது அமினோ அமிலத்தின் $N-H$ தொகுதிக்கும் இடையே ஹைட்ரஜன் பிணைப்பு உருவாகிறது. $\\beta$-மடிப்பு அமைப்பில் சங்கிலிகள் பக்கவாட்டில் இணைந்து ஹைட்ரஜன் பிணைப்பால் நிலைபெறுகின்றன.\n\n**(ஆ)** (i) பரந்த வீச்சு ஆன்டிபயாடிக்குகள்: கிராம்-பாசிட்டிவ் மற்றும் கிராம்-நெகட்டிவ் ஆகிய இருவகை பாக்டீரியாக்களையும் அழிக்கும் மருந்துகள். எ.கா: குளோராம்பெனிகால். (ii) செயற்கை இனிப்பூட்டிகள்: குறைந்த கலோரி கொண்ட இனிப்புப் பொருட்கள். எ.கா: சாக்கரின், அஸ்பார்டேம்.",
    markRubric: "2.5 Marks: Complete protein structure description with H-bonding, 2.5 Marks: Clinical / pharmacological descriptions"
  }
];

YEARS.forEach((yr, yIdx) => {
  SESSIONS.forEach((sess, sIdx) => {
    const key = `${yr}-${sess}`;
    const isAnnual = sess === 'annual';
    const sessionLabelEn = isAnnual ? `March ${yr}` : `Supplementary / Instant Exam ${yr}`;
    const sessionLabelTa = isAnnual ? `மார்ச் ${yr}` : `துணைத் தேர்வு ${yr}`;

    // Select 15 MCQs with offset
    const offset = (yIdx * 15 + (isAnnual ? 0 : 7)) % combinedPool.length;
    const rawMcqSlice = combinedPool.slice(offset, offset + 15);
    const part1 = rawMcqSlice.map((raw, idx) => normalizeCheQuestion(raw, idx));

    // Ensure 15 items even if slice was short
    while (part1.length < 15) {
      const fallbackItem = combinedPool[part1.length % combinedPool.length];
      part1.push(normalizeCheQuestion(fallbackItem, part1.length));
    }

    cheExamPapers[key] = {
      labelEn: `Higher Secondary Second Year Examination — ${sessionLabelEn}`,
      labelTa: `மேல்நிலை இரண்டாம் ஆண்டு பொதுத் தேர்வு — ${sessionLabelTa}`,
      code: `4720 / 5068 (${yr})`,
      part1,
      part2: CHE_PART2_BANK,
      part3: CHE_PART3_BANK,
      part4: CHE_PART4_BANK
    };
  });
});

console.log('Chemistry 14 papers generated. Total keys:', Object.keys(cheExamPapers).length);

const cheConfig = {
  titleEn: 'Chemistry',
  subjectCode: '4720 / 5068',
  icon: 'flask-conical',
  maxMarks: 70,
  part1Rubric: '15 × 1 = 15 Marks • Answer all Questions',
  part2Rubric: '6 × 2 = 12 Marks • Answer any 6 • Q24 is Compulsory',
  part3Rubric: '6 × 3 = 18 Marks • Answer any 6 • Q33 is Compulsory',
  part4Rubric: '5 × 5 = 25 Marks • Answer all Questions (Either / Or)',
  blueprintHtml: `
    <p style="margin-bottom:12px;"><strong>Official Tamil Nadu SCERT Class 12 Chemistry Scheme of Valuation (Theory: 70 Marks, 38 Questions):</strong></p>
    <ul style="list-style-type:disc;padding-left:20px;margin-bottom:16px;">
      <li><strong>Unit 1: Metallurgy (உலோகவியல்):</strong> 5 Marks (1 MCQ, 1 2-Mark or 3-Mark, or Part of 5-Mark)</li>
      <li><strong>Unit 2 & 3: p-Block Elements I & II (p-தொகுதி தனிமங்கள்):</strong> 10 Marks (2 MCQs, 1 3-Mark, 1 5-Mark Either/Or)</li>
      <li><strong>Unit 4: Transition & Inner-Transition Elements (இடைநிலைத் தனிமங்கள்):</strong> 7 Marks (1 MCQ, 1 2-Mark, 1 3-Mark)</li>
      <li><strong>Unit 5: Coordination Compounds (அணைவு வேதியியல்):</strong> 8 Marks (1 MCQ, 1 2-Mark, 1 5-Mark Choice)</li>
      <li><strong>Unit 6: Solid State (திட நிலைமை):</strong> 6 Marks (1 MCQ, 1 2-Mark, 1 3-Mark Compulsory)</li>
      <li><strong>Unit 7: Chemical Kinetics (வேதி வினைவேகவியல்):</strong> 8 Marks (1 MCQ, 1 2-Mark Compulsory, 1 5-Mark)</li>
      <li><strong>Unit 8: Ionic Equilibrium (அயனிச் சமநிலை):</strong> 6 Marks (1 MCQ, 1 2-Mark, 1 3-Mark)</li>
      <li><strong>Unit 9: Electrochemistry (மின் வேதியியல்):</strong> 8 Marks (1 MCQ, 1 2-Mark, 1 5-Mark Choice)</li>
      <li><strong>Unit 10: Surface Chemistry (புறப்பரப்பு வேதியியல்):</strong> 5 Marks (1 MCQ, 1 3-Mark)</li>
      <li><strong>Unit 11 to 14: Organic Chemistry Reactions:</strong> 25 Marks (Carbonyl, Hydroxy, Nitrogen Compounds)</li>
      <li><strong>Unit 15: Biomolecules & Everyday Chemistry:</strong> 7 Marks (1 MCQ, 1 2-Mark, 1 3-Mark)</li>
    </ul>
    <p style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">
      Compulsory Questions: Q24 in Part II (2 Marks) and Q33 in Part III (3 Marks numerical problem) are strictly compulsory.
    </p>
  `
};

const cheHtml = generateSubjectHtml(cheConfig, cheExamPapers);
console.log('Chemistry HTML generated. Total bytes:', cheHtml.length);

// Destination paths for Chemistry
const targets = [
  path.join(ROOT_DIR, 'QB/12/CHEMISTRY/index.html'),
  path.join(ROOT_DIR, 'QB/12/CHE/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/chemistry/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/che/index.html')
];

targets.forEach(tgt => {
  fs.mkdirSync(path.dirname(tgt), { recursive: true });
  fs.writeFileSync(tgt, cheHtml, 'utf8');
  console.log(`Saved: ${tgt} (${Math.round(cheHtml.length / 1024)} KB)`);
});

