import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getClubBySlug, getClubs } from "@/lib/db-queries";
import { getSessionUser } from "@/lib/session";
import EventForm from "@/components/events/event-form";
import EmptyState from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Publish an event",
  description: "Put your club's next event on the BMSCE wall.",
};

export default async function NewEventPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/events/new");

  // A student can only publish under clubs they belong to. There's no
  // "my clubs" endpoint yet, so membership is resolved club by club.
  const clubs = await getClubs();
  const details = await Promise.all(
    clubs.map((club) => getClubBySlug(club.slug))
  );
  const myClubs = clubs.filter((_, index) =>
    details[index]?.members.some((member) => member.userId === user.id)
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="size-4" />
        Back to events
      </Link>

      <div className="mt-6 space-y-3">
        <span className="sticker inline-block bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          Organiser tools
        </span>
        <h1 className="display text-5xl sm:text-6xl">Publish an event</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Fill this in and your event goes live on the BMSCE wall — with
          registrations, team rules and check-in ready to go.
        </p>
      </div>

      <div className="mt-8">
        {myClubs.length ? (
          <EventForm clubs={myClubs} />
        ) : (
          <EmptyState
            title="You're not on a club roster yet"
            description="Events are published by clubs. Ask a club admin to add you to their roster, or email hello@afterclass.app to get your chapter listed."
            actionLabel="Browse clubs"
            actionHref="/clubs"
          />
        )}
      </div>
    </main>
  );
}
