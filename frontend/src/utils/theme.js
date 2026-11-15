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

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* บันทึกไม่ได้ก็ไม่เป็นไร แค่ไม่จำค่า */
  }
  applyTheme(theme);
}
