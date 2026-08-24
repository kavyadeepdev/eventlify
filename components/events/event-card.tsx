import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Users } from "lucide-react";
import type { ClubApiData, EventApiData } from "@/lib/types";
import {
  formatDateStamp,
  formatTime,
  getEventState,
  teamSizeLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const DEFAULT_ART =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop";

interface EventCardProps {
  event: EventApiData;
  club?: ClubApiData;
  index?: number;
  featured?: boolean;
}

const CARD_TONES = [
  "event-card--violet",
  "event-card--acid",
  "event-card--orange",
  "event-card--aqua",
] as const;

export default function EventCard({
  event,
  club,
  index = 0,
  featured = false,
}: EventCardProps) {
  const stamp = formatDateStamp(event.startsAt);
  const state = getEventState(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "event-card group",
        CARD_TONES[index % CARD_TONES.length],
        featured && "event-card--featured"
      )}
    >
      <div className="event-card__art">
        <Image
          src={event.art || DEFAULT_ART}
          alt=""
          fill
          priority={featured}
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 58vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="event-card__wash" />
        <div className="event-card__status">
          {state.status === "LIVE" ? <span className="event-card__live-dot" /> : null}
          {state.label}
        </div>
        <div className="event-card__date">
          <strong className="display">{stamp.day}</strong>
          <span>{stamp.month}</span>
        </div>
      </div>

      <div className="event-card__content">
        <div className="event-card__meta">
          <span>{club?.name ?? "BMSCE club"}</span>
          <span className="event-card__index">#{String(index + 1).padStart(2, "0")}</span>
        </div>

        <h3 className="display event-card__title">{event.name}</h3>

        <p className="event-card__description">{event.description}</p>

        <div className="event-card__footer">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><Clock3 className="size-3.5" />{formatTime(event.startsAt)}</span>
            <span><Users className="size-3.5" />{teamSizeLabel(event)}</span>
          </div>
          <span className="event-card__arrow">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
