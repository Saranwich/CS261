// จัดการธีม Light / Dark  (วางที่ src/utils/theme.js)
//   - จำค่าที่ผู้ใช้เลือกไว้ใน localStorage
//   - ถ้ายังไม่เคยเลือก ใช้ตามระบบของเครื่อง (prefers-color-scheme)
//   - ถ้าอ่านค่าไม่ได้เลย ใช้ dark

const STORAGE_KEY = "theme";

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function resolveTheme() {
  const stored = readStored();
  if (stored) return stored;
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme; // scrollbar / input ของเบราว์เซอร์เปลี่ยนตามด้วย
}

// เรียกก่อน render ใน main.jsx จะได้ไม่แวบสีผิดตอนเปิดหน้า
export function initTheme() {
  applyTheme(resolveTheme());
}

let fadeTimer = null;

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* บันทึกไม่ได้ก็ไม่เป็นไร แค่ไม่จำค่า */
  }

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // วิธีหลัก: View Transitions API
  // เบราว์เซอร์ถ่ายภาพหน้าเก่า-ใหม่ แล้วเฟดข้ามกันทั้งหน้าในครั้งเดียว (ใช้ GPU)
  // ลื่นกว่าสั่งให้ทุก element ค่อย ๆ เปลี่ยนสีเอง และไล่เฉดพื้นหลังแบบ gradient ได้ด้วย
  if (document.startViewTransition && !reduceMotion) {
    document.startViewTransition(() => applyTheme(theme));
    return;
  }

  // สำรอง: เบราว์เซอร์เก่า → ให้สีไล่เฉดทีละ element (สไตล์ .theme-fade อยู่ใน smooth.css)
  const root = document.documentElement;
  if (!reduceMotion) {
    root.classList.add("theme-fade");
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove("theme-fade"), 400);
  }
  applyTheme(theme);
}