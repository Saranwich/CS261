import "./Rightpage.css";
// ใช้สไตล์รายการเส้นทางหัวข้อร่วมกับหน้ารายละเอียดหัวข้อ
import "./TopicDetail.css";
import ResourceList from "./ResourceList";
import COURSE_RESOURCES from "../data/courseResources";

// แสดงรายละเอียดวิชาที่เลือก พร้อมหัวข้อ วิชาที่เกี่ยวข้อง และแหล่งเรียนรู้
function Rightpage({
  selectedCourse,
  setSelectedCourse,
  courses = [],
  courseTopics = [],
  onShowTopics,
  onSelectTopic,
}) {
  // แสดงข้อความแนะนำเมื่อยังไม่มีวิชาที่เลือก
  if (!selectedCourse) {
    return (
      <div className="right-page">
        <div className="empty-course">
          <h2>โปรดเลือกรายวิชา</h2>
        </div>
      </div>
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

  return (
    <div className="right-page">
      <div className="course-detail">
        <div className="detail-label">วิชาที่เลือก</div>
        <h1 className="detail-title">
          <span className="detail-dot"></span>
          {selectedCourse.name}
        </h1>

        <div className="course-description">
          <div className="description-title">คำอธิบายรายวิชา</div>
          <div className="description-text">{selectedCourse.description}</div>
        </div>

        <div className="detail-info">
          ใช้ความรู้จาก <strong>{prereqList.length} วิชา</strong> • ต่อยอดไป{" "}
          <strong>{nextList.length} วิชา</strong> • มี{" "}
          <strong>{selectedCourse.topics} หัวข้อ</strong>
        </div>

        <div className="detail-progress">
          <div
            className="detail-progress-fill"
            style={{
              width: `${
                selectedCourse.topics === 0
                  ? 0
                  : (selectedCourse.learned / selectedCourse.topics) * 100
              }%`,
            }}
          />
        </div>

        {/* ปุ่มเปิดรายการหัวข้อของวิชานี้ และล้างวิชาที่เลือก */}
        <div className="detail-buttons">
          <button className="primary-button" onClick={onShowTopics}>
            ดูหัวข้อในวิชานี้
          </button>
          <button
            className="secondary-button"
            onClick={() => setSelectedCourse(null)}
          >
            ล้าง
          </button>
        </div>

        {/* การ์ดวิชาที่ต้องเรียนก่อน คลิกเพื่อเปิดรายละเอียดวิชานั้น */}
        <div className="section-block">
          <div className="section-title">ผ่านตามลำดับ</div>
          <div className="relation-list">
            {prereqList.length > 0 ? (
              prereqList.map((course, index) => (
                <button
                  key={course.id}
                  type="button"
                  className="relation-item-wrapper"
                  onClick={() => setSelectedCourse(course)}
                  title={`คลิกเพื่อดูวิชา ${course.name}`}
                >
                  <div className="relation-card prereq-card">
                    <div className="badge prereq-badge">{index + 1}</div>
                    <div className="relation-text">
                      <div className="relation-name">{course.name}</div>
                      <div className="relation-sub">
                        รู้แล้ว {course.learned}/{course.topics} หัวข้อ
                      </div>
                    </div>
                  </div>
                  {index < prereqList.length - 1 && (
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="empty-text">- ไม่มีวิชาก่อนหน้า -</div>
            )}
          </div>
        </div>

        {/* การ์ดวิชาที่เรียนต่อจากวิชานี้ คลิกเพื่อเปลี่ยนวิชาที่เลือก */}
        <div className="section-block">
          <div className="section-title">ต่อยอดไป</div>
          <div className="relation-list">
            {nextList.length > 0 ? (
              nextList.map((course, index) => (
                <button
                  key={course.id}
                  type="button"
                  className="relation-item-wrapper"
                  onClick={() => setSelectedCourse(course)}
                  title={`คลิกเพื่อดูวิชา ${course.name}`}
                >
                  <div className="relation-card next-card">
                    <div className="badge next-badge">{index + 1}</div>
                    <div className="relation-text">
                      <div className="relation-name">{course.name}</div>
                      <div className="relation-sub">
                        รู้แล้ว {course.learned}/{course.topics} หัวข้อ
                      </div>
                    </div>
                  </div>
                  {index < nextList.length - 1 && (
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="empty-text">- ไม่มีวิชาต่อยอด -</div>
            )}
          </div>
        </div>

        {/* รายการหัวข้อในวิชานี้ คลิกหัวข้อเพื่อเลือกดูรายละเอียด */}
        <div className="section-block">
          <div className="section-title">หัวข้อในวิชานี้</div>
          {courseTopics.length > 0 ? (
            <div className="path-list">
              {courseTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className="path-list-item"
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-text">- ยังไม่มีหัวข้อในวิชานี้ -</div>
          )}
        </div>

        </div>
      </div>
  );
}

export default Rightpage;
