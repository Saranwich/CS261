
import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import "./PanZoomCanvas.css";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;
const FOCUS_PADDING = 48;

/**
 * PanZoomCanvas
 *
 * Props:
 * - children: เนื้อหาภายใน Canvas เช่น การ์ดหัวข้อและ SVG
 * - focusArea: พื้นที่ที่ต้องการโฟกัส { x, y, width, height }
 * - className: class เพิ่มเติมสำหรับ Canvas
 * - minZoom: ระดับซูมต่ำสุด
 * - maxZoom: ระดับซูมสูงสุด
 * - initialZoom: ระดับซูมเริ่มต้น
 * - onZoomChange: callback เมื่อระดับซูมเปลี่ยน
 *
 * พิกัดของ focusArea อ้างอิงจากจุด (0, 0)
 * ของพื้นที่ children ก่อนใช้ transform
 */
function PanZoomCanvas({
  children,
  focusArea = null,
  className = "",
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM,
  initialZoom = 1,
  onZoomChange,
}) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const clickTimerRef = useRef(null);

  const [zoom, setZoom] = useState(() =>
    clamp(initialZoom, minZoom, maxZoom)
  );

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  // เก็บค่าปัจจุบันไว้ให้ Event Handler อ่านได้
  const transformRef = useRef({
    zoom: clamp(initialZoom, minZoom, maxZoom),
    x: 0,
    y: 0,
  });

  // จำกัดระดับซูมให้อยู่ในช่วงที่กำหนด
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // อัปเดตตำแหน่งและระดับซูม
  const updateTransform = useCallback(
    (next) => {
      const nextZoom = clamp(next.zoom, minZoom, maxZoom);

      transformRef.current = {
        zoom: nextZoom,
        x: next.x,
        y: next.y,
      };

      setZoom(nextZoom);
      setPosition({
        x: next.x,
        y: next.y,
      });

      onZoomChange?.(nextZoom);
    },
    [minZoom, maxZoom, onZoomChange]
  );

  // อ่านขนาดพื้นที่แสดงผล
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const rect = viewport.getBoundingClientRect();

      setViewportSize({
        width: rect.width,
        height: rect.height,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  // ยกเลิก Timer เมื่อตัว Component ถูกถอดออก
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  // โฟกัสพื้นที่ที่ได้รับจาก focusArea
  useEffect(() => {
    if (!focusArea || !viewportSize.width || !viewportSize.height) {
      return;
    }

    const { x, y, width, height } = focusArea;

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const availableWidth = Math.max(
      1,
      viewportSize.width - FOCUS_PADDING * 2
    );

    const availableHeight = Math.max(
      1,
      viewportSize.height - FOCUS_PADDING * 2
    );

    // คำนวณระดับซูมที่ทำให้พื้นที่เป้าหมายอยู่ใน Canvas
    const fitZoom = clamp(
      Math.min(
        availableWidth / width,
        availableHeight / height
      ),
      minZoom,
      maxZoom
    );

    // จัดกึ่งกลางพื้นที่เป้าหมาย
    const nextX =
      viewportSize.width / 2 -
      (x + width / 2) * fitZoom;

    const nextY =
      viewportSize.height / 2 -
      (y + height / 2) * fitZoom;

    updateTransform({
      zoom: fitZoom,
      x: nextX,
      y: nextY,
    });
  }, [
    focusArea?.x,
    focusArea?.y,
    focusArea?.width,
    focusArea?.height,
    viewportSize.width,
    viewportSize.height,
    minZoom,
    maxZoom,
    updateTransform,
  ]);

  // ซูมโดยยึดตำแหน่งเมาส์เป็นจุดอ้างอิง
  const zoomAtPoint = useCallback(
    (nextZoom, clientX, clientY) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const current = transformRef.current;
      const clampedZoom = clamp(nextZoom, minZoom, maxZoom);

      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;

      // แปลงพิกัดหน้าจอกลับเป็นพิกัดใน Canvas
      const contentX = (pointerX - current.x) / current.zoom;
      const contentY = (pointerY - current.y) / current.zoom;

      // คำนวณตำแหน่งใหม่เพื่อให้จุดใต้เมาส์อยู่ที่เดิม
      updateTransform({
        zoom: clampedZoom,
        x: pointerX - contentX * clampedZoom,
        y: pointerY - contentY * clampedZoom,
      });
    },
    [minZoom, maxZoom, updateTransform]
  );

    // ซูมด้วยล้อเมาส์
  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();

      const current = transformRef.current;
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

      zoomAtPoint(
        current.zoom * factor,
        event.clientX,
        event.clientY
      );
    },
    [zoomAtPoint]
  );

  // รองรับการซูมด้วย Scroll Wheel
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // เริ่มลาก Canvas
  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    // ไม่แย่งการคลิกการ์ด ปุ่ม ลิงก์ หรือช่องกรอกข้อมูล
    if (
      event.target.closest(
        "button, a, input, textarea, select, [data-no-pan]"
      )
    ) {
      return;
    }

    const current = transformRef.current;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      originY: current.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  // เลื่อน Canvas ระหว่างลาก
  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      drag.moved = true;
      setIsDragging(true);
    }

    updateTransform({
      ...transformRef.current,
      x: drag.originX + dx,
      y: drag.originY + dy,
    });
  };

  // จบการลาก
  const handlePointerUp = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.moved) {
      suppressClickRef.current = true;

      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  // Reset กลับสู่ระดับซูมเริ่มต้น
  const handleReset = () => {
    updateTransform({
      zoom: clamp(initialZoom, minZoom, maxZoom),
      x: 0,
      y: 0,
    });
  };

  const handleZoomIn = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    zoomAtPoint(
      transformRef.current.zoom + ZOOM_STEP,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  const handleZoomOut = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    zoomAtPoint(
      transformRef.current.zoom - ZOOM_STEP,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  return (
    <div
      ref={viewportRef}
      className={[
        "pan-zoom-canvas",
        isDragging ? "is-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }
      }}
    >
      <div className="pan-zoom-controls" data-no-pan>
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="ซูมเข้า"
          title="ซูมเข้า"
          disabled={zoom >= maxZoom}
        >
          +
        </button>

        <span className="pan-zoom-level">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="ซูมออก"
          title="ซูมออก"
          disabled={zoom <= minZoom}
        >
          -
        </button>

        <button
          type="button"
          className="pan-zoom-reset"
          onClick={handleReset}
          title="รีเซ็ตมุมมอง"
          aria-label="รีเซ็ตมุมมอง"
        >
          รีเซ็ต
        </button>
      </div>

      <div
        ref={contentRef}
        className="pan-zoom-content"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PanZoomCanvas;
