"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="display text-6xl sm:text-8xl">Well, that broke</p>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        Something went wrong loading this page. If the database isn&apos;t
        running locally, that&apos;s usually the culprit.
      </p>
      <div className="mt-8">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
