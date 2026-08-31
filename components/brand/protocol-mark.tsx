import { cn } from "@/lib/utils";

/**
 * The Protocol wordmark, rebuilt as vector art.
 *
 * Same construction as the original: rounded stems, chevrons, and rotated
 * squares with a matching square counter. Painted in `currentColor` so it can
 * be tinted to whatever surface it sits on.
 *
 * Metrics: baseline 84, x-height 50, ascender 36, descender 112, with an even
 * ~40-unit advance between glyphs.
 */
export default function ProtocolMark({ className }: { className?: string }) {
  /** A diamond with a diamond counter, as one even-odd path. */
  const diamond = (cx: number, cy = 69, r = 21, hole = 9.5) =>
    `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z` +
    `M${cx} ${cy - hole}L${cx - hole} ${cy}L${cx} ${cy + hole}L${cx + hole} ${cy}Z`;

  return (
    <svg
      viewBox="0 0 328 122"
      className={cn("block", className)}
      role="img"
      aria-label="Protocol"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* p — stem with descender, and a chevron bowl held clear of it so
            the two don't fuse into a solid triangle */}
        <path d="M22 50V112" />
        <path d="M40 58L58 69L40 80" />

        {/* the double chevron that sits below the p */}
        <g strokeWidth={9}>
          <path d="M42 94L51 101L42 108" />
          <path d="M60 94L69 101L60 108" />
        </g>

        {/* r — stem and lifted arm, kerned in close to the p */}
        <path d="M76 58V84" />
        <path d="M76 69L90 57" />

        {/* t — stem and crossbar; the round cap forms the top dot */}
        <path d="M162 40V84" />
        <path d="M149 57H175" />

        {/* c — open chevron */}
        <path d="M242 57L229 69L242 81" />

        {/* l — plain stem */}
        <path d="M306 40V84" />
      </g>

      {/* The three counters, stroked lightly so their corners round off the
          same way the stems do. */}
      <g
        fill="currentColor"
        fillRule="evenodd"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
      >
        <path d={diamond(120)} />
        <path d={diamond(204)} />
        <path d={diamond(272)} />
      </g>
    </svg>
  );
}
