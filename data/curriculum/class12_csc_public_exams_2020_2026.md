# Tamil Nadu Samacheer Kalvi Class 12 Computer Science - Public Exam Papers & Blueprints (2020–2026)
**Official Controller of Examinations (COE) Reference Archive**
*Government of Tamil Nadu • Directorate of Government Examinations (DGE)*

---

## 1. Exam Blueprint & Structure (Theory: 70 Marks | Practical: 20 Marks | Internal: 10 Marks | Total: 100 Marks)

### Theory Examination Pattern (Duration: 3 Hours):
- **Part I (Q.No 1 – 15):** 15 Objective Multiple Choice Questions (1 Mark each = 15 Marks)
- **Part II (Q.No 16 – 24):** 6 out of 9 Two-Mark Short Questions (2 Marks each = 12 Marks). *Q.No 24 is Compulsory.*
- **Part III (Q.No 25 – 33):** 6 out of 9 Three-Mark Conceptual & Code Output Questions (3 Marks each = 18 Marks). *Q.No 33 is Compulsory.*
- **Part IV (Q.No 34 – 38):** 5 Either/Or Five-Mark Essay & Comprehensive Program Questions (5 Marks each = 25 Marks).

---

## 2. Curriculum Unit Breakdown
1. **Unit 1: Problem Solving Techniques** (Function specifications, Parameters, Pure/Impure Functions, Scope LEGB rule, Algorithmic efficiency Big-O)
2. **Unit 2: Core Python Programming** (Tokens, Control structures, Loops, String handling, Tuples, Sets, Dictionaries, OOP Classes & Data Abstraction)
3. **Unit 3: Database Management Systems** (Relational model, Keys, Relational Algebra, SQL DDL/DML/DCL/TCL, Joins, Group By, Aggregate functions)
4. **Unit 4: Applied Computer Science** (Python-C++ Integration with MinGW, SQLite3 Python binding, Data Visualization using Matplotlib)

---

## 3. High-Frequency Authentic Public Exam Questions (2020 – 2026)

### Part I: Selected MCQs
1. Which of the following is a unit of code that is often defined within a greater code structure?
   - A) Subroutine
   - B) Function
   - C) Files
   - D) Modules
   *(Answer: A | Unit 1: Functions)*

2. The order of scope resolution in Python is:
   - A) Local, Enclosing, Global, Built-in (LEGB)
   - B) Local, Global, Enclosing, Built-in
   - C) Built-in, Global, Enclosing, Local
   - D) Enclosing, Local, Global, Built-in
   *(Answer: A | Unit 1: Scoping)*

3. What will be the output of the following Python statement? `print(list(range(2, 11, 2)))`
   - A) `[2, 4, 6, 8, 10]`
   - B) `[2, 3, 4, 5, 6, 7, 8, 9, 10]`
   - C) `[2, 4, 6, 8]`
   - D) `[4, 6, 8, 10]`
   *(Answer: A | Unit 2: Python Lists & Ranges)*

4. Which SQL constraint ensures that all values in a column are distinct?
   - A) NOT NULL
   - B) UNIQUE
   - C) CHECK
   - D) DEFAULT
   *(Answer: B | Unit 3: SQL Constraints)*

5. Which Python module allows the integration of C++ programs into Python scripts?
   - A) `os`
   - B) `sys`
   - C) `getopt`
   - D) `ctypes`
   *(Answer: C | Unit 4: Python-C++ Interfacing)*

### Part II: Two-Mark Essential Questions
1. **Functions:** What is the difference between interface and implementation in object programming?
2. **Scoping:** Write short notes on the Global scope variable lifetime in Python.
3. **String Slicing:** What is the output of the following code?
   ```python
   str1 = "COMPUTER SCIENCE"
   print(str1[::-1])
   print(str1[0:8])
   ```
4. **Tuples:** How does a tuple differ from a list in Python in terms of mutability and memory storage?
5. **DBMS:** What is the primary difference between Cartesian Product and Natural Join?
6. **Compulsory Question (Q.No 24):** Write a Python program using a while loop to find the sum of all digits of a given number $N = 345$.

### Part III: Three-Mark Code & Conceptual Questions
1. **Recursion:** Explain how Python manages the call stack when executing a recursive factorial function.
2. **Algorithms:** Explain the best-case, average-case, and worst-case time complexity of Binary Search.
3. **OOP Constructors:** Explain the role of the `__init__()` method in Python classes with a syntax example.
4. **SQL Clauses:** Differentiate between the `WHERE` clause and the `HAVING` clause in SQL queries with examples.
5. **Matplotlib:** Write a short Python script using `matplotlib.pyplot` to plot a line graph with X-axis `[1, 2, 3]` and Y-axis `[2, 4, 6]`.
6. **Compulsory Question (Q.No 33):** Trace and predict the exact console output of the following snippet:
   ```python
   def check(x):
       if x <= 1:
           return 1
       return x * check(x - 2)
   print(check(5))
   ```

### Part IV: Five-Mark Analytical & Comprehensive Questions
1. **Algorithmic Efficiency:** Explain the Dynamic Programming approach. Contrast Memoization vs Tabulation with the Fibonacci sequence example.
2. **Python Data Structures:** Explain with examples the four set operations in Python: Union, Intersection, Difference, and Symmetric Difference.
3. **SQL & Relational Algebra:** Given the table `STUDENT(RollNo, Name, Age, Gender, Mark)`. Write SQL queries to:
   - (a) Display distinct genders.
   - (b) Display names of students who scored between 80 and 95 marks.
   - (c) Display student count grouped by Gender where average mark > 75.
   - (d) Sort all male students in descending order of marks.
   - (e) Delete students whose age is greater than 20.
4. **Python-SQLite Integration:** Write a complete Python program using the `sqlite3` module to connect to `school.db`, create a table `ACADEMIC`, insert two records, and fetch all rows using `cursor.fetchall()`.

---
*Authorized by COE Samacheer Kalvi Assessment Engine*
