import "./Rightpage.css";
import ResourceList from "./ResourceList";
import COURSE_RESOURCES from "../data/courseResources";

function Rightpage({
  selectedCourse,
  courses = [],
  courseTopics = [],
  setSelectedCourse,
  onShowTopics,
  onSelectTopic,
}) {
  if (selectedCourse === null) {
    return (
      <aside className="right-page right-page--empty">
        <div className="right-page__empty-icon">◇</div>
        <h2>เลือกรายวิชาที่ต้องการเรียนรู้</h2>
        <p>
          คลิกวิชาจากแผนผังเพื่อดูรายละเอียด
          วิชาพื้นฐานที่ต้องผ่านก่อน และวิชาที่สามารถต่อยอดได้
        </p>
      </aside>
    );
  }

  // รองรับการอ้างอิงวิชาด้วยทั้ง id และ code จากข้อมูลความสัมพันธ์
  const getCourseById = (id) =>
    courses.find((course) => course.id === id || course.code === id);

  const prereqList = (selectedCourse.prerequisites || [])
    .map(getCourseById)
    .filter(Boolean);

  const nextList = (selectedCourse.nextCourses || [])
    .map(getCourseById)
    .filter(Boolean);

  // เลือกแหล่งเรียนรู้ให้ตรงกับรหัสวิชาที่เลือก
  const resources = COURSE_RESOURCES[selectedCourse.code] || [];

  const percent =
    selectedCourse.topics === 0
      ? 0
      : Math.min(
          100,
          (selectedCourse.learned / selectedCourse.topics) * 100
        );

  const isAllLearned =
    selectedCourse.topics > 0 &&
    selectedCourse.learned === selectedCourse.topics;

  return (
    <aside className="right-page">
      <header className="right-page__header">
        <div>
          <p className="right-page__eyebrow">COURSE DETAILS</p>
          <span className="right-page__course-code">
            {selectedCourse.code}
          </span>
        </div>

        <button
          type="button"
          className="right-page__close"
          onClick={() => setSelectedCourse?.(null)}
          aria-label="ล้างวิชาที่เลือก"
          title="ล้างวิชาที่เลือก"
        >
          ×
        </button>
      </header>

      <div className="right-page__body">
        {/* Title row */}
        <div className="right-page__title-row">
          <span
            className={`right-page__status ${
              isAllLearned ? "is-done" : ""
            }`}
          >
            {isAllLearned ? "✓" : "📘"}
          </span>

          <div>
            <h2 className="right-page__title">{selectedCourse.name}</h2>
            <p className="right-page__subtitle">
              {selectedCourse.code} • มี {selectedCourse.topics} หัวข้อ
            </p>
          </div>
        </div>

        {/* Course description */}
        <section className="right-page__section">
          <h3>คำอธิบายรายวิชา</h3>
          <p className="right-page__description">
            {selectedCourse.description || "ยังไม่มีคำอธิบายสำหรับรายวิชานี้"}
          </p>
        </section>

        {/* Progress bar */}
        <section className="right-page__progress">
          <div className="right-page__progress-heading">
            <h3>ความคืบหน้าของวิชา</h3>
            <span>
              {selectedCourse.learned}/{selectedCourse.topics} หัวข้อ
            </span>
          </div>

          <div className="right-page__progress-track">
            <div
              className="right-page__progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p>
            {selectedCourse.topics === 0
              ? "วิชานี้ยังไม่มีหัวข้อกำหนดไว้"
              : isAllLearned
              ? "คุณเรียนรู้ครบทุกหัวข้อในวิชานี้แล้ว!"
              : `เรียนรู้ไปแล้ว ${Math.round(percent)}% (เหลืออีก ${
                  selectedCourse.topics - selectedCourse.learned
                } หัวข้อ)`}
          </p>
        </section>

        {/* Action buttons */}
        <div className="right-page__actions">
          <button
            type="button"
            className="right-page__primary-btn"
            onClick={onShowTopics}
          >
            ดูหัวข้อในวิชานี้ ({selectedCourse.topics})
          </button>
          <button
            type="button"
            className="right-page__secondary-btn"
            onClick={() => setSelectedCourse?.(null)}
          >
            ล้าง
          </button>
        </div>

        {/* Prerequisites */}
        <section className="right-page__section">
          <div className="right-page__section-heading">
            <h3>ผ่านตามลำดับ (Prerequisites)</h3>
            <span className="right-page__count">{prereqList.length}</span>
          </div>

          {prereqList.length === 0 ? (
            <p className="right-page__muted">
              ไม่มีวิชาก่อนหน้า (เป็นวิชาพื้นฐาน)
            </p>
          ) : (
            <ul className="right-page__list">
              {prereqList.map((course, index) => (
                <li key={course.id}>
                  <button
                    type="button"
                    className="right-page__list-button"
                    onClick={() => setSelectedCourse?.(course)}
                  >
                    <span className="right-page__list-status">
                      {index + 1}
                    </span>
                    <span className="right-page__list-text">
                      <strong>{course.name}</strong>
                      <small>
                        {course.code} • รู้แล้ว {course.learned}/
                        {course.topics} หัวข้อ
                      </small>
                    </span>
                    <span className="right-page__badge">
                      ดูวิชานี้
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Next Courses */}
        <section className="right-page__section">
          <div className="right-page__section-heading">
            <h3>ต่อยอดไป (Next Courses)</h3>
            <span className="right-page__count">{nextList.length}</span>
          </div>

          {nextList.length === 0 ? (
            <p className="right-page__muted">
              ยังไม่มีวิชาต่อยอดที่กำหนดไว้
            </p>
          ) : (
            <ul className="right-page__list">
              {nextList.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    className="right-page__list-button"
                    onClick={() => setSelectedCourse?.(course)}
                  >
                    <span className="right-page__list-status">→</span>
                    <span className="right-page__list-text">
                      <strong>{course.name}</strong>
                      <small>
                        {course.code} • รู้แล้ว {course.learned}/
                        {course.topics} หัวข้อ
                      </small>
                    </span>
                    <span className="right-page__badge">
                      ดูวิชานี้
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Topics in this course */}
        <section className="right-page__section">
          <div className="right-page__section-heading">
            <h3>หัวข้อในวิชานี้</h3>
            <span className="right-page__count">
              {courseTopics.length}
            </span>
          </div>

          {courseTopics.length === 0 ? (
            <p className="right-page__muted">
              ยังไม่มีหัวข้อในวิชานี้
            </p>
          ) : (
            <ul className="right-page__list">
              {courseTopics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    className="right-page__list-button"
                    onClick={() => onSelectTopic?.(topic)}
                  >
                    <span
                      className={`right-page__list-status ${
                        topic.done ? "is-done" : ""
                      }`}
                    >
                      {topic.done ? "✓" : "◇"}
                    </span>
                    <span className="right-page__list-text">
                      <strong>{topic.name}</strong>
                      <small>
                        {topic.desc || "คลิกเพื่อดูรายละเอียดหัวข้อ"}
                      </small>
                    </span>
                    <span
                      className={`right-page__badge ${
                        topic.done ? "is-done" : ""
                      }`}
                    >
                      {topic.done ? "เรียนแล้ว" : "ยังไม่เรียน"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Resources */}
        {resources.length > 0 && (
          <section className="right-page__section">
            <h3>แหล่งเรียนรู้เพิ่มเติม</h3>
            <p className="right-page__muted">
              เอกสารและสื่อการสอนแนะนำสำหรับวิชานี้
            </p>
            <ResourceList topic={{ courseCode: selectedCourse.code }} />
          </section>
        )}
      </div>
    </aside>
  );
}

export default Rightpage;
