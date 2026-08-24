"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** How far the element travels on the way in. */
  shift?: number;
  /** Optional stagger delay in milliseconds. */
  delay?: number;
  className?: string;
}

/** Reliable, one-shot viewport reveal with a no-JavaScript visible fallback. */
export default function Reveal({
  children,
  shift = 34,
  delay = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-visible");
      return;
    }

    node.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add("is-visible");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-motion", className)}
      style={
        {
          "--reveal-shift": `${shift}px`,
          "--reveal-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
