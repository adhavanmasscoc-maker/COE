const fs = require('fs');
const path = require('path');
const { generateSubjectHtml, YEARS, SESSIONS } = require('./qb_builder_core');

const ROOT_DIR = path.resolve(__dirname, '..');

const masterEng = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'json-db/12/ENG-12-MASTER.json'), 'utf8'))
  .filter(q => q.type === 'QUESTION_ITEM');
const all100Eng = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'questions/exams/ENGLISH-12-100-ALL.json'), 'utf8')).questions || [];
const set1Eng = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'questions/exams/ENGLISH-12-50-SET1.json'), 'utf8')).questions || [];
const set2Eng = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'questions/exams/ENGLISH-12-50-SET2.json'), 'utf8')).questions || [];

console.log('English pool loaded:', {
  master: masterEng.length,
  all100: all100Eng.length,
  set1: set1Eng.length,
  set2: set2Eng.length
});

const ENG_PART2_BANK = [
  {
    qEn: "Read the following poetic lines and answer the questions:\n\"All the world's a stage,\nAnd all the men and women merely players;\"\n(a) What does the poet compare the world to?\n(b) Identify the figure of speech used in the first line.",
    qTa: "பின்வரும் கவிதை வரிகளைப் படித்து வினாக்களுக்கு விடையளிக்க:\n\"All the world's a stage,\nAnd all the men and women merely players;\"\n(a) உலகம் எதனுடன் ஒப்பிடப்படுகிறது?\n(b) முதல் வரியில் பயின்று வந்துள்ள அணி யாது?",
    chapterEn: "Poem 3: All the World's a Stage (William Shakespeare)",
    solutionEn: "(a) The poet compares the entire world to a theatrical stage where human life plays out its roles.\n(b) Metaphor (implicit comparison between world and stage without using 'like' or 'as').",
    solutionTa: "(a) கவிஞர் உலகை ஒரு நாடக மேடையுடன் ஒப்பிடுகிறார்.\n(b) உருவக அணி (Metaphor).",
    markRubric: "1 Mark: Answering world compared to stage, 1 Mark: Correctly identifying Metaphor"
  },
  {
    qEn: "Rewrite the sentence into Indirect Speech:\nThe teacher said to the students, \"Water boils at 100 degrees Celsius.\"",
    qTa: "அயற்கூற்றாக மாற்றுக:\nThe teacher said to the students, \"Water boils at 100 degrees Celsius.\"",
    chapterEn: "Grammar: Reported Speech",
    solutionEn: "The teacher told the students that water boils at 100 degrees Celsius. (Note: Tense does not change because it is a universal scientific truth).",
    solutionTa: "The teacher told the students that water boils at 100 degrees Celsius.",
    markRubric: "1 Mark: Reporting verb 'told', 1 Mark: Maintaining present tense for universal truth"
  },
  {
    qEn: "Change the voice of the following sentence:\n\"The chef prepared a delectable feast for all the distinguished guests.\"",
    qTa: "செய்வினையைச் செயப்பாட்டு வினையாக மாற்றுக:\n\"The chef prepared a delectable feast for all the distinguished guests.\"",
    chapterEn: "Grammar: Active and Passive Voice",
    solutionEn: "\"A delectable feast was prepared by the chef for all the distinguished guests.\"",
    solutionTa: "\"A delectable feast was prepared by the chef for all the distinguished guests.\"",
    markRubric: "1 Mark: Auxiliary verb 'was prepared', 1 Mark: Correct object-subject transposition"
  },
  {
    qEn: "Combine the sentences into a single Complex sentence using 'Unless':\n\"You work hard. You cannot score high marks in public examinations.\"",
    qTa: "'Unless' பயன்படுத்தி கலவை வாக்கியமாக இணைக்க:\n\"You work hard. You cannot score high marks in public examinations.\"",
    chapterEn: "Grammar: Synthesis of Sentences",
    solutionEn: "\"Unless you work hard, you cannot score high marks in public examinations.\"",
    solutionTa: "\"Unless you work hard, you cannot score high marks in public examinations.\"",
    markRubric: "1 Mark: Correct subordinate clause with 'Unless', 1 Mark: Accurate main clause"
  },
  {
    qEn: "Form a derivative by adding a suitable prefix or suffix:\n(a) regular\n(b) courage",
    qTa: "முன்னொட்டு அல்லது பின்னொட்டு சேர்த்து புதிய சொல்லை உருவாக்குக:\n(a) regular\n(b) courage",
    chapterEn: "Vocabulary: Affixes",
    solutionEn: "(a) irregular (Prefix: ir-) or regularly (Suffix: -ly)\n(b) encourage (Prefix: en-) or courageous (Suffix: -ous)",
    solutionTa: "(a) irregular / regularly\n(b) encourage / courageous",
    markRubric: "1 Mark each for valid standard English derived lexical form"
  },
  {
    qEn: "Identify and correct the error in the sentence:\n\"Neither of the boys were present in the hall yesterday.\"",
    qTa: "பிழையைக் கண்டறிந்து திருத்துக:\n\"Neither of the boys were present in the hall yesterday.\"",
    chapterEn: "Grammar: Error Spotting (Concord)",
    solutionEn: "Error: 'were' -> Correct: 'was'.\nCorrect Sentence: \"Neither of the boys was present in the hall yesterday.\" (Rule: 'Neither of' takes a singular verb).",
    solutionTa: "திருத்தப்பட்ட வாக்கியம்: \"Neither of the boys was present in the hall yesterday.\"",
    markRubric: "1 Mark: Spotting error 'were', 1 Mark: Correct rewrite with singular 'was'"
  },
  {
    qEn: "Fill in the blanks with suitable modal auxiliaries / semi-modals:\n(a) You _______ obey traffic rules. (Obligation)\n(b) How _______ you open my private letters! (Semi-modal)",
    qTa: "பொருத்தமான துணை வினைகளைக் கொண்டு நிரப்புக:\n(a) You _______ obey traffic rules. (Obligation)\n(b) How _______ you open my private letters! (Semi-modal)",
    chapterEn: "Grammar: Modals & Semi-Modals",
    solutionEn: "(a) must / ought to\n(b) dare",
    solutionTa: "(a) must\n(b) dare",
    markRubric: "1 Mark for 'must/ought to', 1 Mark for 'dare'"
  }
];

