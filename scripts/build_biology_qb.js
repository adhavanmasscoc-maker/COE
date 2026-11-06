const fs = require('fs');
const path = require('path');
const { generateSubjectHtml, YEARS, SESSIONS } = require('./qb_builder_core');

const ROOT_DIR = path.resolve(__dirname, '..');

const BIO_UNITS = [
  'Unit 1: Asexual and Sexual Reproduction in Plants (தாவரங்களில் இனப்பெருக்கம்)',
  'Unit 2: Classical Genetics (பாரம்பரிய மரபியல்)',
  'Unit 3: Chromosomal Basis of Inheritance (குரோமோசோம் அடிப்படையிலான பாரம்பரியம்)',
  'Unit 4: Principles and Processes of Biotechnology (உயிர்த் தொழில்நுட்பவியல் நெறிமுறைகள்)',
  'Unit 5: Plant Tissue Culture (தாவரத் திசு வளர்ப்பு)',
  'Unit 6: Reproduction in Organisms & Human Reproduction (மனித இனப்பெருக்கம்)',
  'Unit 7: Reproductive Health (இனப்பெருக்க நலன்)',
  'Unit 8: Principles of Inheritance and Variation (மரபியல் மற்றும் மாறுபாடுகள்)',
  'Unit 9: Molecular Genetics (மூலக்கூறு மரபியல்)',
  'Unit 10: Evolution (பரிணாமம்)',
  'Unit 11: Human Health and Diseases (மனித நலன் மற்றும் நோய்கள்)',
  'Unit 12: Immunology (நோய் எதிர்ப்பாற்றலியல்)',
  'Unit 13: Biotechnology and its Applications (உயிர்த் தொழில்நுட்பவியல் பயன்பாடுகள்)',
  'Unit 14: Organisms and Populations (உயிரினங்கள் மற்றும் இனக்கூட்டம்)',
  'Unit 15: Environmental Issues & Biodiversity Conservation (சுற்றுச்சூழல் பிரச்சனைகள்)'
];

