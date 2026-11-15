import { useMemo, useState } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import ProgressRing from "./ProgressRing";
import "./leftpage.css";

// ========================================
// ขนาดการ์ดและระยะห่าง (หน่วย px)
// CARD_WIDTH / CARD_HEIGHT ต้องตรงกับ .course-card ใน leftpage.css
// ========================================

const CARD_WIDTH = 240;
const CARD_HEIGHT = 112;
const COLUMN_GAP = 110; // ระยะห่างแนวนอน ระหว่างคอลัมน์ (เว้นที่ให้เส้นและหัวลูกศร)
const ROW_GAP = 40;     // ระยะห่างแนวตั้ง ระหว่างการ์ดในคอลัมน์เดียวกัน
const PADDING = 60;     // ขอบว่างรอบแผนผัง


// ========================================
// จัดตำแหน่งการ์ดทุกใบ จากลำดับ prerequisite อย่างเดียว (ไม่อ้างรหัสวิชาใดวิชาหนึ่ง)
//   คอลัมน์ = depth: ไม่มีวิชาก่อนหน้า → คอลัมน์ 0 (ซ้ายสุด)
//                   มี → คอลัมน์ของวิชาก่อนหน้าที่ลึกสุด + 1
//   ในคอลัมน์เดียวกัน เรียงตาม "ค่าเฉลี่ยตำแหน่งแนวตั้งของวิชาก่อนหน้า" (เส้นจะไขว้กันน้อย)
//
// ผลลัพธ์ = { positions: { [courseId]: { x, y } }, width, height }
// ========================================

function calculateLayout(courses) {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const depthById = new Map();

  function depthOf(course) {
    if (depthById.has(course.id)) return depthById.get(course.id);
    depthById.set(course.id, 0); // ใส่ 0 ไว้ก่อน กันวนไม่รู้จบ ถ้าข้อมูลชี้กันเป็นวง

    let depth = 0;
    (course.prerequisites || []).forEach((preId) => {
      const pre = courseById.get(preId);
      if (pre) depth = Math.max(depth, depthOf(pre) + 1);
    });

    depthById.set(course.id, depth);
    return depth;
  }

  const columns = [];
  courses.forEach((course) => {
    const depth = depthOf(course);
    if (!columns[depth]) columns[depth] = [];
    columns[depth].push(course);
  });

  const positions = {};
  columns.forEach((column, depth) => {
    if (depth > 0) {
      const averageY = (course) => {
        const ys = (course.prerequisites || [])
          .filter((preId) => positions[preId])
          .map((preId) => positions[preId].y);
        return ys.length === 0 ? 0 : ys.reduce((sum, y) => sum + y, 0) / ys.length;
      };
      column.sort((a, b) => averageY(a) - averageY(b));
    }

    column.forEach((course, row) => {
      positions[course.id] = {
        x: PADDING + depth * (CARD_WIDTH + COLUMN_GAP),
        y: PADDING + row * (CARD_HEIGHT + ROW_GAP),
      };
    });
  });

  const columnCount = columns.length;
  const tallestColumn = Math.max(0, ...columns.map((column) => column.length));

  return {
    positions,
    width: PADDING * 2 + columnCount * CARD_WIDTH + Math.max(0, columnCount - 1) * COLUMN_GAP,
    height: PADDING * 2 + tallestColumn * CARD_HEIGHT + Math.max(0, tallestColumn - 1) * ROW_GAP,
  };
}


// สถานะของวิชา: idle = ยังไม่เริ่ม / progress = กำลังเรียน / done = ครบทุกหัวข้อ
function statusOf(course) {
  if (course.topics > 0 && course.learned >= course.topics) return "done";
  if (course.learned > 0) return "progress";
  return "idle";
}


