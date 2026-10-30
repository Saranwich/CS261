
import TOPIC_PREREQUISITES from "./topicPrerequisites";

// ========================================
// ข้อมูลรายวิชาจำลอง
// ========================================

const COURSE_INFO = [
  {
    id: 1,
    code: "CS100",
    name: "Web Development",
    description: "พื้นฐานการพัฒนาเว็บไซต์",
  },
  {
    id: 2,
    code: "CS101",
    name: "Discrete Mathematics",
    description: "คณิตศาสตร์ไม่ต่อเนื่องสำหรับวิทยาการคอมพิวเตอร์",
  },
  {
    id: 3,
    code: "CS102",
    name: "Programming Fundamentals",
    description: "พื้นฐานการเขียนโปรแกรม",
  },
  {
    id: 4,
    code: "CS111",
    name: "Object-Oriented Programming",
    description: "การเขียนโปรแกรมเชิงวัตถุ",
  },
];

// ========================================
// สร้างหัวข้อทั้งหมด
// ========================================

const allTopics = [];

COURSE_INFO.forEach((course) => {
  const prerequisiteMap = TOPIC_PREREQUISITES[course.code] || {};

  // เก็บชื่อหัวข้อที่เป็น prerequisite และหัวข้อที่ถูกอ้างถึง
  const topicNames = new Set(Object.keys(prerequisiteMap));

  Object.values(prerequisiteMap).forEach((requirements) => {
    requirements.forEach((requirement) => {
      const match = requirement.match(/^(CS\d+):\s*(.+)$/);

      // ถ้าไม่มีรหัสวิชานำหน้า ให้เป็นหัวข้อในวิชาเดียวกัน
      if (!match) {
        topicNames.add(requirement);
      }
    });
  });

  [...topicNames].forEach((name, index) => {
    allTopics.push({
      id: course.id * 100 + index + 1,
      name,
      desc: `เรียนรู้เกี่ยวกับ ${name}`,
      seqNo: index + 1,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      done: false,
      prerequisites: [],
      nextTopics: [],
      depth: 0,
    });
  });
});

// ========================================
// สร้าง Lookup สำหรับค้นหาหัวข้อ
// ========================================

const topicByFullName = {};

allTopics.forEach((topic) => {
  topicByFullName[`${topic.courseCode}: ${topic.name}`] = topic;
});

// ========================================
// เชื่อมโยง Prerequisites
// ========================================

Object.entries(TOPIC_PREREQUISITES).forEach(
  ([courseCode, topicMap]) => {
    Object.entries(topicMap).forEach(([topicName, requirements]) => {
      const currentTopic = topicByFullName[
        `${courseCode}: ${topicName}`
      ];

      if (!currentTopic) return;

      requirements.forEach((requirement) => {
        const match = requirement.match(/^(CS\d+):\s*(.+)$/);

        const fullName = match
          ? requirement
          : `${courseCode}: ${requirement}`;

        const prerequisite = topicByFullName[fullName];

        if (!prerequisite) {
          console.warn("ไม่พบ prerequisite:", fullName);
          return;
        }

        currentTopic.prerequisites.push(prerequisite.id);

        prerequisite.nextTopics.push(currentTopic.id);
      });
    });
  }
);

// ========================================
// คำนวณ Depth ของหัวข้อ
// ========================================

const visiting = new Set();
const finished = new Set();

function calculateDepth(topic) {
  if (finished.has(topic.id)) return topic.depth;

  // ป้องกันข้อมูล prerequisite วนเป็นวงกลม
  if (visiting.has(topic.id)) {
    console.warn("พบ prerequisite cycle:", topic.name);
    return 0;
  }

  visiting.add(topic.id);

  topic.depth = Math.max(
    0,
    ...topic.prerequisites.map((id) =>
      calculateDepth(allTopics.find((item) => item.id === id))
    ).filter(Number.isFinite).map((depth) => depth + 1)
  );

  visiting.delete(topic.id);
  finished.add(topic.id);

  return topic.depth;
}

allTopics.forEach((topic) => calculateDepth(topic));

// ========================================
// ส่งออกข้อมูลสำหรับ Homepage
// ========================================

export const mockCourseDetails = COURSE_INFO.map((course) => ({
  ...course,
  topics: allTopics.filter(
    (topic) => topic.courseId === course.id
  ),
}));

export const mockSkillTree = {
  courses: COURSE_INFO.map((course) => ({
    ...course,
    prerequisites: [],
    nextCourses: [],
  })),
  prerequisites: [],
};

// หัวข้อที่จำลองว่าเรียนเสร็จแล้ว
export const mockDoneTopicIds = [
  101,
  102,
  201,
  301,
];

export default mockSkillTree;