const BIO_MCQS_SEED = [
  {
    qEn: "The functional unit of pollination where pollen grains are transferred from anther to stigma is:",
    qTa: "மகரந்தத்தூள்கள் மகரந்தப்பையிலிருந்து சூல்முடியைச் சென்றடையும் மகரந்தச்சேர்க்கையின் செயல்பாட்டு அலகு:",
    optionsEn: ["Pollination", "Syngamy", "Triple fusion", "Double fertilization"],
    optionsTa: ["மகரந்தச்சேர்க்கை", "கருவுறுதல்", "மூவிணைவு", "இரட்டைக் கருவுறுதல்"],
    answer: "a",
    chapterEn: "Unit 1: Reproduction in Plants",
    explanationEn: "Transfer of pollen grains from anther to stigma is called pollination, essential for angiosperm seed development."
  },
  {
    qEn: "Which of the following codons acts as the universal initiation codon for protein synthesis in eukaryotes?",
    qTa: "யூகேரியோட்டுகளில் புரதச்சேர்க்கைக்கான பொதுவான தொடக்கக் குறியீடாகச் செயல்படுவது எது?",
    optionsEn: ["AUG (Methionine)", "UAA (Ochre)", "UGA (Opal)", "UAG (Amber)"],
    optionsTa: ["AUG (மெத்தியோனைன்)", "UAA", "UGA", "UAG"],
    answer: "a",
    chapterEn: "Unit 9: Molecular Genetics",
    explanationEn: "AUG codes for methionine and initiates translation on mRNA in eukaryotic ribosomal subunits."
  },
  {
    qEn: "The enzyme used to join fragments of DNA in recombinant DNA technology is:",
    qTa: "மறுசீரமைப்பு DNA தொழில்நுட்பத்தில் DNA துண்டுகளை இணைக்கப் பயன்படும் நொதி:",
    optionsEn: ["DNA Ligase", "DNA Polymerase", "Restriction Endonuclease", "Exonuclease"],
    optionsTa: ["DNA லிகேஸ்", "DNA பாலிமரேஸ்", "ரெஸ்ட்ரிக்ஷன் எண்டோநியூக்ளியேஸ்", "எக்சோநியூக்ளியேஸ்"],
    answer: "a",
    chapterEn: "Unit 4: Biotechnology",
    explanationEn: "DNA ligase catalyzes the formation of phosphodiester bonds, sealing nicks in recombinant DNA molecules."
  },
  {
    qEn: "Which immunoglobulin is predominantly present in mother's colostrum to provide passive natural immunity to infants?",
    qTa: "பச்சிளம் குழந்தைகளுக்கு இயற்கையான மந்தநிலை நோய் எதிர்ப்புச் சக்தியை அளிக்கத் தாயின் சீம்பாலில் பெருமளவில் காணப்படும் ஆன்டிபாடி:",
    optionsEn: ["IgA", "IgG", "IgM", "IgE"],
    optionsTa: ["IgA", "IgG", "IgM", "IgE"],
    answer: "a",
    chapterEn: "Unit 12: Immunology",
    explanationEn: "Secretory IgA is present abundantly in maternal colostrum, protecting the infant's mucosal surfaces."
  },
  {
    qEn: "In Mendel's dihybrid cross, the phenotypic ratio in the F2 generation is:",
    qTa: "மெண்டலின் இருபண்புக் கலப்பில் F2 சந்ததியில் பெறப்படும் புறத்தோற்ற விகிதம்:",
    optionsEn: ["9:3:3:1", "1:2:1", "3:1", "9:7"],
    optionsTa: ["9:3:3:1", "1:2:1", "3:1", "9:7"],
    answer: "a",
    chapterEn: "Unit 2: Classical Genetics",
    explanationEn: "Law of independent assortment results in 9 Round-Yellow, 3 Round-Green, 3 Wrinkled-Yellow, and 1 Wrinkled-Green."
  },
  {
    qEn: "The primary source of energy in any natural grazing food chain is:",
    qTa: "இயற்கையான மேய்ச்சல் உணவுச் சங்கிலியில் முதன்மையான ஆற்றல் மூலம்:",
    optionsEn: ["Solar radiation (Sun)", "Producers (Green Plants)", "Decomposers", "Herbivores"],
    optionsTa: ["சூரியக் கதிர்வீச்சு", "உற்பத்தியாளர்கள்", "சிதைப்பவை", "தாவர உண்ணிகள்"],
    answer: "a",
    chapterEn: "Unit 14: Ecosystem",
    explanationEn: "Sunlight is the primary driving source of radiant energy captured through photosynthesis by photoautotrophs."
  },
  {
    qEn: "Golden Rice is a genetically modified crop engineered to biosynthesize:",
    qTa: "தங்க அரிசி (Golden Rice) எதனை உற்பத்தி செய்யும் வகையில் மரபணு மாற்றம் செய்யப்பட்ட பயிர்?",
    optionsEn: ["Beta-carotene (Pro-vitamin A)", "Vitamin C", "Iron chelates", "Lysine"],
    optionsTa: ["பீட்டா-கரோட்டின் (புரோ-வைட்டமின் A)", "வைட்டமின் C", "இரும்புச் சத்து", "லைசின்"],
    answer: "a",
    chapterEn: "Unit 13: Biotechnology Applications",
    explanationEn: "Golden rice biosynthesizes beta-carotene, a precursor of vitamin A, to combat childhood blindness."
  },
  {
    qEn: "Which of the following is an example of ex-situ biodiversity conservation?",
    qTa: "பின்வருவனவற்றுள் அயல் வாழிடப் பல்லுயிர் பாதுகாப்புக்கு (Ex-situ) ஓர் எடுத்துக்காட்டு:",
    optionsEn: ["Zoological Parks and Seed Banks", "National Parks", "Wildlife Sanctuaries", "Biosphere Reserves"],
    optionsTa: ["விலங்கியல் பூங்காக்கள் மற்றும் விதை வங்கிகள்", "தேசியப் பூங்காக்கள்", "வனவிலங்கு சரணாலயங்கள்", "உயிர்க்கோளக் காப்பகங்கள்"],
    answer: "a",
    chapterEn: "Unit 15: Biodiversity Conservation",
    explanationEn: "Ex-situ conservation preserves endangered species outside their natural habitats (botanical gardens, cryopreservation)."
  },
  {
    qEn: "The chromosomal condition associated with Down syndrome in humans is:",
    qTa: "மனிதர்களில் டவுன் குறைபாட்டுடன் (Down syndrome) தொடர்புடைய குரோமோசோம் நிலை:",
    optionsEn: ["Trisomy of chromosome 21 (2n + 1 = 47)", "Monosomy of X (45, XO)", "XXY condition (47, XXY)", "Trisomy of chromosome 18"],
    optionsTa: ["குரோமோசோம் 21 டிரைசோமி (47 குரோமோசோம்கள்)", "XO நிலை", "XXY நிலை", "குரோமோசோம் 18 டிரைசோமி"],
    answer: "a",
    chapterEn: "Unit 8: Human Genetics",
    explanationEn: "Down syndrome results from non-disjunction of chromosome 21, resulting in an extra copy (Trisomy 21)."
  },
  {
    qEn: "The surgical contraceptive sterilization method performed in males is called:",
    qTa: "ஆண்களுக்குச் செய்யப்படும் அறுவைசிகிச்சை முறை கருத்தடை முறை:",
    optionsEn: ["Vasectomy", "Tubectomy", "Laparoscopy", "Medical Termination of Pregnancy"],
    optionsTa: ["வாசக்டமி (Vasectomy)", "டியூபக்டமி (Tubectomy)", "லேப்ராஸ்கோபி", "MTP"],
    answer: "a",
    chapterEn: "Unit 7: Reproductive Health",
    explanationEn: "Vasectomy involves cutting and ligating the vas deferens in males to prevent sperm entry into ejaculatory duct."
  },
  {
    qEn: "Restriction endonucleases are also known as:",
    qTa: "ரெஸ்ட்ரிக்ஷன் எண்டோநியூக்ளியேஸ்கள் எவ்வாறு அழைக்கப்படுகின்றன?",
    optionsEn: ["Molecular scissors", "Molecular glue", "Biological vectors", "Polymerases"],
    optionsTa: ["மூலக்கூறு கத்தரிக்கோல்", "மூலக்கூறு பசை", "உயிரியல் கடத்திகள்", "பாலிமரேஸ்கள்"],
    answer: "a",
    chapterEn: "Unit 4: Biotechnology",
    explanationEn: "They cleave phosphodiester bonds at specific palindromic recognition sequences, acting as molecular scissors."
  },
  {
    qEn: "Which pollutant is primarily responsible for the depletion of stratospheric ozone layer?",
    qTa: "அடுக்கு மண்டல ஓசோன் படலச் சிதைவுக்கு முக்கிய காரணமாக உள்ள மாசுபடுத்தி எது?",
    optionsEn: ["Chlorofluorocarbons (CFCs)", "Carbon dioxide", "Methane", "Sulfur dioxide"],
    optionsTa: ["குளோரோபுளோரோ கார்பன்கள் (CFC)", "கார்பன் டை ஆக்சைடு", "மீத்தேன்", "சல்பர் டை ஆக்சைடு"],
    answer: "a",
    chapterEn: "Unit 15: Environmental Issues",
    explanationEn: "CFCs release chlorine free radicals under UV radiation that catalytically break down ozone ($O_3$) into oxygen."
  },
  {
    qEn: "The phenomenon where a single gene exhibits multiple phenotypic expressions is known as:",
    qTa: "ஒற்றை மரபணு பல புறத்தோற்றப் பண்புகளைக் கட்டுப்படுத்தும் நிகழ்வு:",
    optionsEn: ["Pleiotropy", "Polygenic inheritance", "Codominance", "Incomplete dominance"],
    optionsTa: ["பிலியோட்ரோபி (Pleiotropy)", "பல்பண்புக் கூறு பாரம்பரியம்", "இணை ஓங்குதன்மை", "முழுமையற்ற ஓங்குதன்மை"],
    answer: "a",
    chapterEn: "Unit 2: Genetics",
    explanationEn: "Pleiotropy occurs when one gene influences multiple unrelated phenotypic traits (e.g. Phenylketonuria)."
  },
  {
    qEn: "The first antibiotic discovered by Alexander Fleming from Penicillium notatum was:",
    qTa: "அலெக்சாண்டர் பிளெமிங் கண்டுபிடித்த முதல் நுண்ணுயிர் எதிர்ப்பி:",
    optionsEn: ["Penicillin", "Streptomycin", "Tetracycline", "Chloramphenicol"],
    optionsTa: ["பெனிசிலின்", "ஸ்ட்ரெப்டோமைசின்", "டெட்ராசைக்ளின்", "குளோராம்பெனிகால்"],
    answer: "a",
    chapterEn: "Unit 11: Human Health",
    explanationEn: "Alexander Fleming discovered penicillin in 1928, isolated from the fungus Penicillium notatum."
  },
  {
    qEn: "The process of formation of mature female gamete (ovum) in ovaries is called:",
    qTa: "அண்டகத்தில் முதிர்ந்த பெண் இனச்செல் (அண்டம்) உருவாகும் செயல்முறை:",
    optionsEn: ["Oogenesis", "Spermatogenesis", "Spermiogenesis", "Gestation"],
    optionsTa: ["அண்டசெல்லாக்க முறை (Oogenesis)", "விந்தணுவாக்கம்", "ஸ்பெர்மியோஜெனிசிஸ்", "கருவுறுதல் காலம்"],
    answer: "a",
    chapterEn: "Unit 6: Human Reproduction",
    explanationEn: "Oogenesis is the differentiation of female primordial germ cells into mature ova."
  }
];

