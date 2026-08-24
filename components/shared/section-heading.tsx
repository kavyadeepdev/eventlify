import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "See all",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <span className="section-label">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="display text-5xl leading-[0.88] sm:text-6xl lg:text-7xl">{title}</h2>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2.5 text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