const ENG_PART3_BANK = [
  {
    qEn: "Explain with Reference to the Context (ERC):\n\"They too, aware of sun and air and water,\nAre fed by peaceful harvests, by war's long winter starv'd.\"",
    qTa: "இடஞ்சுட்டிப் பொருள் விளக்குக:\n\"They too, aware of sun and air and water,\nAre fed by peaceful harvests, by war's long winter starv'd.\"",
    chapterEn: "Poem 6: No Men Are Foreign (James Kirkup)",
    solutionEn: "**Context:** These lines are taken from James Kirkup's poem 'No Men Are Foreign'.\n**Explanation:** The poet asserts universal brotherhood. People in every country share the same natural blessings of sun, air, and water. Peace nourishes everyone with abundant crops, while prolonged war brings suffering, deprivation, and famine to all humanity alike.\n**Comment:** Emphasizes that artificial boundaries are meaningless before nature.",
    solutionTa: "**இடம்:** ஜேம்ஸ் கிர்கப் எழுதிய 'No Men Are Foreign' என்ற கவிதையிலிருந்து எடுக்கப்பட்டது.\n**விளக்கம்:** அனைத்து மனிதர்களுக்கும் சூரியன், காற்று, நீர் பொதுவானவை. போர் அமைதியின்மையை ஏற்படுத்துகிறது, அமைதி வளம் சேர்க்கிறது.",
    markRubric: "1 Mark: Accurate Title & Poet name, 1.5 Marks: Detailed contextual explanation, 0.5 Mark: Literary comment"
  },
  {
    qEn: "Answer the following question in about 30–50 words:\nHow did the two young boys in Verona earn their living during the German occupation?",
    qTa: "30–50 சொற்களில் விடையளிக்க:\nஜெர்மன் ஆக்கிரமிப்பின் போது வெரோனாவில் இருந்த இரு சிறுவர்கள் தங்கள் வாழ்வாதாரத்தை எவ்வாறு ஈட்டினர்?",
    chapterEn: "Prose 1: Two Gentlemen of Verona (A.J. Cronin)",
    solutionEn: "Nicola and Jacopo undertook diverse odd jobs: they shined shoes, sold wild strawberries, hawked newspapers, acted as tourist guides, and ran errands untiringly to pay for their tubercular sister Lucia's medical treatment.",
    solutionTa: "நிகோலா மற்றும் ஜாகோபோ பூட்ஸ் பாலிஷ் செய்தல், பழங்கள் விற்பது, செய்தித்தாள் விநியோகம், சுற்றுலா வழிகாட்டுதல் போன்ற பல வேலைகளைச் செய்தனர்.",
    markRubric: "1.5 Marks: Listing varied occupations, 1.5 Marks: Specifying noble motive (sister's hospital bills)"
  },
  {
    qEn: "Draft a Notice on behalf of the School Pupil Leader inviting students to participate in the Inter-School Science Exhibition.",
    qTa: "பள்ளி மாணவர் தலைவர் சார்பாக அறிவியல் கண்காட்சியில் பங்கேற்க மாணவர்களை அழைக்கும் அறிவிப்பு (Notice) ஒன்றைத் தயாரிக்க.",
    chapterEn: "Study Skills: Notice Writing",
    solutionEn: "```\n                     GOVERNMENT HIGHER SECONDARY SCHOOL, CHENNAI\n                                       NOTICE\n15th October 2024\n                                 SCIENCE TALENT EXHIBITION\nThis is to notify all students of Classes 9 to 12 that our school is organizing an Inter-School Science Exhibition on 10th November 2024 in the School Auditorium. Interested teams may submit their project proposals to their respective science teachers on or before 25th October 2024. Attractive trophies and merit certificates will be awarded to the top 3 projects.\n\nS. Adhavan\nSchool Pupil Leader\n```",
    solutionTa: "அறிவிப்பு வடிவம்: பள்ளி பெயர், 'NOTICE' தலைப்பு, தேதி, நோக்கம், பங்கேற்பு விவரங்கள் மற்றும் கையொப்பம்.",
    markRubric: "1 Mark: Standard Notice box format with School Name & Date, 1.5 Marks: Clear concise content, 0.5 Mark: Designated authority signature"
  },
  {
    qEn: "Study the pie chart depicting the monthly expenditure of a middle-class family and write three sentences of interpretation.",
    qTa: "நடுத்தர குடும்பத்தின் மாதாந்திர செலவு பை வரைபடத்தை ஆராய்ந்து மூன்று விளக்க வாக்கியங்களை எழுதுக.",
    chapterEn: "Study Skills: Non-Verbal Representation",
    solutionEn: "1. The largest portion of monthly income (35%) is spent on food and groceries.\n2. Rent and housing utilities account for the second highest expenditure at 25%.\n3. Only 10% is allocated towards personal savings, highlighting the need for stricter budgetary prudence.",
    solutionTa: "1. மாதாந்திர வருமானத்தில் பெரும் பகுதி (35%) உணவுக்காகச் செலவிடப்படுகிறது.\n2. வீட்டு வாடகைக்கு 25% செலவிடப்படுகிறது.\n3. சேமிப்பு 10% மட்டுமே உள்ளது.",
    markRubric: "1 Mark per accurate analytical comparative statement (Total 3 Marks)"
  }
];

