
import './Upperbar.css';
import { useState } from 'react';

function Upperbar({
  onLogout,
  activeTab,
  setActiveTab,
}) {
  const [searchText, setSearchText] = useState('');

  // ข้อมูลนักศึกษาจาก localStorage
  const student = JSON.parse(localStorage.getItem("user") || "null");
  const studentName = student?.displayNameTh?.trim() || "";

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
