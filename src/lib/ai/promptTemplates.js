/**
 * src/lib/ai/promptTemplates.js
 * Grounded prompts for Tamil Nadu State Board (Samacheer Kalvi) AI Academic Tutor.
 */

export function buildSystemPrompt({ studentName = "மாணவர்", language = "ta", subjectCode = "MAT-12" }) {
  const isTa = language === "ta";

  return `
You are the AI Academic Coach for AKNEX — Tamil Nadu State Board (Samacheer Kalvi) Examination Portal.

## Core Rules:
1. **Read the message first.** If the student sends a casual greeting (hi, hello, வணக்கம்), respond ONLY with a brief, warm greeting — do NOT dump formulas or textbook references. If they ask a simple arithmetic question like "10+10", just answer it directly and naturally.
2. **Socratic mode ONLY for exam questions.** When the student asks about a specific subject topic, MCQ, formula, or concept from the Samacheer Kalvi syllabus, guide step-by-step without revealing the final answer directly.
3. **Never auto-inject formulas** unless the student's message is clearly about a subject topic.
4. **Address the student** as "${studentName}" naturally — not in every sentence, just once at the start of a response.
5. **Language:** ${isTa ? "Respond in Tamil (தமிழ்). Use Samacheer Kalvi textbook terms." : "Respond in English. Be clear and concise."}
6. **KaTeX math:** Use $...$ for inline and $$...$$ for display math — only when the response actually requires it.
7. **Subject scope:** ${subjectCode} (Tamil Nadu State Board Samacheer Kalvi).
`.trim();
}

export function buildHintPrompt({
  studentName = "மாணவர்",
  subjectCode = "MAT-12",
  questionText = "",
  options = {},
  userAnswer = null,
  hintLevel = 1, // 1: Core Concept, 2: First Step, 3: Pitfall
  language = "ta"
}) {
  const isTa = language === "ta";

  const levelDescriptions = {
    1: isTa
      ? "நிலை 1 (அடிப்படை கருத்து & சூத்திரம்): விடையை நேரடியாக சொல்லாமல், இந்த வினாவிற்கு தேவையான அடிப்படை தேற்றம், வரையறை அல்லது பாடப்புத்தக சூத்திரத்தை மட்டும் நினைவூட்டுங்கள்."
      : "Level 1 (Core Concept & Formula): Without revealing the option or final answer, remind the student of the core textbook theorem, definition, or primary formula needed.",
    2: isTa
      ? "நிலை 2 (முதல் படி & சமன்பாடு அமைத்தல்): கொடுக்கப்பட்ட மதிப்புகளை முதல் படியில் எவ்வாறு பிரதியிட வேண்டும் என்று வழிகாட்டுங்கள்."
      : "Level 2 (First Step & Substitution): Guide the student on how to substitute the given question values into the formula for the very first algebraic/numerical step.",
    3: isTa
      ? "நிலை 3 (பொதுவான பிழை & எச்சரிக்கை): மாணவர்கள் பொதுவாக செய்யும் கணக்கீட்டு அல்லது குறியீட்டுப் பிழையை சுட்டிக்காட்டுங்கள். இறுதி விடையைக் கூறாமல் விடையை அவர்களே கண்டறிய ஊக்கப்படுத்துங்கள்."
      : "Level 3 (Common Pitfall & Caution): Point out the common pitfall or sign error students make here. Encourage them to verify their final calculation without spoiling the letter option."
  };

  return `
Student Name: ${studentName}
Subject Code: ${subjectCode}
Active Question: "${questionText}"
Available Options: ${JSON.stringify(options)}
Student Selected Choice (if any): ${userAnswer || "None yet"}
Requested Hint Level: ${hintLevel} - ${levelDescriptions[hintLevel] || levelDescriptions[1]}

Task:
Produce a warm, polite, and respectful response addressed to ${studentName}.
Use KaTeX math formatting ($...$ and $$...$$).
Follow the requested hint level strictly without revealing the final option letter.
`.trim();
}

/**
 * Deterministic fallback generator when AI API is unavailable, rate-limited, or disabled.
 */
