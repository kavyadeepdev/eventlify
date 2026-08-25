import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CalendarCheck, Ticket } from "lucide-react";
import { getUserBySlug, getUserHistory } from "@/lib/db-queries";
import { getSessionUser } from "@/lib/session";
import { formatDateTime, hasPassed } from "@/lib/format";
import PassCard from "@/components/dashboard/pass-card";
import ProfileForm from "@/components/dashboard/profile-form";
import DigitalPass from "@/components/dashboard/digital-pass";
import Avatar from "@/components/shared/avatar";
import EmptyState from "@/components/shared/empty-state";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import CountUp from "@/components/shared/count-up";
import SplitText from "@/components/shared/split-text";
import HeroBackdrop from "@/components/shared/hero-backdrop";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My pass",
  description: "Your registrations, check-ins and profile.",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  // Signing in is the only entry point, so anyone without a USN still needs
  // their pass issued before the portal makes sense.
  if (!user.usn) redirect("/onboarding");

  const [history, profile] = await Promise.all([
    getUserHistory(user.slug),
    getUserBySlug(user.slug),
  ]);

  const registrations = history?.registrations ?? [];
  const attendances = history?.attendances ?? [];
  const attendedEventIds = new Set(attendances.map((entry) => entry.eventId));

  const upcoming = registrations.filter((entry) => !hasPassed(entry.endsAt));
  const past = registrations.filter((entry) => hasPassed(entry.endsAt));

  const stats = [
    { value: registrations.length, label: "Registrations", tone: "bg-zest" },
    { value: upcoming.length, label: "Coming up", tone: "bg-aqua" },
    { value: attendances.length, label: "Checked in", tone: "bg-limepop" },
  ];

  return (
    <>
      <section className="grain relative overflow-hidden bg-grape text-white">
        <HeroBackdrop />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Avatar
              name={user.name}
              image={user.image}
              size="lg"
              className="shadow-[4px_4px_0_var(--color-ink)]"
            />
            <div>
              <span className="sticker inline-block bg-zest px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
                My pass
              </span>
              <h1 className="display mt-3 text-[2.9rem] leading-none sm:text-7xl">
                <SplitText text={user.name} delay={80} stagger={26} />
              </h1>
              <p className="mt-2 break-words text-sm text-white/80">
                {profile?.usn ? `${profile.usn} · ` : ""}
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {stats.map((stat) => (
              <Reveal key={stat.label}>
                <Tilt max={9}>
                  <div
                    className={`brutal shine flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-ink sm:block sm:px-5 sm:py-4 ${stat.tone}`}
                  >
                    <p className="display text-4xl leading-none sm:text-5xl">
                      <CountUp value={stat.value} />
                    </p>
                    <p className="text-right text-[11px] font-bold uppercase tracking-widest sm:mt-1 sm:text-left">
                      {stat.label}
                    </p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WaveEdge fill="var(--color-grape)" className="bg-background" />

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <Ticket className="size-5" />
                <h2 className="display text-3xl sm:text-4xl">Your passes</h2>
              </div>

              {upcoming.length ? (
                <div className="space-y-4">
                  {upcoming.map((registration, index) => (
                    <Reveal key={registration.registrationId}>
                      <PassCard
                        registration={registration}
                        index={index}
                        attended={attendedEventIds.has(registration.eventId)}
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No registrations yet"
                  description="Register for an event and your pass will appear here."
                  actionLabel="Browse events"
                  actionHref="/events"
                />
              )}
            </section>

            {past.length ? (
              <section className="space-y-5">
                <h2 className="display text-3xl sm:text-4xl">Been there</h2>
                <div className="space-y-4">
                  {past.map((registration, index) => (
                    <Reveal key={registration.registrationId}>
                      <PassCard
                        registration={registration}
                        index={index + 2}
                        attended={attendedEventIds.has(registration.eventId)}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <DigitalPass
              name={profile?.name ?? user.name}
              usn={profile?.usn ?? user.usn ?? ""}
              image={profile?.image ?? user.image}
              issuedOn={
                profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : undefined
              }
            />

            <ProfileForm
              name={profile?.name ?? user.name}
              usn={profile?.usn ?? user.usn}
              email={user.email}
              image={profile?.image ?? user.image}
            />

            <div className="brutal rounded-2xl bg-card p-6">
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-5" />
                <h3 className="display text-2xl">Check-in log</h3>
              </div>

              {attendances.length ? (
                <ul className="mt-4 space-y-3">
                  {attendances.slice(0, 8).map((entry) => (
                    <li
                      key={`${entry.eventId}-${entry.checkedInAt}`}
                      className="rounded-xl border-2 border-ink bg-paper px-3 py-2"
                    >
                      <Link
                        href={`/events/${entry.eventSlug}`}
                        className="block truncate text-sm font-bold hover:underline"
                      >
                        {entry.eventName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(entry.checkedInAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No check-ins recorded yet.
                </p>
              )}
            </div>

            <div className="brutal rounded-2xl bg-ink p-6 text-paper">
              <h3 className="display text-2xl">What&apos;s next</h3>
              <p className="mt-2 text-sm text-paper/75">
                New events are added throughout the semester. Check what&apos;s
                open before the registration deadlines close.
              </p>
              <Link href="/events?status=open" className="mt-4 inline-block">
                <Button variant="secondary" size="sm">
                  Browse open events
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
