import { cn } from "@/lib/utils";

interface AfterClassMarkProps {
  className?: string;
}

/**
 * The AfterClass mark combines an A with an open clock-face C: the moment
 * classes finish and the rest of BMSCE starts.
 */
export default function AfterClassMark({ className }: AfterClassMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="14"
        fill="var(--color-ink)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />

      <path
        d="M32.8 11.8A14.4 14.4 0 1 0 36.7 35"
        fill="none"
        stroke="var(--color-limepop)"
        strokeLinecap="round"
        strokeWidth="3.8"
      />

      <path
        d="M14.2 34.5 23.7 12l9.4 22.5M18 25.7h11.6"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.4"
      />

      <path
        d="m36.4 31.4 3.3 3.3"
        fill="none"
        stroke="var(--color-limepop)"
        strokeLinecap="round"
        strokeWidth="3.8"
      />

      <circle
        cx="38.5"
        cy="9.5"
        r="4.5"
        fill="var(--color-flame)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
    </svg>
  );
}
