import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  /** Delay before the first letter lands. */
  delay?: number;
  /** Per-letter stagger. */
  stagger?: number;
  /** Runs a light wave letter-to-letter across the line. */
  shimmer?: boolean;
  className?: string;
}

/**
 * Headline type that rises out of a mask, letter by letter, with a blur-in and
 * a small settle rotation. Once landed, nearby letters react as a magnetic
 * ripple while the outer letter boxes keep the motion stable.
 *
 * The whole phrase is exposed to screen readers via `aria-label` and the
 * letters are hidden from them, so the effect stays purely visual.
 */
export default function SplitText({
  text,
  delay = 0,
  stagger = 22,
  shimmer = false,
  className,
}: SplitTextProps) {
  return (
    <span className={cn("split-text", shimmer && "text-wave", className)} aria-label={text}>
      {text.split(" ").map((word, wordIndex, words) => {
        const previousCharacters = words
          .slice(0, wordIndex)
          .reduce((total, item) => total + item.length + 1, 0);

        return (
          <Fragment key={`${word}-${wordIndex}`}>
            {wordIndex > 0 ? " " : null}
            <span className="line-mask" aria-hidden="true">
              {word.split("").map((character, characterIndex) => {
                const index = previousCharacters + characterIndex;

                return (
                  <span
                    key={`${character}-${characterIndex}`}
                    className="letter"
                    style={
                      {
                        "--letter-delay": `${delay + index * stagger}ms`,
                        "--wave-delay": `${index * 70}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="letter__inner">{character}</span>
                  </span>
                );
              })}
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}
