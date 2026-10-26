const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const examsData = [
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2026-03-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "Which of the following is an organized collection of data?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Database" },
          { "id": "B", "text": "DBMS" },
          { "id": "C", "text": "SQL" },
          { "id": "D", "text": "Table" }
        ],
        "correctAnswer": "A",
        "explanation": "A database is an organized collection of data stored and accessed electronically from a computer system."
      },
      {
        "questionNumber": 2,
        "questionText": "The private members of a class can be accessed from outside the class using:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Public functions" },
          { "id": "B", "text": "Private functions" },
          { "id": "C", "text": "Scope resolution operator" },
          { "id": "D", "text": "Directly" }
        ],
        "correctAnswer": "A",
        "explanation": "Private members cannot be accessed directly from outside the class; they must be accessed through public member functions."
      },
      {
        "questionNumber": 3,
        "questionText": "Which of the following algorithm design techniques uses a top-down approach?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Divide and Conquer" },
          { "id": "B", "text": "Dynamic Programming" },
          { "id": "C", "text": "Greedy Approach" },
          { "id": "D", "text": "Backtracking" }
        ],
        "correctAnswer": "A",
        "explanation": "Divide and conquer algorithms break down a problem into subproblems (top-down), solve each subproblem, and combine solutions."
      },
      {
        "questionNumber": 4,
        "questionText": "What is the worst-case time complexity of Bubble Sort?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "O(n)" },
          { "id": "B", "text": "O(n log n)" },
          { "id": "C", "text": "O(n^2)" },
          { "id": "D", "text": "O(1)" }
        ],
        "correctAnswer": "C",
        "explanation": "Bubble Sort performs n*(n-1)/2 comparisons in the worst case, giving a quadratic time complexity of O(n^2)."
      },
      {
        "questionNumber": 5,
        "questionText": "Which operator is used for Exponentiation in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "*" },
          { "id": "B", "text": "**" },
          { "id": "C", "text": "^" },
          { "id": "D", "text": "//" }
        ],
        "correctAnswer": "B",
        "explanation": "The ** operator computes power/exponentiation in Python (e.g., 2 ** 3 = 8)."
      },
      {
        "questionNumber": 6,
        "questionText": "Which control statement in Python is used as a placeholder for future code?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "break" },
          { "id": "B", "text": "continue" },
          { "id": "C", "text": "pass" },
          { "id": "D", "text": "exit" }
        ],
        "correctAnswer": "C",
        "explanation": "The pass statement is a null operation in Python used as a placeholder."
      },
      {
        "questionNumber": 7,
        "questionText": "In Python, which function is used to find the length of a string/list?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "length()" },
          { "id": "B", "text": "size()" },
          { "id": "C", "text": "len()" },
          { "id": "D", "text": "count()" }
        ],
        "correctAnswer": "C",
        "explanation": "The built-in len() function returns the number of items in an object."
      },
      {
        "questionNumber": 8,
        "questionText": "Which data type in Python is immutable?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "List" },
          { "id": "B", "text": "Dictionary" },
          { "id": "C", "text": "Set" },
          { "id": "D", "text": "Tuple" }
        ],
        "correctAnswer": "D",
        "explanation": "Tuples cannot be modified after their creation; hence they are immutable."
      },
      {
        "questionNumber": 9,
        "questionText": "Which class method is automatically executed when an object of a class is created in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "__init__()" },
          { "id": "B", "text": "__del__()" },
          { "id": "C", "text": "__new__()" },
          { "id": "D", "text": "__create__()" }
        ],
        "correctAnswer": "A",
        "explanation": "The __init__() method acts as the constructor and executes upon instantiation."
      },
      {
        "questionNumber": 10,
        "questionText": "What is the full form of DBMS?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Data Base Management System" },
          { "id": "B", "text": "Data Management System" },
          { "id": "C", "text": "Database Mining System" },
          { "id": "D", "text": "Database Multiple System" }
        ],
        "correctAnswer": "A",
        "explanation": "DBMS stands for Data Base Management System."
      },
      {
        "questionNumber": 11,
        "questionText": "Which key uniquely identifies each record in a relational table?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Foreign Key" },
          { "id": "B", "text": "Primary Key" },
          { "id": "C", "text": "Candidate Key" },
          { "id": "D", "text": "Alternate Key" }
        ],
        "correctAnswer": "B",
        "explanation": "A Primary Key uniquely identifies every record in a table without duplicates or nulls."
      },
      {
        "questionNumber": 12,
        "questionText": "Which SQL command is used to remove a table permanently from a database?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "DELETE" },
          { "id": "B", "text": "TRUNCATE" },
          { "id": "C", "text": "DROP" },
          { "id": "D", "text": "REMOVE" }
        ],
        "correctAnswer": "C",
        "explanation": "DROP TABLE removes the entire table definition along with all of its data."
      },
      {
        "questionNumber": 13,
        "questionText": "Which CSV module function is used to write data into a CSV file line by line?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "writerow()" },
          { "id": "B", "text": "writeall()" },
          { "id": "C", "text": "append()" },
          { "id": "D", "text": "writer()" }
        ],
        "correctAnswer": "A",
        "explanation": "The writerow() method writes a single sequence of data as a row in CSV."
      },
      {
        "questionNumber": 14,
        "questionText": "Which Python module provides functions for interfacing with the operating system?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "sys" },
          { "id": "B", "text": "os" },
          { "id": "C", "text": "getopt" },
          { "id": "D", "text": "csv" }
        ],
        "correctAnswer": "B",
        "explanation": "The os module provides a portable way of using operating system dependent functionality."
      },
      {
        "questionNumber": 15,
        "questionText": "__________ function returns the largest value of the selected column.",
        "marks": 1,
        "options": [
          { "id": "A", "text": "HIGH()" },
          { "id": "B", "text": "MAX()" },
          { "id": "C", "text": "MAXIMUM()" },
          { "id": "D", "text": "LARGE()" }
        ],
        "correctAnswer": "B",
        "explanation": "In SQL, MAX() returns the highest value in the designated column."
      }
    ]
  },
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2025-03-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "Which of the following is a distinct block of code with a unique syntax?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Subroutines" },
          { "id": "B", "text": "Functions" },
          { "id": "C", "text": "Modules" },
          { "id": "D", "text": "Statements" }
        ],
        "correctAnswer": "B",
        "explanation": "A function is a distinct block of reusable code with a defined name and syntax."
      },
      {
        "questionNumber": 2,
        "questionText": "The variables defined inside a function block have which scope?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Global scope" },
          { "id": "B", "text": "Local scope" },
          { "id": "C", "text": "Enclosed scope" },
          { "id": "D", "text": "Built-in scope" }
        ],
        "correctAnswer": "B",
        "explanation": "Variables defined inside a function have local scope and cannot be accessed outside."
      },
      {
        "questionNumber": 3,
        "questionText": "Which of the following is an Abstract Data Type (ADT)?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "List" },
          { "id": "B", "text": "Tuple" },
          { "id": "C", "text": "Pair" },
          { "id": "D", "text": "All of these" }
        ],
        "correctAnswer": "D",
        "explanation": "List, Tuple, and Pair are all abstract data structures defined by their behaviors."
      },
      {
        "questionNumber": 4,
        "questionText": "Binary search is also called as __________.",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Random search" },
          { "id": "B", "text": "Linear search" },
          { "id": "C", "text": "Half-interval search" },
          { "id": "D", "text": "Sequential search" }
        ],
        "correctAnswer": "C",
        "explanation": "Binary search halves the search interval each step, hence called half-interval search."
      },
      {
        "questionNumber": 5,
        "questionText": "Which operator is also called as conditional operator?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Logical" },
          { "id": "B", "text": "Ternary" },
          { "id": "C", "text": "Assignment" },
          { "id": "D", "text": "Relational" }
        ],
        "correctAnswer": "B",
        "explanation": "The ternary operator evaluates conditions and returns values based on true/false."
      },
      {
        "questionNumber": 6,
        "questionText": "Which loop in Python is an entry-controlled loop?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "while" },
          { "id": "B", "text": "do-while" },
          { "id": "C", "text": "switch" },
          { "id": "D", "text": "for and while" }
        ],
        "correctAnswer": "D",
        "explanation": "Both for and while test conditions before executing the body (entry-controlled)."
      },
      {
        "questionNumber": 7,
        "questionText": "What will be the output of print(abs(-15.5)) in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "-15.5" },
          { "id": "B", "text": "15.5" },
          { "id": "C", "text": "15" },
          { "id": "D", "text": "-15" }
        ],
        "correctAnswer": "B",
        "explanation": "The abs() function returns the non-negative magnitude, 15.5."
      },
      {
        "questionNumber": 8,
        "questionText": "Which Python function removes all elements from a list?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "remove()" },
          { "id": "B", "text": "pop()" },
          { "id": "C", "text": "clear()" },
          { "id": "D", "text": "del" }
        ],
        "correctAnswer": "C",
        "explanation": "The clear() method empties the list entirely."
      },
      {
        "questionNumber": 9,
        "questionText": "Which of the following is the output of str1='Computer Science'; print(str1[::-1])?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "ecneicS retupmoC" },
          { "id": "B", "text": "Computer Science" },
          { "id": "C", "text": "eniS eumC" },
          { "id": "D", "text": "Cmue Sine" }
        ],
        "correctAnswer": "A",
        "explanation": "The slice [::-1] reverses the string from right to left."
      },
      {
        "questionNumber": 10,
        "questionText": "Variables defined inside a class in Python are called:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Attributes / Class variables" },
          { "id": "B", "text": "Global variables" },
          { "id": "C", "text": "Local variables" },
          { "id": "D", "text": "Constants" }
        ],
        "correctAnswer": "A",
        "explanation": "Variables defined at class level are called class attributes or variables."
      },
      {
        "questionNumber": 11,
        "questionText": "A tuple in RDBMS is also referred to as a:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Attribute" },
          { "id": "B", "text": "Row / Record" },
          { "id": "C", "text": "Table" },
          { "id": "D", "text": "Domain" }
        ],
        "correctAnswer": "B",
        "explanation": "In relational theory, a tuple corresponds to a single row or record in a table."
      },
      {
        "questionNumber": 12,
        "questionText": "Which SQL statement is used to modify existing records in a table?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "ALTER" },
          { "id": "B", "text": "MODIFY" },
          { "id": "C", "text": "UPDATE" },
          { "id": "D", "text": "CHANGE" }
        ],
        "correctAnswer": "C",
        "explanation": "UPDATE modifies the values of existing columns in specified rows."
      },
      {
        "questionNumber": 13,
        "questionText": "Making changes in the data of an existing file or adding data is called:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Modification" },
          { "id": "B", "text": "Editing" },
          { "id": "C", "text": "Alteration" },
          { "id": "D", "text": "Appending" }
        ],
        "correctAnswer": "D",
        "explanation": "Adding data to the end of an existing file without overwriting is appending."
      },
      {
        "questionNumber": 14,
        "questionText": "The module which allows to interface with the Windows operating system is:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "csv module" },
          { "id": "B", "text": "OS module" },
          { "id": "C", "text": "getopt module" },
          { "id": "D", "text": "sys module" }
        ],
        "correctAnswer": "B",
        "explanation": "The os module provides access to operating system services and commands."
      },
      {
        "questionNumber": 15,
        "questionText": "Which of the following keyword is used to eliminate duplicate rows in SQL?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Where" },
          { "id": "B", "text": "Distinct" },
          { "id": "C", "text": "Unique" },
          { "id": "D", "text": "Filter" }
        ],
        "correctAnswer": "B",
        "explanation": "SELECT DISTINCT removes duplicate rows from the query output."
      }
    ]
  },
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2024-03-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "Which of the following is used to describe the worst case of an algorithm?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Big W" },
          { "id": "B", "text": "Big A" },
          { "id": "C", "text": "Big O" },
          { "id": "D", "text": "Big S" }
        ],
        "correctAnswer": "C",
        "explanation": "Big O notation represents the asymptotic upper bound describing the worst-case scenario."
      },
      {
        "questionNumber": 2,
        "questionText": "How is a data type whose representation is unknown called?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Concrete datatype" },
          { "id": "B", "text": "Built-in datatype" },
          { "id": "C", "text": "Abstract datatype" },
          { "id": "D", "text": "Derived datatype" }
        ],
        "correctAnswer": "C",
        "explanation": "An Abstract Data Type (ADT) is defined by its behavior without exposing underlying representation."
      },
      {
        "questionNumber": 3,
        "questionText": "Which of the following scope refers to variables defined at the outermost level of a program?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Local" },
          { "id": "B", "text": "Global" },
          { "id": "C", "text": "Enclosed" },
          { "id": "D", "text": "Built-in" }
        ],
        "correctAnswer": "B",
        "explanation": "Global variables are declared outside all functions and accessible throughout the module."
      },
      {
        "questionNumber": 4,
        "questionText": "Which of the following is a dynamic programming algorithm technique?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Greedy method" },
          { "id": "B", "text": "Divide and Conquer" },
          { "id": "C", "text": "Memoization" },
          { "id": "D", "text": "Linear Search" }
        ],
        "correctAnswer": "C",
        "explanation": "Memoization caches the results of expensive function calls for reused subproblems."
      },
      {
        "questionNumber": 5,
        "questionText": "Which of the following security technique regulates who can view or use resources in a computing environment?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Access control" },
          { "id": "B", "text": "Password" },
          { "id": "C", "text": "Certification" },
          { "id": "D", "text": "Authentication" }
        ],
        "correctAnswer": "A",
        "explanation": "Access control regulates which users or systems can access specific resources."
      },
      {
        "questionNumber": 6,
        "questionText": "Which of the following is the slicing operator in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "< >" },
          { "id": "B", "text": "{ }" },
          { "id": "C", "text": "( )" },
          { "id": "D", "text": "[ ]" }
        ],
        "correctAnswer": "D",
        "explanation": "The square brackets [start:stop:step] are used for sequence slicing."
      },
      {
        "questionNumber": 7,
        "questionText": "What is the default parameter value for end in print() function of Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "\\n" },
          { "id": "B", "text": "\\t" },
          { "id": "C", "text": "space" },
          { "id": "D", "text": "comma" }
        ],
        "correctAnswer": "A",
        "explanation": "By default, print() appends a newline character '\\n' at the end."
      },
      {
        "questionNumber": 8,
        "questionText": "Which operator is used to concatenate two tuples in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "+" },
          { "id": "B", "text": "*" },
          { "id": "C", "text": "&" },
          { "id": "D", "text": "append" }
        ],
        "correctAnswer": "A",
        "explanation": "The addition operator + joins two tuples into a new tuple."
      },
      {
        "questionNumber": 9,
        "questionText": "Which statement is used to handle exceptions in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "try...except" },
          { "id": "B", "text": "if...else" },
          { "id": "C", "text": "do...while" },
          { "id": "D", "text": "switch...case" }
        ],
        "correctAnswer": "A",
        "explanation": "try...except catches runtime exceptions and allows graceful recovery."
      },
      {
        "questionNumber": 10,
        "questionText": "Which data model represents data as a collection of tables?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Hierarchical model" },
          { "id": "B", "text": "Network model" },
          { "id": "C", "text": "Relational model" },
          { "id": "D", "text": "Object-oriented model" }
        ],
        "correctAnswer": "C",
        "explanation": "The relational data model represents data and relationships as two-dimensional relations (tables)."
      },
      {
        "questionNumber": 11,
        "questionText": "What does DDL stand for in SQL?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Data Definition Language" },
          { "id": "B", "text": "Data Description Language" },
          { "id": "C", "text": "Data Design Language" },
          { "id": "D", "text": "Data Detail Language" }
        ],
        "correctAnswer": "A",
        "explanation": "DDL stands for Data Definition Language (e.g., CREATE, ALTER, DROP)."
      },
      {
        "questionNumber": 12,
        "questionText": "Which method in Python is used to read a single line from a file?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "read()" },
          { "id": "B", "text": "readline()" },
          { "id": "C", "text": "readlines()" },
          { "id": "D", "text": "readone()" }
        ],
        "correctAnswer": "B",
        "explanation": "readline() reads until the next newline character and returns the line as a string."
      },
      {
        "questionNumber": 13,
        "questionText": "What is the output of snippet: for x in range(5): if x==2: continue; print(x, end=' ')?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "0 1 3 4" },
          { "id": "B", "text": "0 1 2" },
          { "id": "C", "text": "0 1 2 3 4" },
          { "id": "D", "text": "0 1 2 3" }
        ],
        "correctAnswer": "A",
        "explanation": "The continue statement skips iteration x=2, printing 0 1 3 4."
      },
      {
        "questionNumber": 14,
        "questionText": "__________ is a collection of resources assembled to create a single unified visual display.",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Objects" },
          { "id": "B", "text": "Interface" },
          { "id": "C", "text": "Graphics" },
          { "id": "D", "text": "Dashboard" }
        ],
        "correctAnswer": "D",
        "explanation": "A Dashboard brings together key metrics and controls into a single display."
      },
      {
        "questionNumber": 15,
        "questionText": "The clause used to sort data in a database:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "GROUP BY" },
          { "id": "B", "text": "SORT BY" },
          { "id": "C", "text": "SELECT" },
          { "id": "D", "text": "ORDER BY" }
        ],
        "correctAnswer": "D",
        "explanation": "ORDER BY sorts the returned records in ascending (ASC) or descending (DESC) order."
      }
    ]
  },
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2023-03-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "Public members of a class can be accessed from:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Inside the class only" },
          { "id": "B", "text": "Outside the class" },
          { "id": "C", "text": "Derived class only" },
          { "id": "D", "text": "Nowhere" }
        ],
        "correctAnswer": "B",
        "explanation": "Public members are globally accessible from outside the class boundary."
      },
      {
        "questionNumber": 2,
        "questionText": "Which function binds a value to a name in programming?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Definition" },
          { "id": "B", "text": "Assignment / Mapping" },
          { "id": "C", "text": "Declaration" },
          { "id": "D", "text": "Execution" }
        ],
        "correctAnswer": "B",
        "explanation": "Assignment binds an expression value to a variable identifier."
      },
      {
        "questionNumber": 3,
        "questionText": "The time complexity of Linear Search in worst case is:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "O(1)" },
          { "id": "B", "text": "O(log n)" },
          { "id": "C", "text": "O(n)" },
          { "id": "D", "text": "O(n^2)" }
        ],
        "correctAnswer": "C",
        "explanation": "In the worst case, linear search checks all n elements, having O(n) complexity."
      },
      {
        "questionNumber": 4,
        "questionText": "Which Python keyword is used to define a function?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "function" },
          { "id": "B", "text": "def" },
          { "id": "C", "text": "define" },
          { "id": "D", "text": "func" }
        ],
        "correctAnswer": "B",
        "explanation": "The def keyword starts a function definition block in Python."
      },
      {
        "questionNumber": 5,
        "questionText": "Which formatting operator is used for string substitution in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "%" },
          { "id": "B", "text": "&" },
          { "id": "C", "text": "$" },
          { "id": "D", "text": "#" }
        ],
        "correctAnswer": "A",
        "explanation": "The % operator performs printf-style string formatting."
      },
      {
        "questionNumber": 6,
        "questionText": "Which dictionary method returns all keys in a Python dictionary?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "get()" },
          { "id": "B", "text": "keys()" },
          { "id": "C", "text": "values()" },
          { "id": "D", "text": "items()" }
        ],
        "correctAnswer": "B",
        "explanation": "dict.keys() returns a dynamic view of all keys in the dictionary."
      },
      {
        "questionNumber": 7,
        "questionText": "In which input field only one option can be selected?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Radio button" },
          { "id": "B", "text": "Text box" },
          { "id": "C", "text": "Drop Down Menu" },
          { "id": "D", "text": "Check box" }
        ],
        "correctAnswer": "A",
        "explanation": "Radio buttons are mutually exclusive, permitting only one selection per group."
      },
      {
        "questionNumber": 8,
        "questionText": "Which SQL command is used to insert new records into a table?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "ADD" },
          { "id": "B", "text": "INSERT INTO" },
          { "id": "C", "text": "UPDATE" },
          { "id": "D", "text": "CREATE" }
        ],
        "correctAnswer": "B",
        "explanation": "INSERT INTO table_name VALUES (...) inserts new tuples into a table."
      },
      {
        "questionNumber": 9,
        "questionText": "Which function is used to fetch the next row of a query result set in SQLite Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "fetchone()" },
          { "id": "B", "text": "fetchall()" },
          { "id": "C", "text": "fetchnext()" },
          { "id": "D", "text": "row()" }
        ],
        "correctAnswer": "A",
        "explanation": "cursor.fetchone() retrieves the next single row of a query result set."
      },
      {
        "questionNumber": 10,
        "questionText": "The mode used when dealing with non-text files like image or exe files in Python is:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "xls mode" },
          { "id": "B", "text": "Text mode" },
          { "id": "C", "text": "csv mode" },
          { "id": "D", "text": "Binary mode" }
        ],
        "correctAnswer": "D",
        "explanation": "Binary mode ('rb'/'wb') handles raw bytes without newline translation."
      },
      {
        "questionNumber": 11,
        "questionText": "In dynamic programming, the technique of storing previously calculated values is called:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Memoization" },
          { "id": "B", "text": "Saving value property" },
          { "id": "C", "text": "Mapping" },
          { "id": "D", "text": "Storing value property" }
        ],
        "correctAnswer": "A",
        "explanation": "Memoization prevents recomputing solutions to overlapping subproblems."
      },
      {
        "questionNumber": 12,
        "questionText": "MySQL belongs to which category of DBMS?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Relational" },
          { "id": "B", "text": "Object Oriented" },
          { "id": "C", "text": "Network" },
          { "id": "D", "text": "Hierarchical" }
        ],
        "correctAnswer": "A",
        "explanation": "MySQL is a Relational Database Management System (RDBMS)."
      },
      {
        "questionNumber": 13,
        "questionText": "Recent statistics depict that 78.9% of websites are developed using which server-side scripting language?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "PHP" },
          { "id": "B", "text": "Microsoft ASP" },
          { "id": "C", "text": "CSS" },
          { "id": "D", "text": "JSP" }
        ],
        "correctAnswer": "A",
        "explanation": "PHP powers the vast majority of server-side websites."
      },
      {
        "questionNumber": 14,
        "questionText": "Which of the following is a Python package for plotting graphs and charts?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Matplotlib" },
          { "id": "B", "text": "Pip" },
          { "id": "C", "text": "Pygame" },
          { "id": "D", "text": "Tkinter" }
        ],
        "correctAnswer": "A",
        "explanation": "Matplotlib (pyplot) is Python's standard 2D data visualization library."
      },
      {
        "questionNumber": 15,
        "questionText": "Which clause in SQL is used with aggregate functions to filter group results?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "WHERE" },
          { "id": "B", "text": "HAVING" },
          { "id": "C", "text": "GROUP BY" },
          { "id": "D", "text": "ORDER BY" }
        ],
        "correctAnswer": "B",
        "explanation": "HAVING filters aggregated groups, whereas WHERE filters individual rows."
      }
    ]
  },
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2022-05-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "A sequence of instructions given to a computer to perform a specific task is called:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Algorithm" },
          { "id": "B", "text": "Program" },
          { "id": "C", "text": "Structure" },
          { "id": "D", "text": "Flowchart" }
        ],
        "correctAnswer": "B",
        "explanation": "A program is an executable sequence of instructions that commands a computer."
      },
      {
        "questionNumber": 2,
        "questionText": "Which function converts a float number to an integer in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "float()" },
          { "id": "B", "text": "int()" },
          { "id": "C", "text": "str()" },
          { "id": "D", "text": "eval()" }
        ],
        "correctAnswer": "B",
        "explanation": "The int() function truncates decimal parts and converts values to integers."
      },
      {
        "questionNumber": 3,
        "questionText": "Which symbol is used for commenting single line in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "//" },
          { "id": "B", "text": "/*" },
          { "id": "C", "text": "#" },
          { "id": "D", "text": "--" }
        ],
        "correctAnswer": "C",
        "explanation": "The # symbol denotes single-line comments in Python."
      },
      {
        "questionNumber": 4,
        "questionText": "What is the index of the last element in a Python list of length n?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "n" },
          { "id": "B", "text": "n-1" },
          { "id": "C", "text": "0" },
          { "id": "D", "text": "1" }
        ],
        "correctAnswer": "B",
        "explanation": "With zero-based indexing, a list of length n has its last element at index n-1."
      },
      {
        "questionNumber": 5,
        "questionText": "Which keyword is used to exit from a loop prematurely in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "continue" },
          { "id": "B", "text": "break" },
          { "id": "C", "text": "pass" },
          { "id": "D", "text": "return" }
        ],
        "correctAnswer": "B",
        "explanation": "The break keyword terminates the innermost enclosing loop."
      },
      {
        "questionNumber": 6,
        "questionText": "Which function generates a sequence of numbers in a loop in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "range()" },
          { "id": "B", "text": "sequence()" },
          { "id": "C", "text": "list()" },
          { "id": "D", "text": "loop()" }
        ],
        "correctAnswer": "A",
        "explanation": "range(start, stop, step) generates an immutable arithmetic sequence of integers."
      },
      {
        "questionNumber": 7,
        "questionText": "What is the extension of Python script file?",
        "marks": 1,
        "options": [
          { "id": "A", "text": ".python" },
          { "id": "B", "text": ".py" },
          { "id": "C", "text": ".pyt" },
          { "id": "D", "text": ".p" }
        ],
        "correctAnswer": "B",
        "explanation": "Python source code files use the .py file extension."
      },
      {
        "questionNumber": 8,
        "questionText": "Which set operation returns all elements present in either set A or set B?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Intersection" },
          { "id": "B", "text": "Union" },
          { "id": "C", "text": "Difference" },
          { "id": "D", "text": "Symmetric Difference" }
        ],
        "correctAnswer": "B",
        "explanation": "Union (A | B) combines all unique elements present in either set."
      },
      {
        "questionNumber": 9,
        "questionText": "Which method is called a destructor in Python classes?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "__init__()" },
          { "id": "B", "text": "__del__()" },
          { "id": "C", "text": "__destruct__()" },
          { "id": "D", "text": "__remove__()" }
        ],
        "correctAnswer": "B",
        "explanation": "The __del__() method is invoked when an instance is about to be destroyed."
      },
      {
        "questionNumber": 10,
        "questionText": "Which component of DBMS defines the database schema?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "DML" },
          { "id": "B", "text": "DDL" },
          { "id": "C", "text": "DCL" },
          { "id": "D", "text": "TCL" }
        ],
        "correctAnswer": "B",
        "explanation": "Data Definition Language (DDL) statements define the structure and schema of the database."
      },
      {
        "questionNumber": 11,
        "questionText": "Which SQL command is used to modify the structure of an existing table?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "UPDATE" },
          { "id": "B", "text": "ALTER" },
          { "id": "C", "text": "MODIFY" },
          { "id": "D", "text": "CHANGE" }
        ],
        "correctAnswer": "B",
        "explanation": "ALTER TABLE modifies existing table structure such as adding or dropping columns."
      },
      {
        "questionNumber": 12,
        "questionText": "Which Python module is used to work with CSV files?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "sys" },
          { "id": "B", "text": "os" },
          { "id": "C", "text": "csv" },
          { "id": "D", "text": "getopt" }
        ],
        "correctAnswer": "C",
        "explanation": "The built-in csv module implements classes to read and write comma separated files."
      },
      {
        "questionNumber": 13,
        "questionText": "Which file mode opens a file for reading only in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "'w'" },
          { "id": "B", "text": "'a'" },
          { "id": "C", "text": "'r'" },
          { "id": "D", "text": "'r+'" }
        ],
        "correctAnswer": "C",
        "explanation": "Mode 'r' opens the file for reading only (default mode)."
      },
      {
        "questionNumber": 14,
        "questionText": "Which method fetches all remaining rows of a query result set in SQLite?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "fetchone()" },
          { "id": "B", "text": "fetchall()" },
          { "id": "C", "text": "fetchmany()" },
          { "id": "D", "text": "getall()" }
        ],
        "correctAnswer": "B",
        "explanation": "fetchall() retrieves all remaining rows of query result and returns them as a list."
      },
      {
        "questionNumber": 15,
        "questionText": "Which function in Matplotlib displays the plot on screen?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "plt.plot()" },
          { "id": "B", "text": "plt.show()" },
          { "id": "C", "text": "plt.display()" },
          { "id": "D", "text": "plt.render()" }
        ],
        "correctAnswer": "B",
        "explanation": "plt.show() renders and displays the constructed figures on the screen."
      }
    ]
  },
  {
    "subjectCode": "CSC-12",
    "prepClass": 12,
    "examDate": "2021-09-01T00:00:00.000Z",
    "durationMinutes": 60,
    "totalMarks": 15,
    "instructions": "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    "status": "PUBLISHED",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "Which of the following is the building block of C++ and Python programs?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Tokens" },
          { "id": "B", "text": "Functions" },
          { "id": "C", "text": "Classes" },
          { "id": "D", "text": "Variables" }
        ],
        "correctAnswer": "A",
        "explanation": "Tokens are the smallest individual units in a program (keywords, identifiers, literals, operators, punctuators)."
      },
      {
        "questionNumber": 2,
        "questionText": "The time complexity of Binary Search in best case is:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "O(n)" },
          { "id": "B", "text": "O(log n)" },
          { "id": "C", "text": "O(1)" },
          { "id": "D", "text": "O(n^2)" }
        ],
        "correctAnswer": "C",
        "explanation": "In the best case, the target element is found at the middle position on the very first comparison, O(1)."
      },
      {
        "questionNumber": 3,
        "questionText": "Which search algorithm uses the divide and conquer approach?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Linear Search" },
          { "id": "B", "text": "Binary Search" },
          { "id": "C", "text": "Sequential Search" },
          { "id": "D", "text": "Bubble Search" }
        ],
        "correctAnswer": "B",
        "explanation": "Binary search divides the sorted array into two halves at each step."
      },
      {
        "questionNumber": 4,
        "questionText": "Which parameter allows passing variable number of arguments to a function in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Default" },
          { "id": "B", "text": "Keyword" },
          { "id": "C", "text": "Variable-length (*args)" },
          { "id": "D", "text": "Positional" }
        ],
        "correctAnswer": "C",
        "explanation": "Variable-length arguments prefixed with * (*args) allow arbitrary positional arguments."
      },
      {
        "questionNumber": 5,
        "questionText": "Which Python function converts a character to its ASCII / Unicode integer value?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "chr()" },
          { "id": "B", "text": "ord()" },
          { "id": "C", "text": "ascii()" },
          { "id": "D", "text": "val()" }
        ],
        "correctAnswer": "B",
        "explanation": "The ord() function takes a single character and returns its Unicode/ASCII integer code."
      },
      {
        "questionNumber": 6,
        "questionText": "Which method appends a single item to the end of a list in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "extend()" },
          { "id": "B", "text": "append()" },
          { "id": "C", "text": "insert()" },
          { "id": "D", "text": "add()" }
        ],
        "correctAnswer": "B",
        "explanation": "list.append(x) appends a single item x to the end of the list."
      },
      {
        "questionNumber": 7,
        "questionText": "Which operator is used for Floor Division in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "/" },
          { "id": "B", "text": "//" },
          { "id": "C", "text": "%" },
          { "id": "D", "text": "div" }
        ],
        "correctAnswer": "B",
        "explanation": "The // operator performs floor division, truncating the fractional part towards negative infinity."
      },
      {
        "questionNumber": 8,
        "questionText": "Which keyword is used to define class in Python?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "struct" },
          { "id": "B", "text": "class" },
          { "id": "C", "text": "object" },
          { "id": "D", "text": "type" }
        ],
        "correctAnswer": "B",
        "explanation": "The class keyword creates a user-defined class object in Python."
      },
      {
        "questionNumber": 9,
        "questionText": "The self parameter in Python class methods refers to:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Class itself" },
          { "id": "B", "text": "Current instance of class" },
          { "id": "C", "text": "Parent class" },
          { "id": "D", "text": "Global object" }
        ],
        "correctAnswer": "B",
        "explanation": "self represents the current instance of the class that invoked the method."
      },
      {
        "questionNumber": 10,
        "questionText": "The process of creating a relational database table structure is part of:",
        "marks": 1,
        "options": [
          { "id": "A", "text": "Data Normalization" },
          { "id": "B", "text": "Database Design" },
          { "id": "C", "text": "Data Modeling" },
          { "id": "D", "text": "All of these" }
        ],
        "correctAnswer": "D",
        "explanation": "Database design encompasses data modeling, schema definition, and normalization."
      },
      {
        "questionNumber": 11,
        "questionText": "Which aggregate function calculates the average value of a column in SQL?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "SUM()" },
          { "id": "B", "text": "AVG()" },
          { "id": "C", "text": "MEAN()" },
          { "id": "D", "text": "COUNT()" }
        ],
        "correctAnswer": "B",
        "explanation": "AVG() computes the arithmetic mean of non-null values in the selected column."
      },
      {
        "questionNumber": 12,
        "questionText": "Which dialect of CSV file uses comma as delimiter by default?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "excel" },
          { "id": "B", "text": "csv_comma" },
          { "id": "C", "text": "default_csv" },
          { "id": "D", "text": "standard" }
        ],
        "correctAnswer": "A",
        "explanation": "The 'excel' dialect is the default dialect in Python's csv module, using comma as delimiter."
      },
      {
        "questionNumber": 13,
        "questionText": "Which command in SQL drops a database entirely?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "DROP DATABASE" },
          { "id": "B", "text": "DELETE DATABASE" },
          { "id": "C", "text": "REMOVE DATABASE" },
          { "id": "D", "text": "TRUNCATE DATABASE" }
        ],
        "correctAnswer": "A",
        "explanation": "DROP DATABASE permanently deletes the specified database and all containing tables."
      },
      {
        "questionNumber": 14,
        "questionText": "Which command line argument in getopt function parses command line options?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "getopt.getopt()" },
          { "id": "B", "text": "sys.argv" },
          { "id": "C", "text": "os.system()" },
          { "id": "D", "text": "optparse()" }
        ],
        "correctAnswer": "A",
        "explanation": "getopt.getopt() parses command line options and parameter lists."
      },
      {
        "questionNumber": 15,
        "questionText": "Which function in Matplotlib sets the title of a plot?",
        "marks": 1,
        "options": [
          { "id": "A", "text": "plt.label()" },
          { "id": "B", "text": "plt.title()" },
          { "id": "C", "text": "plt.heading()" },
          { "id": "D", "text": "plt.name()" }
        ],
        "correctAnswer": "B",
        "explanation": "plt.title('My Title') specifies the chart title in Matplotlib."
      }
    ]
  }
];

