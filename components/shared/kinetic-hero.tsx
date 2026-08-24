"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface KineticHeroProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Feeds pointer and scroll position into CSS variables used by the hero's
 * layered poster artwork. The DOM stays server-rendered; only the motion shell
 * hydrates on the client.
 */
export default function KineticHero({ children, className }: KineticHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<number | null>(null);
  const pointerFrame = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const updateScroll = () => {
      frame.current = null;
      const rect = node.getBoundingClientRect();
      const travel = Math.max(-1, Math.min(1, -rect.top / rect.height));
      node.style.setProperty("--hero-scroll", String(travel));
    };

    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node || event.pointerType === "touch") return;

    const { clientX, clientY } = event;
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      pointerFrame.current = null;
      const rect = node.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--hero-x", x.toFixed(3));
      node.style.setProperty("--hero-y", y.toFixed(3));

      // Measure the stable outer letter and animate only its inner glyph. This
      // creates a smooth magnetic ripple without transform feedback or jitter.
      node.querySelectorAll<HTMLElement>(".letter").forEach((letter) => {
        const glyph = letter.querySelector<HTMLElement>(".letter__inner");
        if (!glyph) return;

        const box = letter.getBoundingClientRect();
        const dx = clientX - (box.left + box.width / 2);
        const dy = clientY - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - distance / 190);
        const influence = proximity * proximity;
        const pullX = Math.max(-4, Math.min(4, dx * influence * 0.03));
        const rotation = Math.max(
          -2.4,
          Math.min(2.4, (dx / 190) * influence * 3)
        );

        glyph.style.setProperty("--kinetic-x", `${pullX}px`);
        glyph.style.setProperty("--kinetic-y", `${-12 * influence}px`);
        glyph.style.setProperty("--kinetic-r", `${rotation}deg`);
        glyph.style.setProperty("--kinetic-s", String(1 + influence * 0.045));
        glyph.style.setProperty("--kinetic-influence", String(influence));
      });
    });
  };

  const resetPointer = () => {
    const node = ref.current;
    if (!node) return;
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = null;
    node.style.setProperty("--hero-x", "0");
    node.style.setProperty("--hero-y", "0");
    node.querySelectorAll<HTMLElement>(".letter__inner").forEach((glyph) => {
      glyph.style.removeProperty("--kinetic-x");
      glyph.style.removeProperty("--kinetic-y");
      glyph.style.removeProperty("--kinetic-r");
      glyph.style.removeProperty("--kinetic-s");
      glyph.style.removeProperty("--kinetic-influence");
    });
  };

  return (
    <section
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className={cn("home-hero kinetic-hero", className)}
    >
      {children}
    </section>
  );
}
