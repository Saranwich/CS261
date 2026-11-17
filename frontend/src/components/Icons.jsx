// ไอคอน SVG ชุดเดียวกันทั้งเว็บ (แทนอีโมจิ / ตัวอักษร ✓ ◇ → ที่หน้าตาเปลี่ยนตามระบบ)
// ใช้สีตาม color ของตัวหนังสือรอบข้าง (currentColor) จึงปรับสีผ่าน CSS ได้ปกติ

function base(size) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };
}

export function CheckIcon({ size = 16 }) {
  return <svg {...base(size)}><path d="M20 6 9 17l-5-5" /></svg>;
}

export function BookIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16 }) {
  return <svg {...base(size)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}

export function SearchIcon({ size = 16 }) {
  return <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
}

export function CircleIcon({ size = 16 }) {
  return <svg {...base(size)}><circle cx="12" cy="12" r="8" /></svg>;
}

export function DotIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DiamondIcon({ size = 16 }) {
  return <svg {...base(size)}><path d="M12 3 21 12l-9 9-9-9z" /></svg>;
}

export function ChevronDownIcon({ size = 16 }) {
  return <svg {...base(size)}><path d="m6 9 6 6 6-6" /></svg>;
}