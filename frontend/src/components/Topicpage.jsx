import { useMemo, useState } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import { CheckIcon, CircleIcon, DiamondIcon, DotIcon } from "./Icons";
import { findAllPrerequisites, toLookup } from "../utils/topics";
import "./Topicpage.css";

// ========================================
// แผนผังรายหัวข้อ
//   - 1 กล่อง = 1 วิชา ข้างในเป็นหัวข้อของวิชานั้น
//   - เส้น = หัวข้อล่าง ต้องรู้ก่อน หัวข้อบน (พื้นฐานอยู่ล่าง)
//
// เห็นทุกหัวข้อเสมอ แต่ถ้าเลือกอะไรไว้ จะซูมไปที่ "เส้นทาง" ของมัน
//   เลือกหัวข้อไว้   → เส้นทาง = หัวข้อนั้น + ทุกหัวข้อที่ต้องรู้ก่อน
//   เลือกแค่วิชา    → เส้นทาง = หัวข้อในวิชานั้น + ทุกหัวข้อที่ต้องรู้ก่อน
// ========================================

// ขนาดและระยะห่าง (หน่วย px)
// NODE_HEIGHT ต้องพอดีกับ .topic-node ใน Topicpage.css (ขนาดจริงถูกใส่ inline จากค่าตรงนี้)
const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;
const NODE_GAP_X = 18;   // ระยะห่างแนวนอน ระหว่างหัวข้อในชั้นเดียวกัน
const NODE_GAP_Y = 46;   // ระยะห่างแนวตั้ง ระหว่างชั้นของหัวข้อ (เว้นที่ให้เส้น)
const BOX_HEADER = 52;   // ความสูงแถบชื่อวิชา (.topic-course__heading สูง 42px)
const BOX_PADDING = 16;  // ขอบว่างในกล่องวิชา
const BOX_MIN_WIDTH = 300; // กว้างอย่างน้อยเท่านี้ เพื่อให้ชื่อวิชาในแถบหัวไม่ถูกบีบ
const BOX_GAP_X = 70;    // ระยะห่างแนวนอน ระหว่างกล่องวิชา
const BOX_GAP_Y = 130;   // ระยะห่างแนวตั้ง ระหว่างชั้นของกล่องวิชา
const PADDING = 40;      // ขอบว่างรอบแผนผัง
const FOCUS_MARGIN = 60; // เผื่อขอบรอบเส้นทางตอนซูมไปหา


// ========================================
// หา "ชั้น" ของแต่ละอย่าง (ใช้ทั้งกับหัวข้อ และกับกล่องวิชา)
//   ไม่มีอะไรต้องรู้ก่อน → ชั้น 0
//   มี                 → ชั้นสูงสุดของสิ่งที่ต้องรู้ก่อน + 1
//
//   ids       = id ทั้งหมดที่จะจัดชั้น
//   parentsOf = ฟังก์ชัน รับ id แล้วคืน id ที่ต้องรู้ก่อน
//
// ผลลัพธ์ = rows  โดย rows[0] = id ชั้น 0, rows[1] = id ชั้น 1, ...
// ========================================

function splitIntoLevels(ids, parentsOf) {
  const levels = {};
  const visiting = new Set();

  function levelOf(id) {
    if (levels[id] !== undefined) return levels[id];
    visiting.add(id);

    let level = 0;
    parentsOf(id).forEach((parentId) => {
      // ข้ามเส้นที่วนกลับมาหาตัวเอง (ข้อมูลชี้กันเป็นวง) ไม่งั้นเลขชั้นจะข้ามไปจนมีชั้นว่าง
      if (visiting.has(parentId)) return;
      level = Math.max(level, levelOf(parentId) + 1);
    });

    visiting.delete(id);
    levels[id] = level;
    return level;
  }

  const rows = [];
  ids.forEach((id) => {
    const level = levelOf(id);
    if (!rows[level]) rows[level] = [];
    rows[level].push(id);
  });
  return rows.filter(Boolean); // กันชั้นว่าง
}


// ========================================
// คำนวณตำแหน่งกล่องวิชา และหัวข้อทุกตัว
//
// ผลลัพธ์ = {
//   boxes:     [{ course, topics, x, y, width, height }],
//   positions: { [topicId]: { x, y, width, height } },
//   width, height   ← ขนาดแผนผังทั้งหมด
// }
// ========================================

