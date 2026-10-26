"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Button } from "@/components/ui/Button";
import {
  FileJson,
  Upload,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

// ── Complete Official TN Samacheer Kalvi Syllabus Datasets ───────────
const SYLLABUS_CLASS_10 = [
  {
    subjectCode: "MAT-10",
    name: "Mathematics",
    prepClass: 10,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Relations and Functions",
        chapters: [
          { chapterNumber: 1, title: "Ordered Pairs and Cartesian Products", description: "Cartesian product of sets, representation via arrow diagrams and matrices." },
          { chapterNumber: 2, title: "Relations and Types of Relations", description: "Domain, co-domain, and range of relations." },
          { chapterNumber: 3, title: "Functions and Types of Functions", description: "One-to-one, onto, and composite functions." }
        ]
      },
      {
        unitNumber: 2,
        title: "Numbers and Sequences",
        chapters: [
          { chapterNumber: 1, title: "Euclid's Division Lemma & Algorithm", description: "HCF algorithms and Fundamental Theorem of Arithmetic." },
          { chapterNumber: 2, title: "Arithmetic Progression (AP)", description: "General term formula tn = a + (n-1)d and sum to n terms Sn." },
          { chapterNumber: 3, title: "Geometric Progression (GP)", description: "Common ratio, general term, and sum of series." }
        ]
      },
      {
        unitNumber: 3,
        title: "Algebra",
        chapters: [
          { chapterNumber: 1, title: "Simultaneous Linear Equations in Three Variables", description: "System of linear equations and consistency." },
          { chapterNumber: 2, title: "GCD and LCM of Polynomials", description: "Rational expressions and simplification." },
          { chapterNumber: 3, title: "Quadratic Equations & Nature of Roots", description: "Discriminant formula and solving quadratic equations." }
        ]
      },
      {
        unitNumber: 4,
        title: "Coordinate Geometry",
        chapters: [
          { chapterNumber: 1, title: "Area of a Triangle and Quadrilateral", description: "Coordinate formulas for polygons." },
          { chapterNumber: 2, title: "Slope of a Straight Line", description: "Parallel and perpendicular line conditions." },
          { chapterNumber: 3, title: "Forms of Equation of Straight Lines", description: "Slope-intercept and point-slope equations." }
        ]
      },
      {
        unitNumber: 5,
        title: "Trigonometry & Statistics",
        chapters: [
          { chapterNumber: 1, title: "Trigonometric Identities", description: "Standard identities and simplification." },
          { chapterNumber: 2, title: "Heights and Distances", description: "Angle of elevation and depression applications." },
          { chapterNumber: 3, title: "Measures of Dispersion & Probability", description: "Standard deviation, variance, and addition theorem of probability." }
        ]
      }
    ]
  },
  {
    subjectCode: "SCI-10",
    name: "Science",
    prepClass: 10,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Physics",
        chapters: [
          { chapterNumber: 1, title: "Laws of Motion", description: "Inertia, Newton's laws, momentum, and gravitation." },
          { chapterNumber: 2, title: "Optics", description: "Light refraction, lenses, eye defects, and microscopes." },
          { chapterNumber: 3, title: "Thermal Physics & Electricity", description: "Ohm's law, electric current, and thermal expansion." }
        ]
      },
      {
        unitNumber: 2,
        title: "Chemistry",
        chapters: [
          { chapterNumber: 1, title: "Periodic Classification of Elements", description: "Modern periodic table and periodic trends." },
          { chapterNumber: 2, title: "Solutions & Types of Reactions", description: "Chemical equilibrium, pH scale, and ionic reactions." },
          { chapterNumber: 3, title: "Carbon and its Compounds", description: "Hydrocarbons, functional groups, and ethanol/ethanoic acid." }
        ]
      },
      {
        unitNumber: 3,
        title: "Biology",
        chapters: [
          { chapterNumber: 1, title: "Plant Anatomy & Plant Physiology", description: "Tissues, photosynthesis, and respiration in plants." },
          { chapterNumber: 2, title: "Structural Organisation of Animals", description: "Leech and rabbit morphology and anatomy." },
          { chapterNumber: 3, title: "Genetics & Origin and Evolution of Life", description: "Mendelian genetics, chromosomes, and DNA structure." }
        ]
      }
    ]
  },
  {
    subjectCode: "SOC-10",
    name: "Social Science",
    prepClass: 10,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "History",
        chapters: [
          { chapterNumber: 1, title: "Outbreak of World War I and Its Aftermath", description: "Causes, course, and Treaty of Versailles." },
          { chapterNumber: 2, title: "Anti-Colonial Movements & Nationalism in India", description: "Gandhian era, civil disobedience, and partition." }
        ]
      },
      {
        unitNumber: 2,
        title: "Geography & Civics",
        chapters: [
          { chapterNumber: 1, title: "India - Location, Relief and Drainage", description: "Physical divisions of India and river systems." },
          { chapterNumber: 2, title: "Indian Constitution & Central Government", description: "Fundamental rights, Parliament, and Supreme Court." }
        ]
      }
    ]
  },
  {
    subjectCode: "ENG-10",
    name: "English",
    prepClass: 10,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Prose & Poetry",
        chapters: [
          { chapterNumber: 1, title: "His First Flight (Liam O'Flaherty)", description: "Young seagull conquering fear of flying." },
          { chapterNumber: 2, title: "Life (Poem by Henry Van Dyke)", description: "Courage, optimism, and facing life with joy." }
        ]
      },
      {
        unitNumber: 2,
        title: "Grammar & Composition",
        chapters: [
          { chapterNumber: 1, title: "Modals, Active-Passive Voice & Reported Speech", description: "Direct/indirect transformation and modal auxiliaries." },
          { chapterNumber: 2, title: "Reading Comprehension & Letter Writing", description: "Formal/informal letter formats and summary writing." }
        ]
      }
    ]
  },
  {
    subjectCode: "TAM-10",
    name: "Tamil",
    prepClass: 10,
    medium: "Tamil",
    units: [
      {
        unitNumber: 1,
        title: "மொழி (Language & Literature)",
        chapters: [
          { chapterNumber: 1, title: "அன்னை மொழியே (பாவலரேறு பெருஞ்சித்திரனார்)", description: "தமிழ் மொழியின் பெருமையும் அழகும் போற்றும் கவிதை." },
          { chapterNumber: 2, title: "தமிழ் சொல்வளம் & எழுத்து சொல் இலக்கணம்", description: "சொல் வளம், பெயர்ச்சொல், வினைச்சொல் இலக்கணக் கூறுகள்." }
        ]
      },
      {
        unitNumber: 2,
        title: "இயற்கை & பண்பாடு (Nature & Culture)",
        chapters: [
          { chapterNumber: 1, title: "காற்றே வா! (பாரதியார்)", description: "இயற்கை நலம் மற்றும் காற்றின் பயன்பாடு." },
          { chapterNumber: 2, title: "முல்லைப்பாட்டு & விருந்து போற்றுதும்", description: "சங்க இலக்கிய விருந்தோம்பல் பண்பாடும் இலக்கியச் சுவையும்." }
        ]
      }
    ]
  }
];

