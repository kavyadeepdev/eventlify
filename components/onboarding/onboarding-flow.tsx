"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import DigitalPass from "@/components/dashboard/digital-pass";
import ProtocolMark from "@/components/brand/protocol-mark";

interface OnboardingFlowProps {
  name: string;
  issuedOn: string;
}

/**
 * What a student sees the first time they sign in.
 *
 * There is no USN or picture step: without a verification system in place
 * those fields can't be trusted, so the pass is issued from the Google
 * account alone and the fields are simply left off the card.
 */
export default function OnboardingFlow({ name, issuedOn }: OnboardingFlowProps) {
  const [step, setStep] = useState<"pass" | "tuned">("pass");

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
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
          This is your AfterClass pass. It travels with you to every event you
          register for.
        </p>
      </div>

      <DigitalPass name={name} issuedOn={issuedOn} animate />

      <div className="flex justify-center">
        <Button size="lg" className="gap-2" onClick={() => setStep("tuned")}>
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
