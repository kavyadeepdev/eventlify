import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { HistoryRegistrationApiData } from "@/lib/types";
import { accentFor, formatDateStamp, formatTime } from "@/lib/format";
import { DEFAULT_ART } from "@/components/events/event-card";
import { cn } from "@/lib/utils";

interface PassCardProps {
  registration: HistoryRegistrationApiData;
  index?: number;
  attended?: boolean;
}

/** A registration rendered as a tear-off ticket stub. */
export default function PassCard({
  registration,
  index = 0,
  attended = false,
}: PassCardProps) {
  const stamp = formatDateStamp(registration.startsAt);
  const accent = accentFor(index + 1);

  return (
    <Link
      href={`/events/${registration.eventSlug}`}
      className="brutal brutal-hover group flex overflow-hidden rounded-2xl bg-card"
    >
      {/* Stub */}
      <div
        className={cn(
          "flex w-24 shrink-0 flex-col items-center justify-center gap-1 border-r-[3px] border-dashed border-ink px-2 py-5",
          accent
        )}
      >
        <span className="display text-3xl leading-none">{stamp.day}</span>
        <span className="text-[10px] font-bold tracking-widest">
          {stamp.month}
        </span>
        <span className="text-[10px] font-bold">
          {formatTime(registration.startsAt)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
        <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-xl border-2 border-ink sm:block">
          <Image
            src={registration.art || DEFAULT_ART}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold leading-tight">
            {registration.eventName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-[10px] font-bold uppercase">
              {registration.mode === "TEAM" ? (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {registration.teamName ?? "Team"}
                </span>
              ) : (
                "Solo"
              )}
            </span>
            {attended ? (
              <span className="rounded-full border-2 border-ink bg-limepop px-2.5 py-0.5 text-[10px] font-bold uppercase">
                Attended
              </span>
            ) : null}
          </div>
        </div>

        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-ink text-paper transition-transform group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
