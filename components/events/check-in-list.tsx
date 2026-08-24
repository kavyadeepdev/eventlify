"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Search, UserRound, Users } from "lucide-react";
import { checkInAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import Avatar from "@/components/shared/avatar";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CheckInPerson {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  attended: boolean;
}

export interface CheckInEntry {
  id: string;
  mode: "SOLO" | "TEAM";
  teamId: string | null;
  title: string;
  registeredAt: string;
  people: CheckInPerson[];
}

interface CheckInListProps {
  eventSlug: string;
  entries: CheckInEntry[];
}

/** Door list: search the roster and check people (or whole teams) in. */
export default function CheckInList({ eventSlug, entries }: CheckInListProps) {
  const [state, submit] = useActionState(checkInAction, idleState);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) ||
        entry.people.some(
          (person) =>
            person.name.toLowerCase().includes(term) ||
            person.email.toLowerCase().includes(term)
        )
    );
  }, [entries, search]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the door list…"
          aria-label="Search registrations"
          className="pl-11"
        />
      </div>

      <FormMessage state={state} />

      {filtered.length ? (
        <ul className="space-y-4">
          {filtered.map((entry) => {
            const allIn =
              entry.people.length > 0 &&
              entry.people.every((person) => person.attended);

            return (
              <li
                key={entry.id}
                className={cn(
                  "brutal rounded-2xl p-5",
                  allIn ? "bg-limepop" : "bg-card"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.mode === "TEAM" ? (
                        <Users className="size-4" />
                      ) : (
                        <UserRound className="size-4" />
                      )}
                      <h3 className="truncate text-lg font-bold">
                        {entry.title}
                      </h3>
                      {allIn ? (
                        <CheckCircle2 className="size-5 shrink-0" />
                      ) : null}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {entry.mode === "TEAM"
                        ? `${entry.people.length} member${entry.people.length === 1 ? "" : "s"}`
                        : "Solo entry"}
                    </p>
                  </div>

                  {/* Team check-in marks every member at once. */}
                  {entry.mode === "TEAM" && entry.teamId && !allIn ? (
                    <form action={submit}>
                      <input type="hidden" name="eventSlug" value={eventSlug} />
                      <input type="hidden" name="teamId" value={entry.teamId} />
                      <SubmitButton size="sm" pendingLabel="Checking in…">
                        Check in team
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>

                <ul className="mt-4 space-y-2">
                  {entry.people.map((person) => (
                    <li
                      key={person.userId}
                      className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-3 py-2"
                    >
                      <Avatar
                        name={person.name}
                        image={person.image}
                        size="sm"
                        className="border-2"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {person.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {person.email}
                        </span>
                      </span>

                      {person.attended ? (
                        <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-limepop px-3 py-1 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="size-3.5" />
                          In
                        </span>
                      ) : (
                        <form action={submit}>
                          <input
                            type="hidden"
                            name="eventSlug"
                            value={eventSlug}
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={person.userId}
                          />
                          <SubmitButton
                            size="xs"
                            variant="outline"
                            pendingLabel="…"
                          >
                            Check in
                          </SubmitButton>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="brutal rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
          Nobody matches that search.
        </p>
      )}
    </div>
  );
}
