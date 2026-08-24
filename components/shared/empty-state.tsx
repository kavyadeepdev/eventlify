import Link from "next/link";
import { CalendarX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon = CalendarX,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="brutal halftone rounded-2xl bg-card px-6 py-16 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border-[3px] border-ink bg-zest shadow-[4px_4px_0_var(--color-ink)]">
        <Icon className="size-7" />
      </div>
      <h3 className="display mt-6 text-2xl sm:text-3xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <div className="mt-6 flex justify-center">
          <Link href={actionHref}>
            <Button variant="secondary">{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
