import { useEffect, useRef, useState } from "react";
import "./PanZoomCanvas.css";

// ========================================
// กระดานที่ลากเลื่อน / ซูมเข้าออกได้ (เวอร์ชันลื่น)
// API เหมือนเดิมทุกอย่าง:
//   <PanZoomCanvas width height focusArea minimapRects>...</PanZoomCanvas>
//
// ที่เปลี่ยน
//   - ซูม (ล้อเมาส์ / ปุ่ม / พอดีจอ / ไปที่เส้นทาง) = ไหลเข้าหาเป้าหมายแบบนุ่ม ๆ ด้วย requestAnimationFrame
//   - ปล่อยมือตอนลาก = กระดานไหลต่ออีกนิด (แรงเฉื่อย)
//   - ระหว่างลาก ปิด pointer-events ของของข้างใน ไม่ให้การ์ดโดน hover แล้ว re-render ทั้งผัง
// ========================================

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

const GLIDE = 0.2;        // ความเร็วที่ไหลเข้าหาเป้า (0-1 ต่อ 1 เฟรม @60fps) ยิ่งมากยิ่งไว
const INERTIA_MS = 260;   // ลากเร็วแค่ไหนปล่อยแล้วไหลต่อไกลแค่ไหน (px = ความเร็ว px/ms * ค่านี้)
const MIN_FLING = 0.15;   // ความเร็วขั้นต่ำ (px/ms) ถึงจะไหลต่อ


function fitToBox(box, area) {
  if (![area.x, area.y, area.width, area.height].every(Number.isFinite) || area.width <= 0 || area.height <= 0) {
    return { scale: 1, x: 0, y: 0 };
  }
  const scale = Math.max(
    MIN_ZOOM,
    Math.min(1, box.clientWidth / area.width, box.clientHeight / area.height)
  );
  return {
    scale: scale,
    x: (box.clientWidth - area.width * scale) / 2 - area.x * scale,
    y: (box.clientHeight - area.height * scale) / 2 - area.y * scale,
  };
}

function zoomAt(view, pointX, pointY, factor) {
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale * factor));
  const ratio = scale / view.scale;
  return {
    scale: scale,
    x: pointX - (pointX - view.x) * ratio,
    y: pointY - (pointY - view.y) * ratio,
  };
}


const MINIMAP_MAX_WIDTH = 170;
const MINIMAP_MAX_HEIGHT = 120;

