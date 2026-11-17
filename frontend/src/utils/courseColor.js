// สีประจำวิชา (ใช้เป็นแถบเล็ก ๆ ข้างการ์ด + ป้ายรหัสวิชา) วางที่ src/utils/courseColor.js
// ให้แค่ "เฉดสี" (hue) ความสว่าง/ความสดอยู่ใน theme.css จึงปรับตาม Light/Dark เอง
// วิชาแรกเป็นเขียว (สีแบรนด์) วิชาถัดไปไล่เฉดห่างกัน ถ้ามีเกิน 8 วิชาจะวนกลับมาที่เฉดแรก

const HUES = [152, 212, 262, 32, 338, 186, 52, 292];

export function courseHue(index) {
  return HUES[((index % HUES.length) + HUES.length) % HUES.length];
}
