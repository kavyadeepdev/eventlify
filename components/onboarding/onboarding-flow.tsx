"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import PicturePicker from "@/components/onboarding/picture-picker";
import DigitalPass from "@/components/dashboard/digital-pass";

interface OnboardingFlowProps {
  name: string;
  email: string;
  defaultImage: string | null;
  /** Set when the student already has a pass. */
  existingUsn?: string | null;
}

const labelClass = "text-xs font-bold uppercase tracking-wide";

export default function OnboardingFlow({
  name,
  email,
  defaultImage,
  existingUsn,
}: OnboardingFlowProps) {
  const [state, submit] = useActionState(completeOnboardingAction, idleState);

  const [fullName, setFullName] = useState(name);
  const [usn, setUsn] = useState("");
  const [image, setImage] = useState(defaultImage ?? "");

  // Deliberately no router.refresh() here: re-running this route's server
  // component would see the freshly saved USN and redirect straight to the
  // dashboard, skipping the pass reveal. The action already revalidated the
  // dashboard, so it is up to date when the student chooses to continue.

  const justIssued = state.ok;
  const alreadySetUp = Boolean(existingUsn) && !justIssued;

  if (justIssued || alreadySetUp) {
    // Next re-renders this route once the action resolves, so the props are
    // the freshly saved record. Prefer them over local form state, which is
    // only a fallback — the form posts DOM values, so the two can diverge.
    const passUsn = existingUsn ?? usn.toUpperCase();
    const passName = name || fullName;
    const passImage = defaultImage ?? (image || null);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <span className="sticker inline-flex items-center gap-2 bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <BadgeCheck className="size-4" />
            {justIssued ? "Pass issued" : "Pass active"}
          </span>
          <h1 className="display mt-5 text-[3rem] leading-[0.9] sm:text-6xl">
            {justIssued ? "You're on the list" : "You're all set"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            This is your AfterClass pass. It travels with you to every event you
            register for.
          </p>
        </div>

        <DigitalPass
          name={passName}
          usn={passUsn}
          image={passImage}
          issuedOn={new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          animate={justIssued}
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Enter the portal
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline">
              Browse events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-8">
      <div className="text-center">
        <span className="sticker inline-block bg-zest px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          One last step
        </span>
        <h1 className="display mt-5 text-[3rem] leading-[0.9] sm:text-6xl">
          Set up your pass
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          We just need your USN and a picture. Signed in as{" "}
          <span className="font-semibold text-ink">{email}</span>.
        </p>
      </div>

      <div className="brutal space-y-5 rounded-2xl bg-card p-6">
        <div className="space-y-1.5">
          <label htmlFor="onboarding-name" className={labelClass}>
            Full name
          </label>
          <Input
            id="onboarding-name"
            name="name"
            required
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onboarding-usn" className={labelClass}>
            USN
          </label>
          <Input
            id="onboarding-usn"
            name="usn"
            required
            maxLength={12}
            value={usn}
            onChange={(event) => setUsn(event.target.value.toUpperCase())}
            placeholder="1BM24CS001"
            autoComplete="off"
            spellCheck={false}
            className="font-mono tracking-[0.14em]"
          />
          <p className="text-xs text-muted-foreground">
            Your university seat number, exactly as it appears on your ID card.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>Profile picture</span>
          <PicturePicker
            name={fullName}
            defaultImage={defaultImage}
            value={image}
            onChange={setImage}
          />
        </div>

        <FormMessage state={state} />

        <SubmitButton size="lg" className="w-full" pendingLabel="Issuing your pass…">
          Generate my pass
        </SubmitButton>
      </div>
    </form>
  );
}