function PanZoomCanvas({ width, height, focusArea = null, minimapRects = null, children }) {
  const boxRef = useRef(null);
  const dragRef = useRef(null);
  const justDraggedRef = useRef(false);
  const isFirstFitRef = useRef(true);
  const minimapRef = useRef(null);
  const minimapDraggingRef = useRef(false);

  // view ล่าสุดเก็บไว้ใน ref ด้วย เพื่อให้ลูป animation อ่านค่าล่าสุดได้โดยไม่ต้องรอ render
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const targetRef = useRef(null); // เป้าหมายที่กำลังไหลเข้าหา (null = อยู่นิ่ง)
  const rafRef = useRef(0);
  const [view, setView] = useState(viewRef.current);
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });

  function commit(next) {
    viewRef.current = next;
    setView(next);
  }

  function stopGlide() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    targetRef.current = null;
  }

  // ไหลไปหา target แบบนุ่ม ๆ (เรียกซ้ำระหว่างทางได้ แค่เปลี่ยนเป้า)
  function glideTo(target) {
    targetRef.current = target;
    if (rafRef.current) return;

    let last = performance.now();
    const step = (now) => {
      const goal = targetRef.current;
      if (!goal) {
        rafRef.current = 0;
        return;
      }

      // ปรับตามเวลาจริง จอ 120Hz กับ 60Hz จึงนุ่มเท่ากัน
      const dt = Math.min(48, now - last);
      last = now;
      const k = 1 - Math.pow(1 - GLIDE, dt / 16.67);

      const cur = viewRef.current;
      const next = {
        scale: cur.scale + (goal.scale - cur.scale) * k,
        x: cur.x + (goal.x - cur.x) * k,
        y: cur.y + (goal.y - cur.y) * k,
      };

      const arrived =
        Math.abs(goal.scale - next.scale) < 0.0008 &&
        Math.abs(goal.x - next.x) < 0.4 &&
        Math.abs(goal.y - next.y) < 0.4;

      if (arrived) {
        commit(goal);
        targetRef.current = null;
        rafRef.current = 0;
        return;
      }

      commit(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  function jumpTo(next) {
    stopGlide();
    commit(next);
  }

  useEffect(() => () => stopGlide(), []);

  useEffect(() => {
    const box = boxRef.current;
    const update = () => setBoxSize({ width: box.clientWidth, height: box.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const areaX = focusArea ? focusArea.x : 0;
  const areaY = focusArea ? focusArea.y : 0;
  const areaWidth = focusArea ? focusArea.width : width;
  const areaHeight = focusArea ? focusArea.height : height;

  // พื้นที่ที่อยากให้เห็นเปลี่ยน → ครั้งแรกวางเลย ครั้งต่อไปไหลไปหา
  useEffect(() => {
    const target = fitToBox(boxRef.current, { x: areaX, y: areaY, width: areaWidth, height: areaHeight });
    if (isFirstFitRef.current) {
      isFirstFitRef.current = false;
      jumpTo(target);
    } else {
      glideTo(target);
    }
  }, [areaX, areaY, areaWidth, areaHeight]);

  // ล้อเมาส์ / pinch = ซูม (บวกเข้าเป้าหมายเดิม ล้อหมุนรัว ๆ จึงต่อเนื่อง ไม่กระตุก)
  useEffect(() => {
    const box = boxRef.current;

    function handleWheel(event) {
      event.preventDefault();
      const rect = box.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const speed = event.ctrlKey ? 0.01 : 0.002;
      const factor = Math.exp(-event.deltaY * speed);
      const base = targetRef.current || viewRef.current;
      glideTo(zoomAt(base, mouseX, mouseY, factor));
    }

    box.addEventListener("wheel", handleWheel, { passive: false });
    return () => box.removeEventListener("wheel", handleWheel);
  }, []);

  // ===== ลากเพื่อเลื่อนกระดาน =====

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    stopGlide(); // จับกระดานที่กำลังไหลอยู่ให้หยุด
    const now = performance.now();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      viewX: viewRef.current.x,
      viewY: viewRef.current.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: now,
      vx: 0,
      vy: 0,
      moved: false,
    };
    justDraggedRef.current = false;
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;

    if (!drag.moved) boxRef.current?.classList.add("is-panning");
    drag.moved = true;

    // ความเร็วล่าสุด (px/ms) เฉลี่ยแบบนุ่ม ๆ ไว้ใช้ตอนปล่อยมือ
    const now = performance.now();
    const elapsed = Math.max(1, now - drag.lastT);
    drag.vx = drag.vx * 0.7 + ((event.clientX - drag.lastX) / elapsed) * 0.3;
    drag.vy = drag.vy * 0.7 + ((event.clientY - drag.lastY) / elapsed) * 0.3;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastT = now;

    commit({ ...viewRef.current, x: drag.viewX + dx, y: drag.viewY + dy });
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    justDraggedRef.current = drag?.moved || false;

    // ปล่อยมือทันทีหลังลากเร็ว ๆ → ไหลต่อ
    if (drag?.moved && performance.now() - drag.lastT < 80) {
      const speed = Math.hypot(drag.vx, drag.vy);
      if (speed > MIN_FLING) {
        const cur = viewRef.current;
        glideTo({ ...cur, x: cur.x + drag.vx * INERTIA_MS, y: cur.y + drag.vy * INERTIA_MS });
      }
    }

    boxRef.current?.classList.remove("is-panning");
    dragRef.current = null;
  }

  function handleClickCapture(event) {
    if (justDraggedRef.current) {
      event.stopPropagation();
      justDraggedRef.current = false;
    }
  }

  // ===== ปุ่มซูม =====

  function zoomFromCenter(factor) {
    const box = boxRef.current;
    const base = targetRef.current || viewRef.current;
    glideTo(zoomAt(base, box.clientWidth / 2, box.clientHeight / 2, factor));
  }

  // ===== แผนที่ย่อ =====
  const miniScale = Math.min(MINIMAP_MAX_WIDTH / width, MINIMAP_MAX_HEIGHT / height);
  const viewport = {
    x: -view.x / view.scale,
    y: -view.y / view.scale,
    width: boxSize.width / view.scale,
    height: boxSize.height / view.scale,
  };
  const showMinimap =
    Boolean(minimapRects) &&
    boxSize.width > 0 &&
    (viewport.width < width * 0.98 || viewport.height < height * 0.98);

  function centerOnMinimap(event) {
    const rect = minimapRef.current.getBoundingClientRect();
    const boardX = (event.clientX - rect.left) / miniScale;
    const boardY = (event.clientY - rect.top) / miniScale;
    const cur = viewRef.current;
    jumpTo({
      scale: cur.scale,
      x: boxSize.width / 2 - boardX * cur.scale,
      y: boxSize.height / 2 - boardY * cur.scale,
    });
  }

  function handleMinimapDown(event) {
    event.stopPropagation();
    minimapDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    centerOnMinimap(event);
  }

  function handleMinimapMove(event) {
    if (minimapDraggingRef.current) centerOnMinimap(event);
  }

  function handleMinimapUp(event) {
    minimapDraggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <div
      className="pan-zoom-canvas"
      ref={boxRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      <div
        className="pan-zoom-content"
        style={{
          width,
          height,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>

      {showMinimap && (
        <div
          className="minimap"
          ref={minimapRef}
          style={{ width: width * miniScale, height: height * miniScale }}
          onPointerDown={handleMinimapDown}
          onPointerMove={handleMinimapMove}
          onPointerUp={handleMinimapUp}
          title="กดหรือลากเพื่อเลื่อนไปจุดนั้น"
          aria-hidden="true"
        >
          {minimapRects.map((rect, index) => (
            <span
              key={index}
              className="minimap__rect"
              style={{
                left: rect.x * miniScale,
                top: rect.y * miniScale,
                width: rect.width * miniScale,
                height: rect.height * miniScale,
              }}
            />
          ))}
          <span
            className="minimap__view"
            style={{
              left: viewport.x * miniScale,
              top: viewport.y * miniScale,
              width: viewport.width * miniScale,
              height: viewport.height * miniScale,
            }}
          />
        </div>
      )}

      <div className="zoom-controls">
        <button onClick={() => zoomFromCenter(1 / 1.2)} aria-label="ซูมออก">−</button>
        <span className="zoom-value">{Math.round(view.scale * 100)}%</span>
        <button onClick={() => zoomFromCenter(1.2)} aria-label="ซูมเข้า">+</button>
        {focusArea && (
          <button className="zoom-fit" onClick={() => glideTo(fitToBox(boxRef.current, focusArea))}>
            ไปที่เส้นทาง
          </button>
        )}
        <button
          className="zoom-fit"
          onClick={() => glideTo(fitToBox(boxRef.current, { x: 0, y: 0, width, height }))}
        >
          พอดีจอ
        </button>
      </div>
    </div>
  );
}

export default PanZoomCanvas;