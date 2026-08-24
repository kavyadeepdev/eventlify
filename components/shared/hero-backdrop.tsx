"use client";

import { useEffect, useRef } from "react";

/**
 * Layered hero texture: blueprint grid, halftone dots, a diagonal stripe band
 * and drifting outlined shapes. Everything is drawn in `currentColor`, so the
 * same component sits correctly on purple, yellow, pink or ink sections
 * without tinting the flat block colour underneath.
 */
export default function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      node.style.setProperty("--scroll", String(window.scrollY));
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Blueprint grid */}
      <span
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          translate: "0 calc(var(--scroll, 0) * 0.04px)",
        }}
      />

      {/* Halftone dots */}
      <span
        className="halftone absolute inset-x-0 -top-8 bottom-0 opacity-[0.22]"
        style={{ translate: "0 calc(var(--scroll, 0) * 0.07px)" }}
      />

      {/* Diagonal stripe band sweeping across the block */}
      <span
        className="stripes absolute -left-[10%] top-[46%] h-28 w-[130%] -rotate-[13deg] opacity-[0.10]"
        style={{ translate: "0 calc(var(--scroll, 0) * -0.05px)" }}
      />
      <span
        className="stripes absolute -left-[10%] top-[8%] h-16 w-[130%] -rotate-[13deg] opacity-[0.07]"
        style={{ translate: "0 calc(var(--scroll, 0) * -0.09px)" }}
      />

      {/* Outlined shapes, slowly drifting */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.28]"
        fill="none"
        stroke="currentColor"
      >
        <circle
          cx="12%"
          cy="78%"
          r="70"
          strokeWidth="3"
          className="animate-float [--float-tilt:0deg]"
        />
        <circle cx="12%" cy="78%" r="104" strokeWidth="3" />
        <circle
          cx="72%"
          cy="16%"
          r="46"
          strokeWidth="3"
          className="animate-float-slow"
        />
      </svg>

      {/* Oversized star, the poster's punctuation mark */}
      <span
        className="animate-spin-slow absolute right-[6%] top-[62%] hidden text-[10rem] leading-none opacity-[0.16] lg:block"
        style={{ translate: "0 calc(var(--scroll, 0) * -0.12px)" }}
      >
        ★
      </span>
    </div>
  );
}
