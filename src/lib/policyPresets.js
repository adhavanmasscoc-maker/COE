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

/**
 * Standard Question Mark Configuration for Samacheer Kalvi Public Examinations
 * Supports 1-Mark, 2-Mark, 3-Mark, and 5-Mark Question Types
 */
export const QUESTION_MARK_CONFIG = [
  {
    marks: 1,
    label: "1-Mark (Objective / MCQ)",
    qType: "MCQ",
    description: "Four options A, B, C, D with single correct answer",
    defaultCount: 15,
  },
  {
    marks: 2,
    label: "2-Mark (Very Short Answer)",
    qType: "SHORT_ANSWER",
    description: "Definitions, simple formulas, two points, direct calculations",
    defaultCount: 5,
  },
  {
    marks: 3,
    label: "3-Mark (Short Answer / Problem)",
    qType: "SHORT_ANSWER",
    description: "Procedural derivations, numerical problems, 3-5 lines",
    defaultCount: 5,
  },
  {
    marks: 5,
    label: "5-Mark (Long Answer / Essay / Either-Or)",
    qType: "SHORT_ANSWER",
    description: "Comprehensive theorem proofs, detailed algorithms, essay analysis",
    defaultCount: 2,
  },
];

/**
 * Standard TN Samacheer Kalvi Syllabi Presets
 * Covering Class 10 Core and ALL 12 Class 12 Higher Secondary Subjects
 */
