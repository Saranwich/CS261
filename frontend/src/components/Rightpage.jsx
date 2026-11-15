import "./Rightpage.css";
import ResourceList from "./ResourceList";
import Collapsible from "./Collapsible";
import ProgressRing from "./ProgressRing";
import COURSE_RESOURCES from "../data/courseResources";
import { ArrowRightIcon, BookIcon, CheckIcon, DiamondIcon } from "./Icons";

function Rightpage({
  selectedCourse,
  courses = [],
  courseTopics = [],
  topicById = {},
  allTopics = [],
  setSelectedCourse,
  onShowTopics,
  onSelectTopic,
  onToggleDone,
}) {
  if (selectedCourse === null) {
    // ยังไม่มีข้อมูลวิชา (กำลังโหลด) → แสดงข้อความว่างแบบเดิม
    if (courses.length === 0) {
      return (
        <aside className="right-page right-page--empty">
          <div className="right-page__empty-icon"><DiamondIcon size={26} /></div>
          <h2>เลือกรายวิชาที่ต้องการเรียนรู้</h2>
          <p>
            คลิกวิชาจากแผนผังเพื่อดูรายละเอียด
            วิชาพื้นฐานที่ต้องผ่านก่อน และวิชาที่สามารถต่อยอดได้
          </p>
        </aside>
      );
    }

    // ----- ภาพรวมทั้งหลักสูตร -----
    const totalTopics = courses.reduce((sum, course) => sum + course.topics, 0);
    const totalLearned = courses.reduce((sum, course) => sum + course.learned, 0);
    const overallPercent = totalTopics === 0 ? 0 : (totalLearned / totalTopics) * 100;
    const allLearned = totalTopics > 0 && totalLearned === totalTopics;
    const completedCourses = courses.filter(
      (course) => course.topics > 0 && course.learned >= course.topics
    ).length;

    // หัวข้อที่ควรเรียนต่อ = หัวข้อแรกที่ยังไม่เรียน และหัวข้อพื้นฐานครบแล้ว (เรียงตามลำดับวิชา → ลำดับหัวข้อ)
    const courseOrder = new Map(courses.map((course, index) => [course.id, index]));
    const upcoming = allTopics
      .filter((topic) => !topic.done)
      .sort(
        (a, b) =>
          (courseOrder.get(a.courseId) ?? 0) - (courseOrder.get(b.courseId) ?? 0) ||
          (a.seqNo || 0) - (b.seqNo || 0)
      );
    const firstReady = upcoming.find((topic) =>
      (topic.prerequisites || []).every((id) => topicById[id]?.done)
    );
    const startTopic = firstReady || upcoming[0] || null;

    // วิชาที่กำลังเรียนอยู่ (เรียนไปแล้วบางส่วน) เรียงจากใกล้ครบที่สุด
    const inProgress = courses
      .filter((course) => course.learned > 0 && course.learned < course.topics)
      .sort((a, b) => b.learned / b.topics - a.learned / a.topics)
      .slice(0, 4);

    return (
      <aside className="right-page">
        <header className="right-page__header">
          <div>
            <p className="right-page__eyebrow">OVERVIEW</p>
            <span className="right-page__course-code">
              {completedCourses}/{courses.length} วิชา
            </span>
          </div>
        </header>

        <div className="right-page__body">
          <div className="right-page__title-row">
            <span className={`right-page__status ${allLearned ? "is-done" : ""}`}>
              {allLearned ? <CheckIcon size={20} /> : <BookIcon size={20} />}
            </span>
            <div>
              <h2 className="right-page__title">ภาพรวมการเรียนของคุณ</h2>
              <p className="right-page__subtitle">คลิกวิชาจากแผนผังเพื่อดูรายละเอียด</p>
            </div>
          </div>

          <section className="right-page__progress">
            <div className="progress-card">
              <ProgressRing key="all-overview" value={overallPercent} done={allLearned} />
              <div className="progress-card__text">
                <h3>ความคืบหน้าทั้งหมด</h3>
                <strong className="progress-card__count">
                  {totalLearned}/{totalTopics} หัวข้อ
                </strong>
                <p>
                  {allLearned
                    ? "คุณเรียนครบทุกหัวข้อแล้ว ยอดเยี่ยมมาก!"
                    : `เหลืออีก ${totalTopics - totalLearned} หัวข้อ`}
                </p>
              </div>
            </div>

            {startTopic && (
              <button
                type="button"
                className="next-up"
                onClick={() => onSelectTopic?.(startTopic)}
              >
                <span className="next-up__text">
                  <span className="next-up__label">ควรเรียนต่อ · {startTopic.courseCode}</span>
                  <span className="next-up__name">{startTopic.name}</span>
                  {!firstReady && (
                    <span className="next-up__hint">ต้องทบทวนหัวข้อพื้นฐานก่อน</span>
                  )}
                </span>
                <ArrowRightIcon size={16} />
              </button>
            )}
          </section>

          <Collapsible title="วิชาที่กำลังเรียน" count={inProgress.length}>
            {inProgress.length === 0 ? (
              <p className="right-page__muted">
                {allLearned
                  ? "เรียนครบทุกวิชาแล้ว"
                  : "ยังไม่ได้เริ่มเรียนวิชาใด เริ่มจากหัวข้อที่แนะนำด้านบนได้เลย"}
              </p>
            ) : (
              <ul className="right-page__list">
                {inProgress.map((course) => (
                  <li key={course.id}>
                    <button
                      type="button"
                      className="right-page__list-button"
                      onClick={() => setSelectedCourse?.(course)}
                    >
                      <span className="right-page__list-text">
                        <strong>{course.name}</strong>
                        <small>
                          รู้แล้ว {course.learned}/{course.topics} หัวข้อ
                        </small>
                      </span>
                      <span className="right-page__badge">
                        {Math.round((course.learned / course.topics) * 100)}%
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Collapsible>
        </div>
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

  // หัวข้อที่ควรเรียนต่อ = หัวข้อแรก (ตามลำดับ) ที่ยังไม่เรียน และหัวข้อพื้นฐานของมันเรียนครบแล้ว
  // ถ้าไม่มีหัวข้อที่พร้อมเรียน ใช้หัวข้อแรกที่ยังไม่เรียน แล้วบอกว่าต้องทบทวนพื้นฐานก่อน
  const notDoneTopics = [...courseTopics]
    .sort((a, b) => (a.seqNo || 0) - (b.seqNo || 0))
    .filter((topic) => !topic.done);
  const readyTopic = notDoneTopics.find((topic) =>
    (topic.prerequisites || []).every((id) => topicById[id]?.done)
  );
  const nextUpTopic = readyTopic || notDoneTopics[0] || null;

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
            {isAllLearned ? <CheckIcon size={20} /> : <BookIcon size={20} />}
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

        {/* Progress ring (key = รหัสวิชา เพื่อให้วงรีเซ็ตเมื่อเปลี่ยนวิชา ไม่เด้งเอง) */}
        <section className="right-page__progress">
          <div className="progress-card">
            <ProgressRing
              key={selectedCourse.id}
              value={percent}
              done={isAllLearned}
            />

            <div className="progress-card__text">
              <h3>ความคืบหน้าของวิชา</h3>
              <strong className="progress-card__count">
                {selectedCourse.learned}/{selectedCourse.topics} หัวข้อ
              </strong>
              <p>
                {selectedCourse.topics === 0
                  ? "วิชานี้ยังไม่มีหัวข้อกำหนดไว้"
                  : isAllLearned
                  ? "คุณเรียนรู้ครบทุกหัวข้อในวิชานี้แล้ว!"
                  : `เหลืออีก ${
                      selectedCourse.topics - selectedCourse.learned
                    } หัวข้อ`}
              </p>
            </div>
          </div>

          {nextUpTopic && (
            <button
              type="button"
              className="next-up"
              onClick={() => onSelectTopic?.(nextUpTopic)}
            >
              <span className="next-up__text">
                <span className="next-up__label">ควรเรียนต่อ</span>
                <span className="next-up__name">{nextUpTopic.name}</span>
                {!readyTopic && (
                  <span className="next-up__hint">ต้องทบทวนหัวข้อพื้นฐานก่อน</span>
                )}
              </span>
              <ArrowRightIcon size={16} />
            </button>
          )}
        </section>

        {/* Prerequisites */}
        <Collapsible title="ผ่านตามลำดับ (Prerequisites)" count={prereqList.length}>
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
        </Collapsible>

        {/* Next Courses */}
        <Collapsible title="ต่อยอดไป (Next Courses)" count={nextList.length}>
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
                    <span className="right-page__list-status"><ArrowRightIcon size={14} /></span>
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
        </Collapsible>

        {/* Topics in this course */}
        <Collapsible title="หัวข้อในวิชานี้" count={courseTopics.length}>
          {courseTopics.length === 0 ? (
            <p className="right-page__muted">
              ยังไม่มีหัวข้อในวิชานี้
            </p>
          ) : (
            <ul className="right-page__list">
              {courseTopics.map((topic) => (
                <li key={topic.id} className="right-page__topic-item">
                  {/* ปุ่มซ้าย: คลิกทำเครื่องหมายว่าเรียนแล้ว/ยังไม่เรียนได้ทันที */}
                  <button
                    type="button"
                    className={`right-page__list-status right-page__list-status--clickable ${
                      topic.done ? "is-done" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDone?.(topic.id);
                    }}
                    title={
                      topic.done
                        ? "คลิกเพื่อยกเลิกสถานะเรียนแล้ว"
                        : "คลิกเพื่อทำเครื่องหมายว่าเรียนแล้ว"
                    }
                    aria-label={topic.done ? "เรียนแล้ว" : "ยังไม่เรียน"}
                  >
                    {topic.done ? <CheckIcon size={14} /> : <DiamondIcon size={13} />}
                  </button>

                  {/* ตรงกลาง: คลิกเพื่อเข้าไปดูรายละเอียดหัวข้อ */}
                  <div
                    className="right-page__list-text right-page__list-text--clickable"
                    onClick={() => onSelectTopic?.(topic)}
                    title="คลิกเพื่อดูรายละเอียดหัวข้อนี้"
                  >
                    <strong>{topic.name}</strong>
                    <small>
                      {topic.desc || "คลิกเพื่อดูรายละเอียดหัวข้อ"}
                    </small>
                  </div>

                  {/* ปุ่ม Badge ขวา: คลิกเปลี่ยนสถานะได้ทันทีโดยไม่ต้องเปิดหน้ารายละเอียด */}
                  <button
                    type="button"
                    className={`right-page__badge-btn ${
                      topic.done ? "is-done" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDone?.(topic.id);
                    }}
                    title={
                      topic.done
                        ? "คลิกเพื่อยกเลิกสถานะเรียนแล้ว"
                        : "คลิกเพื่อทำเครื่องหมายว่าเรียนแล้ว"
                    }
                  >
                    {topic.done ? "✓ เรียนแล้ว" : "+ ยังไม่เรียน"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Collapsible>

        {/* Resources (ปิดไว้ก่อน เพื่อให้หน้าไม่ยาวเกิน) */}
        {resources.length > 0 && (
          <Collapsible title="แหล่งเรียนรู้เพิ่มเติม" count={resources.length} defaultOpen={false}>
            <p className="right-page__muted">
              เอกสารและสื่อการสอนแนะนำสำหรับวิชานี้
            </p>
            <ResourceList links={resources} />
          </Collapsible>
        )}
      </div>

      {/* ปุ่มหลักติดขอบล่างตลอด ไม่ต้องเลื่อนหา */}
      <footer className="right-page__footer">
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
      </footer>
    </aside>
  );
}

export default Rightpage;