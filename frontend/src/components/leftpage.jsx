import { useMemo, useState } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import "./leftpage.css";

const CARD_WIDTH = 240;
const CARD_HEIGHT = 84;
const COLUMN_GAP = 100;
const ROW_GAP = 56;
const PADDING_X = 60;
const PADDING_Y = 80;

// วางวิชาตามลำดับพื้นฐาน: วิชาที่ไม่มีวิชาบังคับก่อนอยู่คอลัมน์แรก
function Leftpage({ courses = [], selectedCourse, setSelectedCourse }) {
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  const { positionedCourses, positionsById, canvasWidth, canvasHeight } =
    useMemo(() => {
      const coursesById = new Map(courses.map((course) => [course.id, course]));
      const depthById = new Map();
      const visiting = new Set();

      // คำนวณระยะห่างจากวิชาพื้นฐาน โดยอิงจากวิชาที่ต้องเรียนก่อน
      function getDepth(course) {
        if (depthById.has(course.id)) return depthById.get(course.id);
        if (visiting.has(course.id)) return 0;

        visiting.add(course.id);
        const depth = (course.prerequisites || []).reduce((maxDepth, id) => {
          const prerequisite = coursesById.get(id);
          return prerequisite
            ? Math.max(maxDepth, getDepth(prerequisite) + 1)
            : maxDepth;
        }, 0);
        visiting.delete(course.id);
        depthById.set(course.id, depth);
        return depth;
      }

      const columns = new Map();
      courses.forEach((course) => {
        const depth = getDepth(course);
        if (!columns.has(depth)) columns.set(depth, []);
        columns.get(depth).push(course);
      });

      const positionsById = new Map();
      columns.forEach((column, depth) => {
        column.forEach((course, row) => {
          positionsById.set(course.id, {
            x: PADDING_X + depth * (CARD_WIDTH + COLUMN_GAP),
            y: PADDING_Y + row * (CARD_HEIGHT + ROW_GAP),
          });
        });
      });

      const positionedCourses = courses.map((course) => ({
        ...course,
        ...positionsById.get(course.id),
      }));
      const columnCount = courses.length
        ? Math.max(...columns.keys()) + 1
        : 0;
      const maxRows = Math.max(0, ...Array.from(columns.values(), (c) => c.length));
      const canvasWidth = Math.max(
        900,
        PADDING_X * 2 +
          columnCount * CARD_WIDTH +
          Math.max(0, columnCount - 1) * COLUMN_GAP
      );
      const canvasHeight = Math.max(
        650,
        PADDING_Y * 2 +
          maxRows * CARD_HEIGHT +
          Math.max(0, maxRows - 1) * ROW_GAP
      );

      return {
        positionedCourses,
        positionsById,
        canvasWidth,
        canvasHeight,
      };
    }, [courses]);

  // สร้างเส้นจากขอบวิชาที่เป็นพื้นฐานไปยังวิชาที่ต้องเรียนต่อ
  const lines = useMemo(
    () =>
      positionedCourses.flatMap((course) =>
        (course.prerequisites || []).flatMap((prerequisiteId) => {
          const from = positionsById.get(prerequisiteId);
          const to = positionsById.get(course.id);
          if (!from || !to) return [];

          return [
            {
              key: `${prerequisiteId}-${course.id}`,
              from: prerequisiteId,
              to: course.id,
              x1: from.x + CARD_WIDTH,
              y1: from.y + CARD_HEIGHT / 2,
              x2: to.x,
              y2: to.y + CARD_HEIGHT / 2,
            },
          ];
        })
      ),
    [positionedCourses, positionsById]
  );

  return (
    <div className="course-map">
      {/* รวมการ์ดและเส้นไว้ในผืนผ้าใบที่ลากและซูมได้ */}
      <PanZoomCanvas width={canvasWidth} height={canvasHeight}>
        <svg
          className="course-lines"
          width={canvasWidth}
          height={canvasHeight}
          aria-hidden="true"
        >
          {lines.map((line) => {
            const midX = (line.x1 + line.x2) / 2;
            const active =
              selectedCourse?.id === line.from ||
              selectedCourse?.id === line.to;
            const hovered =
              hoveredCourseId === line.from || hoveredCourseId === line.to;

            return (
              <path
                key={line.key}
                d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`}
                className={`course-line ${active ? "active" : ""} ${
                  hovered ? "hovered" : ""
                }`}
              />
            );
          })}
        </svg>

        {positionedCourses.map((course) => (
          <button
            key={course.id}
            className={`course-card ${
              selectedCourse?.id === course.id ? "selected" : ""
            }`}
            style={{ left: `${course.x}px`, top: `${course.y}px` }}
            onClick={() => setSelectedCourse(course)}
            onMouseEnter={() => setHoveredCourseId(course.id)}
            onMouseLeave={() => setHoveredCourseId(null)}
            onFocus={() => setHoveredCourseId(course.id)}
            onBlur={() => setHoveredCourseId(null)}
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
        ))}
      </PanZoomCanvas>
    </div>
  );
}

export default Leftpage;
