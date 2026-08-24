import { Suspense } from "react";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { fetchClubs, fetchEvents } from "@/lib/api-client";
import { getEventState, isTeamEvent } from "@/lib/format";
import { ClubApiData, EventApiData } from "@/lib/types";
import EventCard from "@/components/events/event-card";
import EventFilters from "@/components/events/event-filters";
import EmptyState from "@/components/shared/empty-state";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";

export const metadata: Metadata = {
  title: "Events",
  description: "Every workshop, hackathon and challenge at BMSCE.",
};

type SearchParams = Promise<{
  q?: string;
  status?: string;
  mode?: string;
  sort?: string;
}>;

function applyFilters(
  events: EventApiData[],
  { status, mode, sort }: { status?: string; mode?: string; sort?: string }
): EventApiData[] {
  let result = events;

  if (status && status !== "all") {
    result = result.filter((event) => {
      const state = getEventState(event).status;
      if (status === "open") return state === "UPCOMING";
      if (status === "live") return state === "LIVE";
      if (status === "past") return state === "ENDED" || state === "CLOSED";
      return true;
    });
  }

  if (mode && mode !== "all") {
    result = result.filter((event) =>
      mode === "team" ? isTeamEvent(event) : !isTeamEvent(event)
    );
  }

  return [...result].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const aTime = new Date(a.startsAt).getTime();
    const bTime = new Date(b.startsAt).getTime();
    return sort === "later" ? bTime - aTime : aTime - bTime;
  });
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, status, mode, sort } = await searchParams;

  // Text search runs in Postgres via the API; the rest is cheap in-memory work.
  const [events, clubs] = await Promise.all([fetchEvents(q), fetchClubs()]);

  const clubsMap = clubs.reduce<Record<string, ClubApiData>>((map, club) => {
    map[club.id] = club;
    return map;
  }, {});

  const filtered = applyFilters(events, { status, mode, sort });

  return (
    <>
      <section className="directory-hero directory-hero--events">
        <div className="directory-hero__word" aria-hidden="true">EVENTS</div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div>
            <span className="section-label">The full line-up</span>
            <h1 className="display mt-6 text-[4.4rem] leading-[0.82] text-white sm:text-8xl lg:text-[8.5rem]">
              Find your
              <br />
              next plan.
            </h1>
          </div>
          <div className="max-w-sm lg:pb-2">
            <span className="display block text-7xl text-limepop">{filtered.length.toString().padStart(2, "0")}</span>
            <p className="mt-3 border-t border-white/30 pt-4 text-sm leading-relaxed text-white/68">
              Hackathons, workshops, competitions and club nights. Filter the
              board, grab your spot and get it in the calendar.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Suspense
          fallback={
            <div className="brutal h-40 rounded-2xl bg-card" aria-hidden="true" />
          }
        >
          <EventFilters resultCount={filtered.length} />
        </Suspense>

        {filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, index) => (
              <Reveal key={event.id} delay={(index % 3) * 90}>
                <Tilt className="h-full">
                  <EventCard
                    event={event}
                    club={clubsMap[event.clubId]}
                    index={index}
                  />
                </Tilt>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matching events"
            description="Try a different keyword, or clear the filters to see everything."
            actionLabel="Clear filters"
            actionHref="/events"
          />
        )}
      </main>
    </>
  );
}