// เรียงหัวข้อในแต่ละชั้นของกล่อง ให้อยู่ใกล้หัวข้อที่เกี่ยวข้องกัน (เส้นไขว้กันน้อยลง)
//   รอบแรกไล่จากล่างขึ้นบน ดูตำแหน่งของ "หัวข้อที่ต้องรู้ก่อน"
//   รอบสองไล่จากบนลงล่าง ดูตำแหน่งของ "หัวข้อที่ต่อยอด"
function orderRowsToReduceCrossings(rows, idsInBox, topicById) {
  const slot = {}; // id → ตำแหน่งแนวนอนแบบหยาบ (แต่ละชั้นจัดกึ่งกลาง)
  const place = (row) => row.forEach((id, i) => { slot[id] = i - (row.length - 1) / 2; });
  const bySeq = (a, b) => topicById[a].seqNo - topicById[b].seqNo;

  const parentsOf = (id) => topicById[id].prerequisites.filter((x) => idsInBox.includes(x));
  const childrenOf = (id) => topicById[id].nextTopics.filter((x) => idsInBox.includes(x));
  const average = (ids, fallback) => {
    const xs = ids.filter((id) => slot[id] !== undefined).map((id) => slot[id]);
    return xs.length === 0 ? fallback : xs.reduce((sum, x) => sum + x, 0) / xs.length;
  };

  rows.forEach((row) => { row.sort(bySeq); place(row); });

  for (let level = 1; level < rows.length; level++) {
    rows[level].sort((a, b) => average(parentsOf(a), slot[a]) - average(parentsOf(b), slot[b]) || bySeq(a, b));
    place(rows[level]);
  }
  for (let level = rows.length - 2; level >= 0; level--) {
    rows[level].sort((a, b) => average(childrenOf(a), slot[a]) - average(childrenOf(b), slot[b]) || bySeq(a, b));
    place(rows[level]);
  }
}


function calculateLayout(topics, courses, topicById) {
  // ----- 1) แยกหัวข้อลงกล่องวิชา (วิชาที่ไม่มีหัวข้อ ไม่ต้องวาดกล่อง) -----
  const boxes = courses
    .map((course) => ({
      course: course,
      topics: topics.filter((topic) => topic.courseId === course.id),
    }))
    .filter((box) => box.topics.length > 0);

  if (boxes.length === 0) {
    return { boxes: [], positions: {}, width: 400, height: 300 };
  }

  // ----- 2) ในแต่ละกล่อง จัดหัวข้อเป็นชั้น ๆ แล้วหาขนาดกล่อง -----
  boxes.forEach((box) => {
    const idsInBox = box.topics.map((topic) => topic.id);

    // นับเฉพาะหัวข้อก่อนหน้าที่อยู่ในกล่องเดียวกัน
    box.rows = splitIntoLevels(idsInBox, (id) =>
      topicById[id].prerequisites.filter((preId) => idsInBox.includes(preId))
    );
    orderRowsToReduceCrossings(box.rows, idsInBox, topicById);

    const widestRow = Math.max(...box.rows.map((row) => row.length));
    box.width = Math.max(
      BOX_MIN_WIDTH,
      BOX_PADDING * 2 + widestRow * NODE_WIDTH + (widestRow - 1) * NODE_GAP_X
    );
    box.height =
      BOX_HEADER + BOX_PADDING + box.rows.length * NODE_HEIGHT + (box.rows.length - 1) * NODE_GAP_Y;
  });

  // ----- 3) จัดกล่องวิชาเป็นชั้น ๆ -----
  // วิชา A ต้องอยู่สูงกว่าวิชา B ถ้า
  //   - B เป็นวิชาบังคับก่อนของ A หรือ
  //   - มีหัวข้อใน A ที่ต้องรู้หัวข้อใน B ก่อน
  const boxByCourseId = {};
  boxes.forEach((box) => {
    boxByCourseId[box.course.id] = box;
  });

  function coursesNeededBy(courseId) {
    const box = boxByCourseId[courseId];
    const needed = (box.course.prerequisites || []).filter((id) => boxByCourseId[id]);

    box.topics.forEach((topic) => {
      topic.prerequisites.forEach((preId) => {
        const preCourseId = topicById[preId].courseId;
        if (preCourseId !== courseId && boxByCourseId[preCourseId] && !needed.includes(preCourseId)) {
          needed.push(preCourseId);
        }
      });
    });
    return needed;
  }

  const boxRows = splitIntoLevels(
    boxes.map((box) => box.course.id),
    coursesNeededBy
  ).map((row) => row.map((courseId) => boxByCourseId[courseId]));

  // ----- 4) วางกล่อง: ชั้น 0 ล่างสุด แต่ละชั้นเรียงแนวนอนไว้กลางแผนผัง -----
  const rowWidths = boxRows.map(
    (row) => row.reduce((sum, box) => sum + box.width, 0) + (row.length - 1) * BOX_GAP_X
  );
  const rowHeights = boxRows.map((row) => Math.max(...row.map((box) => box.height)));

  const width = PADDING * 2 + Math.max(...rowWidths);
  const height =
    PADDING * 2 + rowHeights.reduce((sum, h) => sum + h, 0) + (boxRows.length - 1) * BOX_GAP_Y;

  function averageNeededX(box) {
    const xs = coursesNeededBy(box.course.id)
      .map((courseId) => boxByCourseId[courseId])
      .filter((needed) => needed.x !== undefined)
      .map((needed) => needed.x + needed.width / 2);
    if (xs.length === 0) return 0;
    return xs.reduce((sum, x) => sum + x, 0) / xs.length;
  }

  // วางจากชั้นล่างขึ้นบน เพราะต้องรู้ตำแหน่งกล่องชั้นล่างก่อน ถึงจะเรียงชั้นบนให้เส้นไม่ไขว้กันมาก
  let rowBottom = height - PADDING;
  boxRows.forEach((row, level) => {
    if (level > 0) {
      row.sort((a, b) => averageNeededX(a) - averageNeededX(b));
    }

    let x = (width - rowWidths[level]) / 2;
    row.forEach((box) => {
      box.x = x;
      box.y = rowBottom - box.height; // กล่องในชั้นเดียวกัน ชิดล่างเท่ากัน
      x += box.width + BOX_GAP_X;
    });

    rowBottom -= rowHeights[level] + BOX_GAP_Y;
  });

  // ----- 5) วางหัวข้อในกล่อง: ชั้น 0 ล่างสุดของกล่อง -----
  const positions = {};
  boxes.forEach((box) => {
    box.rows.forEach((row, level) => {
      const rowWidth = row.length * NODE_WIDTH + (row.length - 1) * NODE_GAP_X;
      const startX = box.x + (box.width - rowWidth) / 2;
      const y = box.y + box.height - BOX_PADDING - NODE_HEIGHT - level * (NODE_HEIGHT + NODE_GAP_Y);

      row.forEach((topicId, index) => {
        positions[topicId] = {
          x: startX + index * (NODE_WIDTH + NODE_GAP_X),
          y: y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        };
      });
    });
  });

  return { boxes, positions, width, height };
}


