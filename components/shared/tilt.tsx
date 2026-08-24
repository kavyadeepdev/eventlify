"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TiltProps {
  children: React.ReactNode;
  /** Maximum rotation in degrees. */
  max?: number;
  /** How far the card lifts toward the pointer. */
  lift?: number;
  className?: string;
}

/**
 * Pointer-reactive 3D tilt with a cursor spotlight. Values are written to CSS
 * custom properties so the animation stays on the compositor.
 */
export default function Tilt({
  children,
  max = 7,
  lift = -6,
  className,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const frameNode = ref.current;
    if (!frameNode || event.pointerType === "touch") return;

    const { clientX, clientY } = event;

    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      // Measure the stationary frame, never the transformed surface. Reading
      // the moving surface here creates a feedback loop and visible jitter.
      const rect = frameNode.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      frameNode.dataset.tilting = "true";
      frameNode.style.setProperty("--tilt-y", `${(px - 0.5) * max * 2}deg`);
      frameNode.style.setProperty("--tilt-x", `${(0.5 - py) * max * 2}deg`);
      frameNode.style.setProperty("--tilt-lift", `${lift}px`);
      frameNode.style.setProperty("--spot-x", `${px * 100}%`);
      frameNode.style.setProperty("--spot-y", `${py * 100}%`);
      frameNode.style.setProperty("--spot-opacity", "1");
    });
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;

    node.dataset.tilting = "false";
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-lift", "0px");
    node.style.setProperty("--spot-opacity", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={cn("tilt-frame", className)}
    >
      <div className="tilt-surface spotlight">{children}</div>
    </div>
  );
}
