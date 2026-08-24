"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Plus, UserRound, Users, X } from "lucide-react";
import { registerSoloAction, registerTeamAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { UserApiData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Avatar from "@/components/shared/avatar";
import Confetti from "@/components/shared/confetti";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import { cn } from "@/lib/utils";

interface RegisterPanelProps {
  eventSlug: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationOpen: boolean;
  closedReason: string;
  isSignedIn: boolean;
  alreadyRegistered: boolean;
  currentUserId: string | null;
  /** Directory used to pick teammates. */
  students: UserApiData[];
}

export default function RegisterPanel({
  eventSlug,
  minTeamSize,
  maxTeamSize,
  registrationOpen,
  closedReason,
  isSignedIn,
  alreadyRegistered,
  currentUserId,
  students,
}: RegisterPanelProps) {
  const soloAllowed = minTeamSize <= 1;
  const teamAllowed = maxTeamSize > 1;

  const [mode, setMode] = useState<"SOLO" | "TEAM">(
    soloAllowed ? "SOLO" : "TEAM"
  );
  const [soloState, soloSubmit] = useActionState(registerSoloAction, idleState);
  const [teamState, teamSubmit] = useActionState(registerTeamAction, idleState);

  const [search, setSearch] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<UserApiData[]>([]);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return students
      .filter(
        (student) =>
          student.id !== currentUserId &&
          !teammates.some((mate) => mate.id === student.id) &&
          (student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            (student.usn ?? "").toLowerCase().includes(term))
      )
      .slice(0, 6);
  }, [search, students, teammates, currentUserId]);

  const teamSize = teammates.length + 1;

  /* ------------------------------ closed states ----------------------------- */

  const justRegistered = soloState.ok || teamState.ok;

  if (alreadyRegistered || justRegistered) {
    return (
      <aside className="brutal relative overflow-visible rounded-2xl bg-limepop p-5 sm:p-6">
        <Confetti fire={justRegistered} />
        <CheckCircle2 className="size-8 animate-[pop-in_0.5s_var(--ease-spring)]" />
        <h2 className="display mt-3 text-3xl">You&apos;re on the list</h2>
        <p className="mt-2 text-sm">
          Your spot is locked in. Find the details and your other passes on your
          dashboard.
        </p>
        <Link href="/dashboard" className="mt-5 inline-block">
          <Button variant="outline">View my pass</Button>
        </Link>
      </aside>
    );
  }

  if (!registrationOpen) {
    return (
      <aside className="brutal rounded-2xl bg-card p-5 sm:p-6">
        <Lock className="size-8" />
        <h2 className="display mt-3 text-3xl">Entries closed</h2>
        <p className="mt-2 text-sm text-muted-foreground">{closedReason}</p>
        <Link href="/events" className="mt-5 inline-block">
          <Button variant="outline">Find another event</Button>
        </Link>
      </aside>
    );
  }

  if (!isSignedIn) {
    return (
      <aside className="brutal rounded-2xl bg-grape p-5 text-white sm:p-6">
        <h2 className="display text-3xl">Ready to join?</h2>
        <p className="mt-2 text-sm text-white/85">
          Sign in with your BMSCE Google account to grab a spot.
        </p>
        <Link href="/login" className="mt-5 inline-block">
          <Button variant="secondary">Sign in to register</Button>
        </Link>
      </aside>
    );
  }

  /* -------------------------------- open form ------------------------------- */

  return (
    <aside className="brutal space-y-5 rounded-2xl bg-card p-5 sm:p-6">
      <div>
        <span className="sticker inline-block bg-limepop px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
          Entries open
        </span>
        <h2 className="display mt-3 text-3xl">Grab your spot</h2>
      </div>

      {soloAllowed && teamAllowed ? (
        <div className="grid grid-cols-2 gap-2">
          {(["SOLO", "TEAM"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-[3px] border-ink px-3 py-3 text-xs font-bold uppercase transition-all",
                mode === option
                  ? "bg-ink text-paper shadow-[3px_3px_0_var(--color-grape)]"
                  : "bg-paper hover:bg-zest"
              )}
            >
              {option === "SOLO" ? (
                <UserRound className="size-4" />
              ) : (
                <Users className="size-4" />
              )}
              {option === "SOLO" ? "Solo" : "Team"}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "SOLO" && soloAllowed ? (
        <form action={soloSubmit} className="space-y-4">
          <input type="hidden" name="eventSlug" value={eventSlug} />
          <p className="text-sm text-muted-foreground">
            One click and you&apos;re registered under your own name.
          </p>
          <FormMessage state={soloState} />
          <SubmitButton
            size="lg"
            className="w-full"
            pendingLabel="Signing you up…"
          >
            Register solo
          </SubmitButton>
        </form>
      ) : null}

      {mode === "TEAM" && teamAllowed ? (
        <form action={teamSubmit} className="space-y-4">
          <input type="hidden" name="eventSlug" value={eventSlug} />
          <input type="hidden" name="minTeamSize" value={minTeamSize} />
          <input type="hidden" name="maxTeamSize" value={maxTeamSize} />

          <div className="space-y-1.5">
            <label
              htmlFor="teamName"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Team name
            </label>
            <Input
              id="teamName"
              name="teamName"
              required
              maxLength={100}
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="The Null Pointers"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="teammate-search"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Add teammates
            </label>
            <Input
              id="teammate-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or USN"
              autoComplete="off"
            />

            {candidates.length ? (
              <ul className="mt-2 divide-y-2 divide-dashed divide-ink/20 rounded-xl border-2 border-ink bg-paper">
                {candidates.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTeammates((current) => [...current, student]);
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zest"
                    >
                      <Avatar
                        name={student.name}
                        image={student.image}
                        size="sm"
                        className="border-2"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {student.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {student.usn || student.email}
                        </span>
                      </span>
                      <Plus className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Selected roster */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-3 py-1 text-xs font-bold text-paper">
                You (captain)
              </span>
              {teammates.map((mate) => (
                <span
                  key={mate.id}
                  className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-zest px-3 py-1 text-xs font-bold"
                >
                  <input type="hidden" name="memberIds" value={mate.id} />
                  {mate.name}
                  <button
                    type="button"
                    onClick={() =>
                      setTeammates((current) =>
                        current.filter((item) => item.id !== mate.id)
                      )
                    }
                    aria-label={`Remove ${mate.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <p
              className={cn(
                "text-xs font-bold uppercase tracking-wide",
                teamSize < minTeamSize || teamSize > maxTeamSize
                  ? "text-flame"
                  : "text-muted-foreground"
              )}
            >
              {teamSize} of {minTeamSize}–{maxTeamSize} members
            </p>
          </div>

          <FormMessage state={teamState} />

          <SubmitButton
            size="lg"
            className="w-full"
            pendingLabel="Building your team…"
          >
            Register team
          </SubmitButton>
        </form>
      ) : null}
    </aside>
  );
}
