"use client";

import { useCallback, useEffect, useRef } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MomentumRailProps {
  children: React.ReactNode[];
  className?: string;
}

/**
 * A draggable, perspective-aware event reel. Each card receives live distance
 * and velocity variables, producing depth and counter-rotation while the rail
 * moves without pulling in a heavyweight animation dependency.
 */
export default function MomentumRail({ children, className }: MomentumRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const motion = useRef({ lastScroll: 0, lastTime: 0, velocity: 0, frame: 0 });

  const renderFrame = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const now = performance.now();
    const elapsed = Math.max(16, now - motion.current.lastTime);
    const delta = rail.scrollLeft - motion.current.lastScroll;
    const rawVelocity = Math.max(-18, Math.min(18, (delta / elapsed) * 16));
    motion.current.velocity += (rawVelocity - motion.current.velocity) * 0.28;
    motion.current.lastScroll = rail.scrollLeft;
    motion.current.lastTime = now;

    const railBox = rail.getBoundingClientRect();
    const center = railBox.left + railBox.width / 2;
    rail.querySelectorAll<HTMLElement>(".motion-rail__item").forEach((item) => {
      const box = item.getBoundingClientRect();
      const distance = Math.max(-1.4, Math.min(1.4, (box.left + box.width / 2 - center) / railBox.width));
      item.style.setProperty("--rail-distance", distance.toFixed(3));
      item.style.setProperty("--rail-velocity", motion.current.velocity.toFixed(3));
      item.style.setProperty("--rail-lift", `${Math.abs(distance) * 24}px`);
    });

    const max = rail.scrollWidth - rail.clientWidth;
    progressRef.current?.style.setProperty(
      "--rail-progress",
      max > 0 ? String(rail.scrollLeft / max) : "1"
    );

    motion.current.velocity *= 0.82;
    motion.current.frame = 0;
  }, []);

  const requestRender = useCallback(() => {
    if (motion.current.frame === 0) {
      motion.current.frame = requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const motionState = motion.current;
    motion.current.lastTime = performance.now();
    renderFrame();
    rail.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    return () => {
      rail.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      cancelAnimationFrame(motionState.frame);
    };
  }, [renderFrame, requestRender]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: rail.scrollLeft,
    };
    rail.setPointerCapture(event.pointerId);
    rail.dataset.dragging = "true";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 6) drag.current.moved = true;
    rail.scrollLeft = drag.current.startScroll - distance * 1.12;
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    drag.current.active = false;
    delete rail.dataset.dragging;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  };

  return (
    <div className={cn("motion-rail-shell", className)}>
      <div className="motion-rail__hint" aria-hidden="true">
        <MoveHorizontal className="size-4" /> Drag the line-up
      </div>
      <div
        ref={railRef}
        className="motion-rail no-scrollbar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        aria-label="Featured BMSCE events"
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn("motion-rail__item", index === 0 && "motion-rail__item--lead")}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="motion-rail__progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </div>
  );
}
