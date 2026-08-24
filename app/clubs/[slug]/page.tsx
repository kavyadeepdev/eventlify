import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Building2, ExternalLink, Mail, Plus } from "lucide-react";
import {
  fetchClubBySlug,
  fetchEventsByClubSlug,
  fetchUsers,
} from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import { getEventState } from "@/lib/format";
import EventCard from "@/components/events/event-card";
import MemberManager from "@/components/clubs/member-manager";
import Avatar from "@/components/shared/avatar";
import EmptyState from "@/components/shared/empty-state";
import WaveEdge from "@/components/shared/wave-edge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchClubBySlug(slug);
  if (!data?.club) return { title: "Club not found" };

  return {
    title: data.club.name,
    description: data.club.description.slice(0, 160),
  };
}

export default async function ClubDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [data, events, user] = await Promise.all([
    fetchClubBySlug(slug),
    fetchEventsByClubSlug(slug),
    getSessionUser(),
  ]);

  if (!data?.club) notFound();

  const { club, members, contacts, links } = data;

  const isAdmin = Boolean(
    user &&
      members.some(
        (member) => member.userId === user.id && member.role === "ADMIN"
      )
  );

  const students = isAdmin ? await fetchUsers() : [];

  const upcoming = events.filter((event) => {
    const status = getEventState(event).status;
    return status === "UPCOMING" || status === "LIVE";
  });
  const past = events.filter((event) => !upcoming.includes(event));

  return (
    <>
      <section className="relative overflow-hidden bg-aqua">
        <div aria-hidden="true" className="halftone absolute inset-0 opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="size-4" />
            All clubs
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink bg-paper shadow-[5px_5px_0_var(--color-ink)]">
              {club.logo ? (
                <div className="relative size-full">
                  <Image
                    src={club.logo}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <Building2 className="size-12" />
              )}
            </div>

            <div className="space-y-3">
              <h1 className="display text-[2.9rem] leading-[0.95] sm:text-7xl">
                {club.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                  {members.length} member{members.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                  {events.length} event{events.length === 1 ? "" : "s"}
                </span>
                {isAdmin ? (
                  <span className="rounded-full border-2 border-ink bg-grape px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    You&apos;re an admin
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveEdge fill="var(--color-aqua)" className="bg-background" />

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section className="space-y-4">
              <h2 className="display text-3xl sm:text-4xl">About</h2>
              <div className="brutal rounded-2xl bg-card p-6">
                <p className="whitespace-pre-line leading-relaxed">
                  {club.description}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="display text-3xl sm:text-4xl">
                  Upcoming events
                </h2>
                {isAdmin ? (
                  <Link href="/events/new">
                    <Button size="sm" variant="secondary" className="gap-1.5">
                      <Plus className="size-4" />
                      New event
                    </Button>
                  </Link>
                ) : null}
              </div>

              {upcoming.length ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {upcoming.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      club={club}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing scheduled"
                  description={`${club.name} has no upcoming events listed.`}
                />
              )}
            </section>

            {past.length ? (
              <section className="space-y-4">
                <h2 className="display text-3xl sm:text-4xl">Past events</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {past.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      club={club}
                      index={index + 3}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {isAdmin ? (
              <section className="space-y-4">
                <h2 className="display text-3xl sm:text-4xl">Admin</h2>
                <MemberManager
                  clubSlug={club.slug}
                  members={members}
                  students={students}
                />
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="brutal rounded-2xl bg-card p-6">
              <h3 className="display text-2xl">Members</h3>
              {members.length ? (
                <ul className="mt-4 space-y-3">
                  {members.map((member) => (
                    <li key={member.userId} className="flex items-center gap-3">
                      <Avatar name={member.name} image={member.image} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {member.name}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-bold uppercase",
                          member.role === "ADMIN"
                            ? "bg-grape text-white"
                            : "bg-zest"
                        )}
                      >
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No members listed yet.
                </p>
              )}
            </div>

            {links.length ? (
              <div className="brutal rounded-2xl bg-card p-6">
                <h3 className="display text-2xl">Links</h3>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
                      >
                        <span className="truncate">{link.title}</span>
                        <ExternalLink className="size-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {contacts.length ? (
              <div className="brutal rounded-2xl bg-card p-6">
                <h3 className="display text-2xl">Contact</h3>
                <ul className="mt-4 space-y-2">
                  {contacts.map((contact) => (
                    <li
                      key={contact.id}
                      className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
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
          </aside>
        </div>
      </main>
    </>
  );
}
