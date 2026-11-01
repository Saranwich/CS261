import TOPIC_PREREQUISITES from "./topicPrerequisites";

export const fallbackSkillTree = {
  courses: [
    {
      id: "c0000000-0000-0000-0000-000000000102",
      code: "CS102",
      name: "Programming Fundamentals",
      desc: "รายวิชาแนะนำพื้นฐานการเขียนโปรแกรม ตัวแปร นิพจน์ คำสั่งควบคุมเงื่อนไข วนลูป และฟังก์ชัน",
    },
    {
      id: "c0000000-0000-0000-0000-000000000111",
      code: "CS111",
      name: "Object-Oriented Programming",
      desc: "การออกแบบและเขียนโปรแกรมเชิงวัตถุ คลาส อ็อบเจกต์ การสืบทอด และโพลีมอร์ฟิซึม",
    },
    {
      id: "c0000000-0000-0000-0000-000000000101",
      code: "CS101",
      name: "Discrete Mathematics",
      desc: "คณิตศาสตร์สำหรับวิทยาการคอมพิวเตอร์ ตรรกศาสตร์ เซต การพิสูจน์ ความสัมพันธ์ และกราฟ",
    },
    {
      id: "c0000000-0000-0000-0000-000000000100",
      code: "CS100",
      name: "Web Development Basics",
      desc: "พื้นฐานเทคโนโลยีเว็บ สถาปัตยกรรม Client-Server HTML, CSS, JavaScript และ DOM",
    },
  ],
  prerequisites: [
    {
      courseId: "c0000000-0000-0000-0000-000000000101",
      prerequisiteId: "c0000000-0000-0000-0000-000000000100",
    },
    {
      courseId: "c0000000-0000-0000-0000-000000000102",
      prerequisiteId: "c0000000-0000-0000-0000-000000000101",
    },
    {
      courseId: "c0000000-0000-0000-0000-000000000111",
      prerequisiteId: "c0000000-0000-0000-0000-000000000102",
    },
  ],
};

// สร้าง courseDetails สำรองโดยอิงหัวข้อจาก TOPIC_PREREQUISITES
export const fallbackCourseDetails = fallbackSkillTree.courses.map((course) => {
  const topicsMap = TOPIC_PREREQUISITES[course.code] || {};
  const topicNames = Object.keys(topicsMap);

  const topics = (topicNames.length > 0
    ? topicNames
    : ["Introduction", "Core Concepts", "Advanced Topics"]
  ).map((name, idx) => ({
    id: `t-${course.code.toLowerCase()}-${idx + 1}`,
    name: name,
    desc: `หัวข้อ ${name} ของรายวิชา ${course.code} ${course.name}`,
    seqNo: idx + 1,
  }));

  return {
    id: course.id,
    code: course.code,
    name: course.name,
    desc: course.desc,
    topics: topics,
  };
});

