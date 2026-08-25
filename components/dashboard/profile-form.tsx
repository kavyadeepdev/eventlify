"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import PicturePicker from "@/components/onboarding/picture-picker";

interface ProfileFormProps {
  name: string;
  usn: string | null;
  email: string;
  image: string | null;
}

export default function ProfileForm({
  name,
  usn,
  email,
  image,
}: ProfileFormProps) {
  const [state, submit] = useActionState(updateProfileAction, idleState);
  const [fullName, setFullName] = useState(name);
  const [usnValue, setUsnValue] = useState(usn ?? "");
  const [picture, setPicture] = useState(image ?? "");

  const labelClass = "text-xs font-bold uppercase tracking-wide";

  return (
    <form action={submit} className="brutal space-y-4 rounded-2xl bg-card p-6">
      <h3 className="display text-2xl">Update your pass</h3>

      <div className="space-y-1.5">
        <label htmlFor="profile-name" className={labelClass}>
          Name
        </label>
        <Input
          id="profile-name"
          name="name"
          required
          maxLength={100}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="profile-usn" className={labelClass}>
          USN
        </label>
        <Input
          id="profile-usn"
          name="usn"
          required
          maxLength={12}
          value={usnValue}
          onChange={(event) => setUsnValue(event.target.value.toUpperCase())}
          placeholder="1BM24CS001"
          autoComplete="off"
          spellCheck={false}
          className="font-mono tracking-[0.14em]"
        />
      </div>

      <div className="space-y-1.5">
        <span className={labelClass}>Picture</span>
        <PicturePicker
          name={fullName}
          defaultImage={image}
          value={picture}
          onChange={setPicture}
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
