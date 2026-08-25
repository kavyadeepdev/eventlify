import { cn } from "@/lib/utils";

interface BmsceCrestProps {
  className?: string;
  /** Drops the circular lettering for very small renders. */
  compact?: boolean;
  title?: string;
}

const TEETH = 24;

/**
 * BMSCE crest, rebuilt as vector art: cogged outer ring, circular lettering,
 * and the bridge-and-bolt roundel.
 *
 * Hues are pulled toward the AfterClass palette (ink cog, grape-leaning blue,
 * coral bolt) while the structure — tooth count, lettering ring, twin-tower
 * suspension bridge, diagonal bolt — is kept faithful to the original.
 */
export default function BmsceCrest({
  className,
  compact = false,
  title = "B.M.S. College of Engineering",
}: BmsceCrestProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={title}
      className={cn("select-none", className)}
    >
      <defs>
        <linearGradient id="crest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f7ef0" />
          <stop offset="55%" stopColor="#5d97f5" />
          <stop offset="100%" stopColor="#8fc0fb" />
        </linearGradient>

        <clipPath id="crest-disc">
          <circle cx="100" cy="100" r="56" />
        </clipPath>

        <path id="crest-arc-top" d="M 38.5 100 A 61.5 61.5 0 0 1 161.5 100" />
        <path id="crest-arc-bottom" d="M 38.5 100 A 61.5 61.5 0 0 0 161.5 100" />
      </defs>

      {/* Cog teeth */}
      <g fill="var(--color-ink, #12121a)">
        {Array.from({ length: TEETH }, (_, index) => (
          <rect
            key={index}
            x="93"
            y="1"
            width="14"
            height="22"
            rx="2.5"
            transform={`rotate(${(index * 360) / TEETH} 100 100)`}
          />
        ))}
      </g>

      {/* Cog body, then the lettering band punched over its inner edge */}
      <circle
        cx="100"
        cy="100"
        r="84"
        fill="none"
        stroke="var(--color-ink, #12121a)"
        strokeWidth="28"
      />
      <circle cx="100" cy="100" r="67" fill="none" stroke="#ffffff" strokeWidth="23" />

      {/* Roundel */}
      <circle cx="100" cy="100" r="56" fill="url(#crest-sky)" />

      <g clipPath="url(#crest-disc)">
        {/* Waterline bands */}
        <g stroke="#2f6ad0" strokeWidth="1.4" opacity="0.55">
          {[118, 128, 138, 148].map((y) => (
            <line key={y} x1="46" y1={y} x2="154" y2={y} />
          ))}
        </g>

        {/* Suspension bridge */}
        <g stroke="#163f8f" fill="none" strokeWidth="2.2">
          <path d="M46 108 H154" strokeWidth="3" />
          <path d="M68 108 V60 M132 108 V60" strokeWidth="3.4" />
          {/* Main cables sweeping between the towers and off to the banks */}
          <path d="M46 76 Q57 92 68 62" />
          <path d="M68 62 Q100 112 132 62" />
          <path d="M132 62 Q143 92 154 76" />
          {/* Hangers */}
          <g strokeWidth="1.2" opacity="0.85">
            {[76, 84, 92, 100, 108, 116, 124].map((x) => (
              <line key={x} x1={x} y1="108" x2={x} y2={hangerTop(x)} />
            ))}
          </g>
        </g>

        {/* Bolt */}
        <path
          d="M141 47 L96 104 L110 104 L64 156 L104 100 L89 100 Z"
          fill="var(--color-coral, #ff4438)"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </g>

      <text
        x="100"
        y="66"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="9"
        fontWeight="700"
        letterSpacing="1.2"
        fontFamily="var(--font-grotesk), system-ui, sans-serif"
      >
        ESTD. 1946
      </text>

      {/* Bearing dots on the lettering band */}
      <circle cx="33.5" cy="100" r="3.9" fill="var(--color-coral, #ff4438)" />
      <circle cx="166.5" cy="100" r="3.9" fill="var(--color-coral, #ff4438)" />

      {compact ? null : (
        <g
          fill="#1f5fd0"
          fontFamily="var(--font-grotesk), system-ui, sans-serif"
          fontWeight="700"
          fontSize="10.4"
          letterSpacing="0.18"
        >
          <text>
            <textPath href="#crest-arc-top" startOffset="50%" textAnchor="middle">
              B.M.S. COLLEGE OF ENGINEERING
            </textPath>
          </text>
          <text>
            <textPath
              href="#crest-arc-bottom"
              startOffset="50%"
              textAnchor="middle"
            >
              BANGALORE - 560019
            </textPath>
          </text>
        </g>
      )}
    </svg>
  );
}

/** Height of each vertical hanger, following the cable's sag. */
function hangerTop(x: number) {
  const span = (x - 68) / 64; // 0 at the left tower, 1 at the right
  const sag = Math.sin(span * Math.PI); // deepest mid-span
  return 62 + sag * 46;
}
