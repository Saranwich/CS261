import { useState, useEffect, useRef, useMemo } from "react";
import Rightpage from "../components/Rightpage";
import Leftpage from "../components/leftpage";
import Upperbar from "../components/Upperbar";
import Topicpage from "../components/Topicpage";
import TopicDetail from "../components/TopicDetail";
import { toLookup, toTopicCards } from "../utils/topics";
import { USE_MOCK_DATA } from "../config/mockConfig";
import { mockSkillTree, mockCourseDetails, mockDoneTopicIds } from "../data/mockSkillTree";
import "./Homepage.css";

// key ที่ใช้เก็บความคืบหน้าของโหมด mock ใน localStorage แยกตามรหัสนักศึกษา
// (App.jsx เก็บ studentId ไว้ตอน login) จึงไม่ปนกันถ้ามีหลายคนใช้เครื่องเดียวกัน
// และไม่ถูกล้างตอน logout ทำให้ login กลับมาแล้วความคืบหน้ายังอยู่
function mockProgressKey() {
  return `mockDoneTopicIds:${localStorage.getItem("studentId") || "guest"}`;
}

// อ่านความคืบหน้าของโหมด mock ที่เคยบันทึกไว้ ถ้าไม่มี/อ่านไม่ได้ ใช้ค่าตั้งต้นจาก mockSkillTree.js
function loadMockProgress() {
  try {
    const saved = localStorage.getItem(mockProgressKey());
    return saved ? JSON.parse(saved) : mockDoneTopicIds;
  } catch {
    return mockDoneTopicIds;
  }
}

// แปลงข้อมูลจาก backend ให้เป็นรูปแบบที่ Leftpage / Rightpage ใช้
function toCourseCards(tree, topics) {
  return tree.courses.map((course) => {
    const courseTopics = topics.filter((topic) => topic.courseId === course.id);

    const prerequisites = (tree.prerequisites || [])
      .filter((link) => link.courseId === course.id)
      .map((link) => link.prerequisiteId);

    // วิชาที่ต้องใช้วิชานี้เป็นพื้นฐาน (กลับทิศของข้างบน)
    const nextCourses = (tree.prerequisites || [])
      .filter((link) => link.prerequisiteId === course.id)
      .map((link) => link.courseId);

    return {
      id: course.id,
      code: course.code,
      name: `${course.code} ${course.name}`,
      topics: courseTopics.length,
      learned: courseTopics.filter((topic) => topic.done).length,
      prerequisites: prerequisites,
      nextCourses: nextCourses,
      description: course.desc || "ยังไม่มีคำอธิบายรายวิชา",
    };
  });
}


// ========================================
// ความกว้างแผงขวา (ลากเส้นแบ่งกลางจอเพื่อปรับ) เก็บเป็น % ของจอ จำค่าไว้ใน localStorage
// ========================================
const RIGHT_MIN = 22;
const RIGHT_MAX = 55;
const RIGHT_DEFAULT = 30;
const RIGHT_KEY = "rightPanelPercent";

function loadRightPercent() {
  try {
    const saved = Number(localStorage.getItem(RIGHT_KEY));
    return saved >= RIGHT_MIN && saved <= RIGHT_MAX ? saved : RIGHT_DEFAULT;
  } catch {
    return RIGHT_DEFAULT;
  }
}

const clampRight = (value) => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, value));


