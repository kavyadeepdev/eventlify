"use client";

import { useActionState, useState } from "react";
import { createEventAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { ClubApiData } from "@/lib/types";
import { slugify } from "@/lib/format";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";

interface EventFormProps {
  clubs: ClubApiData[];
}

const labelClass = "text-xs font-bold uppercase tracking-wide";
const fieldClass =
  "h-12 w-full rounded-xl border-[3px] border-ink bg-card px-4 text-base font-medium outline-none focus-visible:shadow-[4px_4px_0_var(--color-grape)]";

export default function EventForm({ clubs }: EventFormProps) {
  const [state, submit] = useActionState(createEventAction, idleState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={submit} className="space-y-8">
      {/* ------------------------------- basics ------------------------------ */}
      <section className="brutal space-y-5 rounded-2xl bg-card p-6">
        <h2 className="display text-2xl">1 · The basics</h2>

        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Event name
          </label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Midnight Hack Jam"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className={labelClass}>
            URL slug
          </label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder="midnight-hack-jam"
            pattern="[a-z0-9\-]+"
          />
          <p className="break-all text-xs text-muted-foreground">
            afterclass.app/events/<strong>{slug || "your-event"}</strong>
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            placeholder="What's happening, who it's for, what to bring…"
            className="w-full rounded-xl border-[3px] border-ink bg-card px-4 py-3 text-base outline-none focus-visible:shadow-[4px_4px_0_var(--color-grape)]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="art" className={labelClass}>
            Cover art URL <span className="opacity-60">(optional)</span>
          </label>
          <Input
            id="art"
            name="art"
            type="url"
            placeholder="https://images.unsplash.com/…"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="clubId" className={labelClass}>
            Hosting club
          </label>
          <select id="clubId" name="clubId" required className={fieldClass}>
            <option value="">Pick a club…</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ------------------------------- timing ------------------------------ */}
      <section className="brutal space-y-5 rounded-2xl bg-card p-6">
        <h2 className="display text-2xl">2 · When</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="startsAt" className={labelClass}>
              Starts at
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="endsAt" className={labelClass}>
              Ends at
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="registrationDeadline" className={labelClass}>
            Registration deadline
          </label>
          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            required
            className={fieldClass}
          />
          <p className="text-xs text-muted-foreground">
            Must be on or before the start time.
          </p>
        </div>
      </section>

      {/* -------------------------------- teams ------------------------------ */}
      <section className="brutal space-y-5 rounded-2xl bg-card p-6">
        <h2 className="display text-2xl">3 · Team rules</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="minTeamSize" className={labelClass}>
              Min team size
            </label>
            <Input
              id="minTeamSize"
              name="minTeamSize"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="maxTeamSize" className={labelClass}>
              Max team size
            </label>
            <Input
              id="maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Leave both at 1 for a solo event. A max above 1 turns on team
          registration.
        </p>
      </section>

      <FormMessage state={state} />

      <SubmitButton size="lg" pendingLabel="Publishing…" className="w-full">
        Publish event
      </SubmitButton>
    </form>
  );
}
