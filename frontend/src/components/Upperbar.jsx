import './Upperbar.css';
import { useState, useRef, useEffect } from 'react';

const MAX_COURSES = 5;
const MAX_TOPICS = 8;

// แยกคำค้นเป็นคำ ๆ ไม่สนตัวพิมพ์เล็กใหญ่ ทุกคำต้องเจอ
// เช่น "cs 101", "cs101", "linked list" ใช้ได้หมด
// คืนค่า 0 = ไม่ตรง, ยิ่งมากยิ่งตรง
function matchScore(query, text, code = "") {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${code} ${text}`.toLowerCase();
  if (tokens.length === 0 || !tokens.every((t) => haystack.includes(t))) return 0;

  const q = query.toLowerCase().trim();
  if (code.toLowerCase() === q) return 4;          // รหัสวิชาตรงเป๊ะ
  if (code.toLowerCase().startsWith(q)) return 3;  // ขึ้นต้นด้วยรหัสวิชา
  if (text.toLowerCase().startsWith(q)) return 3;  // ขึ้นต้นด้วยชื่อ
  return 1;                                        // มีคำอยู่ตรงไหนสักที่
}

function Upperbar({
  onLogout,
  activeTab,
  setActiveTab,
  courses = [],
  topics = [],
  onSelectCourse,
  onSelectTopic,
}) {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);

  // ข้อมูลนักศึกษาจาก localStorage
  const student = JSON.parse(localStorage.getItem("user") || "null");
  const studentName = student?.displayNameTh?.trim() || "";

  // ========================================
  // ค้นหา (คำนวณทุกครั้งที่พิมพ์ ข้อมูลไม่เยอะจึงไม่ต้อง debounce)
  // ========================================
  const query = searchText.trim();

  const courseResults = query
    ? courses
        .map((c) => ({ item: c, score: matchScore(query, c.name, c.code) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score || a.item.code.localeCompare(b.item.code))
        .slice(0, MAX_COURSES)
        .map((r) => ({ type: "course", item: r.item }))
    : [];

  const topicResults = query
    ? topics
        .map((t) => ({ item: t, score: matchScore(query, t.name) }))
        .filter((r) => r.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.item.courseCode.localeCompare(b.item.courseCode) ||
            a.item.seqNo - b.item.seqNo
        )
        .slice(0, MAX_TOPICS)
        .map((r) => ({ type: "topic", item: r.item }))
    : [];

  // รวมเป็นลิสต์เดียว เอาไว้ใช้กับปุ่มลูกศรขึ้น/ลง
  const results = [...courseResults, ...topicResults];

  // ========================================
  // เลือกผลลัพธ์
  // ========================================
  function handleSelect(result) {
    if (result.type === "course") {
      onSelectCourse(result.item);
      setActiveTab("course");
    } else {
      onSelectTopic(result.item); // selectTopic สลับไปแท็บรายหัวข้อให้เอง
    }
    setSearchText('');
    setIsOpen(false);
    setActiveIndex(-1);
  }

  // ========================================
  // คีย์บอร์ด: ↑ ↓ เลื่อน, Enter เลือก, Esc ปิด
  // ========================================
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // ไม่ได้เลื่อนเลือก → เลือกอันแรกให้
      handleSelect(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  }

  // คลิกนอกช่องค้นหา → ปิด dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function renderItem(result, index) {
    const isActive = index === activeIndex;
    const isCourse = result.type === "course";

    return (
      <li
        key={`${result.type}-${result.item.id}`}
        role="option"
        aria-selected={isActive}
        className={`search-item ${isActive ? "active" : ""}`}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={(e) => {
          e.preventDefault(); // กัน input เสีย focus ก่อนคลิกทำงาน
          handleSelect(result);
        }}
      >
        <span className="search-item-main">{result.item.name}</span>
        {!isCourse && (
          <span className="search-item-sub">
            {result.item.courseCode} · {result.item.courseName}
          </span>
        )}
      </li>
    );
  }

  const showDropdown = isOpen && query !== "";

  return (
    <nav className="nav-container" aria-label="หน้าหลัก">
      <span className="brand">CSTUCOM</span>

      <div className="tabs" role="tablist">
        <button
          className={`tab ${activeTab === 'course' ? 'active' : ''}`}
          onClick={() => setActiveTab('course')}
        >
          รายวิชา
        </button>

        <button
          className={`tab ${activeTab === 'topic' ? 'active' : ''}`}
          onClick={() => setActiveTab('topic')}
        >
          รายหัวข้อ
        </button>
      </div>

      <div className="search-wrap" ref={wrapRef}>
        <label className="search-btn" htmlFor="search-input">
          🔍︎
          <input
            id="search-input"
            type="text"
            placeholder="ค้นหาหัวข้อ / วิชา"
            autoComplete="off"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </label>

        {showDropdown && (
          <div className="search-dropdown">
            {results.length === 0 ? (
              <div className="search-empty">ไม่พบ "{query}"</div>
            ) : (
              <ul role="listbox">
                {courseResults.length > 0 && (
                  <li className="search-group" role="presentation">รายวิชา</li>
                )}
                {courseResults.map((r, i) => renderItem(r, i))}

                {topicResults.length > 0 && (
                  <li className="search-group" role="presentation">หัวข้อ</li>
                )}
                {topicResults.map((r, i) => renderItem(r, courseResults.length + i))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="user" title="ข้อมูลนักศึกษา">
        <span className="avatar">
          {studentName.charAt(0) || "?"}
        </span>

        <span className="who">
          <b>{studentName}</b>
          <small>วิทยาการคอมพิวเตอร์</small>
        </span>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        ออกจากระบบ
      </button>
    </nav>
  );
}

export default Upperbar;