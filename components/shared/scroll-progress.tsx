"use client";

import { useEffect, useRef } from "react";

/** Thin progress rail that tracks how far the page has been read. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const node = ref.current;
      if (!node) return;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      node.style.setProperty("--progress", String(Math.min(progress, 1)));
    };

    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-ink/10"
    >
      <div
        ref={ref}
        className="scroll-progress h-full w-full bg-gradient-to-r from-grape via-punch to-limepop"
      />
    </div>
  );
}
