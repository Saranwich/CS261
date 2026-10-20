import React, { useState } from "react";
import Rightpage from "./Rightpage";
import Leftpage from "./leftpage";
import Upperbar from "../components/Upperbar";
import "./Homepage.css";
// ข้อมูลรายวิชาทั้งหมด
const courses = [
  {
    id: 1,
    name: "CS102",
    topics: 1,
    learned: 0,
    prerequisites: [],
    nextCourses: [2, 3],   // ← เพิ่ม
    description: "รายวิชาแนะนำพื้นฐานด้านวิทยาการคอมพิวเตอร์และแนวคิดสำคัญสำหรับผู้เริ่มต้น",
  },
  {
    id: 2,
    name: "CS111",
    topics: 2,
    learned: 0,
    prerequisites: [1],
    nextCourses: [],
    description: "รายวิชาแนะนำพื้นฐานด้านวิทยาการคอมพิวเตอร์และแนวคิดสำคัญสำหรับผู้เริ่มต้น",
  },
  {
    id: 3,
    name: "CS101",
    topics: 1,
    learned: 0,
    prerequisites: [1],    // ← เพิ่ม
    nextCourses: [],
    description: "รายวิชาแนะนำพื้นฐานด้านวิทยาการคอมพิวเตอร์และแนวคิดสำคัญสำหรับผู้เริ่มต้น",
  },
  {
    id: 4,
    name: "CS100",
    topics: 1,
    learned: 0,
    prerequisites: [],
    nextCourses: [],
    description: "รายวิชาแนะนำพื้นฐานด้านวิทยาการคอมพิวเตอร์และแนวคิดสำคัญสำหรับผู้เริ่มต้น",
  },
];


function Home() {

  // ========================================
  // เก็บวิชาที่ผู้ใช้เลือก
  // ตอนแรกยังไม่ได้เลือก = null
  // ========================================

  const [selectedCourse, setSelectedCourse] =
    useState(null);


  return (
    <>
      {/* ==================================
          Navbar
      ================================== */}

      <Upperbar />


      {/* ==================================
          เนื้อหาหลัก
      ================================== */}

      <div className="homepage">


        {/* ==================================
            ฝั่งซ้าย 70%
        ================================== */}

        <div className="leftPage">

          <Leftpage
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
          />

        </div>


        {/* ==================================
            ฝั่งขวา 30%
        ================================== */}

        <div className="rightPage">

          <Rightpage
            selectedCourse={selectedCourse}
            courses={courses}
          />

        </div>

      </div>
    </>
  );
}

export default Home;