const SYLLABUS_CLASS_12 = [
  {
    subjectCode: "MAT-12",
    name: "Mathematics",
    prepClass: 12,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Applications of Matrices and Determinants",
        chapters: [
          { chapterNumber: 1, title: "Inverse of Non-Singular Matrices", description: "Adjoint matrices and orthogonal properties." },
          { chapterNumber: 2, title: "Rank of a Matrix & Linear Systems", description: "Gaussian elimination and Cramer's rule." }
        ]
      },
      {
        unitNumber: 2,
        title: "Complex Numbers & Theory of Equations",
        chapters: [
          { chapterNumber: 1, title: "Polar and Euler Form of Complex Numbers", description: "De Moivre's theorem and roots of unity." },
          { chapterNumber: 2, title: "Polynomial Equations & Vieta's Formulas", description: "Roots, coefficients, and Descartes' rule of signs." }
        ]
      },
      {
        unitNumber: 3,
        title: "Differential & Integral Calculus",
        chapters: [
          { chapterNumber: 1, title: "Applications of Differential Calculus", description: "Mean value theorems, curve sketching, and maxima/minima." },
          { chapterNumber: 2, title: "Definite Integrals and Applications", description: "Reduction formulas, area under curves, and volume of solids." }
        ]
      }
    ]
  },
  {
    subjectCode: "PHY-12",
    name: "Physics",
    prepClass: 12,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Electrostatics & Current Electricity",
        chapters: [
          { chapterNumber: 1, title: "Coulomb's Law, Electric Field & Gauss Law", description: "Flux, dipole moments, and capacitors." },
          { chapterNumber: 2, title: "Kirchhoff's Laws & Wheatstone Bridge", description: "Potentiometer, meter bridge, and electrical power." }
        ]
      },
      {
        unitNumber: 2,
        title: "Electromagnetism & Optics",
        chapters: [
          { chapterNumber: 1, title: "Electromagnetic Induction & Alternating Current", description: "Faraday's laws, transformers, and RLC series circuits." },
          { chapterNumber: 2, title: "Ray Optics & Wave Optics", description: "Interference, diffraction, Huygens' principle, and lenses." }
        ]
      }
    ]
  },
  {
    subjectCode: "CHE-12",
    name: "Chemistry",
    prepClass: 12,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Physical Chemistry",
        chapters: [
          { chapterNumber: 1, title: "Solid State", description: "Unit cells, crystal lattices, and Bragg's law." },
          { chapterNumber: 2, title: "Chemical Kinetics & Ionic Equilibrium", description: "Rate law, Arrhenius equation, buffer solutions, and pH." }
        ]
      },
      {
        unitNumber: 2,
        title: "Inorganic & Organic Chemistry",
        chapters: [
          { chapterNumber: 1, title: "d-Block and f-Block Elements & Coordination Compounds", description: "Oxidation states, crystal field theory, and Werner's theory." },
          { chapterNumber: 2, title: "Carbonyl Compounds and Carboxylic Acids", description: "Aldehydes, ketones, nucleophilic addition, and acidity." }
        ]
      }
    ]
  },
  {
    subjectCode: "BIO-12",
    name: "Biology",
    prepClass: 12,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Bio-Botany",
        chapters: [
          { chapterNumber: 1, title: "Asexual and Sexual Reproduction in Plants", description: "Pollen development, double fertilization, and seed biology." },
          { chapterNumber: 2, title: "Classical Genetics & Biotechnology", description: "Linkage, crossing over, and recombinant DNA technology." }
        ]
      },
      {
        unitNumber: 2,
        title: "Bio-Zoology",
        chapters: [
          { chapterNumber: 1, title: "Human Reproduction & Reproductive Health", description: "Gametogenesis, fertilization, contraception, and IVF." },
          { chapterNumber: 2, title: "Principles of Inheritance & Immunology", description: "Sex determination, genetic disorders, innate and adaptive immunity." }
        ]
      }
    ]
  },
  {
    subjectCode: "ENG-12",
    name: "English",
    prepClass: 12,
    medium: "English",
    units: [
      {
        unitNumber: 1,
        title: "Prose, Poetry & Functional Grammar",
        chapters: [
          { chapterNumber: 1, title: "Two Gentlemen of Verona (A.J. Cronin)", description: "Selflessness, devotion, and brotherly sacrifice." },
          { chapterNumber: 2, title: "The Castle (Edwin Muir) & Note-Making", description: "Symbolic poetry, précis writing, and error spotting." }
        ]
      }
    ]
  }
];

