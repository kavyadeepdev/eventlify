import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import type { ClubApiData, EventApiData } from "@/lib/types";
import {
  formatDateStamp,
  formatTime,
  getEventState,
  teamSizeLabel,
} from "@/lib/format";
import { DEFAULT_ART } from "./event-card";

interface HeroEventPassProps {
  event?: EventApiData;
  club?: ClubApiData;
}

export default function HeroEventPass({ event, club }: HeroEventPassProps) {
  if (!event) {
    return (
      <div className="event-pass event-pass--empty">
        <span className="event-pass__eyebrow">Your next BMSCE story</span>
        <p className="display text-6xl leading-[0.86] text-white sm:text-7xl">
          The line-up is loading.
        </p>
        <Link href="/events" className="event-pass__empty-link">
          Explore events <ArrowUpRight className="size-5" />
        </Link>
      </div>
    );
  }

  const stamp = formatDateStamp(event.startsAt);
  const state = getEventState(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="event-pass group"
      aria-label={`View featured event: ${event.name}`}
    >
      <div className="event-pass__topbar">
        <span className="flex items-center gap-2">
          <span className="event-pass__pulse" />
          BMSCE pick
        </span>
        <span>Pass 01 / 26</span>
      </div>

      <div className="event-pass__art">
        <Image
          src={event.art || DEFAULT_ART}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 38vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="event-pass__art-wash" />

        <div className="event-pass__date" aria-label={`${stamp.day} ${stamp.month}`}>
          <span>{stamp.day}</span>
          <span>{stamp.month}</span>
        </div>

        <span className="event-pass__status">{state.label}</span>
      </div>

      <div className="event-pass__body">
        <div className="event-pass__name-row">
          <div>
            <p className="event-pass__eyebrow">Next up · {club?.name ?? "BMSCE club"}</p>
            <h2 className="display mt-2 text-[2.3rem] leading-[0.88] text-white sm:text-5xl">
              {event.name}
            </h2>
          </div>
          <span className="event-pass__arrow">
            <ArrowUpRight className="size-6" />
          </span>
        </div>

        <div className="event-pass__facts">
          <div>
            <CalendarDays className="size-4" />
            <span>{formatTime(event.startsAt)}</span>
          </div>
          <div>
            <Users className="size-4" />
            <span>{teamSizeLabel(event)}</span>
          </div>
        </div>
      </div>

      <div className="event-pass__barcode" aria-hidden="true">
        <span />
        <small>EVNT · {event.slug.slice(0, 12).toUpperCase()}</small>
      </div>
    </Link>
  );
}