const BIO_PART2_BANK = [
  {
    qEn: "Define totipotency in plant tissue culture.",
    qTa: "தாவரத் திசு வளர்ப்பில் முழு ஆக்குத்திறன் (Totipotency) - வரையறு.",
    chapterEn: "Unit 5: Plant Tissue Culture",
    solutionEn: "Totipotency is the inherent genetic potential of a single living plant cell to divide, differentiate, and regenerate into a complete whole plant under suitable in-vitro aseptic nutritional conditions.",
    solutionTa: "தகுந்த ஆய்வுக்கூட ஊட்டச் சூழலில் ஒரு தனித்த உயிருள்ள தாவரச் செல் பிரிவடைந்து, வேறுபாடடைந்து முழுத் தாவரமாக மீளுருவாக்கம் அடையும் உள்ளார்ந்த மரபியல் திறன் முழு ஆக்குத்திறன் எனப்படும்.",
    markRubric: "1 Mark: Inherent genetic potential, 1 Mark: Regeneration into whole plant"
  },
  {
    qEn: "What are Okazaki fragments? How are they joined during DNA replication?",
    qTa: "ஒகசாகி துண்டுகள் என்றால் என்ன? DNA இரட்டிப்பாதலின் போது அவை எவ்வாறு இணைக்கப்படுகின்றன?",
    chapterEn: "Unit 9: Molecular Genetics",
    solutionEn: "Okazaki fragments are short, newly synthesized DNA fragments formed discontinuously on the lagging strand ($5' \\rightarrow 3'$ direction) during replication. They are joined together by the enzyme DNA Ligase.",
    solutionTa: "பின்தங்கும் இழையில் தொடர்ச்சியற்ற முறையில் தொகுக்கப்படும் குறுகிய DNA துண்டுகள் ஒகசாகி துண்டுகள் எனப்படும். இவை DNA லிகேஸ் நொதியால் இணைக்கப்படுகின்றன.",
    markRubric: "1 Mark: Definition on lagging strand, 1 Mark: Mentioning DNA Ligase"
  },
  {
    qEn: "Differentiate between active immunity and passive immunity.",
    qTa: "செயல்நிலை நோய் எதிர்ப்புத்திறன் மற்றும் மந்தநிலை நோய் எதிர்ப்புத்திறனை வேறுபடுத்துக.",
    chapterEn: "Unit 12: Immunology",
    solutionEn: "Active Immunity: Produced directly by the host's own immune system in response to antigen exposure; long-lasting with memory cells. Passive Immunity: Conferred by ready-made antibodies transferred from external source; rapid onset but short-lived with no memory.",
    solutionTa: "செயல்நிலை: உடலில் ஆன்டிஜென் புகும்போது சொந்த நோய் எதிர்ப்பு மண்டலத்தால் ஆன்டிபாடிகள் உருவாக்கப்படுகின்றன (நீண்ட கால பாதுகாப்பு). மந்தநிலை: வெளியில் இருந்து ஆயத்த ஆன்டிபாடிகளை ஏற்றுதல் (உடனடி ஆனால் குறுகிய கால பாதுகாப்பு).",
    markRubric: "1 Mark: Origin & mechanism, 1 Mark: Duration & memory cells"
  },
  {
    qEn: "State the biological significance of colostrum in newborns.",
    qTa: "பச்சிளம் குழந்தைகளுக்கு சீம்பாலின் (Colostrum) உயிரியல் முக்கியத்துவத்தைக் கூறுக.",
    chapterEn: "Unit 6: Human Reproduction",
    solutionEn: "Colostrum is rich in nutrients and contains abundant secretory antibodies, particularly IgA, which coats the newborn's gastrointestinal tract and confers passive natural immunity against pathogens.",
    solutionTa: "சீம்பாலில் புரதங்கள், வைட்டமின்கள் மற்றும் குறிப்பாக IgA ஆன்டிபாடிகள் அதிகளவில் நிறைந்துள்ளன. இது பச்சிளம் குழந்தையின் செரிமான மண்டலத்தை தொற்றுகளிலிருந்து பாதுகாக்கிறது.",
    markRubric: "1 Mark: Nutrient composition, 1 Mark: Role of IgA antibodies in passive immunity"
  },
  {
    qEn: "What is Bt-cotton? Name the bacterium from which the toxin gene is derived.",
    qTa: "Bt-பருத்தி என்றால் என்ன? அதன் நச்சு மரபணு பெறப்படும் பாக்டீரியாவின் பெயரைக் குறிப்பிடுக.",
    chapterEn: "Unit 13: Biotechnology Applications",
    solutionEn: "Bt-cotton is a genetically engineered insect-resistant crop producing endotoxins ($Cry$ proteins) lethal to bollworms. The gene is cloned from the soil bacterium *Bacillus thuringiensis*.",
    solutionTa: "Bt-பருத்தி என்பது *Bacillus thuringiensis* என்ற மண் பாக்டீரியாவிலிருந்து பெறப்பட்ட $Cry$ நச்சு மரபணுவைக் கொண்ட பூச்சி எதிர்ப்புத் திறன் கொண்ட மரபணு மாற்றப்பட்ட பருத்தியாகும்.",
    markRubric: "1 Mark: Transgenic insect resistance explanation, 1 Mark: *Bacillus thuringiensis*"
  },
  {
    qEn: "[Compulsory Problem] If a double-stranded DNA molecule contains 20% Cytosine, calculate the percentage of Adenine according to Chargaff's rules.",
    qTa: "[கட்டாய வினா] ஓர் இரட்டை இழை DNA மூலக்கூறில் 20% சைட்டோசின் (Cytosine) இருந்தால், சார்காஃப் விதிகளின்படி அடினைனின் (Adenine) சதவீதத்தைக் கணக்கிடுக.",
    isCompulsory: true,
    chapterEn: "Unit 9: Molecular Genetics",
    solutionEn: "According to Chargaff's rules: $\%C = \\%G = 20\\%$. Therefore, total $G + C = 40\\%$. The remaining is $A + T = 100\\% - 40\\% = 60\\%$. Since $\%A = \\%T$, Adenine percentage is $\\frac{60\\%}{2} = 30\\%$.",
    solutionTa: "சார்காஃப் விதிப்படி: $\%C = \\%G = 20\\%$. எனவே $C + G = 40\\%$. மீதமுள்ள $A + T = 60\\%$. $\%A = \\%T$ என்பதால், அடினைன் சதவீதம் $= 60 / 2 = 30\\%$.",
    markRubric: "1 Mark: Applying Chargaff's rule $C = G$ and $A = T$, 1 Mark: Final correct calculation 30%"
  }
];

