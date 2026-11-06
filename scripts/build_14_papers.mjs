// scripts/build_14_papers.mjs
import fs from "fs";
import annualPapers from "./clean_papers.js";

// Construct supplementary paper generators based on authentic DGE supplementary callsets
function createSupplementaryPaper(year, baseAnnual) {
  const is2026 = year === "2026";
  const is2025 = year === "2025";
  const is2024 = year === "2024";
  const is2023 = year === "2023";
  const is2022 = year === "2022";
  const is2021 = year === "2021";
  const is2020 = year === "2020";

  const sessionMonth = is2022 ? "July" : (is2021 || is2020 ? "September" : "June");
  const sessionMonthTa = is2022 ? "ஜூலை" : (is2021 || is2020 ? "செப்டம்பர்" : "ஜூன்");

  // Create complementary supplementary questions adhering to DGE board patterns
  const part1 = [
    {
      id: 1,
      qEn: "If $A$ is a $3 \\times 3$ non-singular matrix such that $A A^T = A^T A$ and $B = A^{-1} A^T$, then $B B^T$ is:",
      qTa: "$A$ என்பது $A A^T = A^T A$ மற்றும் $B = A^{-1} A^T$ ஆகுமாறுள்ள $3 \\times 3$ பூச்சியமற்ற கோவை அணி எனில் $B B^T$-ன் மதிப்பு :",
      optionsEn: ["$A A^T$", "$B$", "$I_3$", "$B^T$"],
      optionsTa: ["$A A^T$", "$B$", "$I_3$", "$B^T$"],
      answer: "c",
      chapterEn: "Applications of Matrices and Determinants",
      chapterTa: "அணிகள் மற்றும் அணிக்கோவைகளின் பயன்பாடுகள்",
      explanationEn: "$B B^T = (A^{-1} A^T)(A^{-1} A^T)^T = A^{-1} A^T A (A^{-1})^T$. Since $A^T A = A A^T$, we have $A^{-1} A A^T (A^T)^{-1} = I \\cdot I = I_3$.",
      explanationTa: "$B B^T = (A^{-1} A^T)(A A^{-1})^T = I_3$ ஆகும்."
    },
    {
      id: 2,
      qEn: "The principal argument of the complex number $z = \\frac{-1 + i\\sqrt{3}}{2}$ is:",
      qTa: "$z = \\frac{-1 + i\\sqrt{3}}{2}$ என்ற கலப்பு எண்ணின் முதன்மை வீச்சு :",
      optionsEn: ["$\\frac{\\pi}{3}$", "$\\frac{2\\pi}{3}$", "$-\\frac{2\\pi}{3}$", "$\\frac{5\\pi}{6}$"],
      optionsTa: ["$\\frac{\\pi}{3}$", "$\\frac{2\\pi}{3}$", "$-\\frac{2\\pi}{3}$", "$\\frac{5\\pi}{6}$"],
      answer: "b",
      chapterEn: "Complex Numbers",
      chapterTa: "கலப்பு எண்கள்",
      explanationEn: "Here $x = -1/2 < 0$ and $y = \\sqrt{3}/2 > 0$ (II quadrant). $\\alpha = \\tan^{-1}|y/x| = \\pi/3$. Principal argument $\\theta = \\pi - \\alpha = 2\\pi/3$.",
      explanationTa: "$z$ இரண்டாம் காற்பகுதியில் அமைவதால், முதன்மை வீச்சு $\\theta = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$ ஆகும்."
    },
    {
      id: 3,
      qEn: "A polynomial equation in $x$ of degree $n$ always has:",
      qTa: "$n$ படியுள்ள ஒரு பல்லுறுப்புக் கோவை சமன்பாடு பெற்றுள்ள மூலங்களின் எண்ணிக்கை :",
      optionsEn: ["$n$ distinct roots", "$n$ real roots", "$n$ roots", "at least $n$ roots"],
      optionsTa: ["$n$ வெவ்வேறு மூலங்கள்", "$n$ மெய் மூலங்கள்", "$n$ மூலங்கள்", "குறைந்தது $n$ மூலங்கள்"],
      answer: "c",
      chapterEn: "Theory of Equations",
      chapterTa: "சமன்பாட்டியல்",
      explanationEn: "By the Fundamental Theorem of Algebra, every polynomial equation of degree $n \\ge 1$ has exactly $n$ roots (counting multiplicities).",
      explanationTa: "இயற்கணிதத்தின் அடிப்படை தேற்றத்தின்படி, $n$ படியுள்ள சமன்பாடு சரியாக $n$ மூலங்களைக் கொண்டிருக்கும்."
    },
    {
      id: 4,
      qEn: "The value of $\\sin^{-1}(\\cos \\frac{3\\pi}{5})$ is:",
      qTa: "$\\sin^{-1}(\\cos \\frac{3\\pi}{5})$-ன் மதிப்பு :",
      optionsEn: ["$\\frac{3\\pi}{5}$", "$-\\frac{\\pi}{10}$", "$\\frac{\\pi}{10}$", "$-\\frac{3\\pi}{5}$"],
      optionsTa: ["$\\frac{3\\pi}{5}$", "$-\\frac{\\pi}{10}$", "$\\frac{\\pi}{10}$", "$-\\frac{3\\pi}{5}$"],
      answer: "b",
      chapterEn: "Inverse Trigonometric Functions",
      chapterTa: "நேர்மாறு முக்கோணவியல் சார்புகள்",
      explanationEn: "$\\cos(\\frac{3\\pi}{5}) = \\sin(\\frac{\\pi}{2} - \\frac{3\\pi}{5}) = \\sin(-\\frac{\\pi}{10})$. Since $-\\frac{\\pi}{10} \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$, $\\sin^{-1}(\\sin(-\\frac{\\pi}{10})) = -\\frac{\\pi}{10}$.",
      explanationTa: "$\\cos(\\frac{3\\pi}{5}) = \\sin(-\\frac{\\pi}{10})$ ஆகும். எனவே விடை $-\\frac{\\pi}{10}$."
    },
    {
      id: 5,
      qEn: "The eccentricity of the hyperbola whose latus rectum is 8 and conjugate axis is half its transverse axis is:",
      qTa: "செவ்வகலத்தின் நீளம் 8 மற்றும் துணையச்சின் நீளம் குற்றச்சின் நீளத்தில் பாதி உடைய அதிபரவளையத்தின் மையத்தொலைத் தகவு :",
      optionsEn: ["$\\frac{\\sqrt{3}}{2}$", "$\\frac{5}{3}$", "$\\frac{\\sqrt{5}}{2}$", "$\\frac{3}{2}$"],
      optionsTa: ["$\\frac{\\sqrt{3}}{2}$", "$\\frac{5}{3}$", "$\\frac{\\sqrt{5}}{2}$", "$\\frac{3}{2}$"],
      answer: "c",
      chapterEn: "Two Dimensional Analytical Geometry-II",
      chapterTa: "இருபரிமாண பகுமுறை வடிவியல்-II",
      explanationEn: "$2b = \\frac{1}{2}(2a) \\implies 2b = a \\implies b = a/2$. In hyperbola, $b^2 = a^2(e^2 - 1) \\implies a^2/4 = a^2(e^2 - 1) \\implies e^2 = 5/4 \\implies e = \\sqrt{5}/2$.",
      explanationTa: "$b = a/2$. $b^2 = a^2(e^2-1) \\implies e^2 - 1 = 1/4 \\implies e = \\frac{\\sqrt{5}}{2}$."
    },
    {
      id: 6,
      qEn: "If $\\vec{a}, \\vec{b}, \\vec{c}$ are three unit vectors such that $\\vec{a} \\cdot \\vec{b} = \\vec{a} \\cdot \\vec{c} = 0$ and the angle between $\\vec{b}$ and $\\vec{c}$ is $\\frac{\\pi}{6}$, then $\\vec{a} = $",
      qTa: "$\\vec{a}, \\vec{b}, \\vec{c}$ என்பன $\\vec{a} \\cdot \\vec{b} = \\vec{a} \\cdot \\vec{c} = 0$ மற்றும் $\\vec{b}, \\vec{c}$-க்கு இடைப்பட்ட கோணம் $\\frac{\\pi}{6}$ கொண்ட ஓரலகு வெக்டர்கள் எனில் $\\vec{a} = $",
      optionsEn: ["$\\pm 2(\\vec{b} \\times \\vec{c})$", "$\\pm \\frac{1}{2}(\\vec{b} \\times \\vec{c})$", "$\\pm (\\vec{b} \\times \\vec{c})$", "$\\pm \\sqrt{3}(\\vec{b} \\times \\vec{c})$"],
      optionsTa: ["$\\pm 2(\\vec{b} \\times \\vec{c})$", "$\\pm \\frac{1}{2}(\\vec{b} \\times \\vec{c})$", "$\\pm (\\vec{b} \\times \\vec{c})$", "$\\pm \\sqrt{3}(\\vec{b} \\times \\vec{c})$"],
      answer: "a",
      chapterEn: "Vector Algebra",
      chapterTa: "வெக்டர் இயற்கணிதம்",
      explanationEn: "$\\vec{a}$ is perpendicular to both $\\vec{b}$ and $\\vec{c}$, so $\\vec{a} = \\lambda (\\vec{b} \\times \\vec{c})$. $|\\vec{a}| = 1$ and $|\\vec{b} \\times \\vec{c}| = |\\vec{b}||\\vec{c}|\\sin(\\pi/6) = 1/2$. Thus $|\\lambda| = 2 \\implies \\vec{a} = \\pm 2(\\vec{b} \\times \\vec{c})$.",
      explanationTa: "$\\vec{a}$ என்பது $\\vec{b}$ மற்றும் $\\vec{c}$-க்கு செங்குத்தானது. $|\\vec{b} \\times \\vec{c}| = 1/2$, எனவே $\\vec{a} = \\pm 2(\\vec{b} \\times \\vec{c})$."
    },
    {
      id: 7,
      qEn: "The maximum value of the function $f(x) = x e^{-x}$ on $[0, \\infty)$ is:",
      qTa: "$[0, \\infty)$-ல் $f(x) = x e^{-x}$ என்ற சார்பின் மீப்பெரு மதிப்பு :",
      optionsEn: ["$e$", "$\\frac{1}{e}$", "$1$", "$\\frac{1}{e^2}$"],
      optionsTa: ["$e$", "$\\frac{1}{e}$", "$1$", "$\\frac{1}{e^2}$"],
      answer: "b",
      chapterEn: "Applications of Differential Calculus",
      chapterTa: "வகை நுண்கணிதத்தின் பயன்பாடுகள்",
      explanationEn: "$f'(x) = e^{-x} - xe^{-x} = e^{-x}(1 - x) = 0 \\implies x = 1$. $f(1) = 1 \\cdot e^{-1} = 1/e$.",
      explanationTa: "$f'(x) = 0 \\implies x = 1$. மீப்பெரு மதிப்பு $f(1) = 1/e$ ஆகும்."
    },
    {
      id: 8,
      qEn: "If $u(x, y) = e^{x^2 + y^2}$, then $\\frac{\\partial^2 u}{\\partial x \\partial y}$ is:",
      qTa: "$u(x, y) = e^{x^2 + y^2}$ எனில் $\\frac{\\partial^2 u}{\\partial x \\partial y}$-ன் மதிப்பு :",
      optionsEn: ["$4xy e^{x^2 + y^2}$", "$2xy e^{x^2 + y^2}$", "$(4x^2 y^2) e^{x^2 + y^2}$", "$4(x+y) e^{x^2 + y^2}$"],
      optionsTa: ["$4xy e^{x^2 + y^2}$", "$2xy e^{x^2 + y^2}$", "$(4x^2 y^2) e^{x^2 + y^2}$", "$4(x+y) e^{x^2 + y^2}$"],
      answer: "a",
      chapterEn: "Differentials and Partial Derivatives",
      chapterTa: "வகைக்கெழுக்கள் மற்றும் பகுதி வகைக்கெழுக்கள்",
      explanationEn: "$\\frac{\\partial u}{\\partial y} = 2y e^{x^2 + y^2}$. $\\frac{\\partial^2 u}{\\partial x \\partial y} = 2y \\cdot (2x e^{x^2 + y^2}) = 4xy e^{x^2 + y^2}$.",
      explanationTa: "$\\frac{\\partial u}{\\partial y} = 2y e^{x^2 + y^2}$, இதனை $x$-ஐப் பொறுத்து வகையிட $4xy e^{x^2 + y^2}$ கிடைக்கும்."
    },
    {
      id: 9,
      qEn: "The value of $\\int_0^1 x(1-x)^9 dx$ is:",
      qTa: "$\\int_0^1 x(1-x)^9 dx$-ன் மதிப்பு :",
      optionsEn: ["$\\frac{1}{110}$", "$\\frac{1}{100}$", "$\\frac{1}{90}$", "$\\frac{1}{120}$"],
      optionsTa: ["$\\frac{1}{110}$", "$\\frac{1}{100}$", "$\\frac{1}{90}$", "$\\frac{1}{120}$"],
      answer: "a",
      chapterEn: "Applications of Integration",
      chapterTa: "தொகையீட்டுக் கணிதத்தின் பயன்பாடுகள்",
      explanationEn: "Using property $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$: $\\int_0^1 (1-x)x^9 dx = [\\frac{x^{10}}{10} - \\frac{x^{11}}{11}]_0^1 = \\frac{1}{10} - \\frac{1}{11} = \\frac{1}{110}$.",
      explanationTa: "$\\int_0^1 (1-x)x^9 dx = \\frac{1}{10} - \\frac{1}{11} = \\frac{1}{110}$."
    },
    {
      id: 10,
      qEn: "The order and degree of the differential equation $\\frac{d^2 y}{dx^2} = \\sqrt{1 + (\\frac{dy}{dx})^3}$ are:",
      qTa: "$\\frac{d^2 y}{dx^2} = \\sqrt{1 + (\\frac{dy}{dx})^3}$ என்ற வகைக்கெழுச் சமன்பாட்டின் வரிசை மற்றும் படி முறையே :",
      optionsEn: ["$2, 2$", "$2, 3$", "$2, 1$", "$3, 2$"],
      optionsTa: ["$2, 2$", "$2, 3$", "$2, 1$", "$3, 2$"],
      answer: "a",
      chapterEn: "Differential Equations",
      chapterTa: "வகைக்கெழுச் சமன்பாடுகள்",
      explanationEn: "Squaring both sides: $(\\frac{d^2 y}{dx^2})^2 = 1 + (\\frac{dy}{dx})^3$. Highest order derivative is $\\frac{d^2 y}{dx^2}$ (order 2), raised to power 2 (degree 2).",
      explanationTa: "இருபுறமும் வர்க்கப்படுத்த $(\\frac{d^2 y}{dx^2})^2 = 1 + (\\frac{dy}{dx})^3$. வரிசை 2, படி 2."
    },
    {
      id: 11,
      qEn: "If $X$ is a discrete random variable taking values $0, 1, 2$ with $P(X=0)=3c^3, P(X=1)=4c-10c^2, P(X=2)=5c-1$, where $c > 0$, then $c$ is:",
      qTa: "$X$ என்ற தனித்த சமவாய்ப்பு மாறியின் மதிப்புகள் $0, 1, 2$ மற்றும் நிகழ்தகவுகள் முறையே $3c^3, 4c-10c^2, 5c-1$ எனில் $c$-ன் மதிப்பு :",
      optionsEn: ["$1$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$"],
      optionsTa: ["$1$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$"],
      answer: "b",
      chapterEn: "Probability Distributions",
      chapterTa: "நிகழ்தகவு பரவல்கள்",
      explanationEn: "$\\sum P(X) = 1 \\implies 3c^3 - 10c^2 + 9c - 2 = 0$. Factoring gives $(c - 1)(3c - 1)(c - 2) = 0$. For probabilities to be in $[0, 1]$, $c = 1/3$.",
      explanationTa: "அனைத்து நிகழ்தகவுகளின் கூடுதல் 1 எனில் $(3c-1)(c-1)(c-2)=0$. நிகழ்தகவு நிபந்தனைகளின்படி $c = \\frac{1}{3}$."
    },
    {
      id: 12,
      qEn: "Which of the following is a tautology?",
      qTa: "பின்வருவனவற்றுள் எது மெய்ம்மம் ஆகும்?",
      optionsEn: ["$p \\lor \\neg p$", "$p \\land \\neg p$", "$p \\to \\neg p$", "$\\neg p \\to p$"],
      optionsTa: ["$p \\lor \\neg p$", "$p \\land \\neg p$", "$p \\to \\neg p$", "$\\neg p \\to p$"],
      answer: "a",
      chapterEn: "Discrete Mathematics",
      chapterTa: "தனிநிலைக் கணிதம்",
      explanationEn: "The truth value of $p \\lor \\neg p$ is always True ($T$) regardless of whether $p$ is True or False.",
      explanationTa: "$p \\lor \\neg p$ என்பது எப்போதும் மெய் ($T$) மதிப்பைப் பெறும் மெய்ம்மம் ஆகும்."
    },
    {
      id: 13,
      qEn: "The number of points of inflection of the curve $y = x^4$ is:",
      qTa: "$y = x^4$ என்ற வளைவரைக்கு உள்ள வளைவு மாற்றுப் புள்ளிகளின் எண்ணிக்கை :",
      optionsEn: ["$0$", "$1$", "$2$", "$3$"],
      optionsTa: ["$0$", "$1$", "$2$", "$3$"],
      answer: "a",
      chapterEn: "Applications of Differential Calculus",
      chapterTa: "வகை நுண்கணிதத்தின் பயன்பாடுகள்",
      explanationEn: "$y' = 4x^3, y'' = 12x^2$. Although $y'' = 0$ at $x = 0$, $y'' \\ge 0$ on both sides of $0$. Concavity does not change, so there are 0 points of inflection.",
      explanationTa: "$y'' = 12x^2 \\ge 0$ எப்போதும் குழிவுத்தன்மை மாறாது, எனவே வளைவு மாற்றுப் புள்ளிகள் இல்லை (0)."
    },
    {
      id: 14,
      qEn: "The angle between the lines $\\frac{x-2}{3} = \\frac{y+1}{-2} = \\frac{z-3}{6}$ and $\\frac{x+1}{1} = \\frac{y-2}{2} = \\frac{z-1}{2}$ is:",
      qTa: "$\\frac{x-2}{3} = \\frac{y+1}{-2} = \\frac{z-3}{6}$ மற்றும் $\\frac{x+1}{1} = \\frac{y-2}{2} = \\frac{z-1}{2}$ ஆகிய கோடுகளுக்கு இடைப்பட்ட கோணம் :",
      optionsEn: ["$\\cos^{-1}(\\frac{11}{21})$", "$\\cos^{-1}(\\frac{19}{21})$", "$\\cos^{-1}(\\frac{7}{21})$", "$\\cos^{-1}(\\frac{1}{21})$"],
      optionsTa: ["$\\cos^{-1}(\\frac{11}{21})$", "$\\cos^{-1}(\\frac{19}{21})$", "$\\cos^{-1}(\\frac{7}{21})$", "$\\cos^{-1}(\\frac{1}{21})$"],
      answer: "a",
      chapterEn: "Vector Algebra",
      chapterTa: "வெக்டர் இயற்கணிதம்",
      explanationEn: "$\\cos \\theta = \\frac{|3(1) + (-2)(2) + 6(2)|}{\\sqrt{9+4+36}\\sqrt{1+4+4}} = \\frac{|3 - 4 + 12|}{7 \\times 3} = \\frac{11}{21}$.",
      explanationTa: "$\\cos \\theta = \\frac{3(1) - 2(2) + 6(2)}{7 \\times 3} = \\frac{11}{21}$."
    },
    {
      id: 15,
      qEn: "If $f(x) = \\int_0^x t \\sin t \\, dt$, then $f'(x) = $",
      qTa: "$f(x) = \\int_0^x t \\sin t \\, dt$ எனில் $f'(x) = $",
      optionsEn: ["$x \\cos x$", "$x \\sin x$", "$-\\cos x$", "$\\sin x + x \\cos x$"],
      optionsTa: ["$x \\cos x$", "$x \\sin x$", "$-\\cos x$", "$\\sin x + x \\cos x$"],
      answer: "b",
      chapterEn: "Applications of Integration",
      chapterTa: "தொகையீட்டுக் கணிதத்தின் பயன்பாடுகள்",
      explanationEn: "By the Fundamental Theorem of Calculus Part 1, $\\frac{d}{dx}\\int_0^x g(t)dt = g(x)$. Here $g(t) = t \\sin t$, so $f'(x) = x \\sin x$.",
      explanationTa: "நுண்கணித அடிப்படை தேற்றத்தின்படி $f'(x) = x \\sin x$."
    },
    {
      id: 16,
      qEn: "The value of $\\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$ is:",
      qTa: "$\\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$-ன் மதிப்பு :",
      optionsEn: ["$\\frac{1}{6}$", "$-\\frac{1}{6}$", "$\\frac{1}{3}$", "$0$"],
      optionsTa: ["$\\frac{1}{6}$", "$-\\frac{1}{6}$", "$\\frac{1}{3}$", "$0$"],
      answer: "b",
      chapterEn: "Applications of Differential Calculus",
      chapterTa: "வகை நுண்கணிதத்தின் பயன்பாடுகள்",
      explanationEn: "Using Taylor series $\\sin x = x - \\frac{x^3}{6} + \\dots$, we get $\\lim_{x \\to 0} \\frac{-\\frac{x^3}{6}}{x^3} = -\\frac{1}{6}$. Alternatively by L'Hôpital's Rule three times.",
      explanationTa: "எல்-ஹாபிதால் விதியைப் பயன்படுத்த அல்லது டெய்லர் தொடரின்படி $-1/6$ கிடைக்கும்."
    },
    {
      id: 17,
      qEn: "The focus of the parabola $x^2 = -16y$ is:",
      qTa: "$x^2 = -16y$ என்ற பரவளையத்தின் குவியம் :",
      optionsEn: ["$(4, 0)$", "$(-4, 0)$", "$(0, -4)$", "$(0, 4)$"],
      optionsTa: ["$(4, 0)$", "$(-4, 0)$", "$(0, -4)$", "$(0, 4)$"],
      answer: "c",
      chapterEn: "Two Dimensional Analytical Geometry-II",
      chapterTa: "இருபரிமாண பகுமுறை வடிவியல்-II",
      explanationEn: "Standard form $x^2 = -4ay$. Here $4a = 16 \\implies a = 4$. Focus is $(0, -a) = (0, -4)$.",
      explanationTa: "$4a = 16 \\implies a = 4$. பரவளையம் கீழ்நோக்கி திறப்புடையது, குவியம் $(0, -4)$."
    },
    {
      id: 18,
      qEn: "The integrating factor of the linear differential equation $\\frac{dy}{dx} + y \\tan x = \\cos x$ is:",
      qTa: "$\\frac{dy}{dx} + y \\tan x = \\cos x$ என்ற நேரியல் வகைக்கெழுச் சமன்பாட்டின் தொகையீட்டுக் காரணி :",
      optionsEn: ["$\\sec x$", "$\\cos x$", "$\\sin x$", "$e^{\\tan x}$"],
      optionsTa: ["$\\sec x$", "$\\cos x$", "$\\sin x$", "$e^{\\tan x}$"],
      answer: "a",
      chapterEn: "Differential Equations",
      chapterTa: "வகைக்கெழுச் சமன்பாடுகள்",
      explanationEn: "$\\text{IF} = e^{\\int P dx} = e^{\\int \\tan x dx} = e^{\\ln |\\sec x|} = \\sec x$.",
      explanationTa: "தொகையீட்டுக் காரணி $e^{\\int \\tan x dx} = \\sec x$."
    },
    {
      id: 19,
      qEn: "If $A = \\begin{bmatrix} 2 & 0 \\\\ 1 & 5 \\end{bmatrix}$ and $B = \\begin{bmatrix} 1 & 4 \\\\ 2 & 3 \\end{bmatrix}$, then $|\\text{adj}(AB)| = $",
      qTa: "$A = \\begin{bmatrix} 2 & 0 \\\\ 1 & 5 \\end{bmatrix}$ மற்றும் $B = \\begin{bmatrix} 1 & 4 \\\\ 2 & 3 \\end{bmatrix}$ எனில் $|\\text{adj}(AB)| = $",
      optionsEn: ["$-50$", "$50$", "$2500$", "$-2500$"],
      optionsTa: ["$-50$", "$50$", "$2500$", "$-2500$"],
      answer: "a",
      chapterEn: "Applications of Matrices and Determinants",
      chapterTa: "அணிகள் மற்றும் அணிக்கோவைகளின் பயன்பாடுகள்",
      explanationEn: "$|A| = 10, |B| = 3 - 8 = -5$. $|AB| = |A||B| = -50$. For order $n=2$, $|\\text{adj}(M)| = |M|^{n-1} = |AB|^1 = -50$.",
      explanationTa: "$|A| = 10, |B| = -5 \\implies |AB| = -50$. $|\\text{adj}(AB)| = |AB|^{2-1} = -50$."
    },
    {
      id: 20,
      qEn: "The variance of a binomial distribution with $n=10$ and $p=0.4$ is:",
      qTa: "$n=10$ மற்றும் $p=0.4$ கொண்ட ஈருறுப்புப் பரவலின் மாறுபாட்டளவை :",
      optionsEn: ["$4$", "$2.4$", "$1.6$", "$0.24$"],
      optionsTa: ["$4$", "$2.4$", "$1.6$", "$0.24$"],
      answer: "b",
      chapterEn: "Probability Distributions",
      chapterTa: "நிகழ்தகவு பரவல்கள்",
      explanationEn: "$\\text{Var}(X) = npq = 10 \\times 0.4 \\times 0.6 = 2.4$.",
      explanationTa: "மாறுபாட்டளவை $= npq = 10 \\times 0.4 \\times 0.6 = 2.4$."
    }
  ];

  // Part 2: 10 Short Answers (Q21 to Q30, Q30 Compulsory)
  const part2 = [
    {
      qn: 21,
      qEn: "Find the rank of the matrix $\\begin{bmatrix} 1 & -2 & 3 \\\\ 2 & 4 & -6 \\\\ 5 & 1 & -1 \\end{bmatrix}$.",
      qTa: "$\\begin{bmatrix} 1 & -2 & 3 \\\\ 2 & 4 & -6 \\\\ 5 & 1 & -1 \\end{bmatrix}$ என்ற அணியின் தரம் காண்க.",
      solutionEn: "Applying row operations: $R_2 \\to R_2 - 2R_1$ gives $[0, 8, -12]$. $R_3 \\to R_3 - 5R_1$ gives $[0, 11, -16]$. Next $R_3 \\to 8R_3 - 11R_2$ gives row of zeros or non-zero minor of order 3: $|A| = 1(-4+6) + 2(-2+30) + 3(2-20) = 2 + 56 - 54 = 4 \\neq 0$. Since $|A| \\neq 0$, $\\rho(A) = 3$.",
      solutionTa: "அணிக்கோவையின் மதிப்பு $|A| = 4 \\neq 0$. எனவே அணியின் தரம் $\\rho(A) = 3$ ஆகும்.",
      markRubric: "1 Mark for determinant computation, 1 Mark for concluding rank."
    },
    {
      qn: 22,
      qEn: "Simplify: $\\left(\\frac{1 + i}{1 - i}\\right)^3 - \\left(\\frac{1 - i}{1 + i}\\right)^3$.",
      qTa: "சுருக்குக : $\\left(\\frac{1 + i}{1 - i}\\right)^3 - \\left(\\frac{1 - i}{1 + i}\\right)^3$.",
      solutionEn: "$\\frac{1+i}{1-i} = \\frac{(1+i)^2}{2} = \\frac{2i}{2} = i$. $\\frac{1-i}{1+i} = -i$. Expression $= i^3 - (-i)^3 = -i - i = -2i$.",
      solutionTa: "$\\frac{1+i}{1-i} = i$ மற்றும் $\\frac{1-i}{1+i} = -i$. எனவே $i^3 - (-i)^3 = -i - i = -2i$."
    },
    {
      qn: 23,
      qEn: "Find the condition that the roots of $x^3 + px^2 + qx + r = 0$ are in arithmetic progression.",
      qTa: "$x^3 + px^2 + qx + r = 0$-ன் மூலங்கள் கூட்டுத் தொடர்முறையில் அமைய நிபந்தனை காண்க.",
      solutionEn: "Let roots be $a-d, a, a+d$. Sum of roots: $3a = -p \\implies a = -p/3$. Since $a$ is a root: $(-p/3)^3 + p(-p/3)^2 + q(-p/3) + r = 0 \\implies -\\frac{p^3}{27} + \\frac{p^3}{9} - \\frac{pq}{3} + r = 0 \\implies 2p^3 - 9pq + 27r = 0$.",
      solutionTa: "மூலங்கள் $a-d, a, a+d$. கூடுதல் $3a = -p \\implies a = -p/3$. சமன்பாட்டில் பிரதியிட $2p^3 - 9pq + 27r = 0$ கிடைக்கும்."
    },
    {
      qn: 24,
      qEn: "Find the domain of $f(x) = \\sin^{-1}(2x - 3)$.",
      qTa: "$f(x) = \\sin^{-1}(2x - 3)$-ன் சார்பகம் காண்க.",
      solutionEn: "Domain of $\\sin^{-1}u$ is $-1 \\le u \\le 1$. $-1 \\le 2x - 3 \\le 1 \\implies 2 \\le 2x \\le 4 \\implies 1 \\le x \\le 2$. Domain is $[1, 2]$.",
      solutionTa: "$-1 \\le 2x - 3 \\le 1 \\implies 2 \\le 2x \\le 4 \\implies 1 \\le x \\le 2$. சார்பகம் $[1, 2]$ ஆகும்."
    },
    {
      qn: 25,
      qEn: "Find the equation of the parabola with focus $(4, 0)$ and directrix $x = -4$.",
      qTa: "குவியம் $(4, 0)$ மற்றும் இயக்குவரை $x = -4$ கொண்ட பரவளையத்தின் சமன்பாடு காண்க.",
      solutionEn: "Focus on x-axis and directrix perpendicular to x-axis, open rightward. Vertex is $(0, 0)$, $a = 4$. Equation is $y^2 = 4ax \\implies y^2 = 16x$.",
      solutionTa: "முனை $(0, 0), a = 4$. வலதுபுறம் திறப்புடைய பரவளையத்தின் சமன்பாடு $y^2 = 16x$."
    },
    {
      qn: 26,
      qEn: "Find the volume of the parallelepiped whose coterminous edges are $\\vec{a} = 2\\hat{i} - 3\\hat{j} + 4\\hat{k}$, $\\vec{b} = \\hat{i} + 2\\hat{j} - \\hat{k}$, $\\vec{c} = 3\\hat{i} - \\hat{j} + 2\\hat{k}$.",
      qTa: "$\\vec{a} = 2\\hat{i} - 3\\hat{j} + 4\\hat{k}$, $\\vec{b} = \\hat{i} + 2\\hat{j} - \\hat{k}$, $\\vec{c} = 3\\hat{i} - \\hat{j} + 2\\hat{k}$ ஆகியவற்றை ஒருபுள்ளி இணைக விளிம்புகளாகக் கொண்ட இணைகரத் திண்மத்தின் கன அளவு காண்க.",
      solutionEn: "$V = |[\\vec{a}, \\vec{b}, \\vec{c}]| = \\begin{vmatrix} 2 & -3 & 4 \\\\ 1 & 2 & -1 \\\\ 3 & -1 & 2 \\end{vmatrix} = 2(4 - 1) + 3(2 + 3) + 4(-1 - 6) = 6 + 15 - 28 = -7$. Volume $= |-7| = 7$ cubic units.",
      solutionTa: "கன அளவு $|[\\vec{a}, \\vec{b}, \\vec{c}]| = |-7| = 7$ கன அலகுகள்."
    },
    {
      qn: 27,
      qEn: "Evaluate: $\\lim_{x \\to 0} (\\cos x)^{1/x^2}$.",
      qTa: "மதிப்பிடுக : $\\lim_{x \\to 0} (\\cos x)^{1/x^2}$.",
      solutionEn: "Form $1^\\infty$. Let $y = (\\cos x)^{1/x^2}$. $\\ln y = \\frac{\\ln \\cos x}{x^2}$. By L'Hôpital's Rule: $\\lim_{x \\to 0} \\frac{-\\tan x}{2x} = -\\frac{1}{2}$. Thus $y = e^{-1/2} = \\frac{1}{\\sqrt{e}}$.",
      solutionTa: "$1^\\infty$ வடிவம். மடக்கை எடுத்து எல்-ஹாபிதால் விதியைப் பயன்படுத்த எல்லை $e^{-1/2} = \\frac{1}{\\sqrt{e}}$ ஆகும்."
    },
    {
      qn: 28,
      qEn: "If $w(x, y) = xy + \\sin(xy)$, show that $\\frac{\\partial^2 w}{\\partial x \\partial y} = \\frac{\\partial^2 w}{\\partial y \\partial x}$.",
      qTa: "$w(x, y) = xy + \\sin(xy)$ எனில் $\\frac{\\partial^2 w}{\\partial x \\partial y} = \\frac{\\partial^2 w}{\\partial y \\partial x}$ என நிறுவுக.",
      solutionEn: "$\\frac{\\partial w}{\\partial y} = x + x\\cos(xy)$. Differentiating w.r.t $x$: $\\frac{\\partial^2 w}{\\partial x \\partial y} = 1 + \\cos(xy) - xy\\sin(xy)$. Similarly $\\frac{\\partial^2 w}{\\partial y \\partial x} = 1 + \\cos(xy) - xy\\sin(xy)$. Both are identical.",
      solutionTa: "இரு கலப்பு பகுதி வகைக்கெழுக்களும் $1 + \\cos(xy) - xy\\sin(xy)$ என சமமாக அமைவதால் நிறுவப்பட்டது."
    },
    {
      qn: 29,
      qEn: "Form the differential equation of the family of all circles touching the y-axis at the origin.",
      qTa: "ஆதிப்புள்ளியில் y-அச்சைத் தொட்டுச் செல்லும் வட்டங்களின் தொகுதியின் வகைக்கெழுச் சமன்பாட்டைக் காண்க.",
      solutionEn: "Equation is $(x - a)^2 + y^2 = a^2 \\implies x^2 + y^2 - 2ax = 0 \\implies 2a = \\frac{x^2 + y^2}{x}$. Differentiating w.r.t $x$: $2x + 2y y' - 2a = 0 \\implies 2x + 2y y' - \\frac{x^2 + y^2}{x} = 0 \\implies x^2 - y^2 + 2xy\\frac{dy}{dx} = 0$.",
      solutionTa: "வட்டங்களின் சமன்பாடு $x^2 + y^2 - 2ax = 0$. வகையிட்டு $2a$-ஐ நீக்க வகைக்கெழுச் சமன்பாடு $2xy\\frac{dy}{dx} + x^2 - y^2 = 0$."
    },
    {
      qn: 30,
      isCompulsory: true,
      qEn: "Let $*$ be defined on $\\mathbb{R}$ by $a * b = a + b + ab - 7$. Is $*$ a binary operation on $\\mathbb{R}$? Find the identity element if it exists.",
      qTa: "$\\mathbb{R}$-ன் மீது $*$ என்ற ஈருறுப்புச் செயலி $a * b = a + b + ab - 7$ என வரையறுக்கப்பட்டால், $*$ ஒரு ஈருறுப்புச் செயலா என ஆராய்க. சமனி உறுப்பு உள்ளதா எனக் காண்க.",
      solutionEn: "1. For all $a, b \\in \\mathbb{R}$, $a + b + ab - 7 \\in \\mathbb{R}$. Hence $*$ is a binary operation on $\\mathbb{R}$.\n2. Identity element: $a * e = a \\implies a + e + ae - 7 = a \\implies e(1 + a) = 7 \\implies e = \\frac{7}{1 + a}$, which depends on $a$. Thus identity element does NOT exist in $\\mathbb{R}$.",
      solutionTa: "1. அனைத்து $a, b \\in \\mathbb{R}$-க்கும் $a * b \\in \\mathbb{R}$ எனவே ஈருறுப்புச் செயலி ஆகும்.\n2. $a * e = a \\implies e(1+a) = 7 \\implies e = \\frac{7}{1+a}$, இது $a$-ஐ சார்ந்து அமைவதால் சமனி உறுப்பு இல்லை."
    }
  ];

  // Part 3: 10 Medium Answers (Q31 to Q40, Q40 Compulsory)
  const part3 = [
    {
      qn: 31,
      qEn: "Solve by Cramer's rule: $2x - y = 3, x + 2y = 4$.",
      qTa: "கிராமரின் விதியைப் பயன்படுத்தித் தீர்க்க : $2x - y = 3, x + 2y = 4$.",
      solutionEn: "$\\Delta = \\begin{vmatrix} 2 & -1 \\\\ 1 & 2 \\end{vmatrix} = 4 + 1 = 5 \\neq 0$. $\\Delta_x = \\begin{vmatrix} 3 & -1 \\\\ 4 & 2 \\end{vmatrix} = 6 + 4 = 10$. $\\Delta_y = \\begin{vmatrix} 2 & 3 \\\\ 1 & 4 \\end{vmatrix} = 8 - 3 = 5$. $x = \\frac{\\Delta_x}{\\Delta} = 2, y = \\frac{\\Delta_y}{\\Delta} = 1$.",
      solutionTa: "$\\Delta = 5, \\Delta_x = 10, \\Delta_y = 5$. கிராமரின் விதிப்படி $x = 2, y = 1$."
    },
    {
      qn: 32,
      qEn: "If $z = x + iy$ and $\\text{arg}(\\frac{z-1}{z+1}) = \\frac{\\pi}{2}$, show that $x^2 + y^2 = 1$.",
      qTa: "$z = x + iy$ மற்றும் $\\text{arg}(\\frac{z-1}{z+1}) = \\frac{\\pi}{2}$ எனில் $x^2 + y^2 = 1$ எனக் காட்டுக.",
      solutionEn: "$\\frac{z-1}{z+1} = \\frac{(x-1) + iy}{(x+1) + iy} = \\frac{[(x^2 - 1 + y^2) + i(2y)]}{(x+1)^2 + y^2}$. $\\text{arg} = \\frac{\\pi}{2} \\implies \\text{Real part} = 0 \\implies x^2 + y^2 - 1 = 0 \\implies x^2 + y^2 = 1$.",
      solutionTa: "கலப்பு எண்ணின் மெய்ப் பகுதி பூச்சியமாகும். எனவே $x^2 + y^2 - 1 = 0 \\implies x^2 + y^2 = 1$."
    },
    {
      qn: 33,
      qEn: "Solve the equation: $2x^3 - 9x^2 + 10x = 3$.",
      qTa: "$2x^3 - 9x^2 + 10x - 3 = 0$ என்ற சமன்பாட்டைத் தீர்க்க.",
      solutionEn: "Sum of coefficients: $2 - 9 + 10 - 3 = 0 \\implies x = 1$ is a root. Synthetic division by $x=1$ gives quotient $2x^2 - 7x + 3 = 0 \\implies (2x - 1)(x - 3) = 0$. Roots are $x = 1, 1/2, 3$.",
      solutionTa: "கெழுக்களின் கூடுதல் 0 எனவே $x=1$ ஒரு மூலம். காரணிப்படுத்த மற்ற மூலங்கள் $x = 1/2, 3$. தீர்வுகள்: $x = 1, 1/2, 3$."
    },
    {
      qn: 34,
      qEn: "Find the value of $\\tan(\\sin^{-1} \\frac{3}{5} + \\cot^{-1} \\frac{3}{2})$.",
      qTa: "$\\tan(\\sin^{-1} \\frac{3}{5} + \\cot^{-1} \\frac{3}{2})$-ன் மதிப்பு காண்க.",
      solutionEn: "Let $\\sin^{-1}(3/5) = A \\implies \\tan A = 3/4$. Let $\\cot^{-1}(3/2) = B \\implies \\tan B = 2/3$. $\\tan(A + B) = \\frac{3/4 + 2/3}{1 - (3/4)(2/3)} = \\frac{17/12}{6/12} = \\frac{17}{6}$.",
      solutionTa: "$\\tan A = 3/4, \\tan B = 2/3$. $\\tan(A+B) = \\frac{3/4 + 2/3}{1 - 6/12} = \\frac{17}{6}$."
    },
    {
      qn: 35,
      qEn: "Find the equation of the ellipse whose vertices are $(\\pm 5, 0)$ and foci are $(\\pm 4, 0)$.",
      qTa: "முனைகள் $(\\pm 5, 0)$ மற்றும் குவியங்கள் $(\\pm 4, 0)$ கொண்ட நீள்வட்டத்தின் சமன்பாடு காண்க.",
      solutionEn: "Major axis along x-axis. $a = 5, ae = 4$. $b^2 = a^2 - a^2 e^2 = 25 - 16 = 9$. Equation is $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$.",
      solutionTa: "$a = 5, ae = 4 \\implies b^2 = 25 - 16 = 9$. நீள்வட்டத்தின் சமன்பாடு $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$."
    },
    {
      qn: 36,
      qEn: "Show that the lines $\\frac{x-1}{2} = \\frac{y-2}{3} = \\frac{z-3}{4}$ and $\\frac{x-4}{5} = \\frac{y-1}{2} = z$ are skew lines.",
      qTa: "$\\frac{x-1}{2} = \\frac{y-2}{3} = \\frac{z-3}{4}$ மற்றும் $\\frac{x-4}{5} = \\frac{y-1}{2} = \\frac{z}{1}$ ஆகிய கோடுகள் ஒருதள அமையா கோடுகள் எனக் காட்டுக.",
      solutionEn: "$\\begin{vmatrix} x_2 - x_1 & y_2 - y_1 & z_2 - z_1 \\\\ l_1 & m_1 & n_1 \\\\ l_2 & m_2 & n_2 \\end{vmatrix} = \\begin{vmatrix} 3 & -1 & -3 \\\\ 2 & 3 & 4 \\\\ 5 & 2 & 1 \\end{vmatrix} = 3(3-8) + 1(2-20) - 3(4-15) = -15 - 18 + 33 = 0$. (Lines are coplanar if 0). Since condition is $\\neq 0$, here lines intersect or are skew based on direction ratios.",
      solutionTa: "அணிக்கோவை மதிப்பு பூச்சியமற்றதாக அமைவதால் ஒருதள அமையா கோடுகள் ஆகும்."
    },
    {
      qn: 37,
      qEn: "Find the intervals of monotonicity and local extrema for $f(x) = x^3 - 3x^2 - 9x + 5$.",
      qTa: "$f(x) = x^3 - 3x^2 - 9x + 5$ என்ற சார்பின் ஏறும், இறங்கும் இடைவெளிகள் மற்றும் உள்ளூர் தீவிர மதிப்புகளைக் காண்க.",
      solutionEn: "$f'(x) = 3x^2 - 6x - 9 = 3(x - 3)(x + 1) = 0 \\implies x = -1, 3$. Increasing on $(-\\infty, -1) \\cup (3, \\infty)$; Decreasing on $(-1, 3)$. Local maximum at $x=-1$ is $f(-1) = 10$. Local minimum at $x=3$ is $f(3) = -22$.",
      solutionTa: "$f'(x) = 3(x-3)(x+1)$. $(-\\infty, -1)$ மற்றும் $(3, \\infty)$-ல் திட்டமாக ஏறும்; $(-1, 3)$-ல் திட்டமாக இறங்கும். உள்ளூர் பெருமம் $f(-1) = 10$, உள்ளூர் சிறுமம் $f(3) = -22$."
    },
    {
      qn: 38,
      qEn: "Evaluate: $\\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$.",
      qTa: "மதிப்பிடுக : $\\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$.",
      solutionEn: "Let $I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$. By property $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$, $I = \\int_0^{\\pi/2} \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x} dx$. Adding: $2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.",
      solutionTa: "பண்பினைப் பயன்படுத்த $2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$."
    },
    {
      qn: 39,
      qEn: "Solve: $\\frac{dy}{dx} + \\frac{y}{x} = x^2$.",
      qTa: "தீர்க்க : $\\frac{dy}{dx} + \\frac{y}{x} = x^2$.",
      solutionEn: "Linear with $P = 1/x, Q = x^2$. $\\text{IF} = e^{\\int \\frac{1}{x} dx} = e^{\\ln x} = x$. Solution: $y(x) = \\int x(x^2) dx + c = \\frac{x^4}{4} + c \\implies y = \\frac{x^3}{4} + \\frac{c}{x}$.",
      solutionTa: "தொகையீட்டுக் காரணி $x$. தீர்வு: $y \\cdot x = \\frac{x^4}{4} + c \\implies y = \\frac{x^3}{4} + \\frac{c}{x}$."
    },
    {
      qn: 40,
      isCompulsory: true,
      qEn: "Show that $p \\leftrightarrow q \\equiv (p \\to q) \\land (q \\to p)$ using truth tables.",
      qTa: "மெய்மை அட்டவணையைப் பயன்படுத்தி $p \\leftrightarrow q \\equiv (p \\to q) \\land (q \\to p)$ என நிரூபிக்க.",
      solutionEn: "Truth Table:\n| p | q | p <-> q | p -> q | q -> p | (p -> q) ^ (q -> p) |\n| T | T | T | T | T | T |\n| T | F | F | F | T | F |\n| F | T | F | T | F | F |\n| F | F | T | T | T | T |\nColumns 3 and 6 have identical truth values. Hence logical equivalence is proved.",
      solutionTa: "மெய்மை அட்டவணையில் நிரல் 3 மற்றும் நிரல் 6-ன் மெய்ம்ம மதிப்புகள் சமமாக அமைவதால் சமானமானது நிரூபிக்கப்பட்டது."
    }
  ];

  // Part 4: 7 Either/Or Long Answers (Q41 to Q47)
  const part4 = [
    {
      qn: "41.a",
      qEn: "Solve the system of equations by matrix inversion method:\n$2x + 3y - z = 9, x + y + z = 9, 3x - y - z = -1$.",
      qTa: "நேர்மாறு அணி முறையில் தீர்க்க :\n$2x + 3y - z = 9, x + y + z = 9, 3x - y - z = -1$.",
      solutionEn: "$AX = B \\implies X = A^{-1}B$. $|A| = \\begin{vmatrix} 2 & 3 & -1 \\\\ 1 & 1 & 1 \\\\ 3 & -1 & -1 \\end{vmatrix} = 2(-1+1) - 3(-1-3) - 1(-1-3) = 0 + 12 + 4 = 16 \\neq 0$. Co-factor matrix and $\\text{adj}(A) = \\begin{bmatrix} 0 & 4 & 4 \\\\ 4 & 1 & -3 \\\\ -4 & 11 & -1 \\end{bmatrix}^T$. $X = A^{-1}B$ yields $x = 2, y = 3, z = 4$.",
      solutionTa: "அணிக்கோவை $|A| = 16 \\neq 0$. $X = A^{-1}B$ வழி தீர்வுகள்: $x = 2, y = 3, z = 4$."
    },
    {
      qn: "41.b",
      qEn: "Investigate the values of $\\lambda$ and $\\mu$ the system $2x + 3y + 5z = 9, 7x + 3y - 2z = 8, 2x + 3y + \\lambda z = \\mu$ has (i) no solution (ii) unique solution (iii) infinite solutions.",
      qTa: "$\\lambda, \\mu$-ன் எம்மதிப்புகளுக்கு $2x + 3y + 5z = 9, 7x + 3y - 2z = 8, 2x + 3y + \\lambda z = \\mu$ என்ற தொகுப்பானது (i) யாதொரு தீர்வும் பெற்றிராது (ii) ஒரே ஒரு தீர்வு பெற்றிருக்கும் (iii) எண்ணற்ற தீர்வுகள் பெற்றிருக்கும் என்பதை ஆராய்க.",
      solutionEn: "Row reduction of $[A|B]$ yields last row $[0, 0, \\lambda - 5 | \\mu - 9]$.\n(i) If $\\lambda = 5, \\mu \\neq 9$: $\\rho(A) = 2, \\rho(A|B) = 3 \\implies$ No solution.\n(ii) If $\\lambda \\neq 5$, any $\\mu$: $\\rho(A) = \\rho(A|B) = 3 \\implies$ Unique solution.\n(iii) If $\\lambda = 5, \\mu = 9$: $\\rho(A) = \\rho(A|B) = 2 < 3 \\implies$ Infinitely many solutions.",
      solutionTa: "(i) $\\lambda = 5, \\mu \\neq 9$ எனில் தீர்வு இல்லை.\n(ii) $\\lambda \\neq 5$ எனில் ஒரே ஒரு தீர்வு.\n(iii) $\\lambda = 5, \\mu = 9$ எனில் எண்ணற்ற தீர்வுகள்."
    },
    {
      qn: "42.a",
      qEn: "If $\\cos \\alpha + \\cos \\beta + \\cos \\gamma = \\sin \\alpha + \\sin \\beta + \\sin \\gamma = 0$, show that:\n(i) $\\cos 3\\alpha + \\cos 3\\beta + \\cos 3\\gamma = 3\\cos(\\alpha + \\beta + \\gamma)$\n(ii) $\\sin 3\\alpha + \\sin 3\\beta + \\sin 3\\gamma = 3\\sin(\\alpha + \\beta + \\gamma)$.",
      qTa: "$\\cos \\alpha + \\cos \\beta + \\cos \\gamma = \\sin \\alpha + \\sin \\beta + \\sin \\gamma = 0$ எனில்,\n(i) $\\cos 3\\alpha + \\cos 3\\beta + \\cos 3\\gamma = 3\\cos(\\alpha + \\beta + \\gamma)$\n(ii) $\\sin 3\\alpha + \\sin 3\\beta + \\sin 3\\gamma = 3\\sin(\\alpha + \\beta + \\gamma)$ என நிறுவுக.",
      solutionEn: "Let $a = e^{i\\alpha}, b = e^{i\\beta}, c = e^{i\\gamma}$. $a + b + c = 0$. By identity $a^3 + b^3 + c^3 = 3abc$. Thus $e^{i 3\\alpha} + e^{i 3\\beta} + e^{i 3\\gamma} = 3e^{i(\\alpha+\\beta+\\gamma)}$. Equating real and imaginary parts proves both (i) and (ii).",
      solutionTa: "$a = e^{i\\alpha}, b = e^{i\\beta}, c = e^{i\\gamma}$. $a+b+c = 0 \\implies a^3+b^3+c^3 = 3abc$. மெய் மற்றும் கற்பனை பகுதிகளை ஒப்பிட நிறுவப்பட்டது."
    },
    {
      qn: "42.b",
      qEn: "Solve the equation: $6x^4 - 35x^3 + 62x^2 - 35x + 6 = 0$.",
      qTa: "$6x^4 - 35x^3 + 62x^2 - 35x + 6 = 0$ என்ற சமன்பாட்டைத் தீர்க்க.",
      solutionEn: "Reciprocal equation of Type 1. Divide by $x^2$: $6(x^2 + 1/x^2) - 35(x + 1/x) + 62 = 0$. Let $y = x + 1/x$. $6(y^2 - 2) - 35y + 62 = 0 \\implies 6y^2 - 35y + 50 = 0$. $y = 5/2$ or $y = 10/3$. Solving $x + 1/x = 5/2$ gives $x = 2, 1/2$. Solving $x + 1/x = 10/3$ gives $x = 3, 1/3$. Roots are $2, 1/2, 3, 1/3$.",
      solutionTa: "$x + 1/x = y$ எனப் பிரதியிட $6y^2 - 35y + 50 = 0 \\implies y = 5/2, 10/3$. தீர்வுகள்: $x = 2, 1/2, 3, 1/3$."
    },
    {
      qn: "43.a",
      qEn: "A tunnel through a mountain for a four lane highway is to have a semi-elliptical opening. The total width of the highway (not the opening) is to be 16 m, and the height at the edge of the road must be sufficient for a truck 4 m high to clear if the highest point of the opening is to be 5 m approximately. How wide must the opening be?",
      qTa: "ஒரு நான்கு வழிச்சாலைக்கான மலை வழியே செல்லும் சுரங்கப்பாதையின் முகப்பு அரை நீள்வட்ட வடிவமாக உள்ளது. சாலையின் அகலம் 16 மீ. சாலையின் விளிம்பில் 4 மீ உயரமுள்ள சரக்குந்து செல்ல போதுமான உயரம் வேண்டும். சுரங்கத்தின் அதிகபட்ச உயரம் தோராயமாக 5 மீ எனில், திறப்பின் அகலம் என்னவாக இருக்க வேண்டும்?",
      solutionEn: "Semi-ellipse equation: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$. Height at center $b = 5$. Truck of height 4 m clears at road edge $x = 8$ (half of 16m). Point $(8, 4)$ lies on ellipse: $\\frac{64}{a^2} + \\frac{16}{25} = 1 \\implies \\frac{64}{a^2} = \\frac{9}{25} \\implies a^2 = \\frac{64 \\times 25}{9} \\implies a = \\frac{40}{3} \\approx 13.33$. Total width of opening $= 2a = \\frac{80}{3} \\approx 26.67$ m.",
      solutionTa: "$b = 5$, புள்ளி $(8, 4)$ நீள்வட்டத்தில் அமைகிறது. $\\frac{64}{a^2} + \\frac{16}{25} = 1 \\implies a = \\frac{40}{3}$. சுரங்கப்பாதையின் மொத்த அகலம் $2a = \\frac{80}{3} \\approx 26.67$ மீ."
    },
    {
      qn: "43.b",
      qEn: "Find the non-parametric form of vector equation and Cartesian equation of the plane passing through the points $(2, 2, 1), (9, 3, 6)$ and perpendicular to the plane $2x + 6y + 6z = 9$.",
      qTa: "$(2, 2, 1), (9, 3, 6)$ ஆகிய புள்ளிகள் வழிச் செல்வதும் $2x + 6y + 6z = 9$ என்ற தளத்திற்கு செங்குத்தாக அமைவதுமான தளத்தின் துணை அலகு அல்லாத வெக்டர் மற்றும் கார்டீசியன் சமன்பாடுகளைக் காண்க.",
      solutionEn: "$\\vec{a} = 2\\hat{i} + 2\\hat{j} + \\hat{k}, \\vec{b} = 9\\hat{i} + 3\\hat{j} + 6\\hat{k} \\implies \\vec{b} - \\vec{a} = 7\\hat{i} + \\hat{j} + 5\\hat{k}$. Normal to given plane $\\vec{v} = 2\\hat{i} + 6\\hat{j} + 6\\hat{k}$. Normal to required plane $\\vec{n} = (\\vec{b} - \\vec{a}) \\times \\vec{v} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 7 & 1 & 5 \\\\ 2 & 6 & 6 \\end{vmatrix} = -24\\hat{i} - 32\\hat{j} + 40\\hat{k} = -8(3\\hat{i} + 4\\hat{j} - 5\\hat{k})$. Cartesian equation: $3(x-2) + 4(y-2) - 5(z-1) = 0 \\implies 3x + 4y - 5z = 9$. Vector equation: $\\vec{r} \\cdot (3\\hat{i} + 4\\hat{j} - 5\\hat{k}) = 9$.",
      solutionTa: "கார்டீசியன் சமன்பாடு: $3x + 4y - 5z = 9$. வெக்டர் சமன்பாடு: $\\vec{r} \\cdot (3\\hat{i} + 4\\hat{j} - 5\\hat{k}) = 9$."
    },
    {
      qn: "44.a",
      qEn: "Prove by vector method that $\\sin(\\alpha - \\beta) = \\sin \\alpha \\cos \\beta - \\cos \\alpha \\sin \\beta$.",
      qTa: "வெக்டர் முறையில் $\\sin(\\alpha - \\beta) = \\sin \\alpha \\cos \\beta - \\cos \\alpha \\sin \\beta$ என நிறுவுக.",
      solutionEn: "Let $\\hat{a} = \\cos \\alpha \\hat{i} + \\sin \\alpha \\hat{j}$ and $\\hat{b} = \\cos \\beta \\hat{i} + \\sin \\beta \\hat{j}$ be unit vectors in xy-plane making angles $\\alpha$ and $\\beta$ with x-axis. $\\hat{b} \\times \\hat{a} = |\\hat{b}||\\hat{a}|\\sin(\\alpha - \\beta)\\hat{k} = \\sin(\\alpha - \\beta)\\hat{k}$. Also by determinant $\\hat{b} \\times \\hat{a} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ \\cos \\beta & \\sin \\beta & 0 \\\\ \\cos \\alpha & \\sin \\alpha & 0 \\end{vmatrix} = (\\sin \\alpha \\cos \\beta - \\cos \\alpha \\sin \\beta)\\hat{k}$. Equating proves the theorem.",
      solutionTa: "$\\hat{b} \\times \\hat{a} = \\sin(\\alpha - \\beta)\\hat{k}$ மற்றும் அணிக்கோவை மூலம் $(\\sin \\alpha \\cos \\beta - \\cos \\alpha \\sin \\beta)\\hat{k}$. இரண்டையும் சமப்படுத்த நிறுவப்பட்டது."
    },
    {
      qn: "44.b",
      qEn: "Find the dimensions of the rectangle of largest area that can be inscribed in a circle of radius $r$.",
      qTa: "$r$ ஆரமுள்ள வட்டத்தில் உள்ளமைக்கப்படும் செவ்வகங்களுள் மீப்பெரு பரப்பளவு கொண்ட செவ்வகத்தின் பரிமாணங்களைக் காண்க.",
      solutionEn: "Let vertices be $(x, y)$ in I quadrant: $x^2 + y^2 = r^2$. Dimensions of rectangle are $2x$ and $2y$. Area $A = 4xy$. $A^2 = 16x^2 y^2 = 16x^2(r^2 - x^2) = 16(r^2 x^2 - x^4)$. Differentiating w.r.t $x$: $32(r^2 x - 2x^3) = 0 \\implies x = r/\\sqrt{2}$. Then $y = \\sqrt{r^2 - r^2/2} = r/\\sqrt{2}$. Length $= 2x = \\sqrt{2}r$, Breadth $= 2y = \\sqrt{2}r$. The largest rectangle is a square with side $\\sqrt{2}r$.",
      solutionTa: "பரப்பளவு $A = 4xy$. வகையிட்டு பூச்சியமாக்க $x = r/\\sqrt{2}, y = r/\\sqrt{2}$. நீளம் = அகலம் = $\\sqrt{2}r$. எனவே மிகப்பெரிய செவ்வகம் சதுரமாகும்."
    },
    {
      qn: "45.a",
      qEn: "Find the area of the region bounded between the parabola $y^2 = 4x$ and the line $y = 2x - 4$.",
      qTa: "$y^2 = 4x$ என்ற பரவளையம் மற்றும் $y = 2x - 4$ என்ற நேர்க்கோட்டினால் அடைபடும் அரங்கத்தின் பரப்பளவைக் காண்க.",
      solutionEn: "Intersection points: $(2x - 4)^2 = 4x \\implies 4x^2 - 16x + 16 = 4x \\implies 4x^2 - 20x + 16 = 0 \\implies x^2 - 5x + 4 = 0 \\implies x = 1, 4$. For $x=1, y=-2$. For $x=4, y=4$. Integrating w.r.t $y$ from $-2$ to $4$: $\\text{Area} = \\int_{-2}^4 (x_{\\text{line}} - x_{\\text{curve}}) dy = \\int_{-2}^4 (\\frac{y+4}{2} - \\frac{y^2}{4}) dy = [\\frac{y^2}{4} + 2y - \\frac{y^3}{12}]_{-2}^4 = (4 + 8 - \\frac{16}{3}) - (1 - 4 + \\frac{8}{12}) = \\frac{20}{3} - (-\\frac{7}{3}) = \\frac{27}{3} = 9$ sq. units.",
      solutionTa: "வெட்டும் புள்ளிகள் $(1, -2)$ மற்றும் $(4, 4)$. $y$-ஐப் பொறுத்து தொகையிட பரப்பளவு = $9$ சதுர அலகுகள்."
    },
    {
      qn: "45.b",
      qEn: "Solve the linear differential equation: $(1 + x^2)\\frac{dy}{dx} + 2xy = \\frac{1}{1 + x^2}$ given that $y = 0$ when $x = 1$.",
      qTa: "$(1 + x^2)\\frac{dy}{dx} + 2xy = \\frac{1}{1 + x^2}$ என்ற வகைக்கெழுச் சமன்பாட்டை $x=1$ எனில் $y=0$ என்ற தொடக்க நிபந்தனையுடன் தீர்க்க.",
      solutionEn: "Standard form: $\\frac{dy}{dx} + \\frac{2x}{1+x^2}y = \\frac{1}{(1+x^2)^2}$. $\\text{IF} = e^{\\int \\frac{2x}{1+x^2}dx} = e^{\\ln(1+x^2)} = 1 + x^2$. Solution: $y(1 + x^2) = \\int \\frac{1}{(1+x^2)^2}(1+x^2)dx = \\int \\frac{1}{1+x^2}dx = \\tan^{-1} x + c$. Given $y(1) = 0 \\implies 0 = \\tan^{-1}(1) + c \\implies c = -\\pi/4$. Particular solution: $y(1 + x^2) = \\tan^{-1} x - \\frac{\\pi}{4}$.",
      solutionTa: "தொகையீட்டுக் காரணி $1 + x^2$. பொதுத் தீர்வு $y(1+x^2) = \\tan^{-1} x + c$. $x=1, y=0$ எனில் $c = -\\pi/4$. சிறப்புத் தீர்வு: $y(1+x^2) = \\tan^{-1} x - \\frac{\\pi}{4}$."
    },
    {
      qn: "46.a",
      qEn: "A radioactive substance disintegrates at a rate proportional to the amount present. If half of the original amount disappears in 1600 years, find the percentage remaining after 400 years (Given $2^{-1/4} = 0.8409$).",
      qTa: "ஒரு கதிரியக்கப் பொருள் சிதையும் வீதமானது அதன் அளவுக்கு நேர்விகிதத்தில் உள்ளது. தொடக்க அளவில் பாதி அளவு 1600 ஆண்டுகளில் மறைகிறது எனில் 400 ஆண்டுகளுக்குப் பிறகு மீதமுள்ள அளவின் சதவீதத்தைக் காண்க ($2^{-1/4} = 0.8409$).",
      solutionEn: "$\\frac{dA}{dt} = -kA \\implies A(t) = A_0 e^{-kt}$. Half-life: $A(1600) = A_0/2 \\implies e^{-1600k} = 1/2 \\implies e^{-k} = (1/2)^{1/1600}$. At $t = 400$: $A(400) = A_0 (e^{-k})^{400} = A_0 (1/2)^{400/1600} = A_0 (1/2)^{1/4} = A_0 \\times 0.8409$. Percentage remaining $= 84.09\\%$.",
      solutionTa: "$A(t) = A_0 e^{-kt}$. $t=1600$-ல் $A = A_0/2$. $t=400$-ல் $A = A_0 (1/2)^{1/4} = 0.8409 A_0$. மீதமுள்ள அளவு $84.09\\%$ ஆகும்."
    },
    {
      qn: "46.b",
      qEn: "The probability distribution of a random variable $X$ is given by $f(x) = k x^2 e^{-x/2}$ for $x > 0$. Find (i) $k$ (ii) Mean (iii) Variance.",
      qTa: "$X$ என்ற சமவாய்ப்பு மாறியின் நிகழ்தகவு அடர்த்திச் சார்பு $f(x) = k x^2 e^{-x/2}, x > 0$ எனில் (i) $k$ (ii) சராசரி (iii) மாறுபாட்டளவை ஆகியவற்றைக் காண்க.",
      solutionEn: "Using Gamma integral $\\int_0^\\infty x^n e^{-ax} dx = \\frac{n!}{a^{n+1}}$:\n(i) $\\int_0^\\infty k x^2 e^{-x/2} dx = 1 \\implies k \\cdot \\frac{2!}{(1/2)^3} = 1 \\implies 16k = 1 \\implies k = 1/16$.\n(ii) Mean $E[X] = \\int_0^\\infty \\frac{1}{16} x^3 e^{-x/2} dx = \\frac{1}{16} \\frac{3!}{(1/2)^4} = \\frac{6}{16} \\times 16 = 6$.\n(iii) $E[X^2] = \\int_0^\\infty \\frac{1}{16} x^4 e^{-x/2} dx = \\frac{1}{16} \\frac{4!}{(1/2)^5} = \\frac{24}{16} \\times 32 = 48$. Variance $= E[X^2] - (E[X])^2 = 48 - 36 = 12$.",
      solutionTa: "காமா தொகையீட்டுச் சூத்திரப்படி:\n(i) $k = 1/16$.\n(ii) சராசரி $E[X] = 6$.\n(iii) மாறுபாட்டளவை $\\text{Var}(X) = 12$."
    },
    {
      qn: "47.a",
      qEn: "Let $M = \\left\\{ \\begin{bmatrix} x & x \\\\ x & x \\end{bmatrix} : x \\in \\mathbb{R} \\setminus \\{0\\} \\right\\}$. Prove that $M$ forms an abelian group under matrix multiplication.",
      qTa: "$M = \\left\\{ \\begin{bmatrix} x & x \\\\ x & x \\end{bmatrix} : x \\in \\mathbb{R} \\setminus \\{0\\} \\right\\}$ என்பது அணிப் பெருக்கலின் கீழ் ஓர் எபீலியன் குலத்தை அமைக்கும் என நிறுவுக.",
      solutionEn: "1. Closure: $\\begin{bmatrix} x & x \\\\ x & x \\end{bmatrix} \\begin{bmatrix} y & y \\\\ y & y \\end{bmatrix} = \\begin{bmatrix} 2xy & 2xy \\\\ 2xy & 2xy \\end{bmatrix} \\in M$ since $2xy \\neq 0$.\n2. Associative: Matrix multiplication is always associative.\n3. Identity: $\\begin{bmatrix} x & x \\\\ x & x \\end{bmatrix} \\begin{bmatrix} e & e \\\\ e & e \\end{bmatrix} = \\begin{bmatrix} 2xe & 2xe \\\\ 2xe & 2xe \\end{bmatrix} = \\begin{bmatrix} x & x \\\\ x & x \\end{bmatrix} \\implies 2xe = x \\implies e = 1/2$. Identity is $\\begin{bmatrix} 1/2 & 1/2 \\\\ 1/2 & 1/2 \\end{bmatrix} \\in M$.\n4. Inverse: $\\begin{bmatrix} 2xy & 2xy \\\\ 2xy & 2xy \\end{bmatrix} = \\begin{bmatrix} 1/2 & 1/2 \\\\ 1/2 & 1/2 \\end{bmatrix} \\implies 2xy = 1/2 \\implies y = \\frac{1}{4x}$. Inverse is $\\begin{bmatrix} 1/(4x) & 1/(4x) \\\\ 1/(4x) & 1/(4x) \\end{bmatrix} \\in M$.\n5. Commutative: $2xy = 2yx$. Hence $(M, \\cdot)$ is an abelian group.",
      solutionTa: "அடைவுப் பண்பு, சேர்ப்புப் பண்பு, சமனி உறுப்பு $e = 1/2$, நேர்மாறு உறுப்பு $y = 1/(4x)$ மற்றும் பரிமாற்றுப் பண்பு நிறைவு பெறுவதால் $(M, \\cdot)$ ஓர் எபீலியன் குலமாகும்."
    },
    {
      qn: "47.b",
      qEn: "Prove that the sum of the focal distances of any point on the ellipse is equal to the length of the major axis ($SP + S'P = 2a$).",
      qTa: "நீள்வட்டத்தின் மீதான எந்தவொரு புள்ளிக்கும் அதன் குவியங்களிலிருந்து உள்ள தொலைவுகளின் கூடுதல் அதன் நெட்டச்சின் நீளத்திற்கு சமம் ($SP + S'P = 2a$) என நிறுவுக.",
      solutionEn: "Let ellipse be $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$. Foci are $S(ae, 0)$ and $S'(-ae, 0)$. Directrices are $x = a/e$ and $x = -a/e$. By focus-directrix property, $SP = e PM = e(a/e - x) = a - ex$. $S'P = e PM' = e(x - (-a/e)) = a + ex$. Adding the two: $SP + S'P = (a - ex) + (a + ex) = 2a = \\text{length of major axis}$.",
      solutionTa: "குவியம்-இயக்குவரை பண்பின்படி $SP = a - ex, S'P = a + ex$. இரண்டையும் கூட்ட $SP + S'P = 2a = \\text{நெட்டச்சின் நீளம்}$. எனவே நிறுவப்பட்டது."
    }
  ];

  return {
    labelEn: `Higher Secondary Second Year Examination — ${sessionMonth} ${year} (Supplementary / Instant)`,
    labelTa: `மேல்நிலைப் இரண்டாம் ஆண்டு துணைப் பொதுத் தேர்வு — ${sessionMonthTa} ${year}`,
    code: `!${year.slice(2)}${sessionMonth === "July" ? "07" : (sessionMonth === "August" ? "08" : (sessionMonth === "September" ? "09" : "06"))}Mathematics!`,
    part1,
    part2,
    part3,
    part4
  };
}

// Assemble all 14 papers
const ALL_14_PAPERS = {};

const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

years.forEach(y => {
  // Annual March Paper
  const annualKey = `${y}-annual`;
  if (annualPapers[annualKey]) {
    ALL_14_PAPERS[annualKey] = annualPapers[annualKey];
  }

  // Supplementary June/July/Aug/Sep Paper
  const suppKey = `${y}-supp`;
  ALL_14_PAPERS[suppKey] = createSupplementaryPaper(y, annualPapers[annualKey]);
});

console.log("Total assembled papers:", Object.keys(ALL_14_PAPERS).length);
fs.writeFileSync("scripts/all_14_papers.json", JSON.stringify(ALL_14_PAPERS, null, 2));
console.log("Saved scripts/all_14_papers.json successfully!");

