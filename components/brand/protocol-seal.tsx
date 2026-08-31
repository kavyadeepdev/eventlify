import ProtocolMark from "@/components/brand/protocol-mark";
import { cn } from "@/lib/utils";

/**
 * The Protocol wordmark set into a round rubber-stamp seal: two rules, text
 * curved along the inner ring, and star separators. Painted in `currentColor`
 * so the caller sets the ink.
 */
export default function ProtocolSeal({ className }: { className?: string }) {
  return (
    <span className={cn("seal", className)} aria-hidden="true">
      <span className="seal__inner">
        <svg viewBox="0 0 200 200" className="seal__ring">
        <defs>
          {/* Two half-circles: one for the top arc, one for the bottom, drawn
              in opposite directions so both read left-to-right. */}
          <path
            id="seal-arc-top"
            d="M32 100a68 68 0 0 1 136 0"
            fill="none"
          />
          <path
            id="seal-arc-bottom"
            d="M168 100a68 68 0 0 1 -136 0"
            fill="none"
          />
        </defs>

        <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" strokeWidth="1.6" />

        <g fill="currentColor" className="seal__text">
          <text>
            <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
              AFTERCLASS
            </textPath>
          </text>
          <text>
            <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">
              VERIFIED MEMBER
            </textPath>
          </text>
        </g>

        {/* Star separators at the seal's waist */}
        <g fill="currentColor" className="seal__star">
          <text x="14" y="106" textAnchor="middle">★</text>
          <text x="186" y="106" textAnchor="middle">★</text>
        </g>
      </svg>

        <ProtocolMark className="seal__mark" />
      </span>
    </span>
  );
}
