import { useRef, useState } from "react";
import "./PanZoomCanvas.css";

// ผืนผ้าใบที่รองรับการลากเพื่อเลื่อน และใช้ล้อเมาส์เพื่อซูมเข้า-ออก
function PanZoomCanvas({ children, width, height }) {
  const viewportRef = useRef(null);
  // เก็บจุดเริ่มลากไว้โดยไม่ต้องทำให้ React วาดหน้าจอใหม่ทุกครั้งที่เลื่อน
  const dragRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event) {
    // ไม่เริ่มลากเมื่อคลิกปุ่มการ์ด เพื่อให้ปุ่มยังคลิกเลือกได้ตามปกติ
    if (event.button !== 0 || event.target.closest("button")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: view.x,
      y: view.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    // เลื่อนตำแหน่งผืนผ้าใบตามระยะที่ลากจากจุดเริ่มต้น
    setView((current) => ({
      ...current,
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    }));
  }

  function stopDragging(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  }

  function handleWheel(event) {
    event.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const bounds = viewport.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;

    // จำกัดระดับซูม และคงตำแหน่งใต้เคอร์เซอร์ให้เป็นจุดอ้างอิงขณะซูม
    setView((current) => {
      const scale = Math.min(
        2.5,
        Math.max(0.5, current.scale * (event.deltaY < 0 ? 1.1 : 0.9))
      );
      const ratio = scale / current.scale;
      return {
        scale,
        x: pointerX - (pointerX - current.x) * ratio,
        y: pointerY - (pointerY - current.y) * ratio,
      };
    });
  }

  return (
    <div
      ref={viewportRef}
      className={`pan-zoom-viewport ${isDragging ? "dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onWheel={handleWheel}
    >
      <div
        className="pan-zoom-content"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PanZoomCanvas;