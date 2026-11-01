import { useRef, useState, useEffect } from "react";
import "./PanZoomCanvas.css";

// ผืนผ้าใบที่รองรับการลากเพื่อเลื่อน และใช้ล้อเมาส์เพื่อซูมเข้า-ออก
function PanZoomCanvas({ children, width, height, initialScale = 1, initialX = 0, initialY = 0 }) {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const [view, setView] = useState({ x: initialX, y: initialY, scale: initialScale });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event) {
    // ไม่เริ่มลากเมื่อคลิกปุ่มการ์ด เพื่อให้ปุ่มยังคลิกเลือกได้ตามปกติ
    if (event.button !== 0 || event.target.closest("button") || event.target.closest("select")) return;
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

    setView((current) => {
      const scale = Math.min(
        2.5,
        Math.max(0.4, current.scale * (event.deltaY < 0 ? 1.1 : 0.9))
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
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PanZoomCanvas;