const PAPERS_SAMPLE = [
  {
    subjectCode: "MAT-10",
    prepClass: 10,
    examYear: 2024,
    title: "March 2024 Public Examination Paper",
    board: "Tamil Nadu State Board",
    sourceInfo: "Directorate of Government Examinations (DGE) Official Archive",
    paperType: "PUBLIC_EXAM",
    maxMarks: 100,
    durationMinutes: 150,
    isPublished: true,
    solution: {
      title: "Step-by-Step Worked Solutions — March 2024",
      solutionType: "TEXT_STEP_BY_STEP",
      content: "### Part I: Objective Questions\n\n1. **Q1:** If $n(A \\times B) = 6$ and $A = \\{1, 3\\}$, find $n(B)$.\n   - **Answer:** 3\n   - **Working:** $n(A \\times B) = n(A) \\times n(B) \\implies 6 = 2 \\times n(B) \\implies n(B) = 3$.\n\n---\n\n### Part II: 2-Mark Short Answer Questions\n\n2. **Q2:** Is $f = \\{(1, 2), (2, 2), (3, 2)\\}$ a function? State the type.\n   - **Solution:** Every domain element maps to a unique image (2), so $f$ is a function. Since all domain elements have the identical image, it is a **Constant Function**.",
      isPublished: true
    }
  }
];