export const QUICK_SYLLABUS_PRESETS = [
  // Class 12 Subjects
  {
    subject: "Computer Science",
    code: "CSC-12",
    prepClass: 12,
    label: "Class 12 Computer Science (Core)",
    text: "Unit 1: Problem Solving & Algorithmic Strategies (Function Specification, LEGB Scope Rule, Big O Complexity, Searching & Sorting)\nUnit 2: Python Programming (Tokens, Control Flow, Functions & Lambda, Strings, Lists, Tuples, Sets, Dictionaries)\nUnit 3: Database & SQL Integration (RDBMS, SQL DDL/DML/DQL Commands, WHERE/ORDER BY/GROUP BY, SQLite3 Module)\nUnit 4: Data Visualization (Matplotlib, Pyplot bar/plot/show, CSV DictReader & DictWriter)",
    units: [
      { unit: "Unit 1: Problem Solving & Algorithmic Strategies", topics: ["Function Specification", "LEGB Scope Rule", "Big O Complexity", "Linear/Binary Search", "Bubble/Insertion/Selection Sort"] },
      { unit: "Unit 2: Python Programming Core", topics: ["Tokens & Identifiers", "Control Flow (if, while, for)", "Functions & Lambda", "Strings, Lists, Tuples, Dictionaries"] },
      { unit: "Unit 3: Database Concepts & Structured Query Language", topics: ["Relational Model", "SQL DDL, DML, DQL", "Aggregate Functions & GROUP BY", "Python-SQLite3 Interface"] },
      { unit: "Unit 4: Data Visualization & CSV Integration", topics: ["CSV Module (reader, writer, DictReader)", "Matplotlib Pyplot", "Line/Bar Charts & Histograms"] }
    ]
  },
  {
    subject: "Mathematics",
    code: "MAT-12",
    prepClass: 12,
    label: "Class 12 Mathematics (Pure & Applied)",
    text: "Unit 1: Applications of Matrices and Determinants (Rank, System of Linear Equations, Cramer's Rule)\nUnit 2: Complex Numbers (Rectangular & Polar Form, De Moivre's Theorem, Roots of Unity)\nUnit 3: Theory of Equations (Polynomial Roots, Vieta's Formulas, Descartes' Rule)\nUnit 4: Inverse Trigonometric Functions (Principal Values, Properties, Graphs)\nUnit 5: Two Dimensional Analytical Geometry-II (Parabola, Ellipse, Hyperbola, Tangents & Normals)\nUnit 6: Differential Calculus (Limits, Continuity, Mean Value Theorems, Series Expansions, Maxima & Minima)\nUnit 7: Integral Calculus (Definite Integrals, Properties, Bernoulli's Formula, Area of Bounded Regions)",
    units: [
      { unit: "Unit 1: Applications of Matrices and Determinants", topics: ["Rank of a Matrix", "Consistency of Linear Equations", "Cramer's Rule & Inversion Method"] },
      { unit: "Unit 2: Complex Numbers", topics: ["Rectangular & Polar Forms", "De Moivre's Theorem", "n-th Roots of Unity"] },
      { unit: "Unit 3: Analytical Geometry & Calculus", topics: ["Conics (Parabola, Ellipse, Hyperbola)", "Tangent & Normal Equations", "Definite Integrals & Areas"] }
    ]
  },
  {
    subject: "Physics",
    code: "PHY-12",
    prepClass: 12,
    label: "Class 12 Physics (Theory & Problems)",
    text: "Unit 1: Electrostatics (Coulomb's Law, Electric Dipole, Gauss's Law, Capacitors in Series/Parallel, Van de Graaff)\nUnit 2: Current Electricity (Drift Velocity, Ohm's Law, Kirchhoff's Laws, Wheatstone Bridge, Potentiometer)\nUnit 3: Magnetism and Magnetic Effects (Biot-Savart Law, Ampere's Circuital Law, Cyclotron, Moving Coil Galvanometer)\nUnit 4: Electromagnetic Induction and Alternating Current (Faraday's Laws, Lenz's Law, Transformer, AC Circuits)\nUnit 5: Optics (Wave Optics, Huygens' Principle, Interference, Young's Double Slit, Diffraction)\nUnit 6: Modern Physics & Semiconductor Electronics (Photoelectric Effect, Bohr Model, PN Junction, Transistors, Logic Gates)",
    units: [
      { unit: "Unit 1: Electrostatics & Current", topics: ["Coulomb's Law & Gauss Law", "Capacitor Energy & Combinations", "Kirchhoff's Laws & Wheatstone Bridge"] },
      { unit: "Unit 2: Magnetism & AC Circuits", topics: ["Biot-Savart & Ampere Laws", "Faraday & Lenz Induction", "LCR Series Circuit & Resonance"] },
      { unit: "Unit 3: Optics & Modern Physics", topics: ["Interference & Diffraction", "Photoelectric Effect", "Semiconductor Diodes & Logic Gates"] }
    ]
  },
  {
    subject: "Chemistry",
    code: "CHE-12",
    prepClass: 12,
    label: "Class 12 Chemistry (Inorganic, Organic & Physical)",
    text: "Unit 1: Metallurgy (Concentration of Ores, Extraction, Refining of Metals)\nUnit 2: p-Block Elements I & II (Group 13 to 18 properties, anomalous behavior, interhalogen compounds)\nUnit 3: Coordination Chemistry (Werner's Theory, Valence Bond Theory, Crystal Field Theory, Isomerism)\nUnit 4: Solid State & Electrochemistry (Unit Cells, Packing Efficiency, Nernst Equation, Kohlrausch Law, Corrosion)\nUnit 5: Organic Chemistry (Haloalkanes, Alcohols, Phenols, Ethers, Aldehydes, Ketones, Carboxylic Acids, Biomolecules)",
    units: [
      { unit: "Unit 1: Metallurgy & Inorganic Chemistry", topics: ["Ore Concentration & Ellingham Diagrams", "p-Block & d-Block Trends", "Coordination Complexes & CFT"] },
      { unit: "Unit 2: Physical Chemistry", topics: ["Solid State Unit Cells", "Chemical Kinetics & Rate Laws", "Electrochemistry & Nernst Equation"] },
      { unit: "Unit 3: Organic Functional Groups", topics: ["Nucleophilic Substitutions", "Aldehydes, Ketones & Carboxylic Acids", "Biomolecules (Proteins, DNA, RNA)"] }
    ]
  },
  {
    subject: "Accountancy",
    code: "ACC-12",
    prepClass: 12,
    label: "Class 12 Accountancy (Board Blueprint)",
    text: "Unit 1: Accounts from Incomplete Records (Single Entry vs Double Entry, Statement of Affairs, Conversion Method)\nUnit 2: Accounts of Not-for-Profit Organisations (Receipts and Payments, Income and Expenditure Account, Balance Sheet)\nUnit 3: Accounts of Partnership Firms - Fundamentals (Partnership Deed, Interest on Capital & Drawings, Profit & Loss Appropriation)\nUnit 4: Good Will and Admission of a Partner (Revaluation of Assets, Sacrificing Ratio, Capital Adjustments)\nUnit 5: Retirement and Death of a Partner (Gaining Ratio, Settlement of Loan)\nUnit 6: Company Accounts (Issue and Forfeiture of Shares, Reissue of Shares)\nUnit 7: Financial Statement Analysis (Comparative, Common Size Statements, Ratio Analysis)\nUnit 8: Computerised Accounting System (Tally ERP, Chart of Accounts, Voucher Entry)",
    units: [
      { unit: "Unit 1: Incomplete Records & Not-for-Profit", topics: ["Statement of Affairs", "Receipts and Payments Account", "Income & Expenditure Balance Sheet"] },
      { unit: "Unit 2: Partnership Accounts", topics: ["P&L Appropriation", "Goodwill & Revaluation on Admission", "Retirement & Sacrificing Ratio"] },
      { unit: "Unit 3: Company Accounts & Ratios", topics: ["Share Capital Issue & Forfeiture", "Financial Statement Ratios (Liquidity, Solvency)", "Computerised Accounting Principles"] }
    ]
  },
  {
    subject: "Commerce",
    code: "COM-12",
    prepClass: 12,
    label: "Class 12 Commerce (Business Operations)",
    text: "Unit 1: Principles of Management (Taylor's Scientific Management, Fayol's 14 Principles)\nUnit 2: Financial Markets (Money Market, Capital Market, Government Securities, Stock Exchange, SEBI Regulations)\nUnit 3: Human Resource Management (Recruitment, Selection, Training Methods)\nUnit 4: Elements of Marketing (Modern Marketing Concept, Marketing Mix 4Ps, Consumer Protection Act 2019)\nUnit 5: Business Environment (LPG: Liberalisation, Privatisation, Globalisation, Demonetisation, Digital Economy)",
    units: [
      { unit: "Unit 1: Management Fundamentals", topics: ["Taylor's Scientific Principles", "Fayol's 14 Principles of Management", "Management by Objectives (MBO)"] },
      { unit: "Unit 2: Financial Markets & SEBI", topics: ["Capital vs Money Markets", "Stock Exchanges (NSE, BSE)", "SEBI Functions & Regulations"] },
      { unit: "Unit 3: Marketing & Consumer Rights", topics: ["Marketing Mix 4Ps", "Consumer Protection Act 2019", "E-Commerce & Digital Retailing"] }
    ]
  },
  {
    subject: "Economics",
    code: "ECO-12",
    prepClass: 12,
    label: "Class 12 Economics (Macroeconomics & Tamil Nadu)",
    text: "Unit 1: Introduction to Macro Economics (Circular Flow of Income, Economic Systems: Capitalist, Socialist, Mixed)\nUnit 2: National Income (GDP, GNP, NNP, Real vs Nominal Income, Measurement Methods, Difficulties)\nUnit 3: Theories of Employment and Income (Classical Theory, Say's Law of Markets, Keynesian Consumption Function)\nUnit 4: Monetary Economics (Functions of Money, Inflation: Demand-Pull & Cost-Push, Monetary Policy, RBI Functions)\nUnit 5: Banking & Fiscal Economics (Commercial Banks, Central Bank, Public Finance, Direct vs Indirect Taxes, GST)\nUnit 6: International Economics & Fiscal Policy (Balance of Trade, Balance of Payments, Foreign Direct Investment, WTO)",
    units: [
      { unit: "Unit 1: Macroeconomics & National Income", topics: ["Circular Flow in 2, 3, 4 Sector Models", "GDP/GNP/NNP Measurement", "Difficulties in Calculating National Income"] },
      { unit: "Unit 2: Monetary Theory & Banking", topics: ["Keynesian Employment Theory", "Inflation Mechanisms & Control", "RBI Functions & Monetary Instruments"] },
      { unit: "Unit 3: Fiscal Economics & International Trade", topics: ["Direct vs Indirect Taxes (GST)", "Budget Deficit Indicators", "Balance of Payments & WTO Framework"] }
    ]
  },
  {
    subject: "Business Mathematics & Statistics",
    code: "BMS-12",
    prepClass: 12,
    label: "Class 12 Business Mathematics & Statistics (BMS)",
    text: "Unit 1: Applications of Matrices and Determinants in Business (Input-Output Analysis, Hawkins-Simon Conditions)\nUnit 2: Integral Calculus (Consumer's Surplus, Producer's Surplus, Marginal Cost, Marginal Revenue)\nUnit 3: Differential Equations (Linear Differential Equations, Variable Separable in Economics)\nUnit 4: Interpolation and Fitting of Curves (Finite Differences, Newton's Forward & Backward Formulas)\nUnit 5: Probability Distributions (Binomial, Poisson, Normal Distribution in Business Decisions)\nUnit 6: Sampling Techniques and Statistical Quality Control (Random Sampling, Control Charts X-bar and R-chart)\nUnit 7: Operations Research (Linear Programming Problem, Transportation Problem, Assignment Problem)",
    units: [
      { unit: "Unit 1: Business Algebra & Calculus", topics: ["Input-Output Analysis (Hawkins-Simon)", "Consumer & Producer Surplus", "Marginal Revenue & Cost Functions"] },
      { unit: "Unit 2: Probability & Quality Control", topics: ["Binomial & Poisson Distributions", "Normal Curve Properties", "Control Charts (X-bar and R charts)"] },
      { unit: "Unit 3: Operations Research", topics: ["LPP Graphical Method", "Transportation North-West Corner & VAM", "Assignment Hungarian Method"] }
    ]
  },
  {
    subject: "Biology",
    code: "BIO-12",
    prepClass: 12,
    label: "Class 12 Biology (Botany & Zoology Combined)",
    text: "Unit 1: Reproduction in Organisms (Asexual & Sexual Reproduction, Pollination, Fertilization, Embryo Development)\nUnit 2: Genetics and Evolution (Mendelian Genetics, Linkage, DNA Structure, Replication, Gene Expression, Human Evolution)\nUnit 3: Biotechnology and Its Applications (Recombinant DNA, PCR, Gene Therapy, Transgenic Animals/Plants)\nUnit 4: Human Health and Diseases (Infectious Diseases, Immunology, Cancer, AIDS, Drug Abuse)\nUnit 5: Ecology and Environment (Ecosystem Structure, Energy Flow, Biodiversity Conservation, Environmental Issues)",
    units: [
      { unit: "Unit 1: Reproduction & Genetics", topics: ["Microsporogenesis & Megasporogenesis", "Double Fertilization & Endosperm", "Chromosomal Disorders & Pedigree"] },
      { unit: "Unit 2: Molecular Biology & Biotechnology", topics: ["DNA Replication & Transcription", "rDNA Technology & Vectors", "Transgenic Crops & Bioremediation"] },
      { unit: "Unit 3: Human Physiology & Ecology", topics: ["Immunity (Innate vs Acquired)", "Vaccines & Autoimmune Disorders", "Ecological Pyramids & Conservation"] }
    ]
  },
  {
    subject: "Botany",
    code: "BOT-12",
    prepClass: 12,
    label: "Class 12 Bio-Botany (Pure Science)",
    text: "Unit 1: Asexual and Sexual Reproduction in Plants (Microsporogenesis, Megasporogenesis, Pollination, Apomixis)\nUnit 2: Classical and Molecular Genetics (Mendelism, Gene Interactions, Polygenic Inheritance, Genetic Code)\nUnit 3: Biotechnology (Tissue Culture, Totipotency, Micropropagation, Genetic Engineering, Protoplast Fusion)\nUnit 4: Plant Ecology and Phytogeography (Ecological Adaptations, Hydrophytes, Xerophytes, Plant Succession)\nUnit 5: Economic Botany and Crop Improvement (Plant Breeding, Biofortification, Traditional Agriculture, Medicinal Plants)",
    units: [
      { unit: "Unit 1: Plant Reproduction & Genetics", topics: ["Development of Male & Female Gametophyte", "Apomixis & Polyembryony", "Chromosomal Mapping & Linkage"] },
      { unit: "Unit 2: Plant Tissue Culture & Biotechnology", topics: ["Totipotency & Callus Culture", "Protoplast Fusion & Somatic Hybrids", "Bt Cotton & Golden Rice"] },
      { unit: "Unit 3: Plant Ecology & Economic Botany", topics: ["Xerophytic & Hydrophytic Adaptations", "Ecological Succession Stages", "Biofortification & Green Manures"] }
    ]
  },
  {
    subject: "Zoology",
    code: "ZOO-12",
    prepClass: 12,
    label: "Class 12 Bio-Zoology (Pure Science)",
    text: "Unit 1: Human Reproduction and Reproductive Health (Spermatogenesis, Oogenesis, Menstrual Cycle, Contraception, IVF, Assisted Reproductive Technology)\nUnit 2: Genetics and Evolution (Sex Determination in Humans, Mendelian Disorders, DNA Fingerprinting, Theories of Evolution, Natural Selection)\nUnit 3: Immunology and Human Health (Immune System Organs, Antibodies, Hypersensitivity, Vaccines, Pathogenic Microbes)\nUnit 4: Applied Zoology (Sericulture, Apiculture, Aquaculture, Animal Husbandry, Medical Entomology)\nUnit 5: Environmental Issues and Biodiversity (Threats to Wildlife, Red Data Book, Pollution Control, Global Warming)",
    units: [
      { unit: "Unit 1: Human Reproduction & Embryology", topics: ["Gametogenesis & Hormonal Regulation", "Menstrual Cycle Phases", "ART Techniques (IVF, ICSI, ZIFT)"] },
      { unit: "Unit 2: Human Genetics & Molecular Medicine", topics: ["Sex-Linked Inheritance (Hemophilia, Colorblindness)", "Karyotyping & Down/Turner Syndromes", "DNA Fingerprinting in Forensics"] },
      { unit: "Unit 3: Immunology & Medical Zoology", topics: ["Antibody Structure (IgG, IgM, IgA)", "HIV Structure & Life Cycle", "Commercial Apiculture & Sericulture"] }
    ]
  },
  {
    subject: "English",
    code: "ENG-12",
    prepClass: 12,
    label: "Class 12 English (Core Language)",
    text: "Unit 1: Prose Reading Comprehension (Vocabulary, Synonyms, Antonyms, Contextual Inference, Central Themes)\nUnit 2: Poetry Appreciation (Figures of Speech, Rhyme Scheme, Tone, Symbolism, Critical Analysis)\nUnit 3: Supplementary Reader & Literature Study (Character Sketches, Plot Climax, Moral & Ethical Evaluation)\nUnit 4: Advanced Grammar and Mechanics (Active to Passive, Direct to Indirect Speech, Clauses, Prepositional Phrases, Concord)\nUnit 5: Writing Skills (Formal Letter Writing, Bio-Data & Resume, Report Writing, Notice & Article Composition)",
    units: [
      { unit: "Unit 1: Grammar & Vocabulary Mastery", topics: ["Tenses & Subject-Verb Agreement", "Reported Speech & Voice Transformations", "Prefixes, Suffixes & Phrasal Verbs"] },
      { unit: "Unit 2: Literature & Poetry Appreciation", topics: ["Figures of Speech (Metaphor, Simile, Personification)", "Theme Analysis & Critical Appreciation", "Character Sketching & Context Questions"] },
      { unit: "Unit 3: Composition & Practical Writing", topics: ["Letter to Editor & Job Application with CV", "Report Writing & Event Summaries", "Comprehension Passage Inference"] }
    ]
  },

  // Class 10 Core Subjects
  {
    subject: "Mathematics",
    code: "MAT-10",
    prepClass: 10,
    label: "Class 10 Mathematics (Core)",
    text: "Unit 1: Relations and Functions (Cartesian Product, Relations, Types of Functions, Composition)\nUnit 2: Numbers and Sequences (Euclid Division Lemma, AP and GP Formulas, Special Series)\nUnit 3: Algebra (Linear Equations 3 Variables, GCD/LCM Polynomials, Quadratic Formula, Matrices)\nUnit 4: Geometry (Similar Triangles, Thales Theorem, Angle Bisector Theorem, Pythagoras Theorem)\nUnit 5: Coordinate Geometry (Area of Triangle, Slope of Line, Straight Line Equations)\nUnit 6: Trigonometry (Identities, Heights and Distances, Angle of Elevation/Depression)\nUnit 7: Mensuration (Surface Area, Volume of Cone/Cylinder/Sphere, Combination of Solids)\nUnit 8: Statistics and Probability (Standard Deviation, Variance, Coefficient of Variation, Probability Laws)",
    units: [
      { unit: "Unit 1: Relations and Functions", topics: ["Cartesian Product", "Representation of Functions", "Composition of Functions"] },
      { unit: "Unit 2: Numbers and Sequences", topics: ["Euclid's Division Lemma", "Arithmetic Progression (AP)", "Geometric Progression (GP)", "Special Series"] },
      { unit: "Unit 3: Algebra & Matrices", topics: ["Simultaneous Linear Equations", "Quadratic Equation Nature of Roots", "Matrix Multiplication & Transpose"] }
    ]
  },
  {
    subject: "Science",
    code: "SCI-10",
    prepClass: 10,
    label: "Class 10 Science (Physics, Chemistry & Biology)",
    text: "Unit 1: Laws of Motion (Inertia, Newton's Laws, Linear Momentum, Conservation of Momentum)\nUnit 2: Optics (Refraction, Convex/Concave Lenses, Lens Formula, Human Eye Defects)\nUnit 3: Electricity and Thermal Physics (Ohm's Law, Resistors, Joule's Law, Gas Laws)\nUnit 7: Atoms and Molecules (Atomic Mass, Molecular Mass, Mole Concept, Avogadro's Hypothesis)\nUnit 8: Periodic Classification and Solutions (Modern Periodic Law, Solubility, Types of Reactions)\nUnit 12: Plant Anatomy and Physiology (Tissues, Photosynthesis, Respiration)\nUnit 14: Transportation in Plants and Circulation in Animals (Blood, Heart Structure, Lymphatic System)",
    units: [
      { unit: "Unit 1: Physics Principles", topics: ["Newton's Laws of Motion", "Refraction & Lenses", "Ohm's Law & Electric Power"] },
      { unit: "Unit 2: Chemistry Fundamentals", topics: ["Mole Concept & Avogadro Law", "Periodic Table Groups & Periods", "Types of Chemical Reactions"] },
      { unit: "Unit 3: Life Processes & Genetics", topics: ["Structure of Human Heart", "Nervous System & Reflex Arc", "Mendelian Monohybrid & Dihybrid Cross"] }
    ]
  },
  {
    subject: "Language (Tamil)",
    code: "TAM-10",
    prepClass: 10,
    label: "Class 10 Tamil (மொழிப்பாடம்)",
    text: "இயல் 1: அமுதவூற்று (அன்னை மொழியே, தமிழ்ச் சொல்வளம், இரட்டுற மொழிதல், எழுத்து சொல் இலக்கணம்)\nஇயல் 2: உயிரின் ஓசை (காற்றே வா, முல்லைப்பாட்டு, தொகைநிலைத் தொடர்கள்)\nஇயல் 3: கூட்டாஞ்சோறு (விருந்தோம்பல், காசி காண்டம், மலைபடுகடாம், தொகாநிலைத் தொடர்கள்)\nஇயல் 4: நான்காம் தமிழ் (செயற்கை நுண்ணறிவு, பெருமாள் திருமொழி, பரிபாடல், பொது இலக்கணம்)\nஇயல் 5: மணற்கேணி (மொழிபெயர்ப்புக் கல்வி, நீதி வெண்பா, திருவிளையாடற் புராணம், வினா விடை வகைகள்)",
    units: [
      { unit: "இயல் 1: அமுதவூற்று", topics: ["அன்னை மொழியே", "தமிழ்ச் சொல்வளம்", "எழுத்து சொல் இலக்கணம்"] },
      { unit: "இயல் 2: உயிரின் ஓசை & இலக்கணம்", topics: ["காற்றே வா", "முல்லைப்பாட்டு", "தொகைநிலைத் தொடர்கள்"] },
      { unit: "இயல் 3: மணற்கேணி & அறிவியல் தமிழ்", topics: ["செயற்கை நுண்ணறிவு", "மொழிபெயர்ப்புக் கல்வி", "வினா விடை வகைகள்"] }
    ]
  },
  {
    subject: "Social Science",
    code: "SOC-10",
    prepClass: 10,
    label: "Class 10 Social Science (History, Geo, Civics & Eco)",
    text: "History Unit 1: Outbreak of World War I and Its Aftermath (Imperialism, League of Nations, Russian Revolution)\nHistory Unit 5: Social and Religious Reform Movements in the 19th Century (Brahmo Samaj, Arya Samaj, Ramakrishna Mission)\nGeography Unit 1: India - Location, Relief and Drainage (Himalayas, Northern Plains, Peninsular Rivers)\nGeography Unit 3: India - Agriculture (Soils, Irrigation, Kharif/Rabi Crops, Green Revolution)\nCivics Unit 1: Indian Constitution (Preamble, Fundamental Rights & Duties, Directive Principles)\nEconomics Unit 1: Gross Domestic Product and its Growth (Sectors of Economy, Percapita Income)",
    units: [
      { unit: "Unit 1: Indian Freedom & History", topics: ["World War I & Russian Revolution", "19th Century Social Reform", "Anti-Colonial Movements in Tamil Nadu"] },
      { unit: "Unit 2: Geography of India & Tamil Nadu", topics: ["Physiographic Divisions", "Monsoon & Agriculture", "Industrial Clusters of Tamil Nadu"] },
      { unit: "Unit 3: Constitution & Economics", topics: ["Fundamental Rights & Writs", "Union Executive & Parliament", "GDP & Multi-National Corporations"] }
    ]
  }
];