function Home({ onLogout }) {

  // ========================================
  // ข้อมูล: โหมดจริงดึงจาก backend  / โหมด mock (เฉพาะตอน dev) ใช้ข้อมูลจำลองทันที
  //   tree          = แผนผังวิชา + เส้น prerequisite   null = ยังโหลดไม่เสร็จ
  //   courseDetails = รายละเอียด + หัวข้อ ของทุกวิชา
  //   doneTopicIds  = id ของหัวข้อที่รู้แล้ว
  //                   โหมดจริง: เก็บที่ backend ที่เดียว
  //                   โหมด mock: เก็บใน localStorage แยกรายรหัสนักศึกษา (รีเฟรช / logout แล้วไม่หาย)
  // ========================================
  const [tree, setTree] = useState(USE_MOCK_DATA ? mockSkillTree : null);
  const [courseDetails, setCourseDetails] = useState(USE_MOCK_DATA ? mockCourseDetails : []);
  const [doneTopicIds, setDoneTopicIds] = useState(() =>
    USE_MOCK_DATA ? loadMockProgress() : []
  );
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // เพิ่มค่า = สั่งโหลดข้อมูลใหม่ (ปุ่มลองอีกครั้ง)

  // ข้อความแจ้งเตือนเล็ก ๆ ด้านล่างจอ (แทน alert ที่บล็อกหน้าเว็บ)
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  function showToast(message, type = "error") {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ----- ปรับขนาดแผงซ้าย/ขวา -----
  const [rightPercent, setRightPercent] = useState(loadRightPercent);
  const [isResizing, setIsResizing] = useState(false);
  const homepageRef = useRef(null);
  const resizingRef = useRef(false);
  const pendingPercentRef = useRef(rightPercent); // ค่าล่าสุดระหว่างลาก (ไม่ผ่าน state จึงไม่ re-render)

  useEffect(() => {
    try {
      localStorage.setItem(RIGHT_KEY, String(rightPercent));
    } catch {
      /* บันทึกไม่ได้ก็ไม่เป็นไร */
    }
  }, [rightPercent]);

  function startResize(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizingRef.current = true;
    pendingPercentRef.current = rightPercent;
    setIsResizing(true);
  }

  // ระหว่างลาก ตั้งค่าตัวแปร CSS ตรง ๆ ไม่ผ่าน state → ทั้งหน้าไม่ต้อง re-render ทุกพิกเซล
  function moveResize(event) {
    if (!resizingRef.current || !homepageRef.current) return;
    const rect = homepageRef.current.getBoundingClientRect();
    const percent = Math.round(clampRight(((rect.right - event.clientX) / rect.width) * 100) * 10) / 10;
    pendingPercentRef.current = percent;
    homepageRef.current.style.setProperty("--right-w", `${percent}%`);
  }

  // ปล่อยเมาส์ค่อยบันทึกค่าสุดท้ายครั้งเดียว
  function endResize(event) {
    resizingRef.current = false;
    setIsResizing(false);
    setRightPercent(pendingPercentRef.current);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  // คีย์บอร์ด: ← ขยายแผงขวา / → ย่อแผงขวา
  function handleResizerKey(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setRightPercent((current) => clampRight(current + 2));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setRightPercent((current) => clampRight(current - 2));
    }
  }

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // "course" = แผนผังรายวิชา / "topic" = แผนผังรายหัวข้อ
  const [activeTab, setActiveTab] = useState("course");

  // โหมด mock: บันทึกความคืบหน้าลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (!USE_MOCK_DATA) return;
    try {
      localStorage.setItem(mockProgressKey(), JSON.stringify(doneTopicIds));
    } catch (error) {
      console.warn("บันทึกความคืบหน้า mock ไม่สำเร็จ", error);
    }
  }, [doneTopicIds]);

  // ดึงข้อมูลจาก backend ตอนเปิดหน้านี้ (โหมด mock ข้าม)
  useEffect(() => {
    if (USE_MOCK_DATA) return;
    let isMounted = true;
    setLoadError(false);

    async function loadAll() {
      try {
        // 1) หัวข้อที่รู้แล้ว (ต้อง login — browser แนบ cookie ให้เอง)
        const progressResponse = await fetch("/api/progress");

        // session หมดอายุ (ไม่ได้ใช้งาน 30 นาที) → กลับไปหน้า login
        if (progressResponse.status === 401) {
          onLogout();
          return;
        }

        // 2) แผนผังวิชา + เส้น prerequisite (ไม่ต้อง login)
        const treeResponse = await fetch("/api/skill-tree");

        if (!treeResponse.ok || !progressResponse.ok) {
          throw new Error("backend ตอบ error");
        }

        const treeData = await treeResponse.json();
        const progressList = await progressResponse.json();

        // 3) หัวข้อของทุกวิชา (ยิงพร้อมกันทุกวิชา แล้วรอให้ครบ)
        const details = await Promise.all(
          treeData.courses.map(async (course) => {
            const response = await fetch(`/api/courses/${course.id}`);
            if (!response.ok) throw new Error("backend ตอบ error");
            return response.json();
          })
        );

        if (!isMounted) return;
        setTree(treeData);
        setCourseDetails(details);
        setDoneTopicIds(progressList.map((progress) => progress.topicId));
      } catch (error) {
        console.error("โหลดข้อมูลรายวิชาไม่สำเร็จ", error);
        if (isMounted) setLoadError(true);
      }
    }

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [onLogout, reloadKey]);

  // กด Esc = ล้างสิ่งที่เลือกอยู่ (หัวข้อก่อน แล้วค่อยวิชา) ยกเว้นตอนกำลังพิมพ์ในช่องค้นหา
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (selectedTopicId) setSelectedTopicId(null);
      else if (selectedCourseId) setSelectedCourseId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTopicId, selectedCourseId]);

  // แปลงข้อมูลให้หน้าเว็บใช้ — useMemo: คำนวณใหม่เฉพาะตอนข้อมูลเปลี่ยนจริง (เช่น ติ๊กหัวข้อ)
  // ไม่ใช่ทุกครั้งที่หน้า re-render (ไม่งั้นผังรายหัวข้อจะจัดวางใหม่ทั้งหมดทุกครั้ง)
  const topics = useMemo(
    () => toTopicCards(courseDetails, doneTopicIds),
    [courseDetails, doneTopicIds]
  );
  const topicById = useMemo(() => toLookup(topics), [topics]);
  const courses = useMemo(
    () => (tree ? toCourseCards(tree, topics) : []),
    [tree, topics]
  );

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;
  const selectedTopic = topicById[selectedTopicId] || null;

  // เลือกวิชา (หรือ null = เลิกเลือก) → เลิกเลือกหัวข้อด้วย
  function selectCourse(course) {
    setSelectedCourseId(course ? course.id : null);
    setSelectedTopicId(null);
  }

  // เลือกหัวข้อ → เลือกวิชาของหัวข้อนั้นด้วย แล้วไปแท็บรายหัวข้อ
  function selectTopic(topic) {
    if (!topic) return;
    setSelectedTopicId(topic.id);
    setSelectedCourseId(topic.courseId);
    setActiveTab("topic");
  }

  // ========================================
  // ติ๊ก / ยกเลิกติ๊ก "รู้แล้ว"
  //   ยังไม่รู้ → PUT    /api/progress/topics/{topicId}
  //   รู้แล้ว   → DELETE /api/progress/topics/{topicId}
  // อัปเดตหน้าจอก่อนให้รู้สึกเร็ว ถ้าบันทึกไม่สำเร็จ ย้อนกลับและแจ้งผู้ใช้
  // (โหมด mock: แค่เปลี่ยน state แล้ว useEffect ด้านบนจะบันทึกลง localStorage ให้)
  // ========================================
  async function toggleTopicDone(topicId) {
    const wasDone = doneTopicIds.includes(topicId);

    const setDone = (done) =>
      setDoneTopicIds((current) =>
        done
          ? current.includes(topicId) ? current : [...current, topicId]
          : current.filter((id) => id !== topicId)
      );

    setDone(!wasDone);

    // เพิ่งติ๊กหัวข้อสุดท้ายของวิชา → แจ้งว่าเรียนครบวิชาแล้ว
    const justDone = topicById[topicId];
    if (!wasDone && justDone) {
      const allDone = topics
        .filter((topic) => topic.courseId === justDone.courseId)
        .every((topic) => topic.id === topicId || topic.done);
      if (allDone) showToast(`เรียนครบวิชา ${justDone.courseCode} แล้ว`, "success");
    }

    if (USE_MOCK_DATA) return;

    try {
      const response = await fetch(`/api/progress/topics/${topicId}`, {
        method: wasDone ? "DELETE" : "PUT",
      });

      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok) throw new Error("backend ตอบ error");
    } catch (error) {
      console.error("บันทึกไม่สำเร็จ", error);
      setDone(wasDone); // ย้อนกลับ
      showToast("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  // ========================================
  // ฝั่งซ้ายแสดงอะไร
  //   โหลดพัง           → ข้อความ error
  //   ยังโหลดไม่เสร็จ    → กำลังโหลด
  //   แท็บรายหัวข้อ      → แผนผังรายหัวข้อ
  //   แท็บรายวิชา (ปกติ) → แผนผังรายวิชา
  // ========================================
  function renderLeftSide() {
    if (loadError) {
      return (
        <div className="load-error" role="alert">
          <strong>โหลดข้อมูลรายวิชาไม่สำเร็จ</strong>
          <span>ลองเช็กว่า backend เปิดอยู่ไหม แล้วกดลองอีกครั้ง</span>
          <button type="button" className="retry-btn" onClick={() => setReloadKey((key) => key + 1)}>
            ลองอีกครั้ง
          </button>
        </div>
      );
    }

    if (!tree) {
      return (
        <div className="skeleton-map" role="status" aria-label="กำลังโหลดข้อมูลรายวิชา">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      );
    }

    if (activeTab === "topic") {
      return (
        <Topicpage
          topics={topics}
          courses={courses}
          selectedTopic={selectedTopic}
          selectedCourse={selectedCourse}
          onSelectTopic={selectTopic}
        />
      );
    }

    return (
      <Leftpage
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={selectCourse}
      />
    );
  }


  return (
    <div className="app-shell">
      <Upperbar
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        topics={topics}
        onSelectCourse={selectCourse}
        onSelectTopic={selectTopic}
      />

      <div
        className={`homepage ${isResizing ? "is-resizing" : ""}`}
        ref={homepageRef}
        style={{ "--right-w": `${rightPercent}%` }}
      >

        {/* ฝั่งซ้าย 70% */}
        <div className="leftPage">
          {renderLeftSide()}
        </div>

        {/* เส้นแบ่ง: ลากเพื่อปรับขนาด / ดับเบิลคลิกเพื่อรีเซ็ต */}
        <div
          className="resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="ปรับขนาดแผงรายละเอียด"
          aria-valuemin={RIGHT_MIN}
          aria-valuemax={RIGHT_MAX}
          aria-valuenow={Math.round(rightPercent)}
          tabIndex={0}
          title="ลากเพื่อปรับขนาด (ดับเบิลคลิกเพื่อรีเซ็ต)"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onKeyDown={handleResizerKey}
          onDoubleClick={() => setRightPercent(RIGHT_DEFAULT)}
        />

        {/* ฝั่งขวา 30%: แท็บรายหัวข้อ + เลือกหัวข้อไว้ → รายละเอียดหัวข้อ / นอกนั้น → รายละเอียดวิชา */}
        <div className="rightPage">
          {activeTab === "topic" && selectedTopic ? (
            <TopicDetail
              topic={selectedTopic}
              topicById={topicById}
              onSelectTopic={selectTopic}
              onToggleDone={toggleTopicDone}
              onClear={() => setSelectedTopicId(null)}
            />
          ) : (
            <Rightpage
              selectedCourse={selectedCourse}
              setSelectedCourse={selectCourse}
              courses={courses}
              courseTopics={topics.filter((topic) => topic.courseId === selectedCourseId)}
              allTopics={topics}
              topicById={topicById}
              onShowTopics={() => setActiveTab("topic")}
              onSelectTopic={selectTopic}
              onToggleDone={toggleTopicDone}
            />
          )}
        </div>

      </div>

      {toast && (
        <div className={`toast toast--${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Home;