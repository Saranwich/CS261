import { useState } from "react";
import { ChevronDownIcon } from "./Icons";

// หัวข้อที่กดพับ / ขยายได้ (ใช้ในแผงขวา เพื่อให้ไม่ต้องเลื่อนยาว)
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

      {open && <div className="collapsible__body">{children}</div>}
    </section>
  );
}

export default Collapsible;
