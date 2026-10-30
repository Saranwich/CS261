import './Upperbar.css';
import { useState, useRef, useEffect } from 'react';

// ========================================
// [จุดที่แก้] Upperbar Component
// - รับ props activeTab, setActiveTab เพื่อให้สลับหน้ารายวิชา / รายหัวข้อได้จาก Navbar
// - รับ courses, topics เพื่อใช้ในระบบค้นหา (Search)
// ========================================
function Upperbar({
  onLogout,
  activeTab = 'course',
  setActiveTab,
  courses = [],
  topics = [],
  onSelectCourse,
  onSelectTopic,
}) {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapRef = useRef(null);

  // ดึงข้อมูลชื่อนักศึกษาจาก localStorage ที่บันทึกไว้ตอน login
  const student = JSON.parse(localStorage.getItem("user") || "null");
  const studentName = student?.displayNameTh?.trim() || "นักศึกษา";

  // [จุดที่แก้] ฟิลเตอร์ค้นหาทั้งชื่อวิชา รหัสวิชา และชื่อหัวข้อ
  const trimmed = searchText.trim().toLowerCase();
  const matchedCourses = trimmed
    ? courses.filter(
        (c) =>
          c.name?.toLowerCase().includes(trimmed) ||
          c.code?.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedTopics = trimmed
    ? topics.filter(
        (t) =>
          t.name?.toLowerCase().includes(trimmed) ||
          t.courseCode?.toLowerCase().includes(trimmed)
      )
    : [];

  // ปิด dropdown อัตโนมัติเมื่อผู้ใช้คลิกข้างนอกแถบค้นหา
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="nav-container" aria-label="หน้าหลัก">
      <span className="brand">CSTUCOM</span>

      {/* [จุดที่แก้] ปุ่มสลับแท็บ "รายวิชา" และ "รายหัวข้อ" เชื่อมกับ setActiveTab ของ Homepage */}
      <div className="tabs" role="tablist">
        <button
          type="button"
          className={`tab ${activeTab === 'course' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('course')}
        >
          รายวิชา
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'topic' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('topic')}
        >
          รายหัวข้อ
        </button>
      </div>

      {/* [จุดที่แก้] กล่องค้นหาพร้อม Dropdown แสดงผลลัพธ์วิชาและหัวข้อที่ค้นเจอแบบเรียลไทม์ */}
      <div className="search-wrap" ref={searchWrapRef}>
        <label className="search-btn" htmlFor="search-input">
          <span>🔍︎</span>
          <input
            id="search-input"
            type="text"
            placeholder="ค้นหาหัวข้อ / วิชา"
            autoComplete="off"
            value={searchText}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
          />
        </label>

        {showDropdown && trimmed && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              backgroundColor: '#171a23',
              border: '1px solid #323548',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              maxHeight: '320px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            {matchedCourses.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: '#8b93a3', padding: '4px 8px' }}>
                  รายวิชา ({matchedCourses.length})
                </div>
                {matchedCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCourse) onSelectCourse(c);
                      setShowDropdown(false);
                      setSearchText('');
                    }}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#22C55E',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#252836')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    📘 {c.name}
                  </div>
                ))}
              </div>
            )}

            {matchedTopics.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: '#8b93a3', padding: '4px 8px', marginTop: '4px' }}>
                  หัวข้อ ({matchedTopics.length})
                </div>
                {matchedTopics.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (onSelectTopic) onSelectTopic(t);
                      setShowDropdown(false);
                      setSearchText('');
                    }}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#E9EAF2',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#252836')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    📄 {t.courseCode ? `[${t.courseCode}] ` : ''}{t.name}
                  </div>
                ))}
              </div>
            )}

            {matchedCourses.length === 0 && matchedTopics.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', color: '#7F8299', fontSize: '13px' }}>
                ไม่พบข้อมูลที่ค้นหา
              </div>
            )}
          </div>
        )}
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
