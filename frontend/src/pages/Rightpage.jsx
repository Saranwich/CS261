import { useState } from "react";
import "./Rightpage.css";

function Rightpage() {

  const courses = [
    {
      id: 1,
      name: "Programming Fundamentals",
      usedFrom: 1,
      nextCourses: 2,
      topics: 4,
    },
    {
      id: 2,
      name: "CS102",
      usedFrom: 1,
      nextCourses: 2,
      topics: 4,
    },
  ];




  const [selectedCourse, setSelectedCourse] = useState(courses[0]);



  const [isExpanded, setIsExpanded] = useState(true);



  const prerequisiteCourses = [
    {
      id: 1,
      name: "Discrete Mathematics",
      progress: "เริ่มแล้ว 0/4 หัวข้อ",
    },
  ];

  const nextCourses = [
    {
      id: 1,
      name: "Data Structures",
      progress: "รู้แล้ว 0/4 หัวข้อ",
    },
    {
      id: 2,
      name: "Algorithms",
      progress: "รู้แล้ว 0/4 หัวข้อ",
    },
  ];


  return (
    <div className="page">

      <div className="course-panel">


        <div className="course-header">

          <div className="small-title">
            วิชาที่เลือก
          </div>

          <h1 className="main-title">

            <span className="status-dot"></span>

            {selectedCourse.name}

          </h1>

          <div className="course-description">

            ใช้ความรู้จาก{" "}
            <strong>
              {selectedCourse.usedFrom}
            </strong>{" "}
            วิชา · ต่ออยู่ใน{" "}
            <strong>
              {selectedCourse.nextCourses}
            </strong>{" "}
            วิชา · มี{" "}
            <strong>
              {selectedCourse.topics}
            </strong>{" "}
            หัวข้อ

          </div>

        </div>



        <div className="actions">

          <button className="primary-button">
            ดูหัวข้อในวิชานี้
          </button>

          <button
            className="secondary-button"
            onClick={() => setSelectedCourse(courses[0])}
          >
            ล้าง
          </button>

          <button
            className="collapse-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "↑" : "↓"}
          </button>

        </div>



        {isExpanded && (
          <>

            <section className="course-section">

              <div className="section-label">
                ผ่านตามลำดับ
              </div>

              <div className="course-list">

                {prerequisiteCourses.map((course) => (

                  <div
                    className="course-node prerequisite-node"
                    key={course.id}
                  >

                    <div className="course-number prerequisite-number">
                      {course.id}
                    </div>

                    <div className="course-info">

                      <div className="course-name">
                        {course.name}
                      </div>

                      <div className="course-progress">
                        {course.progress}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>



            <section className="course-section">

              <div className="section-label">
                ต่อถัดไป
              </div>

              <div className="next-course-list">

                {nextCourses.map((course, index) => (

                  <div
                    className="course-with-arrow"
                    key={course.id}
                  >

                    {index > 0 && (
                      <div className="course-arrow">
                        →
                      </div>
                    )}

                    <div className="course-node next-node">

                      <div className="course-number next-number">
                        {course.id}
                      </div>

                      <div className="course-info">

                        <div className="course-name">
                          {course.name}
                        </div>

                        <div className="course-progress">
                          {course.progress}
                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

          </>
        )}

      </div>

    </div>
  );
}

export default Rightpage;