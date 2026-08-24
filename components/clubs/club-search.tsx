"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import DebouncedSearch from "@/components/shared/debounced-search";

export default function ClubSearch({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeQuery = searchParams.get("q") ?? "";

  const commitQuery = useCallback(
    (value: string) => {
      startTransition(() =>
        router.replace(
          value ? `/clubs?q=${encodeURIComponent(value)}` : "/clubs",
          { scroll: false }
        )
      );
    },
    [router]
  );

  return (
    <div className="brutal flex flex-col gap-4 rounded-2xl bg-card p-5 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-md">
        <DebouncedSearch
          key={activeQuery}
          initialValue={activeQuery}
          onCommit={commitQuery}
          placeholder="Search clubs…"
          label="Search clubs"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <span className="size-2 rounded-full bg-limepop ring-2 ring-ink" />
          )}
          {resultCount} club{resultCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
