import { useMemo } from "react";
import ResourceList from "./ResourceList";
import Collapsible from "./Collapsible";
import ProgressRing from "./ProgressRing";
import { ArrowRightIcon, CheckIcon, CircleIcon, DiamondIcon } from "./Icons";
import "./TopicDetail.css";

// ลิงก์ค้นหาจากชื่อหัวข้อ (ไม่ต้องเก็บลิงก์ทีละหัวข้อ และไม่มีวันเป็นลิงก์เสีย)
function searchLinksFor(topic) {
  const youtube = (query) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return [
    { type: "search", title: "คลิปสอนภาษาไทย", url: youtube(`สอน ${topic.name}`), note: "ค้นใน YouTube" },
    { type: "search", title: "คลิปสอนภาษาอังกฤษ", url: youtube(`${topic.name} tutorial`), note: "ค้นใน YouTube (มีให้เลือกเยอะกว่า)" },
    {
      type: "search",
      title: "บทความอ่าน",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${topic.name} ${topic.courseName || ""}`)}`,
      note: "ค้นใน Google",
    },
  ];
}

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
        <div className="topic-detail__empty-icon"><DiamondIcon size={26} /></div>
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
            {topic.done ? <CheckIcon size={20} /> : <DiamondIcon size={19} />}
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
          <div className="progress-card">
            <ProgressRing
              key={topic.id}
              value={
                prerequisites.length
                  ? (completedPrerequisites / prerequisites.length) * 100
                  : 100
              }
              done={missingPrerequisites.length === 0}
            />

            <div className="progress-card__text">
              <h3>ความพร้อมก่อนเรียน</h3>
              <strong className="progress-card__count">
                {completedPrerequisites}/{prerequisites.length} หัวข้อพื้นฐาน
              </strong>
              <p>
                {prerequisites.length === 0
                  ? "หัวข้อนี้ไม่มี prerequisite"
                  : missingPrerequisites.length === 0
                    ? "คุณเรียนหัวข้อพื้นฐานครบแล้ว"
                    : `ยังมีหัวข้อพื้นฐานที่ต้องทบทวน ${missingPrerequisites.length} หัวข้อ`}
              </p>
            </div>
          </div>

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
              <span aria-hidden="true"><ArrowRightIcon size={16} /></span>
            </button>
          )}
        </section>

        <Collapsible title="หัวข้อพื้นฐานที่ต้องรู้" count={prerequisites.length}>

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
                      {item.done ? <CheckIcon size={13} /> : index + 1}
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
        </Collapsible>

        <Collapsible title="หัวข้อที่เรียนต่อได้" count={nextTopics.length}>

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
                    <span className="topic-detail__list-status"><ArrowRightIcon size={14} /></span>
                    <span className="topic-detail__list-text">
                      <strong>{item.name}</strong>
                      <small>{item.courseCode}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Collapsible>

        <Collapsible title="แหล่งเรียนรู้เพิ่มเติม" defaultOpen={false}>
          <p className="topic-detail__muted">
            ค้นหาเนื้อหาเพื่อทบทวนหัวข้อนี้
          </p>
          <ResourceList links={searchLinksFor(topic)} />
          {topic.resources?.length > 0 && (
            <>
              <p className="topic-detail__muted">แหล่งเรียนของหัวข้อนี้</p>
              <ResourceList links={topic.resources} />
            </>
          )}
        </Collapsible>
      </div>

      <footer className="topic-detail__footer">
        <button
          type="button"
          className={`topic-detail__done-button ${
            topic.done ? "is-done" : ""
          }`}
          onClick={() => onToggleDone?.(topic.id)}
        >
          {topic.done ? (
            <><CheckIcon size={15} /> เรียนหัวข้อนี้แล้ว</>
          ) : (
            <><CircleIcon size={15} /> ฉันเข้าใจหัวข้อนี้แล้ว</>
          )}
        </button>
      </footer>
    </aside>
  );
}

export default TopicDetail;