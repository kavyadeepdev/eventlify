import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList, ShieldAlert } from "lucide-react";
import {
  fetchClubBySlug,
  fetchEventAttendance,
  fetchEventBySlug,
  fetchEventRegistrations,
  fetchTeam,
} from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import { formatDateTime, getEventState } from "@/lib/format";
import CheckInList, {
  CheckInEntry,
} from "@/components/events/check-in-list";
import EmptyState from "@/components/shared/empty-state";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import CountUp from "@/components/shared/count-up";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = {
  title: "Organiser tools",
};

export default async function ManageEventPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [data, user] = await Promise.all([
    fetchEventBySlug(slug),
    getSessionUser(),
  ]);

  if (!data?.event) notFound();
  if (!user) redirect(`/login?next=/events/${slug}/manage`);

  const { event, club } = data;

  // Organiser tools are for the hosting club's members only.
  const clubDetail = club ? await fetchClubBySlug(club.slug) : null;
  const isOrganiser = Boolean(
    clubDetail?.members.some((member) => member.userId === user.id)
  );

  if (!isOrganiser) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="brutal rounded-2xl bg-card p-8 text-center">
          <ShieldAlert className="mx-auto size-10" />
          <h1 className="display mt-4 text-3xl">Organisers only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only members of {club?.name ?? "the hosting club"} can manage this
            event.
          </p>
          <Link
            href={`/events/${slug}`}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest underline decoration-[3px] underline-offset-4"
          >
            <ArrowLeft className="size-4" />
            Back to the event
          </Link>
        </div>
      </main>
    );
  }

  const [registrations, attendances] = await Promise.all([
    fetchEventRegistrations(slug),
    fetchEventAttendance(slug),
  ]);

  const attendedIds = new Set(attendances.map((entry) => entry.userId));

  // Team registrations only carry a team id, so pull each roster.
  const teams = await Promise.all(
    registrations.map((registration) =>
      registration.teamId ? fetchTeam(registration.teamId) : Promise.resolve(null)
    )
  );

  const entries: CheckInEntry[] = registrations.map((registration, index) => {
    const team = teams[index];

    const people =
      registration.mode === "TEAM" && team
        ? team.members.map((member) => ({
            userId: member.userId,
            name: member.name,
            email: member.email,
            image: member.image,
            attended: attendedIds.has(member.userId),
          }))
        : registration.userId
          ? [
              {
                userId: registration.userId,
                name: registration.userName ?? "Unknown student",
                email: registration.userEmail ?? "",
                image: null,
                attended: attendedIds.has(registration.userId),
              },
            ]
          : [];

    return {
      id: registration.id,
      mode: registration.mode,
      teamId: registration.teamId,
      title:
        registration.teamName ?? registration.userName ?? "Unknown registration",
      registeredAt: registration.createdAt,
      people,
    };
  });

  const headcount = entries.reduce((sum, entry) => sum + entry.people.length, 0);
  const checkedIn = entries.reduce(
    (sum, entry) => sum + entry.people.filter((person) => person.attended).length,
    0
  );
  const rate = headcount ? Math.round((checkedIn / headcount) * 100) : 0;
  const state = getEventState(event);

  const stats = [
    { value: registrations.length, label: "Registrations", tone: "bg-zest" },
    { value: headcount, label: "Total heads", tone: "bg-aqua" },
    { value: checkedIn, label: "Checked in", tone: "bg-limepop" },
    { value: rate, label: "Turnout %", tone: "bg-punch text-white" },
  ];

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paper/70 transition-colors hover:text-paper"
          >
            <ArrowLeft className="size-4" />
            Back to the event
          </Link>

          <span className="sticker mt-6 inline-block bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
            Organiser tools
          </span>

          <h1 className="display mt-4 text-[2.4rem] leading-tight sm:text-6xl">
            {event.name}
          </h1>
          <p className="mt-2 text-sm text-paper/70">
            {state.label} · Entries closed{" "}
            {formatDateTime(event.registrationDeadline)}
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Reveal key={stat.label}>
              <Tilt max={8}>
                <div className={`brutal shine rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${stat.tone}`}>
                  <p className="display text-3xl leading-none sm:text-5xl">
                    {typeof stat.value === "number" ? (
                      <CountUp value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>

        <section className="space-y-5">
          <h2 className="display text-3xl sm:text-4xl">Door list</h2>
          {entries.length ? (
            <CheckInList eventSlug={slug} entries={entries} />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No registrations yet"
              description="Once students register, they'll appear here ready to check in."
              actionLabel="View the event page"
              actionHref={`/events/${slug}`}
            />
          )}
        </section>
      </main>
    </>
  );
}