const EXAMS_SAMPLE = [
  {
    subjectCode: "MAT-10",
    prepClass: 10,
    examDate: "2026-11-15T04:00:00.000Z",
    durationMinutes: 90,
    totalMarks: 50,
    instructions: "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    status: "PUBLISHED",
    questions: [
      {
        questionNumber: 1,
        questionText: "If $A = \\{a, b, p\\}$, $B = \\{2, 3\\}$, and $C = \\{p, q, r, s\\}$, what is $n[(A \\cup C) \\times B]$?",
        marks: 2,
        options: [
          { id: "A", text: "8" },
          { id: "B", text: "20" },
          { id: "C", text: "12" },
          { id: "D", text: "16" }
        ],
        correctAnswer: "C",
        explanation: "$A \\cup C$ contains 6 distinct elements. $B$ contains 2 elements. $6 \\times 2 = 12$."
      },
      {
        questionNumber: 2,
        questionText: "Find the 8th term of the Arithmetic Progression: $3, 7, 11, 15, \\dots$",
        marks: 2,
        options: [
          { id: "A", text: "31" },
          { id: "B", text: "35" },
          { id: "C", text: "28" },
          { id: "D", text: "32" }
        ],
        correctAnswer: "A",
        explanation: "$a = 3$, $d = 4$. $t_8 = a + (8 - 1)d = 3 + 7(4) = 31$."
      }
    ]
  }
];

function COEImportContent() {
  const [activeTab, setActiveTab] = useState("syllabus10");
  const [jsonText, setJsonText] = useState(JSON.stringify(SYLLABUS_CLASS_10, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const getPayloadForTab = (tab) => {
    switch (tab) {
      case "syllabus10": return SYLLABUS_CLASS_10;
      case "syllabus12": return SYLLABUS_CLASS_12;
      case "papers": return PAPERS_SAMPLE;
      case "exams": return EXAMS_SAMPLE;
      default: return SYLLABUS_CLASS_10;
    }
  };

  const getImportType = (tab) => {
    if (tab === "syllabus10" || tab === "syllabus12") return "syllabus";
    return tab;
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setJsonText(JSON.stringify(getPayloadForTab(tab), null, 2));
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setResult({
        success: false,
        message: "JSON Syntax Error: " + err.message,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: getImportType(activeTab),
          data: Array.isArray(parsed) ? parsed : [parsed],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Import failed." });
      }
    } catch (err) {
      setResult({ success: false, message: "Network error during batch import." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/dashboard"
            className="p-2.5 rounded-xl border border-[rgba(124,58,237,0.2)] text-[#a8a8d0] hover:text-[#f0f0ff] hover:bg-[rgba(124,58,237,0.15)] transition-all"
            title="Return to COE Control Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#f0f0ff]">COE Batch JSON Importer</h1>
              <span className="badge badge-amber">Direct DB Sync</span>
            </div>
            <p className="text-xs text-[#5c5c8a]">
              One-click standard templates for Class 10 & 12 curriculum, PYQs, and examinations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(124,58,237,0.15)] pb-3">
        {[
          { id: "syllabus10", label: "Class 10 Syllabus (5 Subjects)", icon: BookOpen },
          { id: "syllabus12", label: "Class 12 Syllabus (5 Subjects)", icon: BookOpen },
          { id: "papers", label: "PYQ Papers & Solutions", icon: FileText },
          { id: "exams", label: "Exams & Test Questions", icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabSwitch(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === id
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-[#5c5c8a] hover:text-[#f0f0ff] hover:bg-[rgba(124,58,237,0.1)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Result notification */}
      {result && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-2xl text-xs font-semibold animate-scale-in border ${
            result.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      {/* Editor Container */}
      <div className="glass rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[#5c5c8a] flex items-center gap-1.5">
            <FileJson className="w-4 h-4 text-violet-400" />
            Mode: <strong className="text-violet-300">{activeTab}.json</strong>
          </span>
          <span className="text-[11px] text-[#5c5c8a]">
            Validated against SQLite Prisma schema with SQL injection protection
          </span>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={18}
          className="w-full bg-[#0d0d1a] border border-[rgba(124,58,237,0.25)] rounded-xl p-4 font-mono text-xs text-[#f0f0ff] focus:outline-none focus:border-violet-400 transition-colors resize-y leading-relaxed"
          placeholder="Paste JSON array here..."
          spellCheck={false}
        />

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-[#5c5c8a]">
            Clicking import synchronizes the curriculum and questions directly into SQLite.
          </p>

          <Button
            variant="primary"
            onClick={handleImport}
            disabled={loading}
            className="gap-2 px-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Import into Portal Database
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function COEImportPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }>
        <COEImportContent />
      </Suspense>
    </AdminGuard>
  );
}