const ENG_PART4_BANK = [
  {
    qEn: "**Question 34 (a) OR (b) [Paragraph / Essay]**\n\n**(a)** Write a paragraph of about 150 words describing the courageous struggle of Nicola and Jacopo in 'Two Gentlemen of Verona'.\n\n*— OR —*\n\n**(b)** How does Robert Lynd humorously analyze human forgetfulness in his essay 'Forgetting'?",
    qTa: "**வினா 34 (அ) அல்லது (ஆ) [பத்தி வினா]**\n\n**(அ)** 'Two Gentlemen of Verona' கதையில் நிகோலா மற்றும் ஜாகோபோவின் வீரஞ்செறிந்த போராட்டத்தை 150 சொற்களில் விவரிக்க.\n\n*— அல்லது —*\n\n**(ஆ)** ராபர்ட் லிண்ட் தனது 'Forgetting' கட்டுரையில் மனித மறதியை நகைச்சுவையுடன் எவ்வாறு பகுப்பாய்வு செய்கிறார்?",
    chapterEn: "Prose Paragraph (5 Marks)",
    solutionEn: "**(a)** Nicola (13) and Jacopo (12) were rendered homeless orphans by wartime bombardment. Their elder sister Lucia contracted tuberculosis of the spine. Instead of succumbing to despair, the two young boys worked incessantly: polishing shoes, selling fruit, delivering papers, and guiding tourists. Their self-reliance, quiet dignity, devotion, and selfless sacrifice touched the narrator deeply, demonstrating true nobility of character.\n\n**(b)** Robert Lynd observes that human memory is remarkably efficient for everyday necessities like appointments, telephone numbers, and addresses, but selective when it comes to taking medicines, posting letters, and returning umbrellas. Sportsmen and poets are notoriously absent-minded because their imaginative minds are occupied with higher thoughts, rendering their forgetfulness benign and amusing.",
    solutionTa: "**(அ)** நாவலாசிரியர் A.J. குரோனின் நிகோலா மற்றும் ஜாகோபோவின் தியாகத்தை விளக்குகிறார். போரினால் குடும்பத்தை இழந்த சிறுவர்கள், காசநோயால் பாதிக்கப்பட்ட சகோதரிக்காக அயராது உழைத்தனர்.\n\n**(ஆ)** ராபர்ட் லிண்ட் மனித மறதியைப் பற்றி நகைச்சுவையாகக் கூறுகிறார். மருந்துகளை மறப்பது, தபால்களை அனுப்ப மறப்பது போன்றவை மனித இயல்புகள் என விவரிக்கிறார்.",
    markRubric: "1 Mark: Title, Author & Introduction, 3 Marks: Detailed conceptual progression & thematic quotes, 1 Mark: Moral / Conclusion"
  },
  {
    qEn: "**Question 35 (a) OR (b) [Letter Writing]**\n\n**(a)** Write a letter to the Commissioner of Municipal Corporation complaining about poor sanitary conditions and irregular garbage clearance in your locality.\n\n*— OR —*\n\n**(b)** Write a letter of application for the post of Junior Software Engineer advertised in 'The Hindu', enclosing your detailed Curriculum Vitae.",
    qTa: "**வினா 35 (அ) அல்லது (ஆ) [கடிதம் வரைதல்]**\n\n**(அ)** உங்கள் பகுதியில் நிலவும் சுகாதார சீர்கேடு மற்றும் குப்பை அகற்றப்படாமை குறித்து மாநகராட்சி ஆணையருக்கு புகார் கடிதம் எழுதுக.\n\n*— அல்லது —*\n\n**(ஆ)** 'தி இந்து' நாளிதழில் வெளியிடப்பட்ட இளநிலை மென்பொருள் பொறியாளர் பதவிக்கான விண்ணப்பக் கடிதத்தை தன்விவரக் குறிப்புடன் (CV) எழுதுக.",
    chapterEn: "Writing Skills: Formal Letters",
    solutionEn: "**(a) Formal Complaint Letter:**\n- From & To address format.\n- Subject: Complaint regarding uncleared garbage and poor sanitation on Gandhi Road - Reg.\n- Body: Detailing overflowing bins, breeding mosquitoes, health hazards, and request for urgent municipal intervention.\n- Subscription: Yours faithfully, Name.\n\n**(b) Job Application Letter:**\n- Cover letter expressing interest in response to advertisement.\n- Detailed Bio-Data/Resume (Educational Qualifications, Technical Skills like Python/SQL, Experience, References).",
    solutionTa: "**(அ) புகார் கடிதம்:** அனுப்புநர், பெறுநர், பொருள், உட்குறிப்பு மற்றும் நன்றியுரை.\n**(ஆ) வேலை விண்ணப்பம்:** விண்ணப்பக் கடிதம் மற்றும் விரிவான தன்விவரக் குறிப்பு (கல்வித் தகுதி, அனுபவம்).",
    markRubric: "1.5 Marks: Proper formal layout & sender/recipient credentials, 2.5 Marks: Lucid professional prose, 1 Mark: Resume / closing subscription"
  },
  {
    qEn: "**Question 36 (a) OR (b) [Summary Writing vs Note-Making]**\n\n**(a)** Write a summary of the given passage reducing it to one-third of its original length, providing a Rough Copy and a Fair Copy with a suitable Title.\n\n*— OR —*\n\n**(b)** Prepare structured notes with main headings, sub-headings, and standard abbreviations based on the given passage on Environmental Conservation.",
    qTa: "**வினா 36 (அ) அல்லது (ஆ) [சுருக்கி வரைதல் / குறிப்பெடுத்தல்]**\n\n**(அ)** கொடுக்கப்பட்ட பத்தியை மூன்றில் ஒரு பங்காக சுருக்கி, மாதிரி நகல் மற்றும் உண்மை நகல் வரைந்து தகுந்த தலைப்பிடுக.\n\n*— அல்லது —*\n\n**(ஆ)** சுற்றுச்சூழல் பாதுகாப்பு பற்றிய பத்தியிலிருந்து தலைப்புகள் மற்றும் உட்பிரிவுகளுடன் குறிப்பு வரைக.",
    chapterEn: "Study Skills: Note-Making & Summarizing",
    solutionEn: "**(a) Summary Writing Method:**\n1. Suitable Title (1 Mark)\n2. Rough Draft with strike-through (1.5 Marks)\n3. Fair Draft: Clear, coherent condensation maintaining core thesis in about one-third word count (2.5 Marks).\n\n**(b) Note-Making Method:**\n1. Title\n2. Main heading 1, 2, 3 with numbered decimal sub-headings (1.1, 1.2)\n3. Key to abbreviations used (e.g. govt., env., dev.).",
    solutionTa: "**(அ) சுருக்கி வரைதல்:** 1. தலைப்பு. 2. மாதிரி நகல் (அடிக்கப்பட்டது). 3. உண்மை நகல் (மூன்றில் ஒரு பங்கு சொற்கள்).\n**(ஆ) குறிப்பெடுத்தல்:** தலைப்புகள், துணைத் தலைப்புகள் மற்றும் சுருக்கக் குறியீடுகள் பட்டியல்.",
    markRubric: "1 Mark: Title, 1.5 Marks: Rough Draft / Outline, 2.5 Marks: High-coherence Fair Summary with exact word metrics"
  }
];

