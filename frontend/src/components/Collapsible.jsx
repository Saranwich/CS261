import { useState } from "react";
import { ChevronDownIcon } from "./Icons";

// หัวข้อที่กดพับ / ขยายได้ (เนื้อหาเลื่อนเปิด-ปิดแบบนุ่ม ๆ ด้วย CSS ใน smooth.css)
//   title = ชื่อหัวข้อ   count = ตัวเลขท้ายชื่อ (ไม่ใส่ก็ได้)   defaultOpen = เปิดไว้ตอนแรกไหม
function Collapsible({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="collapsible">
      <button
        type="button"
        className="collapsible__head"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="collapsible__title">{title}</span>
        {count !== undefined && <span className="collapsible__count">{count}</span>}
        <span className="collapsible__chevron"><ChevronDownIcon size={16} /></span>
      </button>

      {/* เรนเดอร์เนื้อหาไว้เสมอ แล้วให้ CSS ยุบความสูงเป็น 0 (ถ้าไม่เรนเดอร์ จะเลื่อนปิดไม่ได้) */}
      <div className={`collapsible__panel ${open ? "is-open" : ""}`}>
        <div className="collapsible__inner">
          <div className="collapsible__body">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default Collapsible;