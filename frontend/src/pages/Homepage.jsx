import { useState, useEffect } from "react";
import Rightpage from "../components/Rightpage";
import Leftpage from "../components/leftpage";
import Upperbar from "../components/Upperbar";
import Topicpage from "../components/Topicpage";
import TopicDetail from "../components/TopicDetail";
import { toLookup, toTopicCards } from "../utils/topics";
// นำเข้าข้อมูลจำลอง fallback ในกรณีที่ยังไม่ได้เปิด Backend หรือไม่มีข้อมูล
import { fallbackSkillTree, fallbackCourseDetails } from "../data/mockSkillTree";
import "./Homepage.css";

// ========================================
// แปลงข้อมูลจาก backend ให้เป็นรูปแบบที่ Leftpage / Rightpage ใช้อยู่แล้ว
// ========================================

function toCourseCards(tree, topics = []) {
  if (!tree || !tree.courses) return [];

  return tree.courses.map((course) => {
    // หัวข้อของวิชานี้
    const courseTopics = (topics || []).filter((topic) => topic.courseId === course.id);

    // วิชาที่ต้องผ่านก่อนวิชานี้
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

function Home({ onLogout }) {
  // เริ่มต้นด้วย fallbackSkillTree ทันที เพื่อป้องกันหน้าจอว่างเปล่า
  const [tree, setTree] = useState(fallbackSkillTree);
  const [courseDetails, setCourseDetails] = useState(fallbackCourseDetails);
  const [doneTopicIds, setDoneTopicIds] = useState(() => {
    try {
      const saved = localStorage.getItem("learnedTopicIds");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadError, setLoadError] = useState(false);

  // สิ่งที่เลือกอยู่ (เก็บเฉพาะ id ตอนเริ่มเป็น null)
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // แท็บที่เลือกอยู่บน Upperbar: "course" (รายวิชา) หรือ "topic" (รายหัวข้อ)
  const [activeTab, setActiveTab] = useState("course");

  // ========================================
  // โหลดข้อมูลจาก Backend API ตอนเปิดหน้าเว็บ
  // ========================================

  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      try {
        // 1) หัวข้อที่เรารู้แล้วจาก GET /api/progress
        let progressList = [];
        try {
          const progressResponse = await fetch("/api/progress");
          if (progressResponse.ok) {
            progressList = await progressResponse.json();
          }
        } catch (err) {
          console.warn("ไม่สามารถดึง progress จาก backend ได้:", err);
        }

        // 2) แผนผังวิชาจาก GET /api/skill-tree
        const treeResponse = await fetch("/api/skill-tree");

        if (!treeResponse.ok) {
          throw new Error(`backend /api/skill-tree status: ${treeResponse.status}`);
        }

        const treeData = await treeResponse.json();

        if (!treeData.courses || treeData.courses.length === 0) {
          // ถ้า backend ส่งวิชาว่าง ให้ใช้ fallback
          if (isMounted) {
            setTree(fallbackSkillTree);
            setCourseDetails(fallbackCourseDetails);
          }
          return;
        }

        // 3) ดึงรายละเอียดและหัวข้อของทุกวิชาจาก GET /api/courses/{id} พร้อมกัน
        const details = await Promise.all(
          treeData.courses.map(async (course) => {
            const response = await fetch(`/api/courses/${course.id}`);
            if (!response.ok) {
              throw new Error(`backend /api/courses/${course.id} error: ${response.status}`);
            }
            return response.json();
          })
        );

        if (isMounted) {
          setTree(treeData);
          setCourseDetails(details);
          if (progressList.length > 0) {
            setDoneTopicIds(progressList.map((progress) => progress.topicId));
          }
        }
      } catch (error) {
        console.warn("โหลดข้อมูลจาก backend ไม่สำเร็จ ใช้ข้อมูลจำลอง (fallback data):", error);
        if (isMounted) {
          setTree(fallbackSkillTree);
          setCourseDetails(fallbackCourseDetails);
          setLoadError(false);
        }
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // ซิงค์หัวข้อที่รู้แล้วลง localStorage
  useEffect(() => {
    try {
      localStorage.setItem("learnedTopicIds", JSON.stringify(doneTopicIds));
    } catch {
      // ignore
    }
  }, [doneTopicIds]);

  // คำนวณโครงสร้างข้อมูลพร้อมใช้งาน
  const topics = toTopicCards(courseDetails, doneTopicIds);
  const topicById = toLookup(topics);
  const courses = tree ? toCourseCards(tree, topics) : [];

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;
  const selectedTopic = topicById[selectedTopicId] || null;

  function selectCourse(course) {
    setSelectedCourseId(course ? course.id : null);
    setSelectedTopicId(null);
  }

  function selectTopic(topic) {
    if (!topic) return;
    setSelectedTopicId(topic.id);
    setSelectedCourseId(topic.courseId);
    setActiveTab("topic");
  }

  // บันทึกความก้าวหน้า "รู้แล้ว" / "ยังไม่รู้"
  async function toggleTopicDone(topicId) {
    const isDone = doneTopicIds.includes(topicId);

    // Optimistic update
    if (isDone) {
      setDoneTopicIds((prev) => prev.filter((id) => id !== topicId));
    } else {
      setDoneTopicIds((prev) => [...prev, topicId]);
    }

    try {
      const response = await fetch(`/api/progress/topics/${topicId}`, {
        method: isDone ? "DELETE" : "PUT",
      });

      if (response.status === 401 && onLogout) {
        onLogout();
        return;
      }
    } catch (err) {
      console.warn("ไม่สามารถ sync progress ไปยัง backend:", err);
    }
  }

  // ฝั่งซ้าย: แสดงผังรายหัวข้อ หรือ ผังรายวิชา
  function renderLeftSide() {
    if (loadError) {
      return (
        <div className="load-error">
          โหลดข้อมูลรายวิชาไม่สำเร็จ ลองเช็กว่า backend เปิดอยู่ไหม
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
    <>
      <Upperbar
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        topics={topics}
        onSelectCourse={selectCourse}
        onSelectTopic={selectTopic}
      />

      <div className="homepage">
        {/* ฝั่งซ้าย 70% */}
        <div className="leftPage">
          {renderLeftSide()}
        </div>

        {/* ฝั่งขวา 30% */}
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
              onShowTopics={() => setActiveTab("topic")}
              onSelectTopic={selectTopic}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