// Helper to normalize English questions
function normalizeEngQuestion(raw, idx) {
  if (raw.questionPayload) {
    const p = raw.questionPayload;
    return {
      id: idx + 1,
      qn: idx + 1,
      qEn: p.questionEn,
      qTa: p.questionTa || p.questionEn,
      optionsEn: p.options ? [p.options.a, p.options.b, p.options.c, p.options.d] : ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsTa: p.options ? [p.options.a, p.options.b, p.options.c, p.options.d] : ['விருப்பம் அ', 'விருப்பம் ஆ', 'விருப்பம் இ', 'விருப்பம் ஈ'],
      answer: p.correctAnswer || 'a',
      chapterEn: raw.topic || 'Vocabulary & Grammar',
      chapterTa: 'ஆங்கிலப் பாடப்பிரிவு',
      explanationEn: p.stepByStepSolution?.en || 'Standard HSE English grammar & vocabulary reference.',
      explanationTa: 'அரசுத் தேர்வுகள் இயக்கக விடைக்குறிப்பு வழிகாட்டல்.'
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
      chapterEn: raw.chapter || 'English Language Skills',
      chapterTa: 'ஆங்கிலம்',
      explanationEn: raw.explanation || 'Official DGE Answer Key evaluation.',
      explanationTa: 'அரசுத் தேர்வு விடைக்குறிப்பு.'
    };
  }
}