async function run() {
  console.log("=== Importing All User Exams (2021-2026) Into SQLite Database ===");

  // 1. Ensure CSC-12 Subject Exists
  let subject = await prisma.subject.findUnique({
    where: { code: "CSC-12" }
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        code: "CSC-12",
        name: "Computer Science",
        prepClass: 12,
        medium: "English"
      }
    });
    console.log("Created Subject: Computer Science (CSC-12)");
  }

  // 2. Link CSC-12 to all Class 12 preparation students (e.g. Sister)
  const class12Students = await prisma.studentProfile.findMany({
    where: { examPrepClass: 12 }
  });

  for (const st of class12Students) {
    const existing = await prisma.studentSubject.findFirst({
      where: { studentId: st.id, subjectId: subject.id }
    });
    if (!existing) {
      await prisma.studentSubject.create({
        data: { studentId: st.id, subjectId: subject.id }
      });
      console.log("Linked CSC-12 to student: " + st.fullName);
    }
  }

  // 3. Create Syllabus Units for Computer Science if missing
  const unitsCount = await prisma.syllabusUnit.count({ where: { subjectId: subject.id } });
  if (unitsCount === 0) {
    const unit1 = await prisma.syllabusUnit.create({
      data: {
        subjectId: subject.id,
        unitNumber: 1,
        title: "Problem Solving and Python Programming"
      }
    });
    await prisma.syllabusChapter.createMany({
      data: [
        { unitId: unit1.id, chapterNumber: 1, title: "Functions and Scoping", description: "Function definitions, parameters, and variable scopes." },
        { unitId: unit1.id, chapterNumber: 2, title: "Data Abstraction and OOP", description: "Classes, objects, constructors, and encapsulation." },
        { unitId: unit1.id, chapterNumber: 3, title: "Algorithmic Efficiency", description: "Time and space complexity, searching and sorting techniques." }
      ]
    });

    const unit2 = await prisma.syllabusUnit.create({
      data: {
        subjectId: subject.id,
        unitNumber: 2,
        title: "Database Management & SQL"
      }
    });
    await prisma.syllabusChapter.createMany({
      data: [
        { unitId: unit2.id, chapterNumber: 1, title: "Relational Concepts & SQL", description: "DDL, DML, relational tables, and keys." },
        { unitId: unit2.id, chapterNumber: 2, title: "Data Integration with Python", description: "CSV file handling and SQLite Python connectivity." }
      ]
    });
    console.log("Created Syllabus Units and Chapters for Computer Science");
  }

  // 4. Ingest each Exam Schedule & Questions
  let totalImportedQuestions = 0;
  for (const examData of examsData) {
    const examDate = new Date(examData.examDate);
    const year = examDate.getFullYear();

    // Check if this schedule already exists
    let schedule = await prisma.examSchedule.findFirst({
      where: {
        subjectId: subject.id,
        examDate: examDate
      }
    });

    if (!schedule) {
      schedule = await prisma.examSchedule.create({
        data: {
          subjectId: subject.id,
          prepClass: examData.prepClass,
          examDate: examDate,
          durationMinutes: examData.durationMinutes,
          totalMarks: examData.totalMarks,
          instructions: examData.instructions,
          status: "PUBLISHED"
        }
      });
    }

    // Add or replace questions
    await prisma.examQuestion.deleteMany({
      where: { examScheduleId: schedule.id }
    });

    for (const q of examData.questions) {
      await prisma.examQuestion.create({
        data: {
          examScheduleId: schedule.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          marks: q.marks,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "Official Verified Solution."
        }
      });
      totalImportedQuestions++;
    }

    // Ensure corresponding QuestionPaper exists
    const existingPaper = await prisma.questionPaper.findFirst({
      where: {
        subjectId: subject.id,
        examYear: year
      }
    });

    if (!existingPaper) {
      await prisma.questionPaper.create({
        data: {
          subjectId: subject.id,
          prepClass: 12,
          examYear: year,
          title: "Class 12 Computer Science Public Examination " + year,
          board: "Tamil Nadu State Board",
          sourceInfo: "TN DGE Official Repository",
          paperType: "PUBLIC_EXAM",
          maxMarks: examData.totalMarks,
          durationMinutes: examData.durationMinutes,
          isPublished: true
        }
      }).catch(() => {});
    }

    console.log(`Imported Exam ${year} with ${examData.questions.length} questions.`);
  }

  console.log(`All 6 Computer Science exams and ${totalImportedQuestions} questions successfully linked and published in SQLite!`);
}

module.exports = { run, examsData };

if (require.main === module) {
  run().then(() => prisma.$disconnect()).catch(e => {
    console.error("Import error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
}
