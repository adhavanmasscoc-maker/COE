/**
 * Tamil Nadu State Board Examination Policy Presets
 * 10 Master Categories with 5 Actionable Sub-Options Each (50 Distinct Directives)
 */

export const EXAM_POLICY_CONFIG = {
  1: {
    name: "Easy-Only Paper",
    description: "Low cognitive load focusing on recall, definitions, and direct knowledge.",
    options: [
      {
        id: "1A",
        label: "Glossary & Definition Recall",
        directive: "Generate pure definition and term-identification questions based strictly on glossary entries and bold terms in the syllabus."
      },
      {
        id: "1B",
        label: "Direct Textbook Book-Back Style",
        directive: "Frame straightforward questions identical in difficulty to standard book-back review questions requiring direct factual recall."
      },
      {
        id: "1C",
        label: "Formula & Unit Verification",
        directive: "Focus on stating fundamental formulas, naming SI units, symbols, and standard scientific or mathematical constants."
      },
      {
        id: "1D",
        label: "Syntax & Keyword Identification",
        directive: "Focus on identifying language keywords, standard syntax rules, data types, and direct command definitions without complex logic."
      },
      {
        id: "1E",
        label: "Full-Form & Acronym Expansion",
        directive: "Focus on abbreviations, acronym expansions, inventor names, version specifications, and baseline factual milestones."
      }
    ]
  },
  2: {
    name: "Medium-Difficulty Paper",
    description: "Core comprehension, procedural understanding, and standard problem-solving.",
    options: [
      {
        id: "2A",
        label: "Conceptual 'Why & How'",
        directive: "Ask conceptual questions requiring explanation of mechanisms, causes, and working principles without complex mathematical derivations."
      },
      {
        id: "2B",
        label: "Tabular Comparison & Contrast",
        directive: "Frame questions requiring structured tabular differentiation between two related concepts, methods, or algorithms."
      },
      {
        id: "2C",
        label: "Real-World Example Mapping",
        directive: "Present an everyday scenario or practical problem and ask students to identify and explain which core concept applies."
      },
      {
        id: "2D",
        label: "Cause-and-Effect Analysis",
        directive: "Frame questions exploring what happens to a system when one parameter, condition, or input variable is altered."
      },
      {
        id: "2E",
        label: "Standard Procedural Steps",
        directive: "Focus on outlining sequence steps, execution lifecycles, and standard operational workflows in correct chronological order."
      }
    ]
  },
  3: {
    name: "Hard-Only Paper",
    description: "Higher Order Thinking Skills (HOTS), multi-concept synthesis, and edge-cases.",
    options: [
      {
        id: "3A",
        label: "Multi-Topic Synthesis",
        directive: "Frame complex, multi-tier questions requiring simultaneous application of concepts from at least two different syllabus units."
      },
      {
        id: "3B",
        label: "Corner Cases & Subtle Traps",
        directive: "Include boundary conditions, logical paradoxes, division-by-zero risks, off-by-one checks, and non-obvious exceptions to standard rules."
      },
      {
        id: "3C",
        label: "Critical Evaluation & Flaw Identification",
        directive: "Provide an erroneous solution, faulty code snippet, or incorrect proof and require students to locate, justify, and rectify the flaw."
      },
      {
        id: "3D",
        label: "Olympiad / Competitive Exam Tier",
        directive: "Emphasize non-routine problems that challenge conceptual depth, spatial reasoning, and mathematical rigor beyond standard board formats."
      },
      {
        id: "3E",
        label: "System Design & Optimization",
        directive: "Require students to compare multiple valid solutions and justify which is optimal under memory, runtime, or resource constraints."
      }
    ]
  },
  4: {
    name: "Balanced Mix Distribution",
    description: "Curated blueprints blending varying cognitive difficulty tiers.",
    options: [
      {
        id: "4A",
        label: "Standard Board Mix (30% Easy, 50% Medium, 20% Hard)",
        directive: "Structure the question pool with exactly 30% easy recall, 50% medium concept application, and 20% hard analytical questions."
      },
      {
        id: "4B",
        label: "Remedial / Foundation Heavy (50% Easy, 40% Medium, 10% Hard)",
        directive: "Prioritize passing confidence with 50% easy definitions, 40% medium direct problems, and only 10% hard questions."
      },
      {
        id: "4C",
        label: "Merit / Rank-Filter Tier (20% Easy, 40% Medium, 40% Hard)",
        directive: "Design a rigorous discriminator paper with 20% easy warmup, 40% solid medium application, and 40% high-order problem solving."
      },
      {
        id: "4D",
        label: "Uniform Distribution (33% Easy, 34% Medium, 33% Hard)",
        directive: "Distribute questions equally across all three difficulty tiers to test the full spectrum uniformly."
      },
      {
        id: "4E",
        label: "Progressive Difficulty (Strict Ascent)",
        directive: "Order all questions in strict ascending difficulty: Section A entirely easy, Section B entirely medium, Section C entirely hard."
      }
    ]
  },
  5: {
    name: "Direct Syllabus Grounding",
    description: "Strict compliance with published textbook headings and official review material.",
    options: [
      {
        id: "5A",
        label: "Verbatim Syllabus Subheading Match",
        directive: "Every question title must directly quote an explicit chapter subheading or learning objective stated in the uploaded syllabus."
      },
      {
        id: "5B",
        label: "Official Chapter-End Exercise Mimic",
        directive: "Strictly reproduce the style, structure, and scope of standard end-of-chapter review questions without adding external context."
      },
      {
        id: "5C",
        label: "In-Text 'Activity / Think & Discuss' Focus",
        directive: "Formulate questions modeled around the practical activities, boxed side-notes, and 'think & discuss' callouts inside the syllabus."
      },
      {
        id: "5D",
        label: "Syllabus 'Points to Remember' Extraction",
        directive: "Generate questions directly testing the distilled bullet points located in the chapter summary or recap section of the textbook."
      },
      {
        id: "5E",
        label: "Prescribed Experiment & Lab-Theory Focus",
        directive: "Focus questions on the theoretical principles, apparatus names, and procedural steps of experiments prescribed in the practical syllabus."
      }
    ]
  },
  6: {
    name: "Public Exam & Past Paper Modeling",
    description: "Style, terminology, and marking schemes aligned with historical public board exams.",
    options: [
      {
        id: "6A",
        label: "Tamil Nadu State Board Public Exam Style",
        directive: "Use official Tamil Nadu Samacheer Kalvi phrasing ('Define', 'State the law of', 'Write short notes on', 'Distinguish between')."
      },
      {
        id: "6B",
        label: "PTA (Parent-Teacher Association) Model Paper Style",
        directive: "Structure questions adhering to standard Tamil Nadu PTA model question paper blueprints and mark distributions."
      },
      {
        id: "6C",
        label: "Compulsory Question Template (Q.No 24 / Q.No 33)",
        directive: "Generate questions formatted specifically for the compulsory problem-solving or creative slot in state board papers."
      },
      {
        id: "6D",
        label: "Repeated 5-Year High-Yield Trends",
        directive: "Prioritize topics and question patterns that have appeared at least three times across the past five years of public examinations."
      },
      {
        id: "6E",
        label: "Quarterly & Half-Yearly Cumulative Style",
        directive: "Adopt the broad, comprehensive coverage style of state-level half-yearly examinations spanning full term syllabi."
      }
    ]
  },
  7: {
    name: "Short-Answer Focus (2-3 Marks)",
    description: "Concise, structured responses testable within 2 to 4 sentences.",
    options: [
      {
        id: "7A",
        label: "2-Sentence Strict Definitions",
        directive: "Every question must require an exact, concise definition capped at 2 sentences with zero fluff."
      },
      {
        id: "7B",
        label: "Statement & Law Briefs",
        directive: "Ask students to state a formal law, theorem, or principle and write its accompanying mathematical expression or formula."
      },
      {
        id: "7C",
        label: "3-Point Differentiations",
        directive: "Require structured tabular comparison with exactly 3 distinct, non-overlapping points of difference."
      },
      {
        id: "7D",
        label: "Reasoning & Scientific Justification",
        directive: "Questions must ask 'Give reasons why...' requiring students to explain a physical, chemical, or logical phenomenon in 40 words."
      },
      {
        id: "7E",
        label: "Output Prediction & Trace Snippets",
        directive: "Provide 2 to 4 lines of code or an equation and ask students to state the final output or intermediate evaluation step."
      }
    ]
  },
  8: {
    name: "MCQ Focus (4 Options Each)",
    description: "Objective assessments with exactly 4 options and verified distractors.",
    options: [
      {
        id: "8A",
        label: "Single-Best-Answer with Plausible Distractors",
        directive: "Each MCQ must feature 1 unambiguous correct answer and 3 mathematically or conceptually plausible common-error distractors."
      },
      {
        id: "8B",
        label: "Assertion & Reasoning (A/R)",
        directive: "Format all questions as: Assertion (A) and Reason (R), with the standard 4 option choices on validity and explanation."
      },
      {
        id: "8C",
        label: "Match the Columns (Matrix Matching)",
        directive: "Include two columns (Column I with 4 items, Column II with 4 items) where students select the correct matching code combination."
      },
      {
        id: "8D",
        label: "Negative Phrasing ('NOT / INCORRECT')",
        directive: "Structure questions asking 'Which of the following is NOT true?' or 'Which is INCORRECT?' to test fine-grained discrimination."
      },
      {
        id: "8E",
        label: "Code / Diagram Snippet Output MCQs",
        directive: "Every question must reference a small diagram, logic gate, or code snippet where options represent possible outputs or states."
      }
    ]
  },
  9: {
    name: "Numerical & Application Problems",
    description: "Computational problem solving, unit conversions, and formula applications.",
    options: [
      {
        id: "9A",
        label: "Direct Formula Substitution",
        directive: "Provide single-step numerical problems requiring correct formula identification and direct value substitution with standard units."
      },
      {
        id: "9B",
        label: "Multi-Step Mathematical Derivations",
        directive: "Require solving multi-step word problems involving intermediate conversions before reaching the final numerical answer."
      },
      {
        id: "9C",
        label: "Real-World Context Engineering Scenarios",
        directive: "Frame practical numerical problems involving actual engineering, financial, astronomical, or everyday physical context."
      },
      {
        id: "9D",
        label: "Dry-Run Iteration Tables",
        directive: "Require students to calculate variable values across iterations of a loop, recurrence relation, or iterative algorithm."
      },
      {
        id: "9E",
        label: "Boundary & Dimensional Analysis",
        directive: "Focus on verifying physical equations using dimensional consistency or solving for conditions at extreme limits (0, infinity)."
      }
    ]
  },
  10: {
    name: "Custom COE Profiles",
    description: "Specialized administrative filters and custom text directives.",
    options: [
      {
        id: "10A",
        label: "Remedial Exam (Passing Minimum Focus)",
        directive: "Generate only the most essential, repeated, and high-scoring fundamentals designed to verify minimum syllabus competency."
      },
      {
        id: "10B",
        label: "Speed Sprint (Rapid Response)",
        directive: "Short, crisp questions designed to be answered within 60 to 90 seconds each during timed online mock assessments."
      },
      {
        id: "10C",
        label: "Viva Voce / Oral Examination Preparation",
        directive: "Questions designed to assess conceptual clarity and articulation, suitable for lab oral exams and defense sessions."
      },
      {
        id: "10D",
        label: "Diagram & Circuit Drawing Focus",
        directive: "Frame questions requiring students to describe, label, or explain schematics, anatomical structures, or circuit diagrams."
      },
      {
        id: "10E",
        label: "Custom Prompt Override",
        directive: "USE_CUSTOM_TEXT"
      }
    ]
  }
};

/**
 * Resolves the final system prompt directive for Gemini.
 * @param {number|string} policyId - Category key (1 to 10)
 * @param {string} optionId - Selected sub-option ID (e.g., '4A', '8B', '10E')
 * @param {string} [customText=""] - Custom text when option 10E is chosen
 * @returns {string} The directive to pass into the prompt
 */
export function resolvePolicyDirective(policyId, optionId, customText = "") {
  const pId = Number(policyId) || 1;
  const policy = EXAM_POLICY_CONFIG[pId];
  if (!policy) return "Generate standard examination questions aligned with the syllabus.";
  
  const option = policy.options.find(opt => opt.id === optionId);
  if (!option) return policy.options[0].directive;
  
  if (option.directive === "USE_CUSTOM_TEXT") {
    return customText.trim().length > 0
      ? `Apply the following custom rules provided by the COE: ${customText.trim()}`
      : "Apply strict examination standards following the syllabus.";
  }
  
  return option.directive;
}
