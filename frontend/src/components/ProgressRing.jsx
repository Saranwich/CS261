import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon } from "./Icons";

// ========================================
// วงแหวนความคืบหน้า
//   value = 0-100   done = ครบแล้วไหม (วงเป็นสีเขียว + เครื่องหมายถูกตรงกลาง)
//
// ตอน "เพิ่งครบ" (จากไม่ครบ → ครบ ตอนผู้ใช้กดติ๊ก) จะมีวงคลื่นแผ่ออกครั้งเดียว
// ใส่ key ให้วงนี้ตามวิชา/หัวข้อที่เลือก (key={course.id}) ไม่งั้นเปลี่ยนไปดูวิชาที่ครบแล้วก็จะเด้งโดยไม่ได้กดอะไร
// ========================================

// เศษกระดาษสีที่พุ่งออกจากวงตอนเรียนครบ (ค่าตายตัว ไม่สุ่ม เพื่อให้ผลเหมือนกันทุกครั้ง)
const CONFETTI_COLORS = ["#45d6ae", "#8b9aff", "#f0b52f", "#7c8cff"];
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  angle: i * 22.5,
  distance: 50 + (i % 3) * 12,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: (i % 4) * 30,
}));

function ProgressRing({ value = 0, done = false, size = 76, stroke = 7 }) {
  const gradientId = `ring-${useId().replace(/:/g, "")}`;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, value));

  const previousPercent = useRef(percent);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const justCompleted = done && previousPercent.current < 100;
    previousPercent.current = percent;
    if (justCompleted) {
      setBurst(true);
      setTimeout(() => setBurst(false), 1000);
    }
  }, [percent, done]);

  return (
    <div
      className={`progress-ring ${done ? "is-done" : ""} ${burst ? "progress-ring--burst" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`ความคืบหน้า ${Math.round(percent)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c8cff" />
            <stop offset="1" stopColor="#45d6ae" />
          </linearGradient>
        </defs>
        <circle
          className="progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="progress-ring__bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={done ? "#45d6ae" : `url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      {burst &&
        CONFETTI.map((piece, index) => (
          <i
            key={index}
            className="confetti"
            aria-hidden="true"
            style={{
              "--angle": `${piece.angle}deg`,
              "--distance": piece.distance,
              "--color": piece.color,
              animationDelay: `${piece.delay}ms`,
            }}
          />
        ))}
      <span className="progress-ring__label">
        {done ? <CheckIcon size={26} /> : `${Math.round(percent)}%`}
      </span>
    </div>
  );
}

export default ProgressRing;