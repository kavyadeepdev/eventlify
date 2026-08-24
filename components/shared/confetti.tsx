const COLORS = [
  "var(--color-grape)",
  "var(--color-punch)",
  "var(--color-zest)",
  "var(--color-limepop)",
  "var(--color-aqua)",
  "var(--color-flame)",
];

interface ConfettiProps {
  /** Render a burst when true. */
  fire: boolean;
  pieces?: number;
}

/**
 * Lightweight DOM confetti — a burst of absolutely positioned chips. The
 * animation uses `forwards`, so the pieces settle at zero opacity and need no
 * cleanup timer. No canvas, no dependency.
 */
export default function Confetti({ fire, pieces = 28 }: ConfettiProps) {
  if (!fire) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center overflow-visible"
    >
      {Array.from({ length: pieces }).map((_, index) => {
        // Deterministic spread so the burst looks designed, not random noise.
        const angle = (index / pieces) * Math.PI * 2;
        const spread = 60 + (index % 5) * 26;

        return (
          <span
            key={index}
            className="absolute size-2.5 rounded-[2px] border border-ink"
            style={
              {
                background: COLORS[index % COLORS.length],
                animation: "var(--animate-confetti)",
                animationDelay: `${(index % 7) * 35}ms`,
                "--confetti-x": `${Math.cos(angle) * spread}px`,
                "--confetti-y": `${120 + Math.abs(Math.sin(angle)) * 140}px`,
                "--confetti-spin": `${(index % 2 ? 1 : -1) * (360 + index * 18)}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
