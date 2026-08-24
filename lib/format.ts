import { EventApiData } from "./types";

/* ------------------------------- date helpers ------------------------------- */

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateLong(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value: string | Date): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

/** "08 SEP" — the big date stamp used on cards. */
export function formatDateStamp(value: string | Date): {
  day: string;
  month: string;
} {
  const date = new Date(value);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
  };
}

/** Coarse relative phrasing: "in 3 days", "2 hours ago". */
export function formatRelative(value: string | Date): string {
  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms) {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

/* ------------------------------- event status ------------------------------- */

export type EventStatus = "LIVE" | "UPCOMING" | "CLOSED" | "ENDED";

export interface EventState {
  status: EventStatus;
  label: string;
  /** Tailwind classes for the status chip. */
  chipClass: string;
  registrationOpen: boolean;
}

/**
 * Derives display state from the event's timestamps. Registration mirrors the
 * backend rule in `POST /api/events/[slug]/register`: open until the deadline.
 */
export function getEventState(event: EventApiData, now: Date = new Date()): EventState {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const deadline = new Date(event.registrationDeadline);

  if (now >= end) {
    return {
      status: "ENDED",
      label: "Wrapped",
      chipClass: "bg-muted text-muted-foreground",
      registrationOpen: false,
    };
  }

  if (now >= start) {
    return {
      status: "LIVE",
      label: "Happening now",
      chipClass: "bg-flame text-white",
      registrationOpen: false,
    };
  }

  if (now > deadline) {
    return {
      status: "CLOSED",
      label: "Entries closed",
      chipClass: "bg-ink text-paper",
      registrationOpen: false,
    };
  }

  return {
    status: "UPCOMING",
    label: "Registrations open",
    chipClass: "bg-limepop text-ink",
    registrationOpen: true,
  };
}

export function isTeamEvent(event: EventApiData): boolean {
  return event.maxTeamSize > 1;
}

export function teamSizeLabel(event: EventApiData): string {
  if (!isTeamEvent(event)) return "Solo entry";
  if (event.minTeamSize === event.maxTeamSize) {
    return `Teams of ${event.maxTeamSize}`;
  }
  return `Teams of ${event.minTeamSize}–${event.maxTeamSize}`;
}

/* --------------------------------- palette ---------------------------------- */

/** Rotating block colours so a grid never looks monotonous. */
export const ACCENTS = [
  "bg-grape text-white",
  "bg-zest text-ink",
  "bg-punch text-white",
  "bg-limepop text-ink",
  "bg-aqua text-ink",
  "bg-flame text-white",
] as const;

export function accentFor(seed: string | number): string {
  const index =
    typeof seed === "number"
      ? seed
      : [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ACCENTS[Math.abs(index) % ACCENTS.length];
}

/** Deterministic slight rotation, for the hand-stuck sticker feel. */
export function tiltFor(seed: number): string {
  const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
  return tilts[Math.abs(seed) % tilts.length];
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Lowercase, hyphenated slug used for club/event URLs. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** True when the given timestamp is in the past. */
export function hasPassed(value: string | Date): boolean {
  return new Date(value).getTime() < Date.now();
}