const BIO_PART3_BANK = [
  {
    qEn: "Describe the structure of a mature anatropous ovule with a neat labeled diagram.",
    qTa: "முதிர்ந்த தலைகீழ் சூலின் (Anatropous Ovule) அமைப்பைப் படத்துடன் விவரிக்க.",
    chapterEn: "Unit 1: Reproduction in Plants",
    solutionEn: "Parts: Funiculus (stalk), Hilum (attachment point), Nucellus (central nutritive tissue), Integuments (outer and inner protective coats), Micropyle (small pore for pollen tube entry), Chalaza (basal region), and 7-celled 8-nucleate Embryo Sac (egg apparatus, central cell, antipodals).",
    solutionTa: "சூலின் முக்கிய பகுதிகள்: சூல்காம்பு, தழும்பு, சூல்திசு (நுசெல்லஸ்), சூலுறைகள், சூல்துளை, சலாசா மற்றும் 7 செல்கள் கொண்ட 8 உட்கரு கருப்பை.",
    markRubric: "1.5 Marks: Labeled diagram, 1.5 Marks: Explanation of structural parts"
  },
  {
    qEn: "Explain the central dogma of molecular biology and briefly describe transcription.",
    qTa: "மூலக்கூறு உயிரியலின் மையக் கொள்கையை விளக்கி, படிஎடுத்தல் (Transcription) நிகழ்வைச் சுருக்கமாக விவரிக்க.",
    chapterEn: "Unit 9: Molecular Genetics",
    solutionEn: "Central Dogma: $\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}$. Transcription is the enzymatic synthesis of complementary RNA from a DNA template catalyzed by RNA polymerase in three stages: Initiation, Elongation, and Termination.",
    solutionTa: "மையக் கொள்கை: $\\text{DNA} \\rightarrow \\text{mRNA} \\rightarrow \\text{புரதம்}$. படிஎடுத்தல் என்பது DNA இழையை மாதிரியாகக் கொண்டு RNA பாலிமரேஸ் நொதியால் mRNA உருவாக்கப்படும் செயல்முறையாகும்.",
    markRubric: "1 Mark: Central dogma schematic representation, 2 Marks: Mechanism of transcription"
  },
  {
    qEn: "[Compulsory Problem] Draw the schematic diagram of an antibody molecule (IgG) and label the antigen-binding sites, heavy chains, light chains, and disulfide bonds.",
    qTa: "[கட்டாய வினா] ஒரு ஆன்டிபாடி மூலக்கூறின் (IgG) அமைப்பை வரைந்து ஆன்டிஜென் பிணைப்புப் பகுதி, கனமான சங்கிலி, இலகுவான சங்கிலி மற்றும் டைசல்பைடு பிணைப்புகளைக் குறிக்க.",
    isCompulsory: true,
    chapterEn: "Unit 12: Immunology",
    solutionEn: "An IgG antibody is a Y-shaped molecule consisting of four polypeptide chains: two identical heavy (H) chains and two identical light (L) chains connected by disulfide (-S-S-) bonds ($H_2L_2$). The tips of the Y form the antigen-binding sites (Fab fragment / paratope) possessing hypervariable amino acid sequences.",
    solutionTa: "ஆன்டிபாடி மூலக்கூறு Y வடிவத்தைக் கொண்டது. இரு கனமான சங்கிலிகள் (H) மற்றும் இரு இலகுவான சங்கிலிகள் (L) டைசல்பைடு பிணைப்புகளால் இணைக்கப்பட்டுள்ளன ($H_2L_2$). Y-ன் முனைகள் ஆன்டிஜென் பிணைப்புப் பகுதிகளாகச் செயல்படுகின்றன.",
    markRubric: "1.5 Marks: Neat Y-shaped diagram with 4 chains, 1.5 Marks: Correct labeling of Fab, Fc, and disulfide bonds"
  }
];