function Leftpage({ courses = [], selectedCourse, setSelectedCourse }) {
  // วิชาที่เมาส์ชี้อยู่ (null = ไม่ได้ชี้อะไร) เส้นของวิชานี้จะหนาขึ้น
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  const { positions, width, height } = useMemo(() => calculateLayout(courses), [courses]);

  // เส้นเชื่อม 1 เส้น = วิชาก่อนหน้า (ซ้าย) → วิชาที่ต่อยอด (ขวา)
  const lines = [];
  courses.forEach((course) => {
    (course.prerequisites || []).forEach((preId) => {
      const from = positions[preId];
      const to = positions[course.id];
      if (!from || !to) return;

      lines.push({
        key: `${preId}-${course.id}`,
        from: preId,
        to: course.id,
        x1: from.x + CARD_WIDTH,
        y1: from.y + CARD_HEIGHT / 2,
        x2: to.x,
        y2: to.y + CARD_HEIGHT / 2,
      });
    });
  });

  // ภาพรวมของทุกวิชารวมกัน
  const totalTopics = courses.reduce((sum, course) => sum + course.topics, 0);
  const totalLearned = courses.reduce((sum, course) => sum + course.learned, 0);
  const completedCourses = courses.filter((course) => statusOf(course) === "done").length;
  const overallPercent = totalTopics === 0 ? 0 : (totalLearned / totalTopics) * 100;

  return (
    <div className="course-map">
      <PanZoomCanvas width={width} height={height}>
        {/* ===== เส้นเชื่อม (มีหัวลูกศรชี้ไปวิชาที่ต่อยอด) ===== */}
        <svg className="course-lines" width={width} height={height} aria-hidden="true">
          <defs>
            <marker id="course-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#5d6c8a" />
            </marker>
            <marker id="course-arrow-active" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b9aff" />
            </marker>
          </defs>

          {lines.map((line) => {
            const midX = (line.x1 + line.x2) / 2;
            const active = selectedCourse?.id === line.from || selectedCourse?.id === line.to;
            const hovered = hoveredCourseId === line.from || hoveredCourseId === line.to;

            return (
              <path
                key={line.key}
                d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`}
                className={`course-line ${active ? "active" : ""} ${hovered ? "hovered" : ""}`}
                markerEnd={active || hovered ? "url(#course-arrow-active)" : "url(#course-arrow)"}
              />
            );
          })}
        </svg>

        {/* ===== การ์ดรายวิชา ===== */}
        {courses.map((course, index) => {
          const position = positions[course.id];
          const percent =
            course.topics === 0 ? 0 : Math.min(100, (course.learned / course.topics) * 100);
          const status = statusOf(course);

          // course.name ใน Homepage.jsx = "CS100 Web Development Basics" → ตัดรหัสออก เหลือแต่ชื่อ
          const title = course.name.replace(course.code, "").trim() || course.name;

          return (
            <button
              key={course.id}
              type="button"
              className={`course-card is-${status} ${selectedCourse?.id === course.id ? "selected" : ""}`}
              style={{ left: position.x, top: position.y, "--i": index }}
              title={course.name}
              onClick={() => setSelectedCourse(course)}
              onMouseEnter={() => setHoveredCourseId(course.id)}
              onMouseLeave={() => setHoveredCourseId(null)}
              onFocus={() => setHoveredCourseId(course.id)}
              onBlur={() => setHoveredCourseId(null)}
            >
              <div className="course-card-header">
                <span className="course-dot" />
                <span className="course-code">{course.code}</span>
                <span className="course-percent">
                  {status === "done" ? "ครบแล้ว" : `${Math.round(percent)}%`}
                </span>
              </div>

              <span className="course-name">{title}</span>

              <div className="course-info">
                {course.topics} หัวข้อ • รู้แล้ว {course.learned}
              </div>

              <div className="progress-bar">
                <div className="progress" style={{ width: `${percent}%` }} />
              </div>
            </button>
          );
        })}
      </PanZoomCanvas>

      {/* ===== แผงภาพรวม ลอยมุมซ้ายบน (อยู่นอกกระดาน จึงไม่เลื่อน/ซูมตามแผนผัง) ===== */}
      {courses.length > 0 && (
        <div className="overview">
          <ProgressRing
            key="overview"
            value={overallPercent}
            done={totalTopics > 0 && totalLearned === totalTopics}
            size={64}
            stroke={6}
          />
          <div className="overview__text">
            <span className="overview__title">ภาพรวมของคุณ</span>
            <strong className="overview__count">
              {totalLearned}/{totalTopics} หัวข้อ
            </strong>
            <span className="overview__sub">
              เรียนครบแล้ว {completedCourses}/{courses.length} วิชา
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leftpage;