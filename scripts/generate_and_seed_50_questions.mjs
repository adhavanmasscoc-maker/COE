import { createClient } from "@libsql/client/web";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const env = fs.readFileSync(".env", "utf-8");
const dbUrl = env.match(/TURSO_DATABASE_URL=['"]?(.*?)['"]?$/m)[1].trim();
const token = env.match(/TURSO_AUTH_TOKEN=['"]?(.*?)['"]?$/m)[1].trim();
const client = createClient({ url: dbUrl, authToken: token });

function cuid() {
  return "cmw" + crypto.randomBytes(10).toString("hex").slice(0, 21);
}

// -------------------------------------------------------------
// NEW 25 QUESTIONS (Q26 - Q50) FOR EACH OF THE 6 SUBJECTS
// -------------------------------------------------------------

export const NEW_QUESTIONS_MAP = {
  "MAT-10": [
    {
      id: 26,
      chapter: "Relations and Functions",
      chapterTa: "உறவுகளும் சார்புகளும்",
      question: "If a set A contains m elements and set B contains n elements, the total number of non-empty relations from A to B is:",
      questionTa: "கணம் A-ல் m உறுப்புகளும், கணம் B-ல் n உறுப்புகளும் இருப்பின், A-லிருந்து B-க்கு வரையறுக்கப்படும் வெற்றற்ற உறவுகளின் மொத்த எண்ணிக்கை:",
      options: ["2^(mn)", "2^(mn) - 1", "m^n", "n^m"],
      optionsTa: ["2^(mn)", "2^(mn) - 1", "m^n", "n^m"],
      answer: "2^(mn) - 1",
      explanation: "Total relations = 2^(mn). Excluding the empty relation gives 2^(mn) - 1. / மொத்த உறவுகள் 2^(mn). வெற்றற்ற உறவுகள் = 2^(mn) - 1."
    },
    {
      id: 27,
      chapter: "Relations and Functions",
      chapterTa: "உறவுகளும் சார்புகளும்",
      question: "The range of the constant function f(x) = k for all real x is:",
      questionTa: "அனைத்து மெய் எண்களுக்கும் மாறிலிச் சார்பு f(x) = k இன் வீச்சகம்:",
      options: ["R", "{k}", "{0}", "empty set"],
      optionsTa: ["R", "{k}", "{0}", "வெற்றுக்கணம்"],
      answer: "{k}",
      explanation: "Constant function maps all domain elements to a single value k. Range is {k}. / மாறிலிச் சார்பின் வெளியீடு எப்போதும் k மட்டுமே, ஆகவே வீச்சகம் {k}."
    },
    {
      id: 28,
      chapter: "Relations and Functions",
      chapterTa: "உறவுகளும் சார்புகளும்",
      question: "Which test is used to determine whether a curve drawn in a graph represents a one-to-one function?",
      questionTa: "ஒரு வரைபடத்தில் உள்ள வளைவரை ஒன்றுக்கு-ஒன்றான சார்பைக் குறிக்கிறதா என்பதை அறியப் பயன்படும் சோதனை:",
      options: ["Vertical line test", "Horizontal line test", "Diagonal line test", "Slant line test"],
      optionsTa: ["குத்துக்கோடு சோதனை", "கிடைமட்டக்கோடு சோதனை", "மூலைவிட்டக்கோடு சோதனை", "சாய்வுக்கோடு சோதனை"],
      answer: "Horizontal line test",
      explanation: "A horizontal line intersecting the graph at most once proves a function is one-to-one. / கிடைமட்டக்கோடு வளைவரையை அதிகபட்சமாக ஒரு புள்ளியில் மட்டுமே வெட்டினால் அது ஒன்றுக்கு-ஒன்றான சார்பாகும்."
    },
    {
      id: 29,
      chapter: "Relations and Functions",
      chapterTa: "உறவுகளும் சார்புகளும்",
      question: "If f(x) = x + 1, g(x) = 2x, and h(x) = x^2, then the composite function (f o (g o h))(1) is:",
      questionTa: "f(x) = x + 1, g(x) = 2x மற்றும் h(x) = x^2 எனில், (f o (g o h))(1) இன் மதிப்பு:",
      options: ["2", "3", "4", "5"],
      optionsTa: ["2", "3", "4", "5"],
      answer: "3",
      explanation: "h(1) = 1; g(h(1)) = g(1) = 2; f(2) = 2 + 1 = 3. / h(1) = 1 => g(1) = 2 => f(2) = 3."
    },
    {
      id: 30,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "The nth term of an Arithmetic Progression is given by t_n = 3n + 5. The common difference d of the A.P. is:",
      questionTa: "ஒரு கூட்டுத் தொடர்வரிசையின் n-வது உறுப்பு t_n = 3n + 5 எனில், அதன் பொது வித்தியாசம் d:",
      options: ["3", "5", "8", "2"],
      optionsTa: ["3", "5", "8", "2"],
      answer: "3",
      explanation: "t1 = 8, t2 = 11. Common difference d = 11 - 8 = 3 (coefficient of n). / n-ன் கெழுவே பொது வித்தியாசம் d = 3 ஆகும்."
    },
    {
      id: 31,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "The sum of the first n odd natural numbers 1 + 3 + 5 + ... + (2n - 1) is equal to:",
      questionTa: "முதல் n ஒற்றை இயல் எண்களின் கூடுதல் 1 + 3 + 5 + ... + (2n - 1) இன் மதிப்பு:",
      options: ["n(n + 1)/2", "n^2", "2n^2", "n(n - 1)"],
      optionsTa: ["n(n + 1)/2", "n^2", "2n^2", "n(n - 1)"],
      answer: "n^2",
      explanation: "Sum of first n odd natural numbers is n^2. / முதல் n ஒற்றை இயல் எண்களின் கூடுதல் n^2 ஆகும்."
    },
    {
      id: 32,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "If the 5th term of a Geometric Progression is 81 and the first term is 1, then the common ratio r is:",
      questionTa: "ஒரு பெருக்குத் தொடர்வரிசையின் 5-வது உறுப்பு 81 மற்றும் முதல் உறுப்பு 1 எனில், பொது விகிதம் r:",
      options: ["3", "9", "27", "81"],
      optionsTa: ["3", "9", "27", "81"],
      answer: "3",
      explanation: "t5 = a*r^4 => 81 = 1 * r^4 => r = 81^(1/4) = 3. / r^4 = 81 => r = 3."
    },
    {
      id: 33,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "The Geometric Mean between 4 and 16 is:",
      questionTa: "4 மற்றும் 16 ஆகியவற்றின் பெருக்குச் சராசரி (Geometric Mean):",
      options: ["8", "10", "12", "6"],
      optionsTa: ["8", "10", "12", "6"],
      answer: "8",
      explanation: "GM = sqrt(a * b) = sqrt(4 * 16) = sqrt(64) = 8. / GM = sqrt(4 x 16) = 8."
    },
    {
      id: 34,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "What is the rational form of the recurring decimal 0.242424...?",
      questionTa: "0.242424... என்ற சுழல் தசம எண்ணின் விகிதமுறு வடிவம்:",
      options: ["24/99", "24/100", "8/33", "Both A and C"],
      optionsTa: ["24/99", "24/100", "8/33", "A மற்றும் C இரண்டும்"],
      answer: "Both A and C",
      explanation: "x = 24/99 = 8/33. Both forms are valid. / 24/99 ஐ எளிய வடிவிற்கு சுருக்க 8/33 கிடைக்கும் (A மற்றும் C இரண்டும் சரி)."
    },
    {
      id: 35,
      chapter: "Numbers and Sequences",
      chapterTa: "எண்களும் தொடர்வரிசைகளும்",
      question: "If 3 + k, 18 - k, 5k + 1 are in A.P., then the value of k is:",
      questionTa: "3 + k, 18 - k, 5k + 1 என்பன ஒரு கூட்டுத் தொடர்வரிசையில் இருப்பின் k-ன் மதிப்பு:",
      options: ["4", "3", "2", "5"],
      optionsTa: ["4", "3", "2", "5"],
      answer: "4",
      explanation: "2(18 - k) = (3 + k) + (5k + 1) => 36 - 2k = 6k + 4 => 8k = 32 => k = 4. / 2b = a + c சமன்பாட்டின்படி 8k = 32 => k = 4."
    },
    {
      id: 36,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "By Remainder Theorem, when polynomial p(x) is divided by (2x - 1), the remainder is:",
      questionTa: "மீதித் தேற்றத்தின்படி p(x) என்ற பல்லுறுப்புக் கோவையை (2x - 1) ஆல் வகுக்கும் போது கிடைக்கும் மீதி:",
      options: ["p(1)", "p(-1)", "p(1/2)", "p(-1/2)"],
      optionsTa: ["p(1)", "p(-1)", "p(1/2)", "p(-1/2)"],
      answer: "p(1/2)",
      explanation: "Set 2x - 1 = 0 => x = 1/2. Remainder is p(1/2). / 2x - 1 = 0 எனில் x = 1/2. மீதி p(1/2) ஆகும்."
    },
    {
      id: 37,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If (x - 2) is a factor of x^3 - 3x^2 + ax - 4, then the value of a is:",
      questionTa: "(x - 2) என்பது x^3 - 3x^2 + ax - 4 இன் ஒரு காரணி எனில், a-ன் மதிப்பு:",
      options: ["2", "4", "6", "8"],
      optionsTa: ["2", "4", "6", "8"],
      answer: "4",
      explanation: "p(2) = 2^3 - 3(4) + 2a - 4 = 0 => 8 - 12 + 2a - 4 = 0 => 2a = 8 => a = 4. / p(2) = 0 என பிரதியிட 2a = 8 => a = 4."
    },
    {
      id: 38,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "For what value of k will the quadratic equation x^2 - 2kx + 36 = 0 have equal roots?",
      questionTa: "x^2 - 2kx + 36 = 0 என்ற இருபடிச் சமன்பாடு சமமான மூலங்களைப் பெற்றிருக்க k-ன் மதிப்பு:",
      options: ["+-6", "+-12", "6 only", "36"],
      optionsTa: ["+-6", "+-12", "6 மட்டுமே", "36"],
      answer: "+-6",
      explanation: "Delta = (-2k)^2 - 4(1)(36) = 0 => 4k^2 = 144 => k^2 = 36 => k = +-6. / b^2 - 4ac = 0 => 4k^2 = 144 => k = +-6."
    },
    {
      id: 39,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If the sum of the roots of a quadratic equation is -3 and product of roots is 2, the quadratic equation is:",
      questionTa: "மூலங்களின் கூடுதல் -3 மற்றும் மூலங்களின் பெருக்கற்பலன் 2 கொண்ட இருபடிச் சமன்பாடு:",
      options: ["x^2 + 3x + 2 = 0", "x^2 - 3x + 2 = 0", "x^2 + 3x - 2 = 0", "x^2 - 3x - 2 = 0"],
      optionsTa: ["x^2 + 3x + 2 = 0", "x^2 - 3x + 2 = 0", "x^2 + 3x - 2 = 0", "x^2 - 3x - 2 = 0"],
      answer: "x^2 + 3x + 2 = 0",
      explanation: "Equation is x^2 - (sum)x + product = 0 => x^2 - (-3)x + 2 = 0 => x^2 + 3x + 2 = 0. / x^2 - (கூடுதல்)x + பெருக்கல் = x^2 + 3x + 2 = 0."
    },
    {
      id: 40,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "The lowest form of the rational expression (x^2 - 16) / (x^2 + 8x + 16) is:",
      questionTa: "(x^2 - 16) / (x^2 + 8x + 16) என்ற விகிதமுறு கோவையின் எளிய வடிவம்:",
      options: ["(x - 4) / (x + 4)", "(x + 4) / (x - 4)", "(x - 4) / (x - 4)", "x / (x + 4)"],
      optionsTa: ["(x - 4) / (x + 4)", "(x + 4) / (x - 4)", "(x - 4) / (x - 4)", "x / (x + 4)"],
      answer: "(x - 4) / (x + 4)",
      explanation: "(x - 4)(x + 4) / (x + 4)^2 = (x - 4) / (x + 4). / தொகுதியிலும் பகுதியிலும் (x + 4) காரணியை நீக்க (x - 4)/(x + 4) கிடைக்கும்."
    },
    {
      id: 41,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If alpha, beta are the roots of ax^2 + bx + c = 0, then (1/alpha + 1/beta) is equal to:",
      questionTa: "alpha, beta என்பன ax^2 + bx + c = 0 இன் மூலங்கள் எனில், (1/alpha + 1/beta) இன் மதிப்பு:",
      options: ["-b / c", "b / c", "c / b", "-c / b"],
      optionsTa: ["-b / c", "b / c", "c / b", "-c / b"],
      answer: "-b / c",
      explanation: "(1/alpha + 1/beta) = (alpha + beta) / (alpha * beta) = (-b/a) / (c/a) = -b/c. / (alpha + beta)/(alpha * beta) = (-b/a)/(c/a) = -b/c."
    },
    {
      id: 42,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "The square root of 64x^4 - 16x^3 + 17x^2 - 2x + 1 is of degree:",
      questionTa: "64x^4 - 16x^3 + 17x^2 - 2x + 1 இன் வர்க்கமூலத்தின் படி (Degree):",
      options: ["1", "2", "4", "8"],
      optionsTa: ["1", "2", "4", "8"],
      answer: "2",
      explanation: "Degree of the polynomial is 4. Its square root has degree 4 / 2 = 2. / பல்லுறுப்புக் கோவையின் படி 4, ஆகவே அதன் வர்க்கமூலத்தின் படி 2 ஆகும்."
    },
    {
      id: 43,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "A system of linear equations in two variables representing parallel lines has:",
      questionTa: "இரு மாறிகளில் அமைந்த நேரியல் சமன்பாடுகள் இணைக்கோடுகளாக அமைந்தால் அத்தொகுப்பிற்கு:",
      options: ["Unique solution", "No solution", "Infinitely many solutions", "Two solutions"],
      optionsTa: ["ஒரேயொரு தீர்வு உண்டு", "தீர்வு இல்லை", "முடிவற்ற பல தீர்வுகள் உண்டு", "இரு தீர்வுகள் உண்டு"],
      answer: "No solution",
      explanation: "Parallel lines never intersect, therefore the system has no solution (inconsistent). / இணைக்கோடுகள் வெட்டிக்கொள்ளாது என்பதால் தீர்வு இல்லை."
    },
    {
      id: 44,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If A is of order p x q and B is of order q x r, then the transpose of product (AB)^T is of order:",
      questionTa: "A என்பது p x q வரிசை கொண்ட அணி மற்றும் B என்பது q x r வரிசை கொண்ட அணி எனில், (AB)^T அணியின் வரிசை:",
      options: ["p x r", "r x p", "q x q", "r x q"],
      optionsTa: ["p x r", "r x p", "q x q", "r x q"],
      answer: "r x p",
      explanation: "AB is of order p x r. Its transpose (AB)^T has order r x p. / AB அணியின் வரிசை p x r, அதன் இடமாற்று அணியின் வரிசை r x p."
    },
    {
      id: 45,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If A is a square matrix such that A^2 = A, then (I + A)^2 - 3A is equal to:",
      questionTa: "A^2 = A என்றவாறு உள்ள ஒரு சதுர அணி A-க்கு, (I + A)^2 - 3A என்பதன் மதிப்பு:",
      options: ["I", "A", "O", "2I"],
      optionsTa: ["I (அலகு அணி)", "A", "O (பூச்சிய அணி)", "2I"],
      answer: "I",
      explanation: "(I + A)^2 - 3A = I + 2A + A^2 - 3A = I + 2A + A - 3A = I + 3A - 3A = I. / விரித்தெழுத I + 3A - 3A = I கிடைக்கும்."
    },
    {
      id: 46,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If [[x + y, 2], [5, xy]] = [[6, 2], [5, 8]], then the values of x and y are:",
      questionTa: "[[x + y, 2], [5, xy]] = [[6, 2], [5, 8]] எனில், x மற்றும் y இன் மதிப்புகள்:",
      options: ["x = 4, y = 2", "x = 5, y = 1", "x = 3, y = 3", "x = 6, y = 0"],
      optionsTa: ["x = 4, y = 2", "x = 5, y = 1", "x = 3, y = 3", "x = 6, y = 0"],
      answer: "x = 4, y = 2",
      explanation: "x + y = 6, xy = 8 gives roots 4 and 2. Thus x = 4, y = 2 or vice versa. / x + y = 6 மற்றும் xy = 8 எனில் தீர்வுகள் 4 மற்றும் 2."
    },
    {
      id: 47,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "A diagonal matrix in which all the principal diagonal elements are equal to a non-zero scalar k is called a:",
      questionTa: "முதன்மை மூலைவிட்ட உறுப்புகள் அனைத்தும் பூச்சியமற்ற சமமான k மதிப்பைக் கொண்ட மூலைவிட்ட அணி எவ்வாறு அழைக்கப்படுகிறது?",
      options: ["Scalar matrix", "Identity matrix", "Null matrix", "Row matrix"],
      optionsTa: ["திசையிலி அணி (Scalar matrix)", "அலகு அணி", "பூச்சிய அணி", "நிரை அணி"],
      answer: "Scalar matrix",
      explanation: "A diagonal matrix with identical diagonal entries is a scalar matrix. / மூலைவிட்ட உறுப்புகள் யாவும் சமமாக உள்ள அணி திசையிலி அணி எனப்படும்."
    },
    {
      id: 48,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "The transpose of a column matrix of order n x 1 is a:",
      questionTa: "n x 1 வரிசை கொண்ட நிரல் அணியின் இடமாற்று அணி (Transpose):",
      options: ["Row matrix of order 1 x n", "Square matrix", "Column matrix of order 1 x n", "Diagonal matrix"],
      optionsTa: ["1 x n வரிசை கொண்ட நிரை அணி", "சதுர அணி", "நிரல் அணி", "மூலைவிட்ட அணி"],
      answer: "Row matrix of order 1 x n",
      explanation: "Transpose swaps rows and columns, turning n x 1 column into 1 x n row matrix. / நிரல் அணியின் இடமாற்று அணி நிரை அணியாக (1 x n) மாறும்."
    },
    {
      id: 49,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "For any matrix A, which of the following is always a symmetric matrix?",
      questionTa: "எந்தவொரு சதுர அணி A-க்கும், பின்வருவனவற்றுள் எது எப்போதும் ஒரு சமச்சீர் அணியாகும்?",
      options: ["A + A^T", "A - A^T", "A A^T", "Both A and C"],
      optionsTa: ["A + A^T", "A - A^T", "A A^T", "A மற்றும் C இரண்டும்"],
      answer: "Both A and C",
      explanation: "(A + A^T)^T = A^T + A = A + A^T, and (A A^T)^T = (A^T)^T A^T = A A^T. Both are symmetric. / A + A^T மற்றும் A A^T இரண்டும் சமச்சீர் அணிகளாகும்."
    },
    {
      id: 50,
      chapter: "Algebra",
      chapterTa: "இயற்கணிதம்",
      question: "If A = [[1, 2], [3, 4]] and B = [[2, 0], [1, 3]], then the trace of AB is:",
      questionTa: "A = [[1, 2], [3, 4]] மற்றும் B = [[2, 0], [1, 3]] எனில், AB அணியின் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதல் (Trace):",
      options: ["16", "18", "20", "22"],
      optionsTa: ["16", "18", "20", "22"],
      answer: "16",
      explanation: "AB = [[1*2+2*1, 1*0+2*3], [3*2+4*1, 3*0+4*3]] = [[4, 6], [10, 12]]. Trace = 4 + 12 = 16. / AB அணியின் மூலைவிட்ட உறுப்புகள் 4 மற்றும் 12; கூடுதல் = 16."
    }
  ]
};

console.log("Loaded new questions for MAT-10.");

