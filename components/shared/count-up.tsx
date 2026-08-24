"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
}

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * Renders the real number until the animation actually starts, so the correct
 * figure is on screen even if the script is slow or never runs.
 */
export default function CountUp({ value, duration = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;

    const run = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo keeps the last digits from crawling.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimated(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          raf = requestAnimationFrame(run);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {animated ?? value}
    </span>
  );
}
