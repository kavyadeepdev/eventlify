"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Users,
} from "lucide-react";
import { EventApiData, ClubApiData } from "@/lib/types";
import {
  accentFor,
  formatDateStamp,
  formatTime,
  getEventState,
  teamSizeLabel,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import Countdown from "./countdown";
import { DEFAULT_ART } from "./event-card";
import { cn } from "@/lib/utils";

interface EventCarouselProps {
  events: EventApiData[];
  clubsMap?: Record<string, ClubApiData>;
}

const ROTATION_MS = 7000;

export default function EventCarousel({
  events,
  clubsMap = {},
}: EventCarouselProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % events.length);
  }, [events.length]);

  const previous = useCallback(() => {
    setIndex((current) => (current - 1 + events.length) % events.length);
  }, [events.length]);

  // One timer drives both the ring and the slide change, so they stay in sync.
  useEffect(() => {
    if (!playing || events.length < 2) return;

    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed >= ROTATION_MS) {
        next();
        setProgress(0);
      } else {
        setProgress(elapsed / ROTATION_MS);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [playing, next, events.length, index]);

  if (!events.length) return null;

  const event = events[Math.min(index, events.length - 1)];
  const club = clubsMap[event.clubId];
  const accent = accentFor(index);
  const stamp = formatDateStamp(event.startsAt);
  const state = getEventState(event);

  return (
    <section className="brutal-lg relative overflow-hidden rounded-3xl bg-card">
      <div className={cn("relative border-b-[3px] border-ink", accent)}>
        {/* Ghost headline, the way a gig poster repeats its own name */}
        <span
          aria-hidden="true"
          className="display animate-float-slow pointer-events-none absolute -right-4 top-2 hidden select-none text-[8rem] leading-none opacity-15 lg:block"
        >
          {event.name.split(" ")[0]}
        </span>

        <div
          key={event.id}
          className="slide-enter relative grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
        >
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="sticker bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
                ★ Featured
              </span>
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
            </div>

            <h2 className="display text-4xl sm:text-6xl lg:text-7xl">
              {event.name}
            </h2>

            <p className="max-w-xl text-sm leading-relaxed sm:text-base">
              {event.description.length > 180
                ? `${event.description.slice(0, 180)}…`
                : event.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold uppercase text-ink">
                <Users className="size-3.5" />
                {teamSizeLabel(event)}
              </div>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold uppercase text-ink">
                {club ? (
                  club.logo ? (
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
                  )
                ) : (
                  <Building2 className="size-3.5" />
                )}
                {club?.name ?? "BMSCE club"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href={`/events/${event.slug}`}>
                <Button size="lg" className="gap-2">
                  {state.registrationOpen ? "Grab your spot" : "See details"}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline">
                  Browse all
                </Button>
              </Link>
            </div>
          </div>

          {/* Poster panel: art, big time stamp, live countdown */}
          <div className="lg:col-span-5">
            <div className="brutal shine overflow-hidden rounded-2xl bg-paper text-ink">
              <div className="relative h-48 w-full border-b-[3px] border-ink sm:h-56">
                <Image
                  src={event.art || DEFAULT_ART}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="scale-105 object-cover transition-transform duration-[6000ms] ease-out"
                />
              </div>

              <div className="space-y-3 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em]">
                  {stamp.day} {stamp.month}
                </p>
                <p className="display text-6xl leading-none">
                  {formatTime(event.startsAt)}
                </p>
                <Countdown
                  target={event.startsAt}
                  passedLabel="Under way!"
                  className="justify-center pt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 bg-card px-5 py-3">
        <div className="flex items-center gap-1.5">
          {events.slice(0, 8).map((item, dot) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dot)}
              aria-label={`Show ${item.name}`}
              aria-current={dot === index}
              className={cn(
                "h-3 rounded-full border-2 border-ink transition-all",
                dot === index ? "w-9 bg-ink" : "w-3 bg-paper hover:bg-zest"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="relative inline-flex">
            {/* Conic ring shows how long until the next slide. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 rounded-full"
              style={{
                background: `conic-gradient(var(--color-grape) ${(playing ? progress : 0) * 360}deg, transparent 0deg)`,
                opacity: playing ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
              className="relative"
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={previous}
            aria-label="Previous event"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={next}
            aria-label="Next event"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
