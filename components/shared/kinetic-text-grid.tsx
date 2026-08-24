import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  text?: string;
  font?: React.CSSProperties;
  textColor?: string;
  backgroundColor?: string;
  rowCount?: number;
  repeatCount?: number;
  rowGap?: number;
  wordGap?: number;
  horizontalShiftPx?: number;
  zoomScalePct?: number;
  cycleSeconds?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Grid of repeating words that drifts, zooms and wipes down to a single
 * centred word.
 *
 * Deliberately CSS-only — no animation library and no client component. The
 * loading screen is the very first thing painted on a cold load, so it has to
 * run from the server-rendered markup without waiting for hydration. Every
 * animated property is a `transform`, which the compositor can handle without
 * repainting the (very large) text on each frame.
 */
export default function KineticTextGrid({
  text = "LOADING",
  font,
  textColor = "#d7ff38",
  backgroundColor = "#111116",
  rowCount = 9,
  repeatCount = 3,
  rowGap = 14,
  wordGap = 24,
  horizontalShiftPx = 110,
  zoomScalePct = 112,
  cycleSeconds = 3.2,
  className,
  style,
}: Props) {
  // Odd counts keep an exact geometric centre.
  const rowTotal = rowCount % 2 === 0 ? rowCount + 1 : rowCount;
  const wordTotal = repeatCount % 2 === 0 ? repeatCount + 1 : repeatCount;
  const centreRow = Math.floor(rowTotal / 2);
  const centreWord = Math.floor(wordTotal / 2);
  const denominator = Math.max(1, wordTotal - 1);

  return (
    <div
      className={cn("ktg", className)}
      style={
        {
          "--ktg-bg": backgroundColor,
          "--ktg-color": textColor,
          "--ktg-cycle": `${cycleSeconds}s`,
          "--ktg-row-gap": `${rowGap}px`,
          "--ktg-word-gap": `${wordGap}px`,
          "--ktg-zoom": String(zoomScalePct / 100),
          ...style,
        } as React.CSSProperties
      }
    >
      <div className="ktg__stage" style={font}>
        {Array.from({ length: rowTotal }, (_, row) => {
          const offsetFromCentre = row - centreRow;
          const direction = row % 2 === 0 ? 1 : -1;
          const speed = 0.7 + (Math.abs(offsetFromCentre) % 3) * 0.45;
          const driftFull = direction * horizontalShiftPx * speed;
          const wipesLeftToRight = row % 2 === 0;

          return (
            <div
              key={row}
              className="ktg__row"
              style={
                {
                  // Rows rest staggered and drift further apart mid-cycle.
                  "--drift-home": `${driftFull * 0.4}px`,
                  "--drift-full": `${driftFull}px`,
                  "--row-delay": `${-Math.abs(offsetFromCentre) * 0.06}s`,
                } as React.CSSProperties
              }
            >
              {Array.from({ length: wordTotal }, (_, word) => {
                const isAnchor = row === centreRow && word === centreWord;
                const sweep = wipesLeftToRight
                  ? word / denominator
                  : (wordTotal - 1 - word) / denominator;

                return (
                  <span key={word} className="ktg__word">
                    <span
                      className={cn(
                        "ktg__word-inner",
                        isAnchor && "ktg__word-inner--anchor"
                      )}
                      style={
                        {
                          "--wipe-to": wipesLeftToRight ? "110%" : "-110%",
                          "--word-delay": `${sweep * 0.22}s`,
                        } as React.CSSProperties
                      }
                    >
                      {text}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
