import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="display text-[7rem] leading-none sm:text-[12rem]">404</p>
      <h1 className="display -mt-4 text-3xl sm:text-5xl">
        This page left the party
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        The event or club you&apos;re looking for isn&apos;t here — it may have been
        renamed or taken down.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/events">
          <Button size="lg" variant="secondary">
            Browse events
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline">
            Go home
          </Button>
        </Link>
      </div>
    </main>
  );
}
