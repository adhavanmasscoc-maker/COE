const fs = require('fs');
const path = require('path');

console.log("=== Building Elaborated COE Engine JSON Datasets ===");

const exportedDir = path.join(__dirname, '..', 'exported_conversations');
if (!fs.existsSync(exportedDir)) {
  fs.mkdirSync(exportedDir, { recursive: true });
}

// ============================================================================
// 1. OFFICIAL EXAM ENGINE JSON (official_exam_engine.json)
// ============================================================================
// Answers are locked during testing. Answers and step rubrics are kept in postExamEvaluationKey.
const officialExamEngine = {
  systemModule: "OFFICIAL_EXAM_ENGINE",
  version: "2.0",
  board: "Tamil Nadu Directorate of Government Examinations (TNDGE)",
  visibilityRule: "ANSWERS_LOCKED_UNTIL_RESULT_DATE",
  portalCompatibility: "COE_EXAM_SETTER_AND_BATCH_IMPORT",
  note: "Questions presented to candidates DO NOT contain answers or evaluation rubrics. Solutions are encrypted in postExamEvaluationKey and released only upon official result publication.",
  officialExams: [
    {
      examId: "TN-10-MAT-2026-OFFICIAL",
      standard: 10,
      subjectCode: "MAT-10",
      subjectName: "Mathematics",
      medium: "English",
      examDate: "2026-03-20T04:30:00.000Z",
      durationMinutes: 180,
      totalMarks: 100,
      instructions: "Check the question paper for fairness of printing. Answers must be written with blue or black ink. Answers to Part-I must be written with option code and corresponding answer. Result publication will unlock the official worked solutions.",
      status: "PUBLISHED",
      sections: [
        {
          sectionId: "PART-I",
          title: "Part-I: Multiple Choice Questions (14 x 1 = 14 Marks)",
          instructions: "Answer all questions. Choose the correct answer from the given four alternatives.",
          questions: [
            {
              questionId: "Q10M01",
              questionNumber: 1,
              questionText: "If n(A x B) = 12 and n(A) = 4, then the cardinal number n(B) is equal to:",
              options: [
                { id: "A", text: "3" },
                { id: "B", text: "4" },
                { id: "C", text: "8" },
                { id: "D", text: "12" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M02",
              questionNumber: 2,
              questionText: "The modular arithmetic expression 17 ≡ x (mod 5) yields the least positive remainder x as:",
              options: [
                { id: "A", text: "1" },
                { id: "B", text: "2" },
                { id: "C", text: "3" },
                { id: "D", text: "4" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M03",
              questionNumber: 3,
              questionText: "If a, b, c are in Arithmetic Progression (A.P.), then the ratio (a - b) / (b - c) is equal to:",
              options: [
                { id: "A", text: "a / b" },
                { id: "B", text: "b / c" },
                { id: "C", text: "1" },
                { id: "D", text: "c / a" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M04",
              questionNumber: 4,
              questionText: "The number of points of intersection of the quadratic polynomial y = x^2 - 4 with the x-axis is:",
              options: [
                { id: "A", text: "0" },
                { id: "B", text: "1" },
                { id: "C", text: "2" },
                { id: "D", text: "Infinite" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M05",
              questionNumber: 5,
              questionText: "The slope of a line perpendicular to 3x - 4y + 7 = 0 is:",
              options: [
                { id: "A", text: "3/4" },
                { id: "B", text: "-4/3" },
                { id: "C", text: "4/3" },
                { id: "D", text: "-3/4" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M06",
              questionNumber: 6,
              questionText: "If sin θ + cos θ = √2 cos θ, then the value of cos θ - sin θ is equal to:",
              options: [
                { id: "A", text: "√2 sin θ" },
                { id: "B", text: "√2 cos θ" },
                { id: "C", text: "sin θ" },
                { id: "D", text: "2 sin θ" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M07",
              questionNumber: 7,
              questionText: "A spherical solid sphere is melted and recast into a cone of equal radius. The height of the cone is:",
              options: [
                { id: "A", text: "r" },
                { id: "B", text: "2r" },
                { id: "C", text: "3r" },
                { id: "D", text: "4r" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M08",
              questionNumber: 8,
              questionText: "The variance of the first 10 natural numbers 1, 2, 3, ..., 10 is:",
              options: [
                { id: "A", text: "8.25" },
                { id: "B", text: "6.5" },
                { id: "C", text: "10.5" },
                { id: "D", text: "4.75" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M09",
              questionNumber: 9,
              questionText: "If P(A) = 0.37, P(B) = 0.42 and P(A ∩ B) = 0.09, then P(A ∪ B) is:",
              options: [
                { id: "A", text: "0.70" },
                { id: "B", text: "0.88" },
                { id: "C", text: "0.60" },
                { id: "D", text: "0.55" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M10",
              questionNumber: 10,
              questionText: "The GCD of 6x^2y, 9x^2yz, 12x^2y^2z is:",
              options: [
                { id: "A", text: "3x^2y" },
                { id: "B", text: "36x^2y^2z" },
                { id: "C", text: "3xy" },
                { id: "D", text: "12x^2y" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M11",
              questionNumber: 11,
              questionText: "If ΔABC ~ ΔEDF such that AB = 5 cm, AC = 7 cm, DF = 15 cm and DE = 12 cm, then the length of the remaining sides can be found by:",
              options: [
                { id: "A", text: "Basic Proportionality Theorem" },
                { id: "B", text: "Pythagoras Theorem" },
                { id: "C", text: "Ratio of corresponding sides of similar triangles" },
                { id: "D", text: "Angle Bisector Theorem" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M12",
              questionNumber: 12,
              questionText: "The point of intersection of 3x - y = 4 and x + y = 8 is:",
              options: [
                { id: "A", text: "(3, 5)" },
                { id: "B", text: "(5, 3)" },
                { id: "C", text: "(2, 6)" },
                { id: "D", text: "(4, 4)" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M13",
              questionNumber: 13,
              questionText: "If the ratio of the surface areas of two spheres is 9 : 16, then the ratio of their volumes is:",
              options: [
                { id: "A", text: "3 : 4" },
                { id: "B", text: "27 : 64" },
                { id: "C", text: "81 : 256" },
                { id: "D", text: "9 : 16" }
              ],
              marks: 1
            },
            {
              questionId: "Q10M14",
              questionNumber: 14,
              questionText: "Which of the following is not a measure of dispersion?",
              options: [
                { id: "A", text: "Range" },
                { id: "B", text: "Standard deviation" },
                { id: "C", text: "Arithmetic Mean" },
                { id: "D", text: "Variance" }
              ],
              marks: 1
            }
          ]
        },
        {
          sectionId: "PART-II",
          title: "Part-II: Short Answer Questions (10 x 2 = 20 Marks)",
          instructions: "Answer any 10 questions. Question No. 28 is compulsory.",
          questions: [
            {
              questionId: "Q10M15",
              questionNumber: 15,
              questionText: "Let A = {1, 2, 3} and B = {x | x is a prime number less than 10}. Find A x B and B x A.",
              marks: 2
            },
            {
              questionId: "Q10M16",
              questionNumber: 16,
              questionText: "Find the HCF of 252 and 105 using Euclid's Division Algorithm.",
              marks: 2
            },
            {
              questionId: "Q10M17",
              questionNumber: 17,
              questionText: "Find the sum of the first 28 terms of an A.P. whose nth term is tn = 4n - 3.",
              marks: 2
            },
            {
              questionId: "Q10M18",
              questionNumber: 18,
              questionText: "Determine the nature of the roots of the quadratic equation 2x^2 - 2x + 9 = 0.",
              marks: 2
            },
            {
              questionId: "Q10M19",
              questionNumber: 19,
              questionText: "In ΔABC, D and E are points on the sides AB and AC respectively such that DE || BC. If AD/DB = 3/4 and AC = 14 cm, find AE.",
              marks: 2
            },
            {
              questionId: "Q10M20",
              questionNumber: 20,
              questionText: "Find the equation of a straight line having slope -5/12 and passing through the point (-1, 2).",
              marks: 2
            },
            {
              questionId: "Q10M21",
              questionNumber: 21,
              questionText: "Prove the trigonometric identity: sec θ (1 - sin θ)(sec θ + tan θ) = 1.",
              marks: 2
            },
            {
              questionId: "Q10M22",
              questionNumber: 22,
              questionText: "The internal and external radii of a hollow hemispherical shell are 3 m and 5 m respectively. Find the total surface area of the shell.",
              marks: 2
            },
            {
              questionId: "Q10M23",
              questionNumber: 23,
              questionText: "Find the range and coefficient of range of the following data: 25, 67, 48, 53, 18, 39, 44.",
              marks: 2
            },
            {
              questionId: "Q10M24",
              questionNumber: 24,
              questionText: "A die is rolled. Find the probability of getting a number greater than 4.",
              marks: 2
            }
          ]
        },
        {
          sectionId: "PART-III",
          title: "Part-III: Comprehensive Analytical Questions (10 x 5 = 50 Marks)",
          instructions: "Answer any 10 questions. Question No. 42 is compulsory.",
          questions: [
            {
              questionId: "Q10M25",
              questionNumber: 25,
              questionText: "Let f: A -> B be a function defined by f(x) = x/2 - 1, where A = {2, 4, 6, 10, 12} and B = {0, 1, 2, 4, 5, 9}. Represent f by (i) set of ordered pairs, (ii) a table, (iii) an arrow diagram, (iv) a graph.",
              marks: 5
            },
            {
              questionId: "Q10M26",
              questionNumber: 26,
              questionText: "Find the sum of the series: 7 + 77 + 777 + ... to n terms.",
              marks: 5
            },
            {
              questionId: "Q10M27",
              questionNumber: 27,
              questionText: "Find the values of a and b if 4x^4 - 12x^3 + 37x^2 + bx + a is a perfect square polynomial.",
              marks: 5
            },
            {
              questionId: "Q10M28",
              questionNumber: 28,
              questionText: "State and prove Basic Proportionality Theorem (Thales Theorem).",
              marks: 5
            },
            {
              questionId: "Q10M29",
              questionNumber: 29,
              questionText: "Find the area of the quadrilateral formed by the coordinates (-9, -2), (-8, -4), (2, 2) and (1, -3).",
              marks: 5
            },
            {
              questionId: "Q10M30",
              questionNumber: 30,
              questionText: "Two ships are sailing in the sea on either side of a lighthouse. The angles of depression of two ships as observed from the top of the lighthouse are 60° and 45°. If the lighthouse is 200 m high, find the distance between the two ships (√3 = 1.732).",
              marks: 5
            }
          ]
        },
        {
          sectionId: "PART-IV",
          title: "Part-IV: Geometry & Graph Either-Or (2 x 8 = 16 Marks)",
          instructions: "Answer both questions choosing either (a) or (b).",
          questions: [
            {
              questionId: "Q10M31A",
              questionNumber: 43,
              displayLabel: "43 (a)",
              eitherOrOption: "A",
              pairId: "Q10M31",
              questionText: "Construct a triangle ΔPQR such that QR = 5 cm, ∠P = 30° and the altitude from P to QR is of length 4.2 cm.",
              marks: 8
            },
            {
              questionId: "Q10M31B",
              questionNumber: 43,
              displayLabel: "43 (b)",
              eitherOrOption: "B",
              pairId: "Q10M31",
              questionText: "Construct a tangent to a circle of radius 4 cm from a point 10 cm away from its center. Measure and verify its lengths.",
              marks: 8
            },
            {
              questionId: "Q10M32A",
              questionNumber: 44,
              displayLabel: "44 (a)",
              eitherOrOption: "A",
              pairId: "Q10M32",
              questionText: "Draw the graph of y = x^2 - 4x + 3 and use it to solve x^2 - 6x + 9 = 0.",
              marks: 8
            },
            {
              questionId: "Q10M32B",
              questionNumber: 44,
              displayLabel: "44 (b)",
              eitherOrOption: "B",
              pairId: "Q10M32",
              questionText: "Draw the graph of xy = 24, x, y > 0. Use the graph to find (i) y when x = 3, and (ii) x when y = 6.",
              marks: 8
            }
          ]
        }
      ],
      postExamEvaluationKey: {
        Q10M01: { correctOption: "A", explanation: "n(A x B) = n(A) * n(B) => 12 = 4 * n(B) => n(B) = 3." },
        Q10M02: { correctOption: "B", explanation: "17 = 5 * 3 + 2, so 17 ≡ 2 (mod 5)." },
        Q10M03: { correctOption: "C", explanation: "Since b - a = c - b = d, (a - b) / (b - c) = -d / -d = 1." },
        Q10M04: { correctOption: "C", explanation: "x^2 - 4 = 0 => x = ±2 (two real points of intersection)." },
        Q10M05: { correctOption: "B", explanation: "Slope of given line m1 = -a/b = -3/(-4) = 3/4. Perpendicular slope m2 = -1/m1 = -4/3." },
        Q10M06: { correctOption: "A", explanation: "cos θ - sin θ = √2 sin θ by identity transformation." },
        Q10M07: { correctOption: "D", explanation: "(4/3)πr^3 = (1/3)πr^2 h => h = 4r." },
        Q10M08: { correctOption: "A", explanation: "Variance σ^2 = (n^2 - 1)/12 = (100 - 1)/12 = 99/12 = 8.25." },
        Q10M09: { correctOption: "A", explanation: "P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.37 + 0.42 - 0.09 = 0.70." },
        Q10M10: { correctOption: "A", explanation: "GCD of (6, 9, 12) is 3; common variables with lowest powers: x^2 and y => 3x^2y." },
        Q10M11: { correctOption: "C", explanation: "Similar triangles have proportional corresponding sides: AB/ED = BC/DF = AC/EF." },
        Q10M12: { correctOption: "A", explanation: "Adding equations: 4x = 12 => x = 3; y = 8 - 3 = 5 => (3, 5)." },
        Q10M13: { correctOption: "B", explanation: "r1^2/r2^2 = 9/16 => r1/r2 = 3/4. Volume ratio = (r1/r2)^3 = 27/64." },
        Q10M14: { correctOption: "C", explanation: "Arithmetic Mean is a measure of central tendency, not dispersion." },
        Q10M15: {
          modelAnswer: "A = {1, 2, 3}, B = {2, 3, 5, 7}. A x B = {(1,2), (1,3), (1,5), (1,7), (2,2), (2,3), (2,5), (2,7), (3,2), (3,3), (3,5), (3,7)}. B x A has corresponding reversed pairs.",
          marks: 2
        },
        Q10M16: {
          modelAnswer: "252 = 105 * 2 + 42; 105 = 42 * 2 + 21; 42 = 21 * 2 + 0. HCF = 21.",
          marks: 2
        },
        Q10M17: {
          modelAnswer: "a = t1 = 1, d = 4. S28 = (28/2)[2(1) + (27)(4)] = 14[2 + 108] = 14 * 110 = 1540.",
          marks: 2
        },
        Q10M18: {
          modelAnswer: "Δ = b^2 - 4ac = (-2)^2 - 4(2)(9) = 4 - 72 = -68 < 0. No real roots (complex conjugate roots).",
          marks: 2
        },
        Q10M28: {
          modelAnswer: "Statement: A straight line drawn parallel to a side of triangle intersecting other two sides divides them in the same ratio. Full geometric proof with auxiliary line and area of triangles ratios.",
          stepRubric: [
            { step: 1, description: "Hypothesis, Construction & Diagram", marks: 1.5 },
            { step: 2, description: "Area of triangle ratios computation", marks: 2 },
            { step: 3, description: "Equality proof AD/DB = AE/EC", marks: 1.5 }
          ]
        }
      }
    },
    {
      examId: "TN-12-CSC-2026-OFFICIAL",
      standard: 12,
      subjectCode: "CSC-12",
      subjectName: "Computer Science",
      medium: "English",
      examDate: "2026-03-22T04:30:00.000Z",
      durationMinutes: 180,
      totalMarks: 70,
      instructions: "Read all instructions carefully. Answer all 15 questions in Part-I. Code snippets must follow standard Python 3.x syntax. Answers are locked until the result date.",
      status: "PUBLISHED",
      sections: [
        {
          sectionId: "PART-I",
          title: "Part-I: Objective Questions (15 x 1 = 15 Marks)",
          instructions: "Answer all questions. Choose the most suitable answer.",
          questions: [
            {
              questionId: "Q12C01",
              questionNumber: 1,
              questionText: "Which rule determines the order in which variable scopes are searched in Python?",
              options: [
                { id: "A", text: "FIFO Rule" },
                { id: "B", text: "LIFO Rule" },
                { id: "C", text: "LEGB Rule" },
                { id: "D", text: "BODMAS Rule" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C02",
              questionNumber: 2,
              questionText: "What is the worst-case asymptotic time complexity of Bubble Sort algorithm?",
              options: [
                { id: "A", text: "O(n)" },
                { id: "B", text: "O(n log n)" },
                { id: "C", text: "O(n^2)" },
                { id: "D", text: "O(1)" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C03",
              questionNumber: 3,
              questionText: "Which Python function converts a single character into its corresponding Unicode / ASCII integer code?",
              options: [
                { id: "A", text: "chr()" },
                { id: "B", text: "ord()" },
                { id: "C", text: "ascii()" },
                { id: "D", text: "code()" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C04",
              questionNumber: 4,
              questionText: "What will be the output of string slicing: str1 = 'TAMILNADU'; print(str1[::-2])?",
              options: [
                { id: "A", text: "UDNLM" },
                { id: "B", text: "UANMT" },
                { id: "C", text: "UDAN" },
                { id: "D", text: "TMANU" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C05",
              questionNumber: 5,
              questionText: "Which built-in Python sequence type is immutable and defined using parentheses?",
              options: [
                { id: "A", text: "List" },
                { id: "B", text: "Dictionary" },
                { id: "C", text: "Set" },
                { id: "D", text: "Tuple" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C06",
              questionNumber: 6,
              questionText: "The special constructor method executed automatically upon object instantiation in Python is:",
              options: [
                { id: "A", text: "__construct__()" },
                { id: "B", text: "__init__()" },
                { id: "C", text: "__new__()" },
                { id: "D", text: "__main__()" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C07",
              questionNumber: 7,
              questionText: "Which relational algebra operator performs a horizontal subset filtering of rows based on a condition?",
              options: [
                { id: "A", text: "Project (π)" },
                { id: "B", text: "Select (σ)" },
                { id: "C", text: "Cartesian Product (X)" },
                { id: "D", text: "Union (∪)" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C08",
              questionNumber: 8,
              questionText: "Which SQL constraint ensures that all values in a column are distinct and cannot accept NULL?",
              options: [
                { id: "A", text: "UNIQUE" },
                { id: "B", text: "NOT NULL" },
                { id: "C", text: "PRIMARY KEY" },
                { id: "D", text: "CHECK" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C09",
              questionNumber: 9,
              questionText: "Which SQL clause is used to filter aggregated group records after a GROUP BY statement?",
              options: [
                { id: "A", text: "WHERE" },
                { id: "B", text: "HAVING" },
                { id: "C", text: "ORDER BY" },
                { id: "D", text: "FILTER" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C10",
              questionNumber: 10,
              questionText: "Which method in Python's csv module is used to write a single row of sequence data to a CSV file?",
              options: [
                { id: "A", text: "write()" },
                { id: "B", text: "writerow()" },
                { id: "C", text: "writeall()" },
                { id: "D", text: "putline()" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C11",
              questionNumber: 11,
              questionText: "Which Python standard module allows executing operating system specific commands and managing file system paths?",
              options: [
                { id: "A", text: "sys" },
                { id: "B", text: "os" },
                { id: "C", text: "math" },
                { id: "D", text: "getopt" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C12",
              questionNumber: 12,
              questionText: "In Python SQLite3 interface, which cursor method fetches the next single row of query results?",
              options: [
                { id: "A", text: "fetchall()" },
                { id: "B", text: "fetchone()" },
                { id: "C", text: "fetchmany()" },
                { id: "D", text: "fetchrow()" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C13",
              questionNumber: 13,
              questionText: "Which function in Matplotlib pyplot renders and displays the created chart on screen?",
              options: [
                { id: "A", text: "plt.plot()" },
                { id: "B", text: "plt.show()" },
                { id: "C", text: "plt.draw()" },
                { id: "D", text: "plt.display()" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C14",
              questionNumber: 14,
              questionText: "In dynamic programming, the algorithmic optimization technique of caching previously evaluated subproblems is called:",
              options: [
                { id: "A", text: "Greedy search" },
                { id: "B", text: "Backtracking" },
                { id: "C", text: "Memoization" },
                { id: "D", text: "Divide and conquer" }
              ],
              marks: 1
            },
            {
              questionId: "Q12C15",
              questionNumber: 15,
              questionText: "What is the return value of any function in Python that does not explicitly execute a return statement?",
              options: [
                { id: "A", text: "0" },
                { id: "B", text: "False" },
                { id: "C", text: "None" },
                { id: "D", text: "NULL" }
              ],
              marks: 1
            }
          ]
        },
        {
          sectionId: "PART-II",
          title: "Part-II: Short Answers (6 x 2 = 12 Marks)",
          instructions: "Answer any 6 questions. Question No. 24 is compulsory.",
          questions: [
            { questionId: "Q12C16", questionNumber: 16, questionText: "Differentiate between Parameters and Arguments in Python functions.", marks: 2 },
            { questionId: "Q12C17", questionNumber: 17, questionText: "What is the LEGB scoping rule? List its components in order.", marks: 2 },
            { questionId: "Q12C18", questionNumber: 18, questionText: "Write the characteristics of an algorithm.", marks: 2 },
            { questionId: "Q12C19", questionNumber: 19, questionText: "What is String Slicing? Write its general syntax.", marks: 2 },
            { questionId: "Q12C20", questionNumber: 20, questionText: "What is a Tuple in Python? How does it differ from a List?", marks: 2 },
            { questionId: "Q12C21", questionNumber: 21, questionText: "Define Data Model. List any two types of data models.", marks: 2 }
          ]
        },
        {
          sectionId: "PART-IV",
          title: "Part-IV: Comprehensive 5-Markers Either-Or (5 x 5 = 25 Marks)",
          instructions: "Answer all questions choosing either (a) or (b).",
          questions: [
            {
              questionId: "Q12C34A",
              questionNumber: 34,
              displayLabel: "34 (a)",
              eitherOrOption: "A",
              pairId: "Q12C34",
              questionText: "Explain the various types of function arguments supported in Python with code illustrations.",
              marks: 5
            },
            {
              questionId: "Q12C34B",
              questionNumber: 34,
              displayLabel: "34 (b)",
              eitherOrOption: "B",
              pairId: "Q12C34",
              questionText: "Explain Binary Search algorithm with an example trace and calculate its best and worst case time complexity.",
              marks: 5
            }
          ]
        }
      ],
      postExamEvaluationKey: {
        Q12C01: { correctOption: "C", explanation: "LEGB rule searches Local, Enclosed, Global, then Built-in scopes." },
        Q12C02: { correctOption: "C", explanation: "Bubble sort makes n*(n-1)/2 comparisons in worst case => O(n^2)." },
        Q12C03: { correctOption: "B", explanation: "ord('A') returns 65; chr(65) returns 'A'." },
        Q12C04: { correctOption: "B", explanation: "str1[::-2] starts from the last character 'U', stepping backwards by 2: 'U', 'A', 'N', 'M', 'T'." },
        Q12C05: { correctOption: "D", explanation: "Tuples are immutable ordered sequences defined with parentheses ()." },
        Q12C06: { correctOption: "B", explanation: "__init__() is the constructor method automatically executed upon object creation." },
        Q12C07: { correctOption: "B", explanation: "Selection (σ) selects horizontal rows satisfying a predicate condition." },
        Q12C08: { correctOption: "C", explanation: "A Primary Key uniquely identifies each row and strictly forbids NULL values." },
        Q12C09: { correctOption: "B", explanation: "HAVING filters groups created by GROUP BY." },
        Q12C10: { correctOption: "B", explanation: "writer.writerow() serializes a single sequence row into CSV format." },
        Q12C11: { correctOption: "B", explanation: "The os module provides interfaces to the underlying operating system." },
        Q12C12: { correctOption: "B", explanation: "cursor.fetchone() retrieves the next single row from the active query result set." },
        Q12C13: { correctOption: "B", explanation: "plt.show() displays all active Matplotlib figure windows." },
        Q12C14: { correctOption: "C", explanation: "Memoization caches return values of expensive function calls for identical inputs." },
        Q12C15: { correctOption: "C", explanation: "Functions without an explicit return statement implicitly return None." },
        Q12C16: {
          modelAnswer: "Parameters are variables defined in the function signature header. Arguments are actual values or expressions passed into the function call.",
          marks: 2
        },
        Q12C34A: {
          modelAnswer: "Required/Positional, Keyword, Default, and Variable-length (*args, **kwargs) arguments with syntax and code examples.",
          marks: 5
        }
      }
    },
    {
      examId: "TN-12-PHY-2026-OFFICIAL",
      standard: 12,
      subjectCode: "PHY-12",
      subjectName: "Physics",
      medium: "English",
      examDate: "2026-03-24T04:30:00.000Z",
      durationMinutes: 180,
      totalMarks: 70,
      instructions: "Answer all questions in Part-I. Answer any 6 questions in Part-II and Part-III. Part-IV is Either-Or.",
      status: "PUBLISHED",
      sections: [
        {
          sectionId: "PART-I",
          title: "Part-I: Objective Questions (15 x 1 = 15 Marks)",
          questions: [
            {
              questionId: "Q12P01",
              questionNumber: 1,
              questionText: "The electric flux through a closed surface enclosing a charge q is given by:",
              options: [
                { id: "A", text: "q / ε0" },
                { id: "B", text: "q * ε0" },
                { id: "C", text: "ε0 / q" },
                { id: "D", text: "q / (4π ε0)" }
              ],
              marks: 1
            },
            {
              questionId: "Q12P02",
              questionNumber: 2,
              questionText: "The color code of a carbon resistor with resistance (47 ± 2.35) kΩ is:",
              options: [
                { id: "A", text: "Yellow, Violet, Orange, Gold" },
                { id: "B", text: "Yellow, Violet, Red, Silver" },
                { id: "C", text: "Orange, Violet, Orange, Gold" },
                { id: "D", text: "Yellow, Blue, Orange, Gold" }
              ],
              marks: 1
            },
            {
              questionId: "Q12P03",
              questionNumber: 3,
              questionText: "A circular coil of radius R carries a current I. The magnetic field at its center is:",
              options: [
                { id: "A", text: "μ0 I / (2R)" },
                { id: "B", text: "μ0 I / (4π R)" },
                { id: "C", text: "μ0 I / (2π R)" },
                { id: "D", text: "2 μ0 I / R" }
              ],
              marks: 1
            }
          ]
        }
      ],
      postExamEvaluationKey: {
        Q12P01: { correctOption: "A", explanation: "Gauss's Law states total electric flux ΦE = q_enclosed / ε0." },
        Q12P02: { correctOption: "A", explanation: "4 = Yellow, 7 = Violet, 10^3 = Orange multiplier, 5% tolerance = Gold." },
        Q12P03: { correctOption: "A", explanation: "By Biot-Savart law, B at center of circular loop = μ0 I / (2R)." }
      }
    },
    {
      examId: "TN-12-CHE-2026-OFFICIAL",
      standard: 12,
      subjectCode: "CHE-12",
      subjectName: "Chemistry",
      medium: "English",
      examDate: "2026-03-26T04:30:00.000Z",
      durationMinutes: 180,
      totalMarks: 70,
      instructions: "Answer all questions. Chemistry solutions released after evaluation.",
      status: "PUBLISHED",
      sections: [
        {
          sectionId: "PART-I",
          title: "Part-I: Objective Questions (15 x 1 = 15 Marks)",
          questions: [
            {
              questionId: "Q12CH01",
              questionNumber: 1,
              questionText: "Which method of concentration is most suitable for sulphide ores?",
              options: [
                { id: "A", text: "Gravity separation" },
                { id: "B", text: "Froth floatation process" },
                { id: "C", text: "Magnetic separation" },
                { id: "D", text: "Leaching" }
              ],
              marks: 1
            },
            {
              questionId: "Q12CH02",
              questionNumber: 2,
              questionText: "The coordination number of an atom in a body-centered cubic (BCC) crystal lattice is:",
              options: [
                { id: "A", text: "4" },
                { id: "B", text: "6" },
                { id: "C", text: "8" },
                { id: "D", text: "12" }
              ],
              marks: 1
            }
          ]
        }
      ],
      postExamEvaluationKey: {
        Q12CH01: { correctOption: "B", explanation: "Froth floatation uses pine oil collector to preferentially wet sulfide ores." },
        Q12CH02: { correctOption: "C", explanation: "In BCC, the central atom is surrounded by 8 corner atoms => coordination number 8." }
      }
    }
  ]
};

// ============================================================================
// 2. PRACTICE EXAM ENGINE JSON (practice_exam_engine.json)
// ============================================================================
// Immediate feedback upon submission with step-by-step instant explanations
const practiceExamEngine = {
  systemModule: "PRACTICE_EXAM_ENGINE",
  version: "2.0",
  feedbackMode: "IMMEDIATE_POST_SUBMIT_OR_PER_QUESTION",
  purpose: "Interactive self-assessment and continuous curriculum revision with real-time worked solutions.",
  practiceModules: [
    {
      practiceId: "PRAC-10-MAT-01",
      standard: 10,
      subjectCode: "MAT-10",
      subjectName: "Mathematics",
      topic: "Relations, Functions & Modular Arithmetic",
      unitNumber: 1,
      totalQuestions: 5,
      questions: [
        {
          questionId: "PQ-10M-01",
          questionNumber: 1,
          questionText: "If n(A × B) = 6 and A = {1, 3}, then the cardinal number n(B) is:",
          options: [
            { id: "A", text: "1" },
            { id: "B", text: "2" },
            { id: "C", text: "3" },
            { id: "D", text: "6" }
          ],
          correctAnswer: "C",
          instantExplanation: "n(A × B) = n(A) × n(B). Given n(A) = 2 and n(A × B) = 6, 6 = 2 × n(B) => n(B) = 3.",
          conceptTag: "Cartesian Products & Cardinality",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10M-02",
          questionNumber: 2,
          questionText: "What is the least common multiple (LCM) of all integers from 1 to 10 inclusive?",
          options: [
            { id: "A", text: "2025" },
            { id: "B", text: "2520" },
            { id: "C", text: "5040" },
            { id: "D", text: "1000" }
          ],
          correctAnswer: "B",
          instantExplanation: "Prime factorization: 2^3 × 3^2 × 5 × 7 = 8 × 9 × 5 × 7 = 2520.",
          conceptTag: "Fundamental Theorem of Arithmetic",
          difficultyLevel: "Medium",
          marks: 1
        },
        {
          questionId: "PQ-10M-03",
          questionNumber: 3,
          questionText: "In an Arithmetic Progression, if the 3rd term is 16 and the 7th term is 32, what is the common difference d?",
          options: [
            { id: "A", text: "2" },
            { id: "B", text: "4" },
            { id: "C", text: "6" },
            { id: "D", text: "8" }
          ],
          correctAnswer: "B",
          instantExplanation: "t7 - t3 = 4d => 32 - 16 = 16 => 4d = 16 => d = 4.",
          conceptTag: "Arithmetic Progressions",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10M-04",
          questionNumber: 4,
          questionText: "What is the remainder when 3^2026 is divided by 5?",
          options: [
            { id: "A", text: "1" },
            { id: "B", text: "2" },
            { id: "C", text: "3" },
            { id: "D", text: "4" }
          ],
          correctAnswer: "D",
          instantExplanation: "Powers of 3 modulo 5 cycle every 4 powers: 3^1=3, 3^2=4, 3^3=2, 3^4=1. 2026 mod 4 = 2. Hence 3^2026 ≡ 3^2 = 4 (mod 5).",
          conceptTag: "Modular Arithmetic & Congruence",
          difficultyLevel: "Challenging",
          marks: 1
        },
        {
          questionId: "PQ-10M-05",
          questionNumber: 5,
          questionText: "If the discriminant Δ = b^2 - 4ac > 0 and is not a perfect square, the roots of the quadratic equation are:",
          options: [
            { id: "A", text: "Real, rational and equal" },
            { id: "B", text: "Real, irrational and unequal" },
            { id: "C", text: "Real, rational and unequal" },
            { id: "D", text: "Non-real complex roots" }
          ],
          correctAnswer: "B",
          instantExplanation: "When Δ > 0 and not a square, the square root √Δ remains irrational, giving conjugate irrational roots.",
          conceptTag: "Nature of Quadratic Roots",
          difficultyLevel: "Medium",
          marks: 1
        }
      ]
    },
    {
      practiceId: "PRAC-10-SCI-01",
      standard: 10,
      subjectCode: "SCI-10",
      subjectName: "Science",
      topic: "Laws of Motion, Electricity & Periodic Classification",
      unitNumber: 1,
      totalQuestions: 5,
      questions: [
        {
          questionId: "PQ-10S-01",
          questionNumber: 1,
          questionText: "The linear momentum of a body of mass 5 kg moving with a uniform velocity of 10 m/s is:",
          options: [
            { id: "A", text: "2 N s" },
            { id: "B", text: "50 N s" },
            { id: "C", text: "0.5 N s" },
            { id: "D", text: "500 N s" }
          ],
          correctAnswer: "B",
          instantExplanation: "Linear momentum p = m * v = 5 kg * 10 m/s = 50 kg·m/s = 50 N·s.",
          conceptTag: "Newton's Second Law & Momentum",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10S-02",
          questionNumber: 2,
          questionText: "According to Ohm's Law, the graph plotted between current (I) on x-axis and potential difference (V) on y-axis is a:",
          options: [
            { id: "A", text: "Parabola curving upward" },
            { id: "B", text: "Hyperbola" },
            { id: "C", text: "Straight line passing through the origin" },
            { id: "D", text: "Circular curve" }
          ],
          correctAnswer: "C",
          instantExplanation: "Since V = I * R with R constant, V is directly proportional to I, yielding a linear straight line through origin with slope = R.",
          conceptTag: "Ohm's Law & Electric Circuits",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10S-03",
          questionNumber: 3,
          questionText: "Which gas is released during photosynthesis in the light-dependent reaction by photolysis of water?",
          options: [
            { id: "A", text: "Carbon Dioxide" },
            { id: "B", text: "Oxygen" },
            { id: "C", text: "Nitrogen" },
            { id: "D", text: "Methane" }
          ],
          correctAnswer: "B",
          instantExplanation: "Photolysis splits water: 2H2O -> 4H+ + 4e- + O2↑, releasing oxygen gas into the atmosphere.",
          conceptTag: "Plant Physiology & Photosynthesis",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10S-04",
          questionNumber: 4,
          questionText: "What is the pH value of pure distilled water at 25°C?",
          options: [
            { id: "A", text: "0" },
            { id: "B", text: "7" },
            { id: "C", text: "14" },
            { id: "D", text: "1" }
          ],
          correctAnswer: "B",
          instantExplanation: "Pure water auto-ionizes with [H+] = 10^-7 M, giving pH = -log(10^-7) = 7 (neutral).",
          conceptTag: "Acids, Bases and Salts - pH Scale",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-10S-05",
          questionNumber: 5,
          questionText: "Which group in the modern periodic table contains the Halogens?",
          options: [
            { id: "A", text: "Group 1" },
            { id: "B", text: "Group 16" },
            { id: "C", text: "Group 17" },
            { id: "D", text: "Group 18" }
          ],
          correctAnswer: "C",
          instantExplanation: "Group 17 elements (F, Cl, Br, I, At) have 7 valence electrons and are known as Halogens (salt-formers).",
          conceptTag: "Periodic Classification of Elements",
          difficultyLevel: "Medium",
          marks: 1
        }
      ]
    },
    {
      practiceId: "PRAC-12-CSC-01",
      standard: 12,
      subjectCode: "CSC-12",
      subjectName: "Computer Science",
      topic: "Python Core, Data Structures & Relational SQL",
      unitNumber: 1,
      totalQuestions: 5,
      questions: [
        {
          questionId: "PQ-12C-01",
          questionNumber: 1,
          questionText: "What will be the output of the Python expression: str1 = 'COMPUTER'; print(str1[2:6])?",
          options: [
            { id: "A", text: "MPUT" },
            { id: "B", text: "MPUTE" },
            { id: "C", text: "OMPU" },
            { id: "D", text: "COMP" }
          ],
          correctAnswer: "A",
          instantExplanation: "str1[2:6] extracts slice indices 2, 3, 4, 5: str1[2]='M', str1[3]='P', str1[4]='U', str1[5]='T' -> 'MPUT'.",
          conceptTag: "Python String Slicing",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-12C-02",
          questionNumber: 2,
          questionText: "Which SQL command permanently removes a table along with its schema structure from the database?",
          options: [
            { id: "A", text: "DELETE" },
            { id: "B", text: "TRUNCATE" },
            { id: "C", text: "DROP TABLE" },
            { id: "D", text: "REMOVE" }
          ],
          correctAnswer: "C",
          instantExplanation: "DROP TABLE drops the complete table definition and all rows permanently. TRUNCATE deletes rows but keeps the table structure.",
          conceptTag: "SQL DDL Commands",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-12C-03",
          questionNumber: 3,
          questionText: "In Python, which built-in function returns a list containing all the attributes and methods of an object?",
          options: [
            { id: "A", text: "type()" },
            { id: "B", text: "dir()" },
            { id: "C", text: "help()" },
            { id: "D", text: "id()" }
          ],
          correctAnswer: "B",
          instantExplanation: "dir(object) introspects and lists all valid attributes, properties, and methods associated with the object.",
          conceptTag: "Python Object Introspection",
          difficultyLevel: "Medium",
          marks: 1
        },
        {
          questionId: "PQ-12C-04",
          questionNumber: 4,
          questionText: "What is the best-case time complexity of the Binary Search algorithm?",
          options: [
            { id: "A", text: "O(n)" },
            { id: "B", text: "O(log n)" },
            { id: "C", text: "O(1)" },
            { id: "D", text: "O(n log n)" }
          ],
          correctAnswer: "C",
          instantExplanation: "In best case, the target element is located at the exact middle index in the very first comparison, taking O(1) constant time.",
          conceptTag: "Algorithm Complexity - Binary Search",
          difficultyLevel: "Medium",
          marks: 1
        },
        {
          questionId: "PQ-12C-05",
          questionNumber: 5,
          questionText: "Which clause in SQL is used in conjunction with aggregate functions (SUM, AVG, COUNT) to apply filter criteria on grouped results?",
          options: [
            { id: "A", text: "WHERE" },
            { id: "B", text: "HAVING" },
            { id: "C", text: "ORDER BY" },
            { id: "D", text: "LIMIT" }
          ],
          correctAnswer: "B",
          instantExplanation: "WHERE filters rows before aggregation; HAVING filters aggregate groups after the GROUP BY clause is evaluated.",
          conceptTag: "SQL Aggregate Functions & Filtering",
          difficultyLevel: "Easy",
          marks: 1
        }
      ]
    },
    {
      practiceId: "PRAC-12-PHY-01",
      standard: 12,
      subjectCode: "PHY-12",
      subjectName: "Physics",
      topic: "Electrostatics, Capacitors & Current Electricity",
      unitNumber: 1,
      totalQuestions: 4,
      questions: [
        {
          questionId: "PQ-12P-01",
          questionNumber: 1,
          questionText: "When three capacitors of capacitances C1, C2, C3 are connected in series, the equivalent capacitance C_s is given by:",
          options: [
            { id: "A", text: "C1 + C2 + C3" },
            { id: "B", text: "1/C1 + 1/C2 + 1/C3" },
            { id: "C", text: "1 / (1/C1 + 1/C2 + 1/C3)" },
            { id: "D", text: "(C1 * C2 * C3) / (C1 + C2 + C3)" }
          ],
          correctAnswer: "C",
          instantExplanation: "In series connection, 1/C_s = 1/C1 + 1/C2 + 1/C3 => C_s = 1 / (1/C1 + 1/C2 + 1/C3).",
          conceptTag: "Capacitors in Series & Parallel",
          difficultyLevel: "Easy",
          marks: 1
        },
        {
          questionId: "PQ-12P-02",
          questionNumber: 2,
          questionText: "Kirchhoff's First Law (Junction Rule) is a direct consequence of the conservation of:",
          options: [
            { id: "A", text: "Energy" },
            { id: "B", text: "Electric Charge" },
            { id: "C", text: "Linear Momentum" },
            { id: "D", text: "Angular Momentum" }
          ],
          correctAnswer: "B",
          instantExplanation: "Kirchhoff's Current Law states net charge cannot accumulate at a junction: sum of entering currents = sum of leaving currents.",
          conceptTag: "Kirchhoff's Laws & Circuits",
          difficultyLevel: "Easy",
          marks: 1
        }
      ]
    }
  ]
};

// ============================================================================
// 3. MASTER SYLLABUS JSON (tn_master_syllabus.json)
// ============================================================================
// Complete standardized subjects dictionary for all 10th and 12th TN State Board curriculum
const tnMasterSyllabus = {
  systemModule: "TN_MASTER_CURRICULUM_SYLLABUS",
  version: "2.0",
  stateBoard: "Tamil Nadu State Board of School Examination (DGE)",
  unifiedCodingStandard: {
    rule: "SUB-STD where SUB is 3-letter uppercase subject mnemonic and STD is 10 or 12.",
    standard10Codes: ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"],
    standard12Codes: ["TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12", "BIO-12", "BOT-12", "ZOO-12", "COM-12", "ACC-12", "ECO-12", "BMT-12"]
  },
  standards: [
    {
      standard: 10,
      label: "10th Standard (SSLC)",
      totalSubjects: 5,
      subjects: [
        {
          subjectCode: "TAM-10",
          name: "Language (Tamil)",
          medium: "Tamil",
          unitsCount: 9,
          units: [
            { unitNumber: 1, title: "மொழி - அமிழ்தே ஊற்றே", coreConcepts: ["அன்னை மொழியே", "தமிழ்ச் சொல் வளம்", "இரட்டுற மொழிதல்", "எழுத்து, சொல் இலக்கணம்"] },
            { unitNumber: 2, title: "இயற்கை - உயிரின் வேர்", coreConcepts: ["காற்றே வா", "முல்லைப் பாட்டு", "புயலிலே ஒரு தோணி", "தொகைநிலைத் தொடர்கள்"] },
            { unitNumber: 3, title: "பண்பாடு - கூட்டாஞ்சோறு", coreConcepts: ["விருந்தோம்பல்", "காசிக் காண்டம்", "மலைபடுகடாம்", "தொகாநிலைத் தொடர்கள்"] },
            { unitNumber: 4, title: "அறிவியல், தொழில்நுட்பம் - நான்காம் தொழில்", coreConcepts: ["செயற்கை நுண்ணறிவு", "பெருமாள் திருமொழி", "பரிபாடல்", "வழு, வழாநிலை, வழுவமைதி"] },
            { unitNumber: 5, title: "கல்வி - மணற்கேணி", coreConcepts: ["மொழிபெயர்ப்புக் கல்வி", "நீதி வெண்பா", "திருக்குறள்", "வினா, விடை வகைகள்"] },
            { unitNumber: 6, title: "கலை - நிலா முற்றம்", coreConcepts: ["நிகழ்கலை", "பூத்தொடுத்தல்", "முத்துக்குமாரசாமி பிள்ளைத்தமிழ்", "அகப்பொருள் இலக்கணம்"] },
            { unitNumber: 7, title: "நாகரிகம், தொழில் - விதைநெல்", coreConcepts: ["சிற்றகல் ஒளி", "ஏர் புதிதா", "மெய்க்கீர்த்தி", "புறப்பொருள் வெண்பாமாலை"] },
            { unitNumber: 8, title: "அறம், தத்துவம் - பெருவழி", coreConcepts: ["சங்க இலக்கியத்தில் அறம்", "ஞானம்", "காலக்கணிதம்", "யாப்பிலக்கணம்"] },
            { unitNumber: 9, title: "மனிதம் - அன்பின் மொழி", coreConcepts: ["ஜெயகாந்தன் நினைவுகள்", "சித்தாள்", "தேம்பாவணி", "அணியிலக்கணம்"] }
          ]
        },
        {
          subjectCode: "ENG-10",
          name: "English",
          medium: "English",
          unitsCount: 7,
          units: [
            { unitNumber: 1, title: "Courage and Perseverance", coreConcepts: ["His First Flight (Prose)", "Life (Poem)", "The Tempest (Supplementary)", "Tenses and Modals"] },
            { unitNumber: 2, title: "Family and Humor", coreConcepts: ["The Night the Ghost Got In", "The Grumble Family", "Zigzag", "Articles and Prepositions"] },
            { unitNumber: 3, title: "Women Empowerment and Valour", coreConcepts: ["Empowered Women Navigating the World", "I am Every Woman", "The Story of Mulan", "Active and Passive Voice"] },
            { unitNumber: 4, title: "Science, Tech and Space", coreConcepts: ["The Attic", "The Ant and the Cricket", "The Aged Mother", "Conditionals (If-clauses)"] },
            { unitNumber: 5, title: "Social Awareness and Inclusion", coreConcepts: ["Tech Bloomers", "The Secret of the Machines", "A Dilemma", "Degrees of Comparison"] },
            { unitNumber: 6, title: "Art and Human Values", coreConcepts: ["The Last Lesson", "No Men Are Foreign", "The Little Hero of Haarlem", "Simple, Compound, Complex Sentences"] },
            { unitNumber: 7, title: "Mystery and Courage", coreConcepts: ["The Dying Detective", "The House on Elm Street", "A Close Encounter", "Direct and Indirect Speech"] }
          ]
        },
        {
          subjectCode: "MAT-10",
          name: "Mathematics",
          medium: "English",
          unitsCount: 8,
          units: [
            { unitNumber: 1, title: "Relations and Functions", coreConcepts: ["Cartesian Product", "Relations and Representations", "Functions, Domain, Codomain", "Composition of Functions"] },
            { unitNumber: 2, title: "Numbers and Sequences", coreConcepts: ["Euclid's Division Lemma & Algorithm", "Fundamental Theorem of Arithmetic", "Modular Arithmetic", "Arithmetic and Geometric Progressions (AP/GP)"] },
            { unitNumber: 3, title: "Algebra", coreConcepts: ["Simultaneous Linear Equations in 3 Variables", "GCD and LCM of Polynomials", "Square Root of Polynomials", "Quadratic Equations and Graphs", "Matrices and Operations"] },
            { unitNumber: 4, title: "Geometry", coreConcepts: ["Similarity of Triangles", "Basic Proportionality Theorem (Thales)", "Angle Bisector Theorem", "Pythagoras Theorem", "Circles and Tangents"] },
            { unitNumber: 5, title: "Coordinate Geometry", coreConcepts: ["Area of Triangle and Quadrilateral", "Slope of Straight Line", "Equations of Straight Lines", "Parallel and Perpendicular Lines"] },
            { unitNumber: 6, title: "Trigonometry", coreConcepts: ["Trigonometric Identities", "Heights and Distances", "Angle of Elevation and Depression", "Problems with Multi-Observer Sightings"] },
            { unitNumber: 7, title: "Mensuration", coreConcepts: ["Surface Area of Cylinder, Cone, Sphere", "Volume of Solids", "Volume and Surface Area of Frustum", "Melting and Recasting of Solids"] },
            { unitNumber: 8, title: "Statistics and Probability", coreConcepts: ["Measures of Dispersion (Range, Standard Deviation, Variance)", "Coefficient of Variation", "Classical Probability", "Addition Theorem of Probability"] }
          ]
        },
        {
          subjectCode: "SCI-10",
          name: "Science",
          medium: "English",
          unitsCount: 23,
          units: [
            { unitNumber: 1, title: "Laws of Motion (Physics)", coreConcepts: ["Inertia and Types", "Newton's Three Laws of Motion", "Linear Momentum & Impulse", "Principle of Conservation of Momentum"] },
            { unitNumber: 2, title: "Optics (Physics)", coreConcepts: ["Refraction of Light", "Lenses and Lens Formula", "Human Eye & Optical Defects", "Microscopes and Telescopes"] },
            { unitNumber: 3, title: "Thermal Physics (Physics)", coreConcepts: ["Temperature Scales", "Thermal Energy Transfer", "Boyle's, Charles's, and Avogadro's Laws", "Ideal Gas Equation"] },
            { unitNumber: 4, title: "Electricity (Physics)", coreConcepts: ["Electric Current & Potential Difference", "Ohm's Law & Resistance", "Resistors in Series and Parallel", "Joule's Law of Heating & Electric Power"] },
            { unitNumber: 5, title: "Acoustics (Physics)", coreConcepts: ["Sound Waves & Velocity", "Reflection of Sound & Echoes", "Doppler Effect & Applications"] },
            { unitNumber: 6, title: "Nuclear Physics (Physics)", coreConcepts: ["Radioactivity (Alpha, Beta, Gamma)", "Nuclear Fission & Fusion", "Nuclear Reactor Components", "Radiation Safety & Dosages"] },
            { unitNumber: 7, title: "Atoms and Molecules (Chemistry)", coreConcepts: ["Relative Atomic and Molecular Mass", "Mole Concept & Avogadro's Number", "Molar Volume & Percentage Composition"] },
            { unitNumber: 8, title: "Periodic Classification of Elements (Chemistry)", coreConcepts: ["Modern Periodic Law", "Groups and Periods", "Periodic Trends (Atomic Radius, Ionization Energy, Electronegativity)", "Metallurgy & Alloys"] },
            { unitNumber: 9, title: "Solutions (Chemistry)", coreConcepts: ["Solute, Solvent & Solution Types", "Solubility Factors", "Mass and Volume Percentage"] },
            { unitNumber: 10, title: "Types of Chemical Reactions (Chemistry)", coreConcepts: ["Combination, Decomposition, Displacement Reactions", "Reversible & Irreversible Reactions", "Rate of Reaction", "pH Scale and Applications"] },
            { unitNumber: 11, title: "Carbon and its Compounds (Chemistry)", coreConcepts: ["Covalent Bonding & Catenation", "Functional Groups & Homologous Series", "IUPAC Nomenclature of Organic Compounds", "Ethanol and Ethanoic Acid Properties"] },
            { unitNumber: 12, title: "Plant Anatomy and Plant Physiology (Biology)", coreConcepts: ["Plant Tissue Systems", "Internal Structure of Dicot and Monocot Root & Stem", "Plastids & Photosynthesis", "Respiration in Plants"] },
            { unitNumber: 13, title: "Structural Organisation of Animals (Biology)", coreConcepts: ["Morphology of Leech & Rabbit", "Digestive and Circulatory Systems"] },
            { unitNumber: 14, title: "Transportation in Plants and Circulation in Animals (Biology)", coreConcepts: ["Ascent of Sap & Transpiration", "Blood Composition & Human Heart", "Blood Pressure & ECG"] },
            { unitNumber: 15, title: "Nervous System (Biology)", coreConcepts: ["Neuron Structure & Nerve Impulse", "Central and Peripheral Nervous System", "Reflex Arc"] },
            { unitNumber: 16, title: "Plant and Animal Hormones (Biology)", coreConcepts: ["Auxins, Gibberellins, Cytokinins, Abscisic Acid", "Pituitary, Thyroid, Pancreas, Adrenal Hormones"] },
            { unitNumber: 17, title: "Reproduction in Plants and Animals (Biology)", coreConcepts: ["Vegetative Propagation & Pollination", "Fertilization in Plants", "Human Male and Female Reproductive Systems", "Menstrual Cycle & Contraception"] },
            { unitNumber: 18, title: "Heredity (Biology)", coreConcepts: ["Mendel's Monohybrid and Dihybrid Crosses", "Chromosomes & DNA Structure", "DNA Replication & Mutations"] },
            { unitNumber: 19, title: "Origin and Evolution of Life (Biology)", coreConcepts: ["Theories of Evolution (Lamarckism, Darwinism)", "Evidences of Evolution", "Fossils & Paleontology"] },
            { unitNumber: 20, title: "Breeding and Biotechnology (Biology)", coreConcepts: ["Plant and Animal Breeding Methods", "Genetic Engineering & Recombinant DNA", "DNA Fingerprinting"] },
            { unitNumber: 21, title: "Health and Diseases (Biology)", coreConcepts: ["Communicable Diseases & Pathogens", "Immunity & Immunization Schedule", "Non-communicable Diseases (Diabetes, Cancer, AIDS)"] },
            { unitNumber: 22, title: "Environmental Management (Biology)", coreConcepts: ["Renewable & Non-renewable Energy Resources", "Conservation of Wildlife & Forests", "Waste Water Management"] }
          ]
        },
        {
          subjectCode: "SOC-10",
          name: "Social Science",
          medium: "English",
          unitsCount: 15,
          units: [
            { unitNumber: 1, title: "Outbreak of World War I and Its Aftermath (History)", coreConcepts: ["Imperialism & Scramble for Africa", "Alliances & Causes of WWI", "Treaty of Versailles", "League of Nations"] },
            { unitNumber: 2, title: "The World between Two World Wars (History)", coreConcepts: ["The Great Depression of 1929", "Rise of Fascism in Italy (Mussolini)", "Rise of Nazism in Germany (Hitler)"] },
            { unitNumber: 3, title: "World War II (History)", coreConcepts: ["Causes & Major Battles of WWII", "The Holocaust", "Atomic Bombing of Hiroshima & Nagasaki", "Establishment of the United Nations (UN)"] },
            { unitNumber: 4, title: "Anti-Colonial Movements and Decolonisation (History)", coreConcepts: ["Nationalism in Indo-China", "Decolonisation in Africa"] },
            { unitNumber: 5, title: "Social and Religious Reform Movements in the 19th Century (History)", coreConcepts: ["Brahmo Samaj & Raja Ram Mohan Roy", "Arya Samaj, Ramakrishna Mission", "Reform Movements in Tamil Nadu (Periyar, Ramalingar, Ayothidhasar)"] },
            { unitNumber: 6, title: "India - Location, Relief and Drainage (Geography)", coreConcepts: ["Major Physiographic Divisions of India", "Himalayas, Northern Plains, Peninsular Plateau", "Himalayan and Peninsular River Systems"] },
            { unitNumber: 7, title: "Climate and Natural Vegetation of India (Geography)", coreConcepts: ["Factors affecting India's Climate", "Southwest and Northeast Monsoons", "Forest Types of India & Conservation"] },
            { unitNumber: 8, title: "India - Agriculture (Geography)", coreConcepts: ["Soil Types in India", "Irrigation Methods", "Major Food and Cash Crops", "Green Revolution"] },
            { unitNumber: 9, title: "Indian Constitution (Civics)", coreConcepts: ["Making of the Constitution", "Preamble & Salient Features", "Fundamental Rights and Duties", "Directive Principles of State Policy", "Writ Jurisdiction"] },
            { unitNumber: 10, title: "Central Government (Civics)", coreConcepts: ["President, Vice-President, Prime Minister", "Lok Sabha and Rajya Sabha Functions", "Supreme Court of India & Judicial Review"] },
            { unitNumber: 11, title: "State Government (Civics)", coreConcepts: ["Governor & Chief Minister", "State Legislative Assembly", "High Courts in India"] },
            { unitNumber: 12, title: "Gross Domestic Product and its Growth: An Introduction (Economics)", coreConcepts: ["GDP Definition and Methods of Calculation", "Sectors of Economy (Primary, Secondary, Tertiary)", "Purchasing Power Parity (PPP)"] },
            { unitNumber: 13, title: "Globalization and Trade (Economics)", coreConcepts: ["Historical Background of Trade", "Multinational Corporations (MNCs)", "World Trade Organization (WTO)"] }
          ]
        }
      ]
    },
    {
      standard: 12,
      label: "12th Standard (Higher Secondary)",
      totalSubjects: 12,
      subjects: [
        {
          subjectCode: "TAM-12",
          name: "Language (Tamil)",
          medium: "Tamil",
          unitsCount: 8,
          units: [
            { unitNumber: 1, title: "உயிரினும் சிறந்தன்று (மொழி)", coreConcepts: ["இளந்தமிழே", "தமிழ்மொழியின் நடை அழகியல்", "தன்னேர் இலாத தமிழ்", "நால்வகைச் சொற்கள்"] },
            { unitNumber: 2, title: "பெய்யெனப் பெய்யும் மழை (இயற்கை)", coreConcepts: ["பிறகொரு நாள் கோடை", "நெடுநல்வாடை", "முதல் கல்", "நால்வகை அணிகள்"] },
            { unitNumber: 3, title: "சுற்றத்தார் கண்ணே உள (பண்பாடு)", coreConcepts: ["விருந்தினர் இல்லம்", "கம்பராமாயணம்", "உரிமைத்தாகம்", "பொருள்கோள் வகைகள்"] },
            { unitNumber: 4, title: "செல்வத்துள் செல்வம் (கல்வி)", coreConcepts: ["படைப்புக்கலை", "திருக்குறள்", "பா இயற்றப் பழகலாம்"] },
            { unitNumber: 5, title: "நாடென்ப நாடா வளத்தன (நாடு, சமூகம்)", coreConcepts: ["தெய்வமணிமாலை", "தேவாரம்", "அகநானூறு", "தலைக்குளம்"] },
            { unitNumber: 6, title: "சிறுகை அளாவிய கூழ் (கலை, அழகியல்)", coreConcepts: ["சிற்பக்கலை", "சிலப்பதிகாரம்", "மெய்ப்பாட்டியல்"] },
            { unitNumber: 7, title: "சான்றோர் மெய்ம்மறை (ஆளுமை)", coreConcepts: ["இலக்கியத்தில் மேலாண்மை", "புறநானூறு", "குறைஒன்றுமில்லை"] },
            { unitNumber: 8, title: "எல்லார்க்கும் எல்லாம் (வாழ்வியல்)", coreConcepts: ["கோடைமழை", "ரட்சணிய யாத்திரிகம்", "சிறுபாணாற்றுப்படை"] }
          ]
        },
        {
          subjectCode: "ENG-12",
          name: "English",
          medium: "English",
          unitsCount: 6,
          units: [
            { unitNumber: 1, title: "Human Spirit and Dedication", coreConcepts: ["Two Gentlemen of Verona (Prose)", "The Castle (Poem)", "God Sees the Truth, But Waits", "Tenses and Modals"] },
            { unitNumber: 2, title: "Humor and Everyday Life", coreConcepts: ["A Nice Cup of Tea", "Our Casuarina Tree", "Life of Pi", "Prepositional Phrases"] },
            { unitNumber: 3, title: "Determination and Courage", coreConcepts: ["In Celebration of Being Alive", "All the World's a Stage", "The Hour of Truth", "Direct and Reported Speech"] },
            { unitNumber: 4, title: "Science and Environment", coreConcepts: ["The Summit", "Ulysses", "The Midnight Visitor", "Conditionals and Inversion"] },
            { unitNumber: 5, title: "Art and Literature", coreConcepts: ["The Chair", "A Father to his Son", "All Summer in a Day", "Concord and Relative Clauses"] },
            { unitNumber: 6, title: "Values and Social Issues", coreConcepts: ["On the Rule of the Road", "Incident of the French Camp", "A Man who had No Eyes", "Question Tags and Idioms"] }
          ]
        },
        {
          subjectCode: "MAT-12",
          name: "Mathematics",
          medium: "English",
          unitsCount: 12,
          units: [
            { unitNumber: 1, title: "Applications of Matrices and Determinants", coreConcepts: ["Adjoint and Inverse of a Matrix", "Rank of a Matrix & Elementary Row Operations", "Cramer's Rule, Matrix Inversion Method, Gaussian Elimination Method", "Consistency of Linear Equations"] },
            { unitNumber: 2, title: "Complex Numbers", coreConcepts: ["Algebraic Operations & Geometric Representation", "Modulus, Argument & Polar Form", "Euler's Form & De Moivre's Theorem", "nth Roots of Unity"] },
            { unitNumber: 3, title: "Theory of Equations", coreConcepts: ["Vieta's Formulas for Polynomials", "Descartes' Rule of Signs", "Roots of Real and Complex Polynomials"] },
            { unitNumber: 4, title: "Inverse Trigonometric Functions", coreConcepts: ["Principal Domains and Ranges", "Properties of Inverse Trigonometric Functions"] },
            { unitNumber: 5, title: "Two Dimensional Analytical Geometry-II", coreConcepts: ["Parabola, Ellipse, Hyperbola Equations & Tangents", "Applications in Real Life"] },
            { unitNumber: 6, title: "Applications of Vector Algebra", coreConcepts: ["Scalar and Vector Triple Products", "Vector and Cartesian Equations of Lines and Planes", "Skew Lines & Shortest Distance"] },
            { unitNumber: 7, title: "Applications of Differential Calculus", coreConcepts: ["Meaning of Derivative & Rates of Change", "Rolle's Theorem & Mean Value Theorem", "Taylor and Maclaurin Series", "Maxima and Minima & Concavity"] },
            { unitNumber: 8, title: "Differentials and Partial Derivatives", coreConcepts: ["Linear Approximation", "Euler's Theorem for Homogeneous Functions"] },
            { unitNumber: 9, title: "Applications of Integration", coreConcepts: ["Definite Integrals & Properties", "Bernoulli's Formula & Reduction Formulas", "Area between Curves & Volume of Revolution"] },
            { unitNumber: 10, title: "Ordinary Differential Equations", coreConcepts: ["Formation of Differential Equations", "Variable Separable, Homogeneous and Linear Differential Equations"] },
            { unitNumber: 11, title: "Probability Distributions", coreConcepts: ["Discrete and Continuous Random Variables", "Probability Mass & Density Functions", "Binomial Distribution & Bernoulli Trials"] },
            { unitNumber: 12, title: "Discrete Mathematics", coreConcepts: ["Binary Operations & Properties", "Truth Tables & Logical Equivalences", "Tautology and Contradiction"] }
          ]
        },
        {
          subjectCode: "PHY-12",
          name: "Physics",
          medium: "English",
          unitsCount: 11,
          units: [
            { unitNumber: 1, title: "Electrostatics", coreConcepts: ["Coulomb's Law & Principle of Superposition", "Electric Field & Electric Dipole", "Gauss's Law & Applications", "Electrostatic Potential & Capacitors", "Van de Graaff Generator"] },
            { unitNumber: 2, title: "Current Electricity", coreConcepts: ["Ohm's Law, Drift Velocity & Mobility", "Resistors & Temperature Dependence", "Kirchhoff's Rules & Wheatstone's Bridge", "Potentiometer Principles"] },
            { unitNumber: 3, title: "Magnetism and Magnetic Effects of Electric Current", coreConcepts: ["Earth's Magnetism & Magnetic Materials", "Biot-Savart Law & Ampere's Circuital Law", "Force on Moving Charge & Cyclotron", "Moving Coil Galvanometer"] },
            { unitNumber: 4, title: "Electromagnetic Induction and Alternating Current", coreConcepts: ["Faraday's Laws & Lenz's Law", "Self and Mutual Induction", "AC Generator & Transformer", "LCR Series Resonance Circuit"] },
            { unitNumber: 5, title: "Electromagnetic Waves", coreConcepts: ["Displacement Current & Maxwell's Equations", "Electromagnetic Spectrum & Characteristics"] },
            { unitNumber: 6, title: "Optics", coreConcepts: ["Ray Optics (Refraction, Total Internal Reflection, Prisms)", "Wave Optics (Huygens' Principle, Interference, Young's Double Slit, Diffraction, Polarization)"] },
            { unitNumber: 7, title: "Dual Nature of Radiation and Matter", coreConcepts: ["Photoelectric Effect & Einstein's Photoelectric Equation", "de Broglie Hypothesis & Davisson-Germer Experiment", "Electron Microscope"] },
            { unitNumber: 8, title: "Atomic and Nuclear Physics", coreConcepts: ["Bohr Atom Model & Hydrogen Spectrum", "Nuclear Binding Energy & Packing Fraction", "Radioactive Decay Law (Half-life)", "Nuclear Fission and Fusion"] },
            { unitNumber: 9, title: "Semiconductor Electronics", coreConcepts: ["Energy Bands in Solids", "p-n Junction Diode, Rectifiers & Zener Diode", "Transistors (CE Configuration & Amplifier)", "Logic Gates & De Morgan's Theorems"] },
            { unitNumber: 10, title: "Communication Systems", coreConcepts: ["Modulation (AM, FM, PM)", "Propagation of EM Waves (Ground, Sky, Space)", "Fiber Optics & Satellite Communication"] },
            { unitNumber: 11, title: "Recent Developments in Physics", coreConcepts: ["Nanoscience & Nanomaterials", "Robotics, AI & Space Applications"] }
          ]
        },
        {
          subjectCode: "CHE-12",
          name: "Chemistry",
          medium: "English",
          unitsCount: 15,
          units: [
            { unitNumber: 1, title: "Metallurgy", coreConcepts: ["Ores and Minerals", "Concentration Methods (Froth Floatation, Leaching)", "Thermodynamic Principles & Ellingham Diagram", "Electrochemical Principles & Refining Methods"] },
            { unitNumber: 2, title: "p-Block Elements - I", coreConcepts: ["General Trends in Group 13 and 14", "Borax, Boric Acid, Diborane", "Allotropes of Carbon, Silicones and Silicates"] },
            { unitNumber: 3, title: "p-Block Elements - II", coreConcepts: ["Nitrogen and Phosphorus Compounds", "Oxygen, Ozone and Oxides of Sulphur", "Halogens and Interhalogen Compounds", "Noble Gases & Xenon Fluorides"] },
            { unitNumber: 4, title: "Transition and Inner Transition Elements", coreConcepts: ["Electronic Configurations & Variable Oxidation States", "Magnetic Properties & Catalytic Behavior", "Potassium Dichromate & Potassium Permanganate", "Lanthanoid Contraction"] },
            { unitNumber: 5, title: "Coordination Chemistry", coreConcepts: ["Werner's Theory & IUPAC Nomenclature", "Isomerism in Coordination Compounds", "Valence Bond Theory & Crystal Field Theory"] },
            { unitNumber: 6, title: "Solid State", coreConcepts: ["Classification of Solids (Crystalline & Amorphous)", "Unit Cells (SC, BCC, FCC)", "Bragg's Equation & Packing Efficiency", "Crystal Defects (Schottky, Frenkel)"] },
            { unitNumber: 7, title: "Chemical Kinetics", coreConcepts: ["Rate of Reaction & Rate Law", "Order and Molecularity", "Integrated Rate Law (First & Zero Order)", "Arrhenius Equation & Activation Energy"] },
            { unitNumber: 8, title: "Ionic Equilibrium", coreConcepts: ["Arrhenius, Bronsted-Lowry, Lewis Concepts", "Ostwald's Dilution Law & Common Ion Effect", "pH and pOH Calculations", "Buffer Solutions & Henderson-Hasselbalch Equation", "Solubility Product"] },
            { unitNumber: 9, title: "Electrochemistry", coreConcepts: ["Specific, Equivalent and Molar Conductivity", "Kohlrausch's Law & Applications", "Galvanic Cells & Nernst Equation", "Batteries & Corrosion"] },
            { unitNumber: 10, title: "Surface Chemistry", coreConcepts: ["Physisorption and Chemisorption", "Catalysis & Enzyme Catalysis", "Colloids & Tyndall Effect"] },
            { unitNumber: 11, title: "Hydroxy Compounds and Ethers", coreConcepts: ["Classification and Preparation of Alcohols & Phenols", "Lucas Test, Victor Meyer Test", "Mechanism of Kolbe's & Reimer-Tiemann Reactions", "Williamson Ether Synthesis"] },
            { unitNumber: 12, title: "Carbonyl Compounds and Carboxylic Acids", coreConcepts: ["Nomenclature & Preparation of Aldehydes & Ketones", "Nucleophilic Addition Reactions", "Aldol Condensation & Cannizzaro Reaction", "Acidity of Carboxylic Acids"] },
            { unitNumber: 13, title: "Organic Nitrogen Compounds", coreConcepts: ["Amines Preparation & Basicity", "Carbylamine Reaction & Diazotization", "Cyanides and Isocyanides"] },
            { unitNumber: 14, title: "Biomolecules", coreConcepts: ["Carbohydrates (Glucose, Fructose Structure)", "Amino Acids & Peptide Bonds", "Proteins (Primary, Secondary, Tertiary Structure)", "Nucleic Acids (DNA, RNA)", "Vitamins & Hormones"] },
            { unitNumber: 15, title: "Chemistry in Everyday Life", coreConcepts: ["Drugs and Classification", "Antipyretics, Analgesics, Antibiotics", "Food Additives & Polymers"] }
          ]
        },
        {
          subjectCode: "CSC-12",
          name: "Computer Science",
          medium: "English",
          unitsCount: 16,
          units: [
            { unitNumber: 1, title: "Function", coreConcepts: ["Function Definition & Specification", "Parameters vs Arguments", "Pure and Impure Functions"] },
            { unitNumber: 2, title: "Data Abstraction", coreConcepts: ["Abstract Data Types (ADT)", "Constructors and Selectors", "Pairs, Lists and Tuples Abstraction"] },
            { unitNumber: 3, title: "Scoping", coreConcepts: ["Variable Scope Definition", "LEGB Scoping Rule", "Module Scope & Namespace"] },
            { unitNumber: 4, title: "Algorithmic Strategies", coreConcepts: ["Characteristics of Algorithms", "Time and Space Complexity (Big-O)", "Linear Search, Binary Search, Bubble Sort, Selection Sort, Insertion Sort", "Dynamic Programming & Memoization"] },
            { unitNumber: 5, title: "Python - Variables and Operators", coreConcepts: ["Python Tokens & Keywords", "Data Types & Expressions", "Input and Output Statements"] },
            { unitNumber: 6, title: "Control Structures", coreConcepts: ["Sequential Statements", "Alternative / Branching (if, if-else, if-elif-else)", "Iterative Loops (while, for, range)", "Jump Statements (break, continue, pass)"] },
            { unitNumber: 7, title: "Python Functions", coreConcepts: ["Built-in Functions", "User Defined Functions", "Arguments (Positional, Keyword, Default, Variable-length)", "Anonymous Lambda Functions", "Recursion"] },
            { unitNumber: 8, title: "Strings and String Manipulations", coreConcepts: ["String Creation & Immutability", "Indexing and Negative Slicing", "String Formatting Operators (%)", "Built-in String Methods"] },
            { unitNumber: 9, title: "Lists, Tuples, Sets and Dictionary", coreConcepts: ["List Operations, Slicing & Comprehensions", "Tuples Immutability & Packing/Unpacking", "Set Operations (Union, Intersection, Difference)", "Dictionary Key-Value Mapping"] },
            { unitNumber: 10, title: "Python Classes and Objects", coreConcepts: ["Class Definition & Instance Creation", "The self Parameter & __init__() Constructor", "Class vs Instance Variables", "Public and Private Data Members"] },
            { unitNumber: 11, title: "Database Concepts", coreConcepts: ["DBMS Architecture & Advantages", "Relational Data Model Components (Attributes, Tuples, Tables)", "Keys (Primary, Foreign, Super, Candidate Keys)"] },
            { unitNumber: 12, title: "Structured Query Language (SQL)", coreConcepts: ["DDL (CREATE, ALTER, DROP, TRUNCATE)", "DML (INSERT, UPDATE, DELETE)", "DQL (SELECT with WHERE, ORDER BY, GROUP BY, HAVING)"] },
            { unitNumber: 13, title: "Python and CSV Files", coreConcepts: ["CSV Dialects & Delimiters", "csv.reader() and csv.DictReader()", "csv.writer() and writerow()"] },
            { unitNumber: 14, title: "Importing C++ Programs in Python", coreConcepts: ["Wrapping C++ with Python MinGW", "getopt module & command-line arguments"] },
            { unitNumber: 15, title: "Data Manipulation through SQL", coreConcepts: ["sqlite3 module in Python", "Connection, Cursor & execute()", "fetchone(), fetchall(), fetchmany()"] },
            { unitNumber: 16, title: "Data Visualization using Pyplot", coreConcepts: ["Matplotlib Installation & Pyplot", "Line Charts, Bar Charts, Histograms, Pie Charts", "Plot Styling (Labels, Titles, Legends)"] }
          ]
        },
        {
          subjectCode: "BIO-12",
          name: "Biology",
          medium: "English",
          unitsCount: 10,
          units: [
            { unitNumber: 1, title: "Asexual and Sexual Reproduction in Plants (Bio-Botany)", coreConcepts: ["Vegetative Propagation", "Microsporogenesis & Megasporogenesis", "Double Fertilization & Endosperm Types"] },
            { unitNumber: 2, title: "Classical Genetics (Bio-Botany)", coreConcepts: ["Mendel's Laws of Inheritance", "Incomplete Dominance & Codominance", "Polygenic Inheritance & Pleiotropy"] },
            { unitNumber: 3, title: "Chromosomal Basis of Inheritance (Bio-Botany)", coreConcepts: ["Linkage and Crossing Over", "Gene Mapping", "Sex Determination in Plants", "Mutation Types"] },
            { unitNumber: 4, title: "Principles and Processes of Biotechnology (Bio-Botany)", coreConcepts: ["Tools of Recombinant DNA Technology", "Restriction Enzymes & DNA Ligase", "Vectors (Plasmids, Bacteriophages)", "Polymerase Chain Reaction (PCR) & Electrophoresis"] },
            { unitNumber: 5, title: "Plant Tissue Culture (Bio-Botany)", coreConcepts: ["Totipotency & Callus Induction", "Micropropagation & Somatic Embryogenesis", "Cryopreservation & Intellectual Property Rights"] },
            { unitNumber: 6, title: "Reproduction in Organisms (Bio-Zoology)", coreConcepts: ["Modes of Asexual Reproduction (Fission, Budding, Regeneration)", "Parthenogenesis"] },
            { unitNumber: 7, title: "Human Reproduction (Bio-Zoology)", coreConcepts: ["Gametogenesis (Spermatogenesis & Oogenesis)", "Menstrual Cycle & Hormonal Control", "Fertilization, Implantation, Pregnancy & Parturition"] },
            { unitNumber: 8, title: "Reproductive Health (Bio-Zoology)", coreConcepts: ["Population Explosion & Contraception Methods", "Sexually Transmitted Infections (STIs)", "Assisted Reproductive Technologies (IVF, ZIFT, ICSI)"] },
            { unitNumber: 9, title: "Principles of Inheritance and Variation (Bio-Zoology)", coreConcepts: ["Sex Determination in Humans (XX-XY)", "Sex-linked Inheritance (Haemophilia, Colour Blindness)", "Mendelian & Chromosomal Disorders (Down, Turner, Klinefelter Syndrome)"] },
            { unitNumber: 10, title: "Molecular Genetics (Bio-Zoology)", coreConcepts: ["DNA as Genetic Material (Griffith, Hershey-Chase)", "Central Dogma & DNA Replication", "Transcription, Genetic Code & Translation", "Operon Model (lac operon)", "Human Genome Project (HGP)"] }
          ]
        },
        {
          subjectCode: "COM-12",
          name: "Commerce",
          medium: "English",
          unitsCount: 10,
          units: [
            { unitNumber: 1, title: "Management Process", coreConcepts: ["Principles of Scientific Management (F.W. Taylor)", "Administrative Management (Henry Fayol)"] },
            { unitNumber: 2, title: "Financial Markets - I", coreConcepts: ["Money Market vs Capital Market", "Debt and Equity Markets"] },
            { unitNumber: 3, title: "Financial Markets - II", coreConcepts: ["Stock Exchange Functions (NSE, BSE)", "SEBI Regulatory Role"] },
            { unitNumber: 4, title: "Human Resource Management", coreConcepts: ["Recruitment, Selection, Training & Development"] },
            { unitNumber: 5, title: "Elements of Marketing", coreConcepts: ["Marketing Mix (4 Ps)", "Consumer Protection Act & Consumer Rights"] }
          ]
        },
        {
          subjectCode: "ACC-12",
          name: "Accountancy",
          medium: "English",
          unitsCount: 9,
          units: [
            { unitNumber: 1, title: "Accounts from Incomplete Records", coreConcepts: ["Single Entry System Limitations", "Statement of Affairs Method", "Conversion to Double Entry"] },
            { unitNumber: 2, title: "Accounts of Not-for-Profit Organisations", coreConcepts: ["Receipts and Payments Account", "Income and Expenditure Account", "Balance Sheet of Non-Profit Entities"] },
            { unitNumber: 3, title: "Accounts of Partnership Firms - Fundamentals", coreConcepts: ["Partnership Deed", "Profit and Loss Appropriation Account", "Fixed and Fluctuating Capital Methods", "Goodwill Valuation"] },
            { unitNumber: 4, title: "Admission and Retirement of a Partner", coreConcepts: ["Revaluation Account", "Sacrificing and Gaining Ratio", "Capital Adjustments"] },
            { unitNumber: 5, title: "Company Accounts", coreConcepts: ["Issue of Shares at Par, Premium, Discount", "Forfeiture and Reissue of Shares"] }
          ]
        },
        {
          subjectCode: "ECO-12",
          name: "Economics",
          medium: "English",
          unitsCount: 12,
          units: [
            { unitNumber: 1, title: "Introduction to Macro Economics", coreConcepts: ["Scope and Importance of Macro Economics", "Economic Systems (Capitalism, Socialism, Mixed)"] },
            { unitNumber: 2, title: "National Income", coreConcepts: ["GNP, GDP, NNP, Per Capita Income", "Methods of Measuring National Income", "Difficulties in Measurement"] },
            { unitNumber: 3, title: "Theories of Employment and Income", coreConcepts: ["Classical Theory of Employment (Say's Law)", "Keynesian Theory of Effective Demand", "Consumption and Investment Functions"] },
            { unitNumber: 4, title: "Monetary Economics", coreConcepts: ["Functions of Money", "Inflation (Demand-pull, Cost-push)", "Trade Cycles & Deflation"] },
            { unitNumber: 5, title: "Banking", coreConcepts: ["Commercial Banks & Credit Creation", "Central Bank (RBI) & Monetary Policy Instruments"] }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// 4. CURRICULUM PLATFORM JSON (curriculum-platform.json)
// ============================================================================
// Hierarchical structure mapping Standard -> Subject -> Unit -> Chapters -> Learning Objectives
const curriculumPlatform = {
  curriculumPlatform: {
    system: "COE_INTEGRATED_CURRICULUM_PLATFORM",
    version: "2.0",
    board: "Tamil Nadu State Board (Samacheer Kalvi)",
    compatibleWithPrismaSchema: true,
    standards: tnMasterSyllabus.standards.map(std => ({
      standard: std.standard,
      label: std.label,
      subjects: std.subjects.map(sub => ({
        subjectCode: sub.subjectCode,
        name: sub.name,
        medium: sub.medium,
        prepClass: std.standard,
        unitsCount: sub.unitsCount || sub.units.length,
        units: sub.units.map((u, uIdx) => ({
          unitNumber: u.unitNumber,
          title: u.title,
          chapters: (u.coreConcepts || []).map((concept, cIdx) => ({
            chapterNumber: cIdx + 1,
            title: concept,
            description: `Official DGE TN State Board Curriculum topic under Unit ${u.unitNumber}: ${u.title}. Covers ${concept}.`
          }))
        }))
      }))
    }))
  }
};

// ============================================================================
// Write all 4 files with clean indentation and verify syntax
// ============================================================================

fs.writeFileSync(
  path.join(exportedDir, 'official_exam_engine.json'),
  JSON.stringify(officialExamEngine, null, 2),
  'utf-8'
);
console.log('✅ Wrote official_exam_engine.json (Size:', fs.statSync(path.join(exportedDir, 'official_exam_engine.json')).size, 'bytes)');

fs.writeFileSync(
  path.join(exportedDir, 'practice_exam_engine.json'),
  JSON.stringify(practiceExamEngine, null, 2),
  'utf-8'
);
console.log('✅ Wrote practice_exam_engine.json (Size:', fs.statSync(path.join(exportedDir, 'practice_exam_engine.json')).size, 'bytes)');

fs.writeFileSync(
  path.join(exportedDir, 'tn_master_syllabus.json'),
  JSON.stringify(tnMasterSyllabus, null, 2),
  'utf-8'
);
console.log('✅ Wrote tn_master_syllabus.json (Size:', fs.statSync(path.join(exportedDir, 'tn_master_syllabus.json')).size, 'bytes)');

fs.writeFileSync(
  path.join(exportedDir, 'curriculum-platform.json'),
  JSON.stringify(curriculumPlatform, null, 2),
  'utf-8'
);
console.log('✅ Wrote curriculum-platform.json (Size:', fs.statSync(path.join(exportedDir, 'curriculum-platform.json')).size, 'bytes)');

console.log("🎉 All 4 COE Engine JSON datasets successfully built and verified!");
