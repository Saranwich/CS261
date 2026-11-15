import './Upperbar.css';
import { useState } from 'react';

const MAX_COURSES = 5;
const MAX_TOPICS = 8;

// แยกคำค้นเป็นคำ ๆ ไม่สนตัวพิมพ์เล็กใหญ่ ทุกคำต้องเจอ
// คืนค่า 0 = ไม่ตรง, ยิ่งมากยิ่งตรง
function matchScore(query, text, code = "") {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${code} ${text}`.toLowerCase();
  if (tokens.length === 0 || !tokens.every((t) => haystack.includes(t))) return 0;

  const q = query.toLowerCase().trim();
  if (code.toLowerCase() === q) return 4;
  if (code.toLowerCase().startsWith(q)) return 3;
  if (text.toLowerCase().startsWith(q)) return 3;
  return 1;
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

  const student = JSON.parse(localStorage.getItem("user") || "null");
  const studentName = student?.displayNameTh?.trim() || "";

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

  const results = [...courseResults, ...topicResults];

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

      <div className="search-wrap">
        <label className="search-btn" htmlFor="search-input">
          🔍︎
          <input
            id="search-input"
            type="text"
            placeholder="ค้นหาหัวข้อ / วิชา"
            autoComplete="off"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
      </div>

      <div className="user" title="ข้อมูลนักศึกษา">
        <span className="avatar">{studentName.charAt(0) || "?"}</span>
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