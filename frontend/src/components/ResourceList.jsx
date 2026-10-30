import { useMemo } from "react";
import "./ResourceList.css";

function ResourceList({ topic }) {
  const resources = useMemo(() => {
    if (!topic?.name) return [];

    const query = encodeURIComponent(topic.name);
    const courseQuery = encodeURIComponent(
      `${topic.courseCode || ""} ${topic.name}`.trim()
    );

    return [
      {
        id: "youtube",
        type: "video",
        title: `ค้นหาวิดีโอสอน ${topic.name}`,
        description: "ค้นหาวิดีโอสอนและตัวอย่างประกอบบน YouTube",
        url: `https://www.youtube.com/results?search_query=${query}`,
        label: "YouTube",
      },
      {
        id: "google",
        type: "article",
        title: `ค้นหาบทความเกี่ยวกับ ${topic.name}`,
        description: "ค้นหาบทความและคำอธิบายเพิ่มเติม",
        url: `https://www.google.com/search?q=${courseQuery}`,
        label: "บทความ",
      },
      {
        id: "mdn",
        type: "document",
        title: "ค้นหาเอกสารจาก MDN Web Docs",
        description: "เหมาะสำหรับหัวข้อเกี่ยวกับ HTML, CSS และ JavaScript",
        url: `https://developer.mozilla.org/en-US/search?q=${query}`,
        label: "MDN Docs",
      },
    ];
  }, [topic]);

  if (!topic) {
    return (
      <div className="resource-list resource-list--empty">
        <p>เลือกหัวข้อเพื่อดูแหล่งเรียนรู้เพิ่มเติม</p>
      </div>
    );
  }

  return (
    <div className="resource-list">
      {resources.map((resource) => (
        <a
          key={resource.id}
          className="resource-card"
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span
            className={`resource-card__icon resource-card__icon--${resource.type}`}
            aria-hidden="true"
          >
            {resource.type === "video"
              ? "▶"
              : resource.type === "article"
                ? "↗"
                : "⌘"}
          </span>

          <span className="resource-card__content">
            <span className="resource-card__title">
              {resource.title}
            </span>
            <span className="resource-card__description">
              {resource.description}
            </span>
            <span className="resource-card__label">
              {resource.label}
            </span>
          </span>

          <span className="resource-card__arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}

export default ResourceList;
