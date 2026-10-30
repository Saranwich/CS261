
import { useMemo } from "react";
import ResourceList from "./ResourceList";
import "./TopicDetail.css";

function TopicDetail({
  topic,
  topicById = {},
  onSelectTopic,
  onToggleDone,
  onClear,
}) {
  const prerequisites = useMemo(() => {
    if (!topic) return [];

    // เรียง prerequisite จากหัวข้อพื้นฐานไปหัวข้อที่ใกล้กับหัวข้อที่เลือก
    const visited = new Set();
    const result = [];

    function visit(topicId) {
      if (visited.has(topicId)) return;
      visited.add(topicId);

      const current = topicById[topicId];
      if (!current) return;

      (current.prerequisites || []).forEach(visit);
      if (topicId !== topic.id) result.push(current);
    }

    (topic.prerequisites || []).forEach(visit);

    return result;
  }, [topic, topicById]);

  const nextTopics = useMemo(() => {
    if (!topic) return [];

    return (topic.nextTopics || [])
      .map((id) => topicById[id])
      .filter(Boolean);
  }, [topic, topicById]);

  if (!topic) {
    return (
      <aside className="topic-detail topic-detail--empty">
        <div className="topic-detail__empty-icon">◇</div>
        <h2>เลือกหัวข้อที่ต้องการเรียนรู้</h2>
        <p>
          คลิกหัวข้อจาก Skill Tree เพื่อดูรายละเอียด
          หัวข้อพื้นฐานที่ต้องรู้ก่อน และหัวข้อที่เรียนต่อได้
        </p>
      </aside>
    );
  }

  const completedPrerequisites = prerequisites.filter(
    (item) => item.done
  ).length;

  const missingPrerequisites = prerequisites.filter(
    (item) => !item.done
  );

  const firstMissing = missingPrerequisites[0];

  return (
    <aside className="topic-detail">
      <header className="topic-detail__header">
        <div>
          <p className="topic-detail__eyebrow">TOPIC DETAILS</p>
          <span className="topic-detail__course">
            {topic.courseCode}
          </span>
        </div>

        <button
          type="button"
          className="topic-detail__close"
          onClick={onClear}
          aria-label="ล้างหัวข้อที่เลือก"
          title="ล้างหัวข้อที่เลือก"
        >
          ×
        </button>
      </header>

      <div className="topic-detail__body">
        <div className="topic-detail__title-row">
          <span
            className={`topic-detail__status ${
              topic.done ? "is-done" : ""
            }`}
          >
            {topic.done ? "✓" : "◇"}
          </span>

          <div>
            <h2 className="topic-detail__title">{topic.name}</h2>
            <p className="topic-detail__subtitle">
              {topic.courseName || topic.courseCode}
            </p>
          </div>
        </div>

        <section className="topic-detail__section">
          <h3>เกี่ยวกับหัวข้อนี้</h3>
          <p className="topic-detail__description">
            {topic.desc || "ยังไม่มีคำอธิบายสำหรับหัวข้อนี้"}
          </p>
        </section>

        <section className="topic-detail__progress">
          <div className="topic-detail__progress-heading">
            <h3>ความพร้อมก่อนเรียน</h3>
            <span>
              {completedPrerequisites}/{prerequisites.length}
            </span>
          </div>

          <div className="topic-detail__progress-track">
            <div
              className="topic-detail__progress-fill"
              style={{
                width: `${
                  prerequisites.length
                    ? (completedPrerequisites / prerequisites.length) * 100
                    : 100
                }%`,
              }}
            />
          </div>

          <p>
            {prerequisites.length === 0
              ? "หัวข้อนี้ไม่มี prerequisite"
              : missingPrerequisites.length === 0
                ? "คุณเรียนหัวข้อพื้นฐานครบแล้ว"
                : `ยังมีหัวข้อพื้นฐานที่ต้องทบทวน ${missingPrerequisites.length} หัวข้อ`}
          </p>

          {firstMissing && (
            <button
              type="button"
              className="topic-detail__start"
              onClick={() => onSelectTopic?.(firstMissing)}
            >
              <span>
                <small>แนะนำให้เริ่มจาก</small>
                <strong>{firstMissing.name}</strong>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </section>

        <section className="topic-detail__section">
          <div className="topic-detail__section-heading">
            <h3>หัวข้อพื้นฐานที่ต้องรู้</h3>
            <span className="topic-detail__count">
              {prerequisites.length}
            </span>
          </div>

          {prerequisites.length === 0 ? (
            <p className="topic-detail__muted">
              ไม่มีหัวข้อก่อนหน้า
            </p>
          ) : (
            <ul className="topic-detail__list">
              {prerequisites.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="topic-detail__list-button"
                    onClick={() => onSelectTopic?.(item)}
                  >
                    <span
                      className={`topic-detail__list-status ${
                        item.done ? "is-done" : ""
                      }`}
                    >
                      {item.done ? "✓" : index + 1}
                    </span>

                    <span className="topic-detail__list-text">
                      <strong>{item.name}</strong>
                      <small>{item.courseCode}</small>
                    </span>

                    <span
                      className={`topic-detail__badge ${
                        item.done
                          ? "topic-detail__badge--done"
                          : firstMissing?.id === item.id
                            ? "topic-detail__badge--start"
                            : "topic-detail__badge--todo"
                      }`}
                    >
                      {item.done
                        ? "เรียนแล้ว"
                        : firstMissing?.id === item.id
                          ? "เริ่มที่นี่"
                          : "ยังไม่เรียน"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="topic-detail__section">
          <div className="topic-detail__section-heading">
            <h3>หัวข้อที่เรียนต่อได้</h3>
            <span className="topic-detail__count">
              {nextTopics.length}
            </span>
          </div>

          {nextTopics.length === 0 ? (
            <p className="topic-detail__muted">
              ยังไม่มีหัวข้อต่อยอดที่กำหนดไว้
            </p>
          ) : (
            <ul className="topic-detail__list">
              {nextTopics.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="topic-detail__list-button"
                    onClick={() => onSelectTopic?.(item)}
                  >
                    <span className="topic-detail__list-status">
                      →
                    </span>
                    <span className="topic-detail__list-text">
                      <strong>{item.name}</strong>
                      <small>{item.courseCode}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="topic-detail__section">
          <h3>แหล่งเรียนรู้เพิ่มเติม</h3>
          <p className="topic-detail__muted">
            ค้นหาเนื้อหาเพื่อทบทวนหัวข้อนี้
          </p>
          <ResourceList topic={topic} />
        </section>
      </div>

      <footer className="topic-detail__footer">
        <button
          type="button"
          className={`topic-detail__done-button ${
            topic.done ? "is-done" : ""
          }`}
          onClick={() => onToggleDone?.(topic.id)}
        >
          {topic.done ? "✓ เรียนหัวข้อนี้แล้ว" : "○ ฉันเข้าใจหัวข้อนี้แล้ว"}
        </button>
      </footer>
    </aside>
  );
}

export default TopicDetail;
