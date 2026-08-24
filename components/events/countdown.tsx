"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  target: string;
  /** Shown once the target time has passed. */
  passedLabel?: string;
  className?: string;
  tone?: "light" | "dark";
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/**
 * Live countdown. The first paint renders nothing time-dependent so the server
 * and client markup agree; the ticker starts after hydration.
 */
export default function Countdown({
  target,
  passedLabel = "It's go time",
  className,
  tone = "light",
}: CountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const targetMs = new Date(target).getTime();
    const tick = () => setRemaining(targetMs - Date.now());

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const tileClass =
    tone === "dark"
      ? "border-paper/30 bg-ink text-paper"
      : "border-ink bg-paper text-ink";

  if (remaining !== null && remaining <= 0) {
    return (
      <p className={cn("display text-2xl", className)}>{passedLabel}</p>
    );
  }

  const parts = split(remaining ?? 0);
  const units = [
    { label: "Days", value: parts.days },
    { label: "Hrs", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div className={cn("flex gap-2", className)} suppressHydrationWarning>
      {units.map((unit) => (
        <div
          key={unit.label}
          className={cn(
            "flex min-w-14 flex-col items-center overflow-hidden rounded-xl border-[3px] px-2 py-1.5",
            tileClass
          )}
        >
          <span
            key={unit.value}
            className="display animate-tick text-2xl leading-none tabular-nums"
          >
            {remaining === null ? "--" : String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