export function generateDeterministicHint({
  studentName = "மாணவர்",
  subjectCode = "MAT-12",
  questionText = "",
  hintLevel = 1,
  language = "ta",
  matchedChunk = null
}) {
  const isTa = language === "ta";
  const salutation = isTa
    ? `வணக்கம் ${studentName}! `
    : `Hello ${studentName}! `;

  const textbookTitle = matchedChunk
    ? (isTa ? matchedChunk.contentTa : matchedChunk.contentEn)
    : "";

  if (hintLevel === 1) {
    if (isTa) {
      return `${salutation}இந்த வினாவை அணுக, நாம் தமிழ்நாடு சமச்சீர் கல்வி பாடத்திட்டத்தின் முக்கிய அடிப்படை சூத்திரத்தை நினைவுகூர வேண்டும்:

${textbookTitle ? `> **பாடப்பகுதி குறிப்பு:**\n> ${textbookTitle.slice(0, 300)}...\n\n` : ""}
**வழிகாட்டும் கருத்து (நிலை 1):**
வினாவில் கொடுக்கப்பட்டுள்ள தரவுகளை முதலில் குறித்துக் கொள்ளுங்கள். இந்த வகை வினாக்களுக்கு அடிப்படை தொடர்பு அல்லது பண்பினை பயன்படுத்துவதே முதல் படியாகும்.

இப்போது முதல் படியை நீங்களே முயற்சி செய்து பாருங்கள்!`;
    } else {
      return `${salutation}To approach this problem, recall the standard Tamil Nadu Samacheer Kalvi textbook principle:

${textbookTitle ? `> **Textbook Reference:**\n> ${textbookTitle.slice(0, 300)}...\n\n` : ""}
**Guiding Concept (Level 1):**
Identify the known and unknown variables in the problem. The core formula links these quantities directly. 

Try substituting the initial values into the formula!`;
    }
  }

  if (hintLevel === 2) {
    if (isTa) {
      return `${salutation}**கணக்கீட்டின் முதல் படி (நிலை 2):**

1. கொடுக்கப்பட்ட சமன்பாடு அல்லது மதிப்புகளை ஒழுங்குபடுத்துங்கள்.
2. இடது மற்றும் வலது பக்க மதிப்புகளை சூத்திரத்திற்கு ஏற்ப பொருத்தவும்.
3. $x$ அல்லது தொடர்புடைய மாறியை ஒரு பக்கத்திற்கு கொண்டு வந்து எளிய சமன்பாடாக மாற்றவும்.

இப்போது உங்கள் கணக்கீட்டை தொடருங்கள், நீங்கள் சரியான பாதையில் இருக்கிறீர்கள்!`;
    } else {
      return `${salutation}**First Mathematical Step (Level 2):**

1. Align the given parameters with standard textbook notation.
2. Substitute the given constants directly into the primary relation.
3. Isolate the target variable onto one side to simplify the expression.

Continue this reduction—you are on the right track!`;
    }
  }

  // Level 3 Pitfall
  if (isTa) {
    return `${salutation}**கவனிக்க வேண்டிய பொதுவான தவறு (நிலை 3):**

⚠️ **எச்சரிக்கை:** மாணவர்கள் பெரும்பாலும் குறியீடுகள் ($+$ அல்லது $-$) மற்றும் அலகு மாற்றங்களில் தவறு செய்வதுண்டு. 
- உங்கள் கணக்கீட்டில் வகுத்தல் அல்லது வர்க்கமூலம் எடுக்கும் போது அடையாளங்களை இருமுறை சரிபார்க்கவும்.
- விடையின் அலகுகள் சரியாக பொருந்துகிறதா என உறுதி செய்யவும்.

உங்களால் எளிதாக சரியான விடையை தேர்வு செய்ய முடியும்!`;
  } else {
    return `${salutation}**Common Pitfall to Avoid (Level 3):**

⚠️ **Caution:** A frequent mistake here involves arithmetic signs ($+$ vs. $-$) or inverted fraction ratios.
- Double-check whether you remembered to square the denominator or invert when taking matrix inverses.
- Verify dimensions and signs before finalizing your selection.

You've got this—recalculate the final step with confidence!`;
  }
}

