import { useRef, useState, useLayoutEffect } from "react";
import "./leftpage.css";

function Leftpage({ courses, selectedCourse, setSelectedCourse }) {
  const mapRef = useRef(null);
  const cardRefs = useRef({});
  const [lines, setLines] = useState([]);

  // คำนวณตำแหน่งเส้นจากตำแหน่งการ์ดจริง
  useLayoutEffect(() => {
    const calculateLines = () => {
      if (!mapRef.current) return;
      const mapBox = mapRef.current.getBoundingClientRect();
      const result = [];

      courses.forEach((course) => {
        (course.prerequisites || []).forEach((preId) => {
          const fromEl = cardRefs.current[preId];
          const toEl = cardRefs.current[course.id];
          if (!fromEl || !toEl) return;

          const a = fromEl.getBoundingClientRect();
          const b = toEl.getBoundingClientRect();

          result.push({
            key: `${preId}-${course.id}`,
            from: preId,
            to: course.id,
            x1: a.left + a.width / 2 - mapBox.left, // กลางล่างของวิชาก่อนหน้า
            y1: a.bottom - mapBox.top,
            x2: b.left + b.width / 2 - mapBox.left, // กลางบนของวิชาถัดไป
            y2: b.top - mapBox.top,
          });
        });
      });

      setLines(result);
    };

    calculateLines();
    window.addEventListener("resize", calculateLines);
    return () => window.removeEventListener("resize", calculateLines);
  }, [courses]);

  return (
    <div className="course-map" ref={mapRef}>
      {/* ===== เส้นเชื่อม ===== */}
      <svg className="course-lines">
        {lines.map((l) => {
          const midY = (l.y1 + l.y2) / 2;
          const active =
            selectedCourse?.id === l.from || selectedCourse?.id === l.to;

          return (
            <path
              key={l.key}
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
              className={`course-line ${active ? "active" : ""}`}
            />
          );
        })}
      </svg>

      {/* ===== การ์ดรายวิชา ===== */}
      {courses.map((course) => {
        const isSelected = selectedCourse?.id === course.id;

        return (
          <button
            key={course.id}
            ref={(el) => (cardRefs.current[course.id] = el)}
            className={`course-card course-${course.id} ${
              isSelected ? "selected" : ""
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="course-card-header">
              <span className="course-dot"></span>
              <span className="course-name">{course.name}</span>
            </div>

            <div className="course-info">
              {course.topics} หัวข้อ • รู้แล้ว {course.learned}
            </div>

            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${
                    course.topics === 0
                      ? 0
                      : (course.learned / course.topics) * 100
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