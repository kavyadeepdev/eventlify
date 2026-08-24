import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import type { ClubApiData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  club: ClubApiData;
  index?: number;
  eventCount?: number;
}

const CLUB_TONES = [
  "club-card--violet",
  "club-card--orange",
  "club-card--acid",
  "club-card--aqua",
] as const;

export default function ClubCard({ club, index = 0, eventCount }: ClubCardProps) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className={cn("club-card group", CLUB_TONES[index % CLUB_TONES.length])}
    >
      <div className="club-card__top">
        <span className="club-card__number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="club-card__logo">
          {club.logo ? (
            <Image
              src={club.logo}
              alt=""
              fill
              sizes="72px"
              className="object-cover"
            />
          ) : (
            <Building2 className="size-7" />
          )}
        </span>
      </div>

      <div className="club-card__body">
        <span className="club-card__eyebrow">Student-led · BMSCE-wide</span>
        <h3 className="display mt-3 text-3xl leading-none">{club.name}</h3>
        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-ink/62">
          {club.description}
        </p>

        <div className="club-card__footer">
          <span>
            {eventCount === undefined
              ? "BMSCE partner"
              : `${eventCount} event${eventCount === 1 ? "" : "s"}`}
          </span>
          <span className="club-card__arrow">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
