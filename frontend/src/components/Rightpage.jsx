import "./Rightpage.css";


function Rightpage({selectedCourse,courses = [],courseTopics = [],setSelectedCourse,onShowTopics,onSelectTopic,}) {
  if (selectedCourse === null) {
    return (
      <div className="right-page">
        <div className="empty-course">
          <h2>โปรดเลือกรายวิชา</h2>
        </div>
      </div>
    );
  }

  // ฟังก์ชันดึงข้อมูลวิชาจาก array ตาม id
  const getCourseById = (id) => courses.find((c) => c.id === id);

  const prereqList = (selectedCourse.prerequisites || [])
    .map(getCourseById)
    .filter(Boolean);

  const nextList = (selectedCourse.nextCourses || [])
    .map(getCourseById)
    .filter(Boolean);

  return (
    <div className="right-page">
      <div className="course-detail">
        <div className="detail-label">วิชาที่เลือก</div>
        <h1 className="detail-title">
          <span className="detail-dot"></span>
          {selectedCourse.name}
        </h1>
        {/* ==================================
    ส่วน: คำอธิบายรายวิชา
================================== */}
        <div className="course-description">
          <div className="description-title">
            คำอธิบายรายวิชา
          </div>

          <div className="description-text">
            {selectedCourse.description}
          </div>
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
              width: `${selectedCourse.topics === 0
                ? 0
                : (selectedCourse.learned / selectedCourse.topics) * 100
                }%`,
            }}
          />
        </div>

        <div className="detail-buttons">
          <button className="primary-button" onClick={onShowTopics}>ดูหัวข้อในวิชานี้</button>
          <button className="secondary-button" onClick={() => setSelectedCourse(null)}>ล้าง</button>
        </div>
        
        {/* ==================================
            ส่วน: ผ่านตามลำดับ (Prerequisites)
        ================================== */}
        <div className="section-block">
          <div className="section-title">ผ่านตามลำดับ</div>
          <div className="relation-list">
            {prereqList.length > 0 ? (
              prereqList.map((course, index) => (
                <div key={course.id} className="relation-item-wrapper">
                  <div className="relation-card prereq-card" onClick={() => setSelectedCourse(course)}style={{ cursor: "pointer" }}>
                    <div className="badge prereq-badge">{index + 1}</div>
                    <div className="relation-text">
                      <div className="relation-name">{course.name}</div>
                      <div className="relation-sub">
                        รู้แล้ว {course.learned}/{course.topics} หัวข้อ
                      </div>
                    </div>
                  </div>
                  {index < prereqList.length - 1 && (
                    <span className="arrow">→</span>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-text">- ไม่มีวิชาก่อนหน้า -</div>
            )}
          </div>
        </div>

        {/* ==================================
            ส่วน: ต่อยอดไป (Next Courses)
        ================================== */}
        <div className="section-block">
          <div className="section-title">ต่อยอดไป</div>
          <div className="relation-list">
            {nextList.length > 0 ? (
              nextList.map((course, index) => (
                <div key={course.id} className="relation-item-wrapper">
                  <div className="relation-card next-card" onClick={() => setSelectedCourse(course)}style={{ cursor: "pointer" }}>
                    <div className="badge next-badge">{index + 1}</div>
                    <div className="relation-text">
                      <div className="relation-name">{course.name}</div>
                      <div className="relation-sub">
                        รู้แล้ว {course.learned}/{course.topics} หัวข้อ
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-text">- ไม่มีวิชาต่อยอด -</div>
            )}
          </div>
        </div>

        {/* ==================================
        ส่วน: หัวข้อในวิชานี้
        ================================== */}
        <div className="section-block">
          <div className="section-title">หัวข้อในวิชานี้</div>
          <div className="path-list">{courseTopics.length > 0 ? (courseTopics.map((topic) => (
            <div key={topic.id} className="path-item"onClick={() => onSelectTopic(topic)}style={{ cursor: "pointer" }}>{topic.name}</div>))) : (
            <div className="empty-text">- ไม่มีหัวข้อ -</div>)}
          </div>
        </div>


        {/* ==================================
        ส่วน: แหล่งเรียนวิชานี้
        ================================== */}
        <div className="section-block">
          <div className="section-title">แหล่งเรียนวิชานี้</div>
          <ResourceList resources={COURSE_RESOURCES[selectedCourse.code] || []} />
          </div>
      </div>
    </div>
  );
}

export default Rightpage;