// กรอบสี่เหลี่ยมที่ล้อมหัวข้อทั้งหมดใน ids (เผื่อขอบรอบ ๆ) เอาไว้ซูมไปหา
function areaAround(ids, positions) {
  const found = ids.map((id) => positions[id]).filter(Boolean);
  if (found.length === 0) return null;

  const left = Math.min(...found.map((p) => p.x)) - FOCUS_MARGIN;
  const top = Math.min(...found.map((p) => p.y)) - FOCUS_MARGIN;
  const right = Math.max(...found.map((p) => p.x + p.width)) + FOCUS_MARGIN;
  const bottom = Math.max(...found.map((p) => p.y + p.height)) + FOCUS_MARGIN;

  return { x: left, y: top, width: right - left, height: bottom - top };
}


function Topicpage({
  topics = [],
  courses = [],
  selectedTopic = null,
  selectedCourse = null,
  onSelectTopic,
}) {
  // หัวข้อที่เมาส์ชี้อยู่ (null = ไม่ได้ชี้อะไร)
  const [hoveredTopicId, setHoveredTopicId] = useState(null);

  const topicById = useMemo(() => toLookup(topics), [topics]);
  const layout = useMemo(
    () => calculateLayout(topics, courses, topicById),
    [topics, courses, topicById]
  );

  // ========================================
  // หัวข้อที่อยู่ "บนเส้นทาง" = หัวข้อที่สนใจ + ทุกหัวข้อที่ต้องรู้ก่อน
  // ========================================

  let focusIds = [];
  let focusLabel = "";
  if (selectedTopic && topicById[selectedTopic.id]) {
    focusIds = [selectedTopic.id];
    focusLabel = `หัวข้อ ${selectedTopic.name}`;
  } else if (selectedCourse) {
    focusIds = topics
      .filter((topic) => topic.courseId === selectedCourse.id)
      .map((topic) => topic.id);
    focusLabel = `วิชา ${selectedCourse.name}`;
  }

  const pathIds = new Set([
    ...focusIds,
    ...findAllPrerequisites(focusIds, topicById).map((topic) => topic.id),
  ]);
  const hasPath = pathIds.size > 0;
  const focusArea = hasPath ? areaAround([...pathIds], layout.positions) : null;
  const focusCourseId = selectedTopic ? selectedTopic.courseId : selectedCourse?.id;

  // ========================================
  // เส้นเชื่อม 1 เส้น = หัวข้อที่ต้องรู้ก่อน → หัวข้อที่ต่อยอด
  //   เส้นปกติบาง ๆ  /  อยู่บนเส้นทาง = หนาขึ้น  /  ต่อกับหัวข้อที่เมาส์ชี้ = หนาสุด
  // ========================================

  const edges = [];
  topics.forEach((topic) => {
    const target = layout.positions[topic.id];
    if (!target) return;

    topic.prerequisites.forEach((preId) => {
      const source = layout.positions[preId];
      if (!source) return;

      const sourceIsBelow = source.y >= target.y;
      edges.push({
        id: `${preId}-${topic.id}`,
        preId,
        topicId: topic.id,
        source,
        target,
        startSide: sourceIsBelow ? "top" : "bottom",
        endSide: sourceIsBelow ? "bottom" : "top",
        isCross: topicById[preId].courseId !== topic.courseId,
      });
    });
  });

  // กระจายจุดเกาะบนขอบการ์ด ไม่ให้ทุกเส้นมารวมที่กึ่งกลางจุดเดียว
  // (เรียงตามตำแหน่งปลายอีกด้านซ้าย→ขวา เส้นจะไม่ไขว้กันตรงปากการ์ด)
  const ports = {};
  const addPort = (key, edge, end, otherX) => {
    if (!ports[key]) ports[key] = [];
    ports[key].push({ edge, end, otherX });
  };
  edges.forEach((edge) => {
    addPort(`${edge.preId}:${edge.startSide}`, edge, "start", edge.target.x + edge.target.width / 2);
    addPort(`${edge.topicId}:${edge.endSide}`, edge, "end", edge.source.x + edge.source.width / 2);
  });
  Object.values(ports).forEach((list) => {
    list.sort((a, b) => a.otherX - b.otherX);
    list.forEach((port, index) => {
      const node = port.end === "start" ? port.edge.source : port.edge.target;
      const inner = node.width - 48;
      const x = node.x + 24 + (list.length === 1 ? inner / 2 : (inner * index) / (list.length - 1));
      port.edge[port.end === "start" ? "x1" : "x2"] = x;
    });
  });

  edges.forEach((edge) => {
    const { source, target } = edge;
    edge.y1 = edge.startSide === "top" ? source.y : source.y + source.height;
    edge.y2 = edge.endSide === "bottom" ? target.y + target.height : target.y;

    const lift = Math.max(30, Math.abs(edge.y2 - edge.y1) * 0.45) * (edge.startSide === "top" ? -1 : 1);
    edge.path = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${edge.y1 + lift}, ${edge.x2} ${edge.y2 - lift}, ${edge.x2} ${edge.y2}`;

    const onPath = pathIds.has(edge.preId) && pathIds.has(edge.topicId);
    const hovered = hoveredTopicId === edge.preId || hoveredTopicId === edge.topicId;

    const classes = ["topic-edge"];
    if (edge.isCross) classes.push("topic-edge--cross");
    if (hasPath && !onPath) classes.push("topic-edge--faded");
    if (onPath) classes.push("topic-edge--active");
    if (hovered) classes.push("topic-edge--hover");
    edge.className = classes.join(" ");
    edge.marker = hovered ? "url(#topic-arrow-hover)" : onPath ? "url(#topic-arrow-active)" : undefined;
  });

  // เส้นที่เด่นกว่า วาดทีหลัง จะได้ทับเส้นจาง ๆ (svg ตัวหลังอยู่บน)
  const weight = (edge) =>
    edge.className.includes("--hover") ? 2 : edge.className.includes("--active") ? 1 : 0;
  edges.sort((a, b) => weight(a) - weight(b));

  return (
    <section className="topic-page">
      <header className="topic-page__header">
        <div>
          <p className="topic-page__eyebrow">LEARNING PATH</p>
          <h2 className="topic-page__title">Topic Skill Tree</h2>
          <p className="topic-page__subtitle">
            คลิกหัวข้อที่เรียนไม่ทัน เพื่อดูว่าต้องย้อนไปเรียนอะไรก่อน (เส้น: ล่าง ต้องรู้ก่อน บน · เส้นประ = ข้ามวิชา)
          </p>
        </div>

        <div className="topic-page__legend">
          <span className="topic-page__legend-item">
            <span className="topic-page__legend-dot topic-page__legend-dot--done" />
            เรียนแล้ว
          </span>
          <span className="topic-page__legend-item">
            <span className="topic-page__legend-dot topic-page__legend-dot--selected" />
            หัวข้อที่เลือก
          </span>
          <span className="topic-page__legend-item">
            <span className="topic-page__legend-line" />
            Prerequisite
          </span>
        </div>
      </header>

      {topics.length === 0 ? (
        <div className="topic-page__empty">
          <div className="topic-page__empty-icon"><DiamondIcon size={28} /></div>
          <h3>ยังไม่มีหัวข้อให้แสดง</h3>
          <p>เมื่อโหลดข้อมูลรายวิชาและหัวข้อสำเร็จ Skill Tree จะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="topic-page__canvas">
          <PanZoomCanvas width={layout.width} height={layout.height} focusArea={focusArea} minimapRects={layout.boxes}>
            {/* ===== กล่องวิชา (อยู่ล่างสุด) ===== */}
            {layout.boxes.map((box) => (
              <div
                key={box.course.id}
                className={`topic-course ${box.course.id === focusCourseId ? "topic-course--selected" : ""}`}
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
              >
                <div className="topic-course__heading">
                  <span className="topic-course__code">{box.course.code}</span>
                  <span className="topic-course__name">
                    {box.course.name.replace(box.course.code, "").trim()}{" "}<small className="topic-course__count">{box.topics.filter((t) => t.done).length}/{box.topics.length} หัวข้อ</small>
                  </span>
                </div>
              </div>
            ))}

            {/* ===== เส้นเชื่อม ===== */}
            <svg
              className="topic-tree__edges"
              width={layout.width}
              height={layout.height}
              aria-hidden="true"
            >
              <defs>
                <marker id="topic-arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 0 0 L 7 4 L 0 8 z" fill="#9baaff" />
                </marker>
                <marker id="topic-arrow-hover" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 0 0 L 8 4.5 L 0 9 z" fill="#d7dcff" />
                </marker>
              </defs>

              {edges.map((edge) => (
                <path
                  key={edge.id}
                  d={edge.path}
                  className={edge.className}
                  markerEnd={edge.marker}
                />
              ))}
            </svg>

            {/* ===== หัวข้อ ===== */}
            {topics.map((topic) => {
              const position = layout.positions[topic.id];
              if (!position) return null;

              const isSelected = selectedTopic?.id === topic.id;
              const isInPath = pathIds.has(topic.id);

              const classes = ["topic-node"];
              if (topic.done) classes.push("topic-node--done");
              if (isSelected) classes.push("topic-node--selected");
              if (isInPath) classes.push("topic-node--in-path");
              else if (hasPath) classes.push("topic-node--dimmed"); // ไม่อยู่บนเส้นทาง → จางลง (แต่ยังเห็น)
              if (selectedCourse && selectedCourse.id === topic.courseId) {
                classes.push("topic-node--course-match");
              }

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={classes.join(" ")}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: position.width,
                    height: position.height,
                  }}
                  title={`${topic.courseCode} · ${topic.name}${topic.done ? " — เรียนแล้ว" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectTopic?.(topic)}
                  onMouseEnter={() => setHoveredTopicId(topic.id)}
                  onMouseLeave={() => setHoveredTopicId(null)}
                >
                  <span className="topic-node__status">
                    {topic.done ? <CheckIcon size={14} /> : isSelected ? <DotIcon size={14} /> : <CircleIcon size={14} />}
                  </span>

                  <span className="topic-node__content">
                    <span className="topic-node__name">{topic.name}</span>
                    <span className="topic-node__meta">
                      {topic.courseCode} · Topic {topic.seqNo}
                    </span>
                  </span>

                  {isSelected && <span className="topic-node__selected-label">SELECTED</span>}
                </button>
              );
            })}
          </PanZoomCanvas>
        </div>
      )}

      <footer className="topic-page__footer">
        <span>
          {topics.length} หัวข้อ · {layout.boxes.length} รายวิชา
        </span>
        <span>
          {hasPath
            ? `${focusLabel} และหัวข้อที่ต้องรู้ก่อน (${pathIds.size} หัวข้อ)`
            : "เลือกวิชาหรือการ์ดหัวข้อ เพื่อดูเส้นทาง prerequisite"}
        </span>
      </footer>
    </section>
  );
}

export default Topicpage;