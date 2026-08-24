import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Search,
  Sparkles,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { fetchClubs, fetchEvents } from "@/lib/api-client";
import { getEventState } from "@/lib/format";
import type { ClubApiData } from "@/lib/types";
import EventCard from "@/components/events/event-card";
import HeroEventPass from "@/components/events/hero-event-pass";
import ClubCard from "@/components/clubs/club-card";
import Marquee from "@/components/shared/marquee";
import Reveal from "@/components/shared/reveal";
import SectionHeading from "@/components/shared/section-heading";
import EmptyState from "@/components/shared/empty-state";
import KineticHero from "@/components/shared/kinetic-hero";
import MomentumRail from "@/components/shared/momentum-rail";
import SplitText from "@/components/shared/split-text";
import Tilt from "@/components/shared/tilt";
import { Button } from "@/components/ui/button";

const steps = [
  {
    Icon: Search,
    number: "01",
    title: "Find your thing",
    copy: "Browse workshops, hackathons, club meets and competitions in one feed.",
  },
  {
    Icon: UsersRound,
    number: "02",
    title: "Bring the crew",
    copy: "Go solo or build a team without chasing sign-up sheets and group chats.",
  },
  {
    Icon: TicketCheck,
    number: "03",
    title: "Show up ready",
    copy: "Keep every registration and attendance check inside your personal pass.",
  },
];

