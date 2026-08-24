import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  /** Scroll right-to-left by default; `reverse` runs the other way. */
  reverse?: boolean;
  tone?: "ink" | "bright";
  className?: string;
}

/**
 * Infinite scrolling ticker strip. The item list is rendered twice so the
 * CSS translate loop (see `.marquee__track` in globals.css) is seamless.
 */
export default function Marquee({
  items,
  reverse = false,
  tone = "ink",
  className,
}: MarqueeProps) {
  const strip = (
    <div
      className={cn("marquee__track", reverse && "marquee__track--reverse")}
      aria-hidden="true"
    >
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="display flex items-center gap-8 text-xl whitespace-nowrap sm:text-2xl"
        >
          {item}
          <span
            className={cn(
              "text-base",
              tone === "ink" ? "text-limepop" : "text-grape"
            )}
          >
            ★
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "marquee border-y-[3px] border-ink py-3",
        tone === "ink" ? "bg-ink text-paper" : "bg-zest text-ink",
        className
      )}
    >
      {strip}
      {strip}
      <span className="sr-only">{items.join(", ")}</span>
    </div>
  );
}
