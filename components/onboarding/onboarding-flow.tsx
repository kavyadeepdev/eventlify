"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Radio } from "lucide-react";
import { saveProfilePictureAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import PicturePicker from "@/components/onboarding/picture-picker";
import DigitalPass from "@/components/dashboard/digital-pass";
import ProtocolMark from "@/components/brand/protocol-mark";

interface OnboardingFlowProps {
  name: string;
  issuedOn: string;
  defaultImage: string | null;
}

/**
 * What a student sees the first time they sign in: pick a picture, get the
 * pass, then a holding screen.
 *
 * There is no USN step — without a verification system that field can't be
 * trusted, so it isn't collected or shown.
 */
export default function OnboardingFlow({
  name,
  issuedOn,
  defaultImage,
}: OnboardingFlowProps) {
  const [state, submit] = useActionState(saveProfilePictureAction, idleState);
  const [image, setImage] = useState(defaultImage ?? "");
  const [step, setStep] = useState<"pass" | "tuned">("pass");

  // The action resolving is what advances the flow: the picture is saved
  // before the pass is shown carrying it.
  const issued = state.ok;

  if (step === "tuned") {
    return (
      <div className="space-y-8 text-center">
        <div>
          <span className="sticker inline-flex items-center gap-2 bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Radio className="size-4" />
            Coming soon
          </span>
          <h1 className="display mt-5 text-[3.2rem] leading-[0.9] sm:text-6xl">
            Stay tuned
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
            Your pass is live. Events, club rosters and registrations are on
            the way — we&apos;ll light this up the moment they land.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="brutal mx-auto flex max-w-xs items-center justify-center rounded-2xl bg-ink px-8 py-10 text-protocol"
        >
          <ProtocolMark className="w-full" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Go to my pass
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

  if (issued) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <span className="sticker inline-flex items-center gap-2 bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <BadgeCheck className="size-4" />
            Pass issued
          </span>
          <h1 className="display mt-5 text-[3rem] leading-[0.9] sm:text-6xl">
            You&apos;re on the list
          </h1>
        </div>

        <DigitalPass
          name={name}
          image={image || null}
          issuedOn={issuedOn}
          animate
        />

        <div className="flex justify-center">
          <Button size="lg" className="gap-2" onClick={() => setStep("tuned")}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-7">
      <div className="text-center">
        <span className="sticker inline-block bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          One quick thing
        </span>
        <h1 className="display mt-5 text-[3rem] leading-[0.9] sm:text-6xl">
          Pick your picture
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
          It goes on your pass. Your Google picture is already in — swap it for
          something better if you like.
        </p>
      </div>

      <input type="hidden" name="image" value={image} />

      <div className="brutal rounded-2xl bg-card p-6">
        <PicturePicker
          name={name}
          defaultImage={defaultImage}
          value={image}
          onChange={setImage}
        />
      </div>

      <FormMessage state={state} />

      <SubmitButton size="lg" className="w-full" pendingLabel="Issuing…">
        Generate my pass
      </SubmitButton>
    </form>
  );
}
