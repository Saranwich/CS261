import TOPIC_PREREQUISITES from "./topicPrerequisites";

// 1) ข้อมูลรายวิชา (แหล่งเดียว)
const COURSE_INFO = [
  { id: "c0000000-0000-0000-0000-000000000100", code: "CS100", name: "Web Development Basics",
    desc: "พื้นฐานเทคโนโลยีเว็บ สถาปัตยกรรม Client-Server HTML, CSS, JavaScript และ DOM" },
  { id: "c0000000-0000-0000-0000-000000000101", code: "CS101", name: "Discrete Mathematics",
    desc: "คณิตศาสตร์สำหรับวิทยาการคอมพิวเตอร์ ตรรกศาสตร์ เซต การพิสูจน์ ความสัมพันธ์ และกราฟ" },
  { id: "c0000000-0000-0000-0000-000000000102", code: "CS102", name: "Programming Fundamentals",
    desc: "รายวิชาแนะนำพื้นฐานการเขียนโปรแกรม ตัวแปร นิพจน์ คำสั่งควบคุมเงื่อนไข วนลูป และฟังก์ชัน" },
  { id: "c0000000-0000-0000-0000-000000000111", code: "CS111", name: "Object-Oriented Programming",
    desc: "การออกแบบและเขียนโปรแกรมเชิงวัตถุ คลาส อ็อบเจกต์ การสืบทอด และโพลีมอร์ฟิซึม" },
].map((c) => ({ ...c, description: c.desc })); // เผื่อโค้ดเก่าใช้ .description

const courseByCode = Object.fromEntries(COURSE_INFO.map((c) => [c.code, c]));

// prerequisite ระดับวิชา (ใช้ code เพื่ออ่านง่าย)
const COURSE_PREREQ_CODES = [
  ["CS101", "CS100"],
  ["CS102", "CS101"],
  ["CS111", "CS102"],
];

const coursePrerequisites = COURSE_PREREQ_CODES.map(([course, prereq]) => ({
  courseId: courseByCode[course].id,
  prerequisiteId: courseByCode[prereq].id,
}));

// 2) สร้างหัวข้อ
const DEFAULT_TOPICS = ["Introduction", "Core Concepts", "Advanced Topics"];
const CROSS_REF = /^(CS\d+):\s*(.+)$/;

const allTopics = [];

COURSE_INFO.forEach((course) => {
  const prereqMap = TOPIC_PREREQUISITES[course.code] || {};
  const keys = Object.keys(prereqMap);
  const roots = [];
  Object.values(prereqMap).flat().forEach((req) => {
    if (!CROSS_REF.test(req) && !keys.includes(req) && !roots.includes(req)) roots.push(req);
  });
  const list = keys.length > 0 ? [...roots, ...keys] : DEFAULT_TOPICS;

  list.forEach((name, index) => {
    allTopics.push({
      id: `t-${course.code.toLowerCase()}-${index + 1}`,
      name,
      desc: `หัวข้อ ${name} ของรายวิชา ${course.code} ${course.name}`,
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

const topicById = new Map(allTopics.map((t) => [t.id, t]));
const topicByFullName = new Map(
  allTopics.map((t) => [`${t.courseCode}: ${t.name}`, t])
);

// 3) เชื่อม prerequisites ระดับหัวข้อ
Object.entries(TOPIC_PREREQUISITES).forEach(([courseCode, topicMap]) => {
  Object.entries(topicMap).forEach(([topicName, requirements]) => {
    const current = topicByFullName.get(`${courseCode}: ${topicName}`);
    if (!current) return;

    requirements.forEach((req) => {
      const fullName = CROSS_REF.test(req) ? req : `${courseCode}: ${req}`;
      const prereq = topicByFullName.get(fullName);
      if (!prereq) {
        console.warn("ไม่พบ prerequisite:", fullName);
        return;
      }
      current.prerequisites.push(prereq.id);
      prereq.nextTopics.push(current.id);
    });
  });
});

// 4) คำนวณ depth
const visiting = new Set();
const finished = new Set();

function calculateDepth(topic) {
  if (finished.has(topic.id)) return topic.depth;
  if (visiting.has(topic.id)) {
    console.warn("พบ prerequisite cycle:", topic.name);
    return 0;
  }
  visiting.add(topic.id);
  topic.depth = topic.prerequisites.length
    ? Math.max(...topic.prerequisites.map((id) => calculateDepth(topicById.get(id)) + 1))
    : 0;
  visiting.delete(topic.id);
  finished.add(topic.id);
  return topic.depth;
}
allTopics.forEach(calculateDepth);

// 5) Export (ชุดเดียว ใช้ได้ทั้งชื่อเดิม fallback / mock)
export const skillTree = {
  courses: COURSE_INFO.map((c) => ({
    ...c,
    prerequisites: coursePrerequisites
      .filter((p) => p.courseId === c.id)
      .map((p) => p.prerequisiteId),
    nextCourses: coursePrerequisites
      .filter((p) => p.prerequisiteId === c.id)
      .map((p) => p.courseId),
  })),
  prerequisites: coursePrerequisites,
};

export const courseDetails = COURSE_INFO.map((c) => ({
  ...c,
  topics: allTopics.filter((t) => t.courseId === c.id),
}));

// alias ให้โค้ดเดิมยังทำงาน
export const fallbackSkillTree = skillTree;
export const fallbackCourseDetails = courseDetails;
export const mockSkillTree = skillTree;
export const mockCourseDetails = courseDetails;

// หัวข้อที่จำลองว่าเรียนเสร็จแล้ว (ค่าตั้งต้น = ยังไม่เรียนอะไรเลย)
// อยากให้มีหัวข้อที่เรียนแล้วตั้งแต่เปิดครั้งแรก ใส่ id เพิ่มได้ เช่น "t-cs100-1"
export const mockDoneTopicIds = [];

export default skillTree;