const engCombinedPool = [...masterEng, ...all100Eng, ...set1Eng, ...set2Eng];
const engExamPapers = {};

YEARS.forEach((yr, yIdx) => {
  SESSIONS.forEach((sess, sIdx) => {
    const key = `${yr}-${sess}`;
    const isAnnual = sess === 'annual';
    const sessionLabelEn = isAnnual ? `March ${yr}` : `Supplementary / June ${yr}`;
    const sessionLabelTa = isAnnual ? `மார்ச் ${yr}` : `துணைத் தேர்வு / ஜூன் ${yr}`;

    const offset = (yIdx * 20 + (isAnnual ? 0 : 10)) % engCombinedPool.length;
    const mcqSlice = engCombinedPool.slice(offset, offset + 20);
    const part1 = mcqSlice.map((raw, idx) => normalizeEngQuestion(raw, idx));

    while (part1.length < 20) {
      const fallback = engCombinedPool[part1.length % engCombinedPool.length];
      part1.push(normalizeEngQuestion(fallback, part1.length));
    }

    engExamPapers[key] = {
      labelEn: `Higher Secondary Second Year Examination — ${sessionLabelEn}`,
      labelTa: `மேல்நிலை இரண்டாம் ஆண்டு பொதுத் தேர்வு — ${sessionLabelTa}`,
      code: `3001 / ENG-12 (${yr})`,
      part1,
      part2: ENG_PART2_BANK,
      part3: ENG_PART3_BANK,
      part4: ENG_PART4_BANK
    };
  });
});

