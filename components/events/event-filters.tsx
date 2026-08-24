"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import DebouncedSearch from "@/components/shared/debounced-search";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "Everything" },
  { value: "open", label: "Open" },
  { value: "live", label: "Live" },
  { value: "past", label: "Wrapped" },
] as const;

const MODE_OPTIONS = [
  { value: "all", label: "Any format" },
  { value: "solo", label: "Solo" },
  { value: "team", label: "Team" },
] as const;

const SORT_OPTIONS = [
  { value: "soon", label: "Soonest" },
  { value: "later", label: "Latest" },
  { value: "name", label: "A–Z" },
] as const;

/**
 * Filter bar. State lives in the URL so results are shareable and the page
 * itself can stay a Server Component.
 */
export default function EventFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeQuery = searchParams.get("q") ?? "";
  const paramString = searchParams.toString();

  const commit = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(paramString);
      for (const [key, value] of Object.entries(updates)) {
        // Defaults stay out of the URL to keep it readable.
        if (!value || value === "all" || (key === "sort" && value === "soon")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.replace(
          params.toString() ? `${pathname}?${params}` : pathname,
          { scroll: false }
        );
      });
    },
    [paramString, pathname, router]
  );

  const commitQuery = useCallback(
    (value: string) => commit({ q: value }),
    [commit]
  );

  const group = (
    name: string,
    options: readonly { value: string; label: string }[],
    fallback: string
  ) => {
    const current = searchParams.get(name) ?? fallback;
    return (
      // One scrolling line per group on phones, wrapping rows from sm up.
      <div
        className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label={name}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => commit({ [name]: option.value })}
            aria-pressed={current === option.value}
            className={cn(
              "shrink-0 snap-start rounded-full border-[3px] border-ink px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all sm:px-4 sm:text-xs",
              current === option.value
                ? "bg-ink text-paper shadow-[3px_3px_0_var(--color-grape)]"
                : "bg-card hover:bg-zest"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="brutal space-y-4 rounded-2xl bg-card p-4 sm:space-y-5 sm:p-5">
      <DebouncedSearch
        key={activeQuery}
        initialValue={activeQuery}
        onCommit={commitQuery}
        placeholder="Search events by name or keyword"
        label="Search events"
      />

      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          {group("status", STATUS_OPTIONS, "all")}
          {group("mode", MODE_OPTIONS, "all")}
        </div>
        {group("sort", SORT_OPTIONS, "soon")}
      </div>

      <p className="flex items-center gap-2 border-t-2 border-dashed border-ink/30 pt-3 text-xs font-bold uppercase tracking-wide">
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span className="size-2 rounded-full bg-limepop ring-2 ring-ink" />
        )}
        {resultCount} event{resultCount === 1 ? "" : "s"} found
      </p>
    </div>
  );
}
