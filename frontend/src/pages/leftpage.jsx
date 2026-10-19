import "./leftpage.css";


function Leftpage({
  courses,
  selectedCourse,
  setSelectedCourse,
}) {

  return (
    <div className="course-map">


      {/* ==================================
          รายวิชาทั้งหมด
      ================================== */}

      {courses.map((course) => {

        // เช็กว่าวิชานี้กำลังถูกเลือกอยู่หรือไม่

        const isSelected =
          selectedCourse?.id === course.id;


        return (

          <button
            key={course.id}

            className={`
              course-card
              course-${course.id}
              ${isSelected ? "selected" : ""}
            `}

            onClick={() => {
              setSelectedCourse(course);
            }}
          >


            {/* ==================================
                ชื่อวิชา
            ================================== */}

            <div className="course-card-header">

              <span className="course-dot"></span>

              <span className="course-name">
                {course.name}
              </span>

            </div>


            {/* ==================================
                จำนวนหัวข้อ
            ================================== */}

            <div className="course-info">

              {course.topics} หัวข้อ
              {" • "}
              รู้แล้ว {course.learned}

            </div>


            {/* ==================================
                Progress Bar
            ================================== */}

            <div className="progress-bar">

              <div
                className="progress"
                style={{
                  width: `${
                    course.topics === 0
                      ? 0
                      : (
                          course.learned /
                          course.topics
                        ) * 100
                  }%`,
                }}
              />

            </div>

          </button>
        );
      })}

    </div>
  );
}

export default Leftpage;