export default async function HomePage() {
  const [events, clubs] = await Promise.all([fetchEvents(), fetchClubs()]);

  const clubsMap = clubs.reduce<Record<string, ClubApiData>>((map, club) => {
    map[club.id] = club;
    return map;
  }, {});

  const live = events.filter((event) => getEventState(event).status === "LIVE");
  const upcoming = events.filter(
    (event) => getEventState(event).status === "UPCOMING"
  );
  const openNow = [...live, ...upcoming];
  const featured = (openNow.length ? openNow : events).slice(0, 5);
  const heroEvent = featured[0];

  const eventCountByClub = events.reduce<Record<string, number>>((map, event) => {
    map[event.clubId] = (map[event.clubId] ?? 0) + 1;
    return map;
  }, {});

  const stats = [
    { value: events.length, label: "Events on the board" },
    { value: openNow.length, label: "Taking registrations" },
    { value: clubs.length, label: "Clubs making it happen" },
  ];

  return (
    <>
      <KineticHero>
        <div className="home-hero__ghost" aria-hidden="true">
          EVENT
        </div>
        <div className="home-hero__grid" aria-hidden="true" />
        <div className="home-hero__glow" aria-hidden="true" />
        <span className="home-hero__spark home-hero__spark--one" aria-hidden="true">✦</span>
        <span className="home-hero__spark home-hero__spark--two" aria-hidden="true">✦</span>

        <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-20">
          <div className="home-hero__kicker hero-enter hero-enter--kicker">
            <span>BMSCE culture, live</span>
            <span className="hidden sm:inline">Discover · Register · Show up</span>
            <span>2026</span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.08fr_0.72fr] lg:gap-16">
            <div className="relative z-10">
              <div className="hero-enter hero-enter--sticker inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-ink bg-limepop px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-ink shadow-[3px_3px_0_var(--color-ink)]">
                <Sparkles className="size-3.5" />
                BMSCE is calling
              </div>

              <h1 className="display mt-7 max-w-4xl text-[4rem] leading-[0.86] text-white sm:text-[6.15rem] lg:text-[7rem] xl:text-[8.3rem] 2xl:text-[9rem]">
                <SplitText text="BMSCE" delay={120} stagger={42} />
                <br />
                <SplitText
                  text="has plans."
                  delay={620}
                  stagger={48}
                  className="home-hero__headline-accent"
                />
              </h1>

              <p className="hero-enter hero-enter--copy mt-7 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
                One bold, beautifully organised home for every hackathon,
                workshop, competition and club night happening at BMSCE.
              </p>

              <div className="hero-enter hero-enter--actions mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <Link href="/events" className="block">
                  <Button size="lg" variant="secondary" className="w-full gap-2 bg-limepop sm:w-auto">
                    Explore the line-up
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white bg-white/10 text-white shadow-[4px_4px_0_rgba(255,255,255,0.35)] hover:bg-white hover:text-ink sm:w-auto"
                  >
                    Open my pass
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hero-enter hero-enter--pass relative mx-auto w-full max-w-[500px] lg:mx-0 lg:justify-self-end">
              <span className="home-hero__orbit home-hero__orbit--one" aria-hidden="true">
                THIS WEEK
              </span>
              <span className="home-hero__orbit home-hero__orbit--two" aria-hidden="true">
                ★
              </span>
              <Tilt max={5} lift={-9} className="hero-pass-tilt">
                <HeroEventPass
                  event={heroEvent}
                  club={heroEvent ? clubsMap[heroEvent.clubId] : undefined}
                />
              </Tilt>
            </div>
          </div>

          <div className="home-hero__stats hero-enter hero-enter--stats">
            {stats.map((stat, index) => (
              <div key={stat.label}>
                <span className="home-hero__stat-index">0{index + 1}</span>
                <strong className="display">{String(stat.value).padStart(2, "0")}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </KineticHero>

      <Marquee
        items={[
          "HACKATHONS",
          "WORKSHOPS",
          "CLUB NIGHTS",
          "DESIGN SPRINTS",
          "COMPETITIONS",
          "TECH TALKS",
        ]}
      />

      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Now booking"
              title="Make a plan"
              description="Fresh BMSCE drops, hand-picked from the clubs running the show."
              href="/events"
              linkLabel="See full line-up"
            />
          </Reveal>

          {featured.length ? (
            <Reveal shift={26}>
              <MomentumRail className="mt-10">
                {featured.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    club={clubsMap[event.clubId]}
                    index={index}
                    featured={index === 0}
                  />
                ))}
              </MomentumRail>
            </Reveal>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="The board is quiet"
                description="No BMSCE events have been published yet. Check back shortly."
              />
            </div>
          )}
        </section>

        <section className="how-it-works">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <span className="section-label section-label--dark">Zero chaos</span>
                <h2 className="display mt-5 text-5xl leading-[0.88] text-white sm:text-7xl">
                  From “what&apos;s on?” to checked in.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-white/65 lg:justify-self-end">
                AfterClass turns the messy part of BMSCE life into a simple
                three-step flow, so the fun bit gets more of your attention.
              </p>
            </div>

            <Reveal shift={22}>
              <div className="mt-12 grid overflow-hidden rounded-[2rem] border-2 border-white/20 md:grid-cols-3">
                {steps.map(({ Icon, number, title, copy }) => (
                  <div key={number} className="how-it-works__step">
                    <div className="flex items-center justify-between">
                      <span className="display text-5xl text-limepop">{number}</span>
                      <Icon className="how-it-works__icon size-6 text-white/70" />
                    </div>
                    <h3 className="mt-12 text-xl font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{copy}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="club-showcase">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Meet the makers"
                title="Find your people"
                description="Student-led communities turning ideas into rooms full of people."
                href="/clubs"
                linkLabel="Meet every club"
              />
            </Reveal>

            {clubs.length ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {clubs.slice(0, 4).map((club, index) => (
                  <Reveal key={club.id} delay={index * 90}>
                    <ClubCard
                      club={club}
                      index={index}
                      eventCount={eventCountByClub[club.id] ?? 0}
                    />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal>
            <div className="final-cta">
              <div className="final-cta__mark" aria-hidden="true">★</div>
              <div className="relative z-10 max-w-3xl">
                <span className="section-label">Your semester, sorted</span>
                <h2 className="display mt-6 text-5xl leading-[0.88] sm:text-7xl lg:text-8xl">
                  Don&apos;t hear about it after it happened.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/65">
                  Sign in once, save your spot, and keep the whole semester in
                  one brilliantly organised pass.
                </p>
                <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                  <Link href="/events" className="block">
                    <Button size="lg" className="w-full gap-2 sm:w-auto">
                      <CalendarCheck2 className="size-4" />
                      Find an event
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">Sign in</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
