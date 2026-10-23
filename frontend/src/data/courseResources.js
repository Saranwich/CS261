// ========================================
// แหล่งเรียนของแต่ละวิชา (ข้อมูลชั่วคราว เลือกเอง)
//
// ใช้ฟรีทั้งหมด เช็คแล้วว่าลิงก์เปิดได้ (ต.ค. 2569)
// backend ยังไม่มีตารางนี้ เลยเขียนไว้ฝั่งหน้าบ้านไปก่อนเหมือน topicPrerequisites.js
//
// วิธีอ่าน
//   CS213: [
//     { type: "video", title: "Abdul Bari", url: "https://...", note: "อธิบายพร้อมวาดบนกระดาน" },
//   ]
//   type  = "video" (คลิป / ช่อง YouTube) | "web" (เว็บอ่าน / ฝึกทำ) | "book" (หนังสือฟรี) | "course" (คอร์สเต็ม)
//   note  = บอกสั้น ๆ ว่าเหมาะกับอะไร
//
// แหล่งเรียนรายหัวข้อ ไม่ได้เขียนไว้ที่นี่ หน้าเว็บจะสร้างลิงก์ค้นหา YouTube / Google จากชื่อหัวข้อให้เอง
// ========================================

const COURSE_RESOURCES = {
  CS100: [
    { type: "web", title: "MDN Learn web development", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", note: "HTML / CSS / JS ตั้งแต่ศูนย์ ละเอียดและถูกต้องที่สุด" },
    { type: "web", title: "javascript.info", url: "https://javascript.info/", note: "JavaScript ทีละบท มีแบบฝึกหัดท้ายบท" },
    { type: "course", title: "The Odin Project", url: "https://www.theodinproject.com/", note: "ทำเว็บจริงไปทีละโปรเจกต์" },
    { type: "video", title: "freeCodeCamp (YouTube)", url: "https://www.youtube.com/@freecodecamp", note: "คลิปสอนยาวแบบคอร์สเต็ม" },
  ],
  CS101: [
    { type: "video", title: "Discrete Math Full Course (YouTube)", url: "https://www.youtube.com/playlist?list=PLHXZ9OQGMqxersk8fUxiUMSIx0DBqsKZS", note: "เซต ตรรกะ การพิสูจน์ กราฟ ครบทั้งวิชา" },
    { type: "book", title: "Discrete Mathematics: An Open Introduction", url: "https://discrete.openmathbooks.org/dmoi3.html", note: "หนังสือฟรี มีโจทย์พร้อมเฉลย" },
    { type: "course", title: "MIT 6.042J Mathematics for CS", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/", note: "เน้นการพิสูจน์และการนับ" },
    { type: "video", title: "Neso Academy (YouTube)", url: "https://www.youtube.com/@NesoAcademy", note: "Boolean algebra และวงจรดิจิทัล" },
  ],
  CS102: [
    { type: "course", title: "CS50x (Harvard)", url: "https://cs50.harvard.edu/x/", note: "ปูพื้นการเขียนโปรแกรมที่ดีที่สุดตัวหนึ่ง" },
    { type: "video", title: "Bro Code (YouTube)", url: "https://www.youtube.com/@BroCodez", note: "คลิปสั้น ตรงประเด็น หลายภาษา" },
    { type: "web", title: "VisuAlgo", url: "https://visualgo.net/en", note: "ดูภาพเคลื่อนไหวว่า loop / recursion ทำงานยังไง" },
  ],
  CS111: [
    { type: "course", title: "MOOC.fi Java Programming", url: "https://java-programming.mooc.fi/", note: "Java + OOP ทีละขั้น มีโจทย์ตรวจอัตโนมัติ" },
    { type: "web", title: "Oracle: Object-Oriented Concepts", url: "https://docs.oracle.com/javase/tutorial/java/concepts/", note: "class / object / inheritance / interface จากต้นทาง" },
    { type: "web", title: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns", note: "หลักออกแบบเชิงวัตถุ มีภาพประกอบ" },
  ],
};

export default COURSE_RESOURCES;
