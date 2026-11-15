// เปิดข้อมูลจำลองเฉพาะตอนรัน dev (npm run dev) เท่านั้น — build จริงจะเป็น false เสมอ
// อยากต่อ backend จริงตอน dev: สร้างไฟล์ .env.local แล้วใส่  VITE_USE_MOCK=false
export const USE_MOCK_DATA =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== "false";