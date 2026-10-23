// ========================================
// หัวข้อไหน ต้องรู้หัวข้อไหนก่อน  (ข้อมูลชั่วคราว แต่งเอง)
//
// backend ยังไม่มีตารางนี้ เลยเขียนไว้ฝั่งหน้าบ้านไปก่อน
// วันที่ backend มี API ให้ ค่อยลบไฟล์นี้ แล้วไปแก้ toTopicCards ใน utils/topics.js ให้อ่านจาก API แทน
//
// วิธีอ่าน
//   CS213: {
//     "Linked Lists": ["Abstract Data Types", "CS111: Classes & Objects"],
//   }
//   = หัวข้อ "Linked Lists" ของ CS213 ต้องรู้ 2 หัวข้อก่อน
//       "Abstract Data Types"        ← ไม่มีรหัสวิชานำหน้า = หัวข้อในวิชาเดียวกัน (CS213)
//       "CS111: Classes & Objects"   ← มีรหัสวิชานำหน้า   = หัวข้อของวิชาอื่น
//
// ชื่อหัวข้อต้องสะกดตรงกับในฐานข้อมูล (db/curriculum-2566.sql) ทุกตัวอักษร
// ถ้าสะกดผิด จะมีคำเตือนขึ้นใน Console ของ browser
// หัวข้อที่ไม่ได้เขียนไว้ที่นี่ = ไม่ต้องรู้อะไรก่อน (เป็นหัวข้อพื้นฐาน)
// ========================================

const TOPIC_PREREQUISITES = {
  CS100: {
    "Web Architecture (Client-Server)": ["How the Web Works"],
    "HTML Basics": ["How the Web Works"],
    "CSS Basics": ["HTML Basics"],
    "CSS Layout (Flexbox & Grid)": ["CSS Basics"],
    "JavaScript Basics": ["HTML Basics", "CS102: Variables & Data Types"],
    "DOM Manipulation": ["JavaScript Basics"],
    "Events": ["DOM Manipulation"],
    "Forms & Validation": ["Events"],
    "Responsive Design": ["CSS Layout (Flexbox & Grid)"],
    "Fetch API & JSON": ["JavaScript Basics", "Web Architecture (Client-Server)"],
    "Web Deployment": ["Git & GitHub Workflow", "Web Architecture (Client-Server)"],
  },

  CS101: {
    "Predicate Logic & Quantifiers": ["Propositional Logic"],
    "Boolean Algebra": ["Propositional Logic"],
    "Digital Logic Circuits": ["Boolean Algebra"],
    "Proof Techniques": ["Predicate Logic & Quantifiers"],
    "Mathematical Induction": ["Proof Techniques"],
    "Sets": ["Propositional Logic"],
    "Functions": ["Sets"],
    "Relations": ["Sets"],
    "Counting Basics": ["Sets"],
    "Permutations & Combinations": ["Counting Basics"],
    "Graph Basics": ["Relations"],
    "Trees": ["Graph Basics", "Mathematical Induction"],
  },

  CS102: {
    "Flowcharts & Pseudocode": ["Algorithmic Problem Solving"],
    "Variables & Data Types": ["Flowcharts & Pseudocode"],
    "Operators & Expressions": ["Variables & Data Types"],
    "Input & Output": ["Variables & Data Types"],
    "Conditionals (if/else)": ["Operators & Expressions"],
    "Loops": ["Conditionals (if/else)"],
    "Arrays": ["Loops"],
    "Strings": ["Arrays"],
    "Functions": ["Loops"],
    "Parameter Passing": ["Functions"],
    "Recursion": ["Functions"],
    "Testing & Debugging": ["Functions"],
  },

  CS111: {
    "Classes & Objects": ["CS102: Functions", "CS102: Variables & Data Types"],
    "Encapsulation": ["Classes & Objects"],
    "Constructors": ["Classes & Objects", "CS102: Parameter Passing"],
    "Inheritance": ["Classes & Objects"],
    "Polymorphism": ["Inheritance"],
    "Abstract Classes & Interfaces": ["Polymorphism"],
    "Exception Handling": ["Classes & Objects", "CS102: Testing & Debugging"],
    "Collections": ["Classes & Objects", "CS102: Arrays"],
    "UML Class Diagrams": ["Inheritance", "Encapsulation"],
    "Object-Oriented Design": ["Abstract Classes & Interfaces", "UML Class Diagrams"],
    "Design-to-Code Consistency": ["Object-Oriented Design", "Software Development Life Cycle"],
  },
};

export default TOPIC_PREREQUISITES;