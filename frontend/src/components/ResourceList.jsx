// แสดงลิงก์แหล่งเรียนของวิชา และแจ้งเมื่อไม่มีข้อมูลแหล่งเรียน
function ResourceList({ resources = [] }) {
  if (resources.length === 0) {
    return <div className="empty-text">- ไม่มีแหล่งเรียนรู้ -</div>;
  }

  return (
    <div className="topic-resource-links">
      {resources.map((resource) => (
        // เปิดแหล่งเรียนในแท็บใหม่ โดยไม่ให้หน้าเดิมถูกควบคุมจากแท็บปลายทาง
        <a
          key={resource.url}
          className="topic-resource-link"
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="topic-resource-title">{resource.title}</span>
          {resource.note && (
            <span className="topic-resource-description">{resource.note}</span>
          )}
        </a>
      ))}
    </div>
  );
}

export default ResourceList;