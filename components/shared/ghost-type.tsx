import { cn } from "@/lib/utils";

interface GhostTypeProps {
  /** Words tiled behind the section, largest first. */
  words: string[];
  className?: string;
}

/**
 * Oversized outlined lettering tiled behind a hero — the poster device where a
 * headline's own vocabulary is repeated as background texture.
 *
 * Decorative only: hidden from assistive tech and non-interactive.
 */
export default function GhostType({ words, className }: GhostTypeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 hidden select-none overflow-hidden lg:block",
        className
      )}
    >
      <div className="absolute inset-y-0 right-0 flex w-full flex-col items-end justify-center gap-2 pr-4 text-right leading-[0.82] lg:w-[54%]">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="display text-outline block whitespace-nowrap text-[8.5vw] opacity-[0.24]"
            style={{
              // Stagger from the right edge so the stack reads as a wall.
              marginRight: `${index % 2 === 0 ? 0 : 5}%`,
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
