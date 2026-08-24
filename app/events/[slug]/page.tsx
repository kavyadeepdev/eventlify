import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Lock,
  CalendarClock,
  ClipboardList,
  ExternalLink,
  Flag,
  Mail,
  Timer,
  Users,
} from "lucide-react";
import {
  fetchClubBySlug,
  fetchEventBySlug,
  fetchEventRegistrations,
  fetchUserHistory,
  fetchUsers,
} from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import {
  formatDateLong,
  formatDateTime,
  formatTime,
  getEventState,
  teamSizeLabel,
} from "@/lib/format";
import Countdown from "@/components/events/countdown";
import RegisterPanel from "@/components/events/register-panel";
import { DEFAULT_ART } from "@/components/events/event-card";
import Avatar from "@/components/shared/avatar";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import SplitText from "@/components/shared/split-text";
import HeroBackdrop from "@/components/shared/hero-backdrop";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchEventBySlug(slug);
  if (!data?.event) return { title: "Event not found" };

  return {
    title: data.event.name,
    description: data.event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [data, user] = await Promise.all([
    fetchEventBySlug(slug),
    getSessionUser(),
  ]);

  if (!data?.event) notFound();

  const { event, club, contacts, links } = data;
  const state = getEventState(event);

  // Only fetch what each viewer actually needs.
  const [registrations, students, history, clubDetail] = await Promise.all([
    fetchEventRegistrations(slug),
    state.registrationOpen && event.maxTeamSize > 1
      ? fetchUsers()
      : Promise.resolve([]),
    user ? fetchUserHistory(user.slug) : Promise.resolve(null),
    user && club ? fetchClubBySlug(club.slug) : Promise.resolve(null),
  ]);

  const alreadyRegistered = Boolean(
    history?.registrations.some((entry) => entry.eventId === event.id)
  );

  const canManage = Boolean(
    user && clubDetail?.members.some((member) => member.userId === user.id)
  );

  const closedReason =
    state.status === "ENDED"
      ? "This event has already wrapped up."
      : state.status === "LIVE"
        ? "This event is under way — registrations are closed."
        : `Registration closed on ${formatDateTime(event.registrationDeadline)}.`;

  const facts = [
    {
      Icon: CalendarClock,
      label: "Starts",
      value: formatDateLong(event.startsAt),
      detail: formatTime(event.startsAt),
    },
    {
      Icon: Flag,
      label: "Ends",
      value: formatDateLong(event.endsAt),
      detail: formatTime(event.endsAt),
    },
    {
      Icon: Timer,
      label: "Entries close",
      value: formatDateLong(event.registrationDeadline),
      detail: formatTime(event.registrationDeadline),
    },
    {
      Icon: Users,
      label: "Format",
      value: teamSizeLabel(event),
      detail: `${registrations.length} registered`,
    },
  ];

  return (
    <>
      {/* -------------------------------- hero -------------------------------- */}
      <section className="grain relative overflow-hidden bg-grape text-white">
        <HeroBackdrop />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All events
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                    state.chipClass
                  )}
                >
                  {state.status === "LIVE" ? (
                    <span className="size-2 animate-blink rounded-full bg-current" />
                  ) : null}
                  {state.label}
                </span>
                {club ? (
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
                  >
                    {club.logo ? (
                      <span className="relative size-4 overflow-hidden rounded-full">
                        <Image
                          src={club.logo}
                          alt=""
                          fill
                          sizes="16px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <Building2 className="size-3.5" />
                    )}
                    {club.name}
                  </Link>
                ) : null}
              </div>

              <h1 className="display max-w-full text-[clamp(2.65rem,12.5vw,4.5rem)] leading-[0.9] sm:text-7xl">
                <SplitText text={event.name} delay={80} stagger={22} />
              </h1>

              <Countdown
                target={event.startsAt}
                passedLabel={state.status === "ENDED" ? "That's a wrap" : "Live now!"}
              />

              {canManage ? (
                <Link href={`/events/${event.slug}/manage`}>
                  <Button variant="secondary" className="gap-2">
                    <ClipboardList className="size-4" />
                    Organiser tools
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <Tilt max={9}>
                <div className="brutal shine group relative h-56 overflow-hidden rounded-2xl bg-paper sm:h-72">
                  <Image
                    src={event.art || DEFAULT_ART}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                </div>
              </Tilt>
            </div>
          </div>
        </div>
      </section>

      <WaveEdge fill="var(--color-grape)" className="bg-background" />

      <main className="mx-auto w-full max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            {/* fact grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {facts.map(({ Icon, label, value, detail }) => (
                <Reveal key={label}>
                  <div className="brutal shine rounded-2xl bg-card p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <Icon className="size-4" />
                      {label}
                    </div>
                    <p className="mt-2 text-lg font-bold leading-tight">
                      {value}
                    </p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* about */}
            <Reveal className="space-y-4">
              <h2 className="display text-3xl sm:text-4xl">What&apos;s the deal</h2>
              <div className="brutal rounded-2xl bg-card p-6">
                <p className="whitespace-pre-line text-base leading-relaxed">
                  {event.description}
                </p>
              </div>
            </Reveal>

            {/* links & contacts */}
            {links.length || contacts.length ? (
              <section className="grid gap-6 sm:grid-cols-2">
                {links.length ? (
                  <div className="space-y-3">
                    <h3 className="display text-2xl">Resources</h3>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.id}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="brutal-sm flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{link.title}</span>
                              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {link.type}
                              </span>
                            </span>
                            <ExternalLink className="size-4 shrink-0" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {contacts.length ? (
                  <div className="space-y-3">
                    <h3 className="display text-2xl">Who to ask</h3>
                    <ul className="space-y-2">
                      {contacts.map((contact) => (
                        <li
                          key={contact.id}
                          className="brutal-sm flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-bold">
                              {contact.title}
                            </span>
                            <span className="block truncate text-muted-foreground">
                              {contact.value}
                            </span>
                          </span>
                          <Mail className="size-4 shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* who's coming */}
            {registrations.length ? (
              <section className="space-y-4">
                <h2 className="display text-3xl sm:text-4xl">
                  Who&apos;s coming ({registrations.length})
                </h2>
                <div className="brutal flex flex-wrap gap-3 rounded-2xl bg-card p-5">
                  {registrations.slice(0, 24).map((registration) => (
                    <div
                      key={registration.id}
                      className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper py-1 pl-1 pr-3"
                    >
                      <Avatar
                        name={registration.teamName ?? registration.userName ?? "?"}
                        size="sm"
                        className="border-2"
                      />
                      <span className="text-xs font-bold">
                        {registration.teamName ?? registration.userName}
                      </span>
                      {registration.mode === "TEAM" ? (
                        <Users className="size-3.5" />
                      ) : null}
                    </div>
                  ))}
                  {registrations.length > 24 ? (
                    <span className="self-center text-xs font-bold uppercase text-muted-foreground">
                      +{registrations.length - 24} more
                    </span>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          {/* sticky registration rail */}
          <div className="lg:col-span-4">
            <div
              id="register"
              className="space-y-6 scroll-mt-24 lg:sticky lg:top-28"
            >
              <RegisterPanel
                eventSlug={event.slug}
                minTeamSize={event.minTeamSize}
                maxTeamSize={event.maxTeamSize}
                registrationOpen={state.registrationOpen}
                closedReason={closedReason}
                isSignedIn={Boolean(user)}
                alreadyRegistered={alreadyRegistered}
                currentUserId={user?.id ?? null}
                students={students}
              />

              {club ? (
                <div className="brutal rounded-2xl bg-card p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Hosted by
                  </h3>
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="mt-3 flex items-center gap-3"
                  >
                    <Avatar name={club.name} image={club.logo} />
                    <span>
                      <span className="block font-bold">{club.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        View club profile
                      </span>
                    </span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Phone action bar — the primary action stays in reach on a long page */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        {alreadyRegistered ? (
          <Link href="/dashboard" className="block">
            <Button size="lg" variant="secondary" className="w-full gap-2">
              <CheckCircle2 className="size-4" />
              You&apos;re registered — view pass
            </Button>
          </Link>
        ) : !state.registrationOpen ? (
          <p className="flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Lock className="size-4" />
            {state.status === "ENDED" ? "Event finished" : "Entries closed"}
          </p>
        ) : user ? (
          <a href="#register" className="block">
            <Button size="lg" className="w-full">
              Grab your spot
            </Button>
          </a>
        ) : (
          <Link href={`/login?next=/events/${event.slug}`} className="block">
            <Button size="lg" className="w-full">
              Sign in to register
            </Button>
          </Link>
        )}
      </div>
    </>
  );
}
