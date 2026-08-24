"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";

interface ProfileFormProps {
  name: string;
  usn: string | null;
  email: string;
}

export default function ProfileForm({ name, usn, email }: ProfileFormProps) {
  const [state, submit] = useActionState(updateProfileAction, idleState);
  const labelClass = "text-xs font-bold uppercase tracking-wide";

  return (
    <form action={submit} className="brutal space-y-4 rounded-2xl bg-card p-6">
      <h3 className="display text-2xl">Your details</h3>

      <div className="space-y-1.5">
        <label htmlFor="profile-name" className={labelClass}>
          Name
        </label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={name}
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="profile-usn" className={labelClass}>
          USN
        </label>
        <Input
          id="profile-usn"
          name="usn"
          defaultValue={usn ?? ""}
          maxLength={30}
          placeholder="1BM24CS001"
        />
      </div>

      <div className="space-y-1.5">
        <span className={labelClass}>Email</span>
        <p className="rounded-xl border-2 border-dashed border-ink/40 px-4 py-3 text-sm text-muted-foreground">
          {email}
        </p>
      </div>

      <FormMessage state={state} />

      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
