import type { Metadata } from "next";
import { fetchClubs, fetchEvents } from "@/lib/api-client";
import ClubCard from "@/components/clubs/club-card";
import ClubSearch from "@/components/clubs/club-search";
import EmptyState from "@/components/shared/empty-state";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import { Suspense } from "react";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Student chapters and communities running BMSCE events.",
};

type SearchParams = Promise<{ q?: string }>;

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const [clubs, events] = await Promise.all([fetchClubs(q), fetchEvents()]);

  const eventCountByClub = events.reduce<Record<string, number>>((map, event) => {
    map[event.clubId] = (map[event.clubId] ?? 0) + 1;
    return map;
  }, {});

  return (
    <>
      <section className="directory-hero directory-hero--clubs">
        <div className="directory-hero__word" aria-hidden="true">CREWS</div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div>
            <span className="section-label">The crews</span>
            <h1 className="display mt-6 text-[4.4rem] leading-[0.82] text-white sm:text-8xl lg:text-[8.5rem]">
              Find your
              <br />
              people.
            </h1>
          </div>
          <div className="max-w-sm lg:pb-2">
            <span className="display block text-7xl text-limepop">{clubs.length.toString().padStart(2, "0")}</span>
            <p className="mt-3 border-t border-white/30 pt-4 text-sm leading-relaxed text-white/68">
              Student-led chapters, collectives and communities making BMSCE
              much more interesting.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Suspense
          fallback={
            <div className="brutal h-24 rounded-2xl bg-card" aria-hidden="true" />
          }
        >
          <ClubSearch resultCount={clubs.length} />
        </Suspense>

        {clubs.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map((club, index) => (
              <Reveal key={club.id} delay={(index % 4) * 80}>
                <Tilt className="h-full">
                  <ClubCard
                    club={club}
                    index={index}
                    eventCount={eventCountByClub[club.id] ?? 0}
                  />
                </Tilt>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No clubs found"
            description="Nothing matched that search. Try a different name, or browse the full list."
            actionLabel="Show all clubs"
            actionHref="/clubs"
          />
        )}
      </main>
    </>
  );
}