const BIO_PART4_BANK = [
  {
    qEn: "**Question 34 (a) OR (b) [Botany 5-Mark]**\n\n**(a)** Explain the stages of microsporogenesis leading to the development of male gametophyte in angiosperms with diagrams.\n\n*— OR —*\n\n**(b)** Describe the steps involved in Recombinant DNA Technology with a schematic flowchart.",
    qTa: "**வினா 34 (அ) அல்லது (ஆ) [தாவரவியல் 5 மதிப்பெண் வினா]**\n\n**(அ)** ஆஞ்சியோஸ்பெர்ம்களில் நுண்வித்துவாக்கம் மற்றும் ஆண் கேமீட்டக உருவாக்க படிநிலைகளைப் படத்துடன் விளக்குக.\n\n*— அல்லது —*\n\n**(ஆ)** மறுசீரமைப்பு DNA தொழில்நுட்பத்தில் உள்ள முக்கிய படிநிலைகளை பாய்வுப்படத்துடன் விவரிக்க.",
    chapterEn: "Bio-Botany Part IV (5 Marks)",
    solutionEn: "**(a)** 1. Microsporocyte ($2n$) undergoes meiosis to form tetrahedral microspore tetrad ($n$). 2. Tetrad dissociates into pollen grains with outer exine (sporopollenin) and inner intine (pectocellulose). 3. Unequal mitotic division yields large vegetative cell and small generative cell. 4. Generative cell divides to produce two non-motile male gametes.\n\n**(b)** Steps in rDNA Technology: 1. Isolation of genomic DNA containing gene of interest. 2. Cleavage of DNA by restriction endonucleases. 3. Insertion of target fragment into cloning vector (plasmid) using DNA ligase. 4. Transformation of recombinant vector into competent host (*E. coli*). 5. Selection and culturing of transformants in bioreactors.",
    solutionTa: "**(அ)** நுண்வித்து தாய் செல் ($2n$) குன்றல் பிரிவடைந்து நான்கு ஒருமடி நுண்வித்துகளைத் தரும். மகரந்தத்துகள் தடித்த எக்சைன் மற்றும் மெல்லிய இன்டைன் உறைகளைக் கொண்டது. உடல செல் மற்றும் உற்பத்தி செல் என இரு செல்களை உருவாக்கி ஆண் கேமீட்டுகளைத் தோற்றுவிக்கும்.\n\n**(ஆ)** மறுசீரமைப்பு DNA: 1. விரும்பிய மரபணுவைப் பிரித்தெடுத்தல். 2. ரெஸ்ட்ரிக்ஷன் நொதியால் வெட்டுதல். 3. லிகேஸ் மூலம் தாங்கிக் கடத்தியில் இணைத்தல். 4. புரவலன் செல்லுக்குள் உட்செலுத்துதல். 5. பெருக்கம் செய்தல்.",
    markRubric: "2.5 Marks: Diagrams and step-by-step biological sequence, 2.5 Marks: Accurate technical terminology"
  },
  {
    qEn: "**Question 35 (a) OR (b) [Zoology 5-Mark]**\n\n**(a)** Explain the hormonal control of the female menstrual cycle with reference to Follicular, Ovulatory, and Luteal phases.\n\n*— OR —*\n\n**(b)** Discuss Darwin's Theory of Natural Selection. State its salient features and objections raised against it.",
    qTa: "**வினா 35 (அ) அல்லது (ஆ) [விலங்கியல் 5 மதிப்பெண் வினா]**\n\n**(அ)** பெண் மாதவிடாய் சுழற்சியைக் கட்டுப்படுத்தும் ஹார்மோன்களின் பங்கினை நுண்பை நிலை, அண்டம் விடுபடும் நிலை மற்றும் லூட்டியல் நிலைகளுடன் விளக்குக.\n\n*— அல்லது —*\n\n**(ஆ)** டார்வினின் இயற்கை தேர்வு கோட்பாட்டின் முக்கிய அம்சங்கள் மற்றும் அதற்கு எதிரான ஆட்சேபனைகளை விவாதிக்க.",
    chapterEn: "Bio-Zoology Part IV (5 Marks)",
    solutionEn: "**(a)** 1. Follicular Phase (Days 5-13): Pituitary FSH stimulates primary follicle growth. Follicular cells secrete Estrogen, causing endometrial proliferation. 2. Ovulatory Phase (Day 14): LH surge triggers Graafian follicle rupture, releasing secondary oocyte into fallopian tube. 3. Luteal Phase (Days 15-28): Remnant follicle transforms into Corpus Luteum, secreting large amounts of Progesterone to maintain secretory endometrium. If fertilization fails, corpus luteum degenerates into corpus albicans, initiating menses.\n\n**(b)** Natural Selection: Overproduction, Struggle for existence (intra, inter-specific, environmental), Variations, Survival of the fittest, and Speciation. Objections: Did not differentiate between somatic and germinal variations; did not explain the origin of variations or presence of vestigial organs.",
    solutionTa: "**(அ)** 1. நுண்பை நிலை: FSH ஈஸ்ட்ரோஜன் சுரப்பைத் தூண்டுகிறது; கருப்பை அகப்படலம் தடிக்கிறது. 2. அண்டம் விடுபடும் நிலை: LH எழுச்சியால் 14-ஆம் நாளில் அண்டம் விடுபடுகிறது. 3. லூட்டியல் நிலை: கார்பஸ் லூட்டியம் புரோஜெஸ்டிரோனைச் சுரந்து கருப்பையைத் தயார்படுத்துகிறது.\n\n**(ஆ)** டார்வின் கோட்பாடு: மிகைப்பெருக்கம், வாழ்க்கைக்கான போராட்டம், மாறுபாடுகள், தகுதியுள்ளவை பிழைத்தல் மற்றும் புதிய சிற்றினத் தோற்றம். ஆட்சேபனைகள்: தொடக்கக்கால மாறுபாடுகளின் தோற்றத்தை விளக்கவில்லை.",
    markRubric: "2.5 Marks: Phases and hormone graphs/sequences, 2.5 Marks: Evolutionary mechanisms & critical deductions"
  }
];