console.log('English 14 papers generated. Total keys:', Object.keys(engExamPapers).length);

const engConfig = {
  titleEn: 'English',
  subjectCode: '3001 / ENG-12',
  icon: 'languages',
  maxMarks: 90,
  part1Rubric: '20 × 1 = 20 Marks • Vocabulary & Grammar (All Compulsory)',
  part2Rubric: '7 × 2 = 14 Marks • Poetry Appreciation & Grammar Transformation',
  part3Rubric: '7 × 3 = 21 Marks • ERC, Prose Short Questions & Study Skills',
  part4Rubric: '7 × 5 = 35 Marks • Paragraphs, Letters, Summaries & Essays',
  blueprintHtml: `
    <p style="margin-bottom:12px;"><strong>Official Tamil Nadu SCERT Class 12 General English Scheme of Evaluation (Theory: 90 Marks, 47 Questions):</strong></p>
    <ul style="list-style-type:disc;padding-left:20px;margin-bottom:16px;">
      <li><strong>Part I (Q1–20): 1-Mark Objectives (20 Marks):</strong> Synonyms (Q1-3), Antonyms (Q4-6), Idioms, Phrasal Verbs, Compound Words, Affixes, Abbreviations, Question Tags, Prepositions.</li>
      <li><strong>Part II Section 1 (Poetry Appreciation):</strong> Answer any 4 out of 6 (4 × 2 = 8 Marks)</li>
      <li><strong>Part II Section 2 (Grammar Transformation):</strong> Answer any 3 out of 4 (3 × 2 = 6 Marks) — Voice, Direct/Indirect, Conditionals, Simple/Compound/Complex.</li>
      <li><strong>Part III Section 1 (Explain with Reference to Context):</strong> Answer any 2 out of 3 (2 × 3 = 6 Marks)</li>
      <li><strong>Part III Section 2 (Prose Short Answers):</strong> Answer any 2 out of 3 (2 × 3 = 6 Marks)</li>
      <li><strong>Part III Section 3 (Study Skills):</strong> Answer any 3 out of 4 (3 × 3 = 9 Marks) — Dialogue, Notice, Advertisement, Non-verbal charts.</li>
      <li><strong>Part IV (Q41–47 Either/Or Long Answers, 35 Marks):</strong> Prose & Poetry Paragraphs, Letter Writing, Summary Writing / Note-Making, Comprehension.</li>
    </ul>
  `
};

const engHtml = generateSubjectHtml(engConfig, engExamPapers);
console.log('English HTML generated. Total bytes:', engHtml.length);

const targets = [
  path.join(ROOT_DIR, 'QB/12/ENGLISH/index.html'),
  path.join(ROOT_DIR, 'QB/12/ENG/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/english/index.html'),
  path.join(ROOT_DIR, 'public/student/qb/12/eng/index.html')
];

targets.forEach(tgt => {
  fs.mkdirSync(path.dirname(tgt), { recursive: true });
  fs.writeFileSync(tgt, engHtml, 'utf8');
  console.log(`Saved: ${tgt} (${Math.round(engHtml.length / 1024)} KB)`);
});

