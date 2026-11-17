// แปลงข้อมูลหัวข้อจาก backend ให้เป็นรูปแบบที่หน้าเว็บใช้
export function toTopicCards(courseDetails = [], doneTopicIds = []) {
  // 1) สร้างหัวข้อทุกตัว (ยังไม่มีเส้นเชื่อม)
  const topics = [];
  (courseDetails || []).forEach((course) => {
    (course.topics || []).forEach((topic) => {
      topics.push({
        id: topic.id,
        name: topic.name,
        desc: topic.desc,
        seqNo: topic.seqNo,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        done: doneTopicIds.includes(topic.id),
        prerequisites: [...(topic.prerequisites || [])],
        resources: topic.resources || [],
        nextTopics: [],
        depth: 0,
      });
    });
  });

  // 2) เส้นเชื่อม: backend ส่ง topic.prerequisites (id ของหัวข้อที่ต้องรู้ก่อน) มาให้แล้ว
  //    ที่นี่แค่ตัด id ที่ไม่มีในหน้า แล้วเติม nextTopics ขาย้อนกลับ
  const topicById = toLookup(topics);
  topics.forEach((topic) => {
    topic.prerequisites = topic.prerequisites.filter((preId) => topicById[preId]);
    topic.prerequisites.forEach((preId) => topicById[preId].nextTopics.push(topic.id));
  });

  // 3) หา depth = ต้องผ่านหัวข้อก่อนหน้ายาวที่สุดกี่ขั้น
  const finished = {};

  function depthOf(topic) {
    if (!topic || !topic.id) return 0;
    if (finished[topic.id]) return topic.depth || 0;
    finished[topic.id] = true;

    (topic.prerequisites || []).forEach((preId) => {
      const parent = topicById[preId];
      if (parent) {
        topic.depth = Math.max(topic.depth || 0, depthOf(parent) + 1);
      }
    });
    return topic.depth || 0;
  }

  topics.forEach(depthOf);
  return topics;
}

// { [id]: item } เอาไว้หาของจาก id ได้เร็ว ๆ
export function toLookup(items = []) {
  const lookup = {};
  (items || []).forEach((item) => {
    if (item && item.id != null) {
      lookup[item.id] = item;
    }
  });
  return lookup;
}

// หาหัวข้อทั้งหมดที่ต้องรู้ก่อน (ย้อนไปให้สุดทุกชั้น)
export function findAllPrerequisites(startIds = [], topicById = {}) {
  const foundIds = [];
  const toVisit = [...startIds];

  while (toVisit.length > 0) {
    const curId = toVisit.pop();
    const topic = topicById[curId];
    if (!topic) continue;

    (topic.prerequisites || []).forEach((preId) => {
      if (!foundIds.includes(preId)) {
        foundIds.push(preId);
        toVisit.push(preId);
      }
    });
  }

  return foundIds
    .filter((id) => !startIds.includes(id))
    .map((id) => topicById[id])
    .filter(Boolean)
    .sort(
      (a, b) =>
        (a.depth || 0) - (b.depth || 0) ||
        (a.courseCode || "").localeCompare(b.courseCode || "") ||
        (a.seqNo || 0) - (b.seqNo || 0)
    );
}