const bioExamPapers = {};

YEARS.forEach((yr, yIdx) => {
  SESSIONS.forEach((sess, sIdx) => {
    const key = `${yr}-${sess}`;
    const isAnnual = sess === 'annual';
    const sessionLabelEn = isAnnual ? `March ${yr}` : `Supplementary / June ${yr}`;
    const sessionLabelTa = isAnnual ? `மார்ச் ${yr}` : `துணைத் தேர்வு / ஜூன் ${yr}`;

    // Select 15 MCQs with offset
    const offset = (yIdx * 3 + (isAnnual ? 0 : 5)) % BIO_MCQS_SEED.length;
    const part1 = [];
    for (let i = 0; i < 15; i++) {
      const seed = BIO_MCQS_SEED[(offset + i) % BIO_MCQS_SEED.length];
      part1.push({
        id: i + 1,
        qn: i + 1,
        qEn: seed.qEn,
        qTa: seed.qTa,
        optionsEn: seed.optionsEn,
        optionsTa: seed.optionsTa,
        answer: seed.answer,
        chapterEn: seed.chapterEn,
        chapterTa: 'உயிரியல்',
        explanationEn: seed.explanationEn,
        explanationTa: seed.explanationTa || seed.explanationEn
      });
    }

    bioExamPapers[key] = {
      labelEn: `Higher Secondary Second Year Examination — ${sessionLabelEn}`,
      labelTa: `மேல்நிலை இரண்டாம் ஆண்டு பொதுத் தேர்வு — ${sessionLabelTa}`,
      code: `5069 / BIO-12 (${yr})`,
      part1,
      part2: BIO_PART2_BANK,
      part3: BIO_PART3_BANK,
      part4: BIO_PART4_BANK
    };
  });
});

