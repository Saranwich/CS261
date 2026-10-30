
import { useMemo } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import { findAllPrerequisites, toLookup } from "../utils/topics";
import "./Topicpage.css";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 76;
const COURSE_WIDTH = 290;
const COURSE_GAP = 44;
const LEVEL_GAP = 145;
const SIBLING_GAP = 96;
const TREE_PADDING = 40;

function Topicpage({
  topics = [],
  courses = [],
  selectedTopic = null,
  selectedCourse = null,
  onSelectTopic,
}) {
  // สร้าง lookup เพื่อค้นหาหัวข้อด้วย id ได้อย่างรวดเร็ว
  const topicById = useMemo(() => toLookup(topics), [topics]);

  // รวมทุก prerequisite ของหัวข้อที่เลือก
  const prerequisiteTopics = useMemo(() => {
    if (!selectedTopic || !topicById[selectedTopic.id]) {
      return [];
    }

    return findAllPrerequisites([selectedTopic.id], topicById);
  }, [selectedTopic, topicById]);

  // หัวข้อที่อยู่บนเส้นทางการเรียนรู้ที่เลือก
  const focusIds = useMemo(() => {
    const ids = new Set();

    if (selectedTopic) {
      ids.add(selectedTopic.id);
      prerequisiteTopics.forEach((topic) => ids.add(topic.id));
    }

    return ids;
  }, [selectedTopic, prerequisiteTopics]);

  // จัดกลุ่มหัวข้อตามรายวิชา
  const layout = useMemo(() => {
    const courseMap = new Map();

    courses.forEach((course) => {
      courseMap.set(String(course.id), {
        ...course,
        topics: [],
      });
    });

    topics.forEach((topic) => {
      const key = String(topic.courseId);

      if (!courseMap.has(key)) {
        courseMap.set(key, {
          id: topic.courseId,
          code: topic.courseCode || "COURSE",
          name: topic.courseName || "รายวิชา",
          topics: [],
        });
      }

      courseMap.get(key).topics.push(topic);
    });

    const courseGroups = Array.from(courseMap.values()).filter(
      (course) => course.topics.length > 0
    );

    const maxDepth = Math.max(
      0,
      ...topics.map((topic) => Number(topic.depth) || 0)
    );

    const positions = {};
    const groupBounds = [];

    courseGroups.forEach((course, courseIndex) => {
      const x =
        TREE_PADDING + courseIndex * (COURSE_WIDTH + COURSE_GAP);

      // เรียงหัวข้อในแต่ละระดับให้ตำแหน่งคงที่
      const sortedTopics = [...course.topics].sort(
        (a, b) =>
          (Number(a.depth) || 0) - (Number(b.depth) || 0) ||
          (Number(a.seqNo) || 0) - (Number(b.seqNo) || 0)
      );

      const rankByDepth = new Map();

      sortedTopics.forEach((topic) => {
        const depth = Number(topic.depth) || 0;
        const rank = rankByDepth.get(depth) || 0;

        rankByDepth.set(depth, rank + 1);

        // depth มากจะอยู่สูงกว่า เพื่อให้หัวข้อพื้นฐานอยู่ด้านล่าง
        const y =
          TREE_PADDING +
          (maxDepth - depth) * LEVEL_GAP +
          rank * SIBLING_GAP;

        positions[topic.id] = {
          x: x + (COURSE_WIDTH - NODE_WIDTH) / 2,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          centerX: x + COURSE_WIDTH / 2,
        };
      });

      const courseTopics = sortedTopics
        .map((topic) => positions[topic.id])
        .filter(Boolean);

      const minY = Math.min(...courseTopics.map((pos) => pos.y));
      const maxY = Math.max(
        ...courseTopics.map((pos) => pos.y + pos.height)
      );

      groupBounds.push({
        id: course.id,
        code: course.code,
        name: course.name,
        x,
        y: minY - 58,
        width: COURSE_WIDTH,
        height: maxY - minY + 86,
      });
    });

    const maxX =
      TREE_PADDING * 2 +
      courseGroups.length * COURSE_WIDTH +
      Math.max(0, courseGroups.length - 1) * COURSE_GAP;

    const maxY = Math.max(
      400,
      ...Object.values(positions).map((pos) => pos.y + pos.height)
    );

    return {
      positions,
      groupBounds,
      width: maxX,
      height: maxY + TREE_PADDING * 2,
    };
  }, [courses, topics]);

  // เส้นเชื่อมจาก prerequisite ด้านล่างไปยังหัวข้อที่ต่อยอดด้านบน
  const edges = useMemo(() => {
    const result = [];

    topics.forEach((topic) => {
      const target = layout.positions[topic.id];
      if (!target) return;

      (topic.prerequisites || []).forEach((prerequisiteId) => {
        const source = layout.positions[prerequisiteId];
        if (!source) return;

        const startX = source.x + source.width / 2;
        const startY = source.y;
        const endX = target.x + target.width / 2;
        const endY = target.y + target.height;

        const curveOffset = Math.max(
          35,
          Math.abs(startY - endY) * 0.35
        );

        result.push({
          id: `${prerequisiteId}-${topic.id}`,
          prerequisiteId,
          topicId: topic.id,
          path: [
            `M ${startX} ${startY}`,
            `C ${startX} ${startY - curveOffset},`,
            `${endX} ${endY + curveOffset},`,
            `${endX} ${endY}`,
          ].join(" "),
        });
      });
    });

    return result;
  }, [topics, layout]);

  // คำนวณพื้นที่ของเส้นทางที่ต้องการโฟกัสสำหรับ PanZoomCanvas
  const focusArea = useMemo(() => {
    if (!selectedTopic || focusIds.size === 0) return null;

    const selectedPositions = [...focusIds]
      .map((id) => layout.positions[id])
      .filter(Boolean);

    if (selectedPositions.length === 0) return null;

    const minX = Math.min(...selectedPositions.map((pos) => pos.x));
    const minY = Math.min(...selectedPositions.map((pos) => pos.y));
    const maxX = Math.max(
      ...selectedPositions.map((pos) => pos.x + pos.width)
    );
    const maxY = Math.max(
      ...selectedPositions.map((pos) => pos.y + pos.height)
    );

    const padding = 80;

    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [selectedTopic, focusIds, layout]);

  const hasTopics = topics.length > 0;

  return (
    <section className="topic-page">
      <header className="topic-page__header">
        <div>
          <p className="topic-page__eyebrow">LEARNING PATH</p>
          <h2 className="topic-page__title">Topic Skill Tree</h2>
          <p className="topic-page__subtitle">
            สำรวจความสัมพันธ์ของหัวข้อและลำดับการเรียนรู้
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

      {!hasTopics ? (
        <div className="topic-page__empty">
          <div className="topic-page__empty-icon">◇</div>
          <h3>ยังไม่มีหัวข้อให้แสดง</h3>
          <p>เมื่อโหลดข้อมูลรายวิชาและหัวข้อสำเร็จ Skill Tree จะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="topic-page__canvas">
          <PanZoomCanvas
            focusArea={focusArea}
            className="topic-page__panzoom"
            minZoom={0.25}
            maxZoom={2.5}
            initialZoom={0.8}
          >
            <div
              className="topic-tree"
              style={{
                width: layout.width,
                height: layout.height,
              }}
            >
              {/* กล่องพื้นหลังของแต่ละรายวิชา */}
              {layout.groupBounds.map((course) => (
                <div
                  key={course.id}
                  className={`topic-course ${
                    selectedCourse &&
                    String(selectedCourse.id) === String(course.id)
                      ? "topic-course--selected"
                      : ""
                  }`}
                  style={{
                    left: course.x,
                    top: course.y,
                    width: course.width,
                    height: course.height,
                  }}
                >
                  <div className="topic-course__heading">
                    <span className="topic-course__code">
                      {course.code}
                    </span>
                    <span className="topic-course__name">
                      {course.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* SVG สำหรับวาดเส้นเชื่อม */}
              <svg
                className="topic-tree__edges"
                width={layout.width}
                height={layout.height}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="topic-arrow"
                    markerWidth="7"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path d="M 0 0 L 6 3.5 L 0 7 z" fill="currentColor" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const isActive =
                    focusIds.has(edge.prerequisiteId) &&
                    focusIds.has(edge.topicId);

                  return (
                    <path
                      key={edge.id}
                      d={edge.path}
                      className={`topic-edge ${
                        isActive ? "topic-edge--active" : ""
                      }`}
                      markerEnd="url(#topic-arrow)"
                    />
                  );
                })}
              </svg>

              {/* การ์ดหัวข้อ */}
              {topics.map((topic) => {
                const position = layout.positions[topic.id];
                if (!position) return null;

                const isSelected = selectedTopic?.id === topic.id;
                const isInPath = focusIds.has(topic.id);
                const isCourseTopic =
                  selectedCourse &&
                  String(selectedCourse.id) === String(topic.courseId);

                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={[
                      "topic-node",
                      topic.done ? "topic-node--done" : "",
                      isSelected ? "topic-node--selected" : "",
                      isInPath ? "topic-node--in-path" : "",
                      selectedTopic && !isInPath
                        ? "topic-node--dimmed"
                        : "",
                      isCourseTopic ? "topic-node--course-match" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: position.width,
                      height: position.height,
                    }}
                    onClick={() => onSelectTopic?.(topic)}
                    title={`${topic.name}${topic.done ? " — เรียนแล้ว" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span className="topic-node__status">
                      {topic.done ? "✓" : isSelected ? "●" : "○"}
                    </span>

                    <span className="topic-node__content">
                      <span className="topic-node__name">
                        {topic.name}
                      </span>
                      <span className="topic-node__meta">
                        {topic.courseCode}
                        {Number.isFinite(Number(topic.seqNo))
                          ? ` · Topic ${topic.seqNo}`
                          : ""}
                      </span>
                    </span>

                    {isSelected && (
                      <span className="topic-node__selected-label">
                        SELECTED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </PanZoomCanvas>
        </div>
      )}

      <footer className="topic-page__footer">
        <span>
          {topics.length} หัวข้อ · {layout.groupBounds.length} รายวิชา
        </span>
        <span>
          {selectedTopic
            ? `เลือก: ${selectedTopic.name} · prerequisite ${prerequisiteTopics.length} หัวข้อ`
            : "เลือกการ์ดหัวข้อเพื่อดูเส้นทาง prerequisite"}
        </span>
      </footer>
    </section>
  );
}

export default Topicpage;