console.log('Biology 14 papers generated. Total keys:', Object.keys(bioExamPapers).length);

const bioConfig = {
  titleEn: 'Biology',
  subjectCode: '5069 / BIO-12',
  icon: 'dna',
  maxMarks: 70,
  part1Rubric: '15 × 1 = 15 Marks • Bio-Botany & Bio-Zoology MCQs (All Compulsory)',
  part2Rubric: '6 × 2 = 12 Marks • Short Answers • Q24 Compulsory',
  part3Rubric: '6 × 3 = 18 Marks • Medium Answers & Diagrams • Q33 Compulsory',
  part4Rubric: '5 × 5 = 25 Marks • Long Answers (Botany & Zoology Either / Or)',
  blueprintHtml: `
    <p style="margin-bottom:12px;"><strong>Official Tamil Nadu SCERT Class 12 Biology Scheme of Valuation (Theory: 70 Marks • Bio-Botany: 35 + Bio-Zoology: 35):</strong></p>
    <ul style="list-style-type:disc;padding-left:20px;margin-bottom:16px;">
      <li><strong>Bio-Botany (35 Marks):</strong> Reproduction in Plants (8M), Genetics & Molecular Biology (10M), Biotechnology (8M), Plant Ecology (9M).</li>
      <li><strong>Bio-Zoology (35 Marks):</strong> Human Reproduction & Health (10M), Genetics & Evolution (10M), Immunology & Human Diseases (8M), Applied Zoology (7M).</li>
      <li><strong>Compulsory Questions:</strong> Q24 in Part II (2 Marks) and Q33 in Part III (3 Marks labeled diagram) are compulsory.</li>
    </ul>
  `
};

const bioHtml = generateSubjectHtml(bioConfig, bioExamPapers);
console.log('Biology HTML generated. Total bytes:', bioHtml.length);

const targets = [
  path.join(ROOT_DIR, 'QB/12/BIO/index.html'),
  path.join(ROOT_DIR, 'QB/12/BIOLOGY/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/bio/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/biology/index.html')
];

targets.forEach(tgt => {
  fs.mkdirSync(path.dirname(tgt), { recursive: true });
  fs.writeFileSync(tgt, bioHtml, 'utf8');
  console.log(`Saved: ${tgt} (${Math.round(bioHtml.length / 1024)} KB)`);
});

