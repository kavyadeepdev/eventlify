"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Lock, Plus, UserRound, Users, X, QrCode, AlertCircle, XCircle } from "lucide-react";
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
  registrationStatus?: string | null;
  currentUserId: string | null;
  students: UserApiData[];
  isPaid?: boolean;
  feeAmount?: number;
  upiId?: string | null;
  upiQrUrl?: string | null;
}

export default function RegisterPanel({
  eventSlug,
  minTeamSize,
  maxTeamSize,
  registrationOpen,
  closedReason,
  isSignedIn,
  alreadyRegistered,
  registrationStatus,
  currentUserId,
  students,
  isPaid = false,
  feeAmount = 0,
  upiId,
  upiQrUrl,
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

  const [transactionId, setTransactionId] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");

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
  const justRegistered = soloState.ok || teamState.ok;
  const status = registrationStatus || (justRegistered ? (isPaid ? "PENDING_VERIFICATION" : "CONFIRMED") : null);

  /* ------------------------------ closed / registered ----------------------------- */

  if (alreadyRegistered || justRegistered) {
    if (status === "PENDING_VERIFICATION") {
      return (
        <aside className="brutal relative rounded-2xl border-2 border-ink bg-zest p-5 sm:p-6 shadow-[4px_4px_0_var(--color-ink)] space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-7 text-ink animate-spin-slow" />
            <span className="sticker bg-ink text-paper px-3 py-1 text-xs font-bold uppercase">
              Under Review
            </span>
          </div>
          <h2 className="display text-3xl text-ink">Payment Under Verification</h2>
          <p className="text-sm text-ink/90 font-medium">
            Your payment proof and UTR transaction ID have been submitted. A club officer will review your payment shortly to issue your QR entry pass.
          </p>
          <Link href="/dashboard" className="inline-block pt-2">
            <Button variant="outline" className="border-2 border-ink">Check status on dashboard</Button>
          </Link>
        </aside>
      );
    }

    if (status === "REJECTED") {
      return (
        <aside className="brutal relative rounded-2xl border-2 border-ink bg-punch p-5 sm:p-6 text-white shadow-[4px_4px_0_var(--color-ink)] space-y-3">
          <XCircle className="size-8" />
          <h2 className="display text-3xl">Payment Rejected</h2>
          <p className="text-sm text-white/90">
            Your submitted payment proof was rejected by the organizers. Please contact the club or re-submit.
          </p>
        </aside>
      );
    }

    return (
      <aside className="brutal relative overflow-visible rounded-2xl bg-limepop p-5 sm:p-6">
        <Confetti fire={justRegistered} />
        <CheckCircle2 className="size-8 animate-[pop-in_0.5s_var(--ease-spring)]" />
        <h2 className="display mt-3 text-3xl">You&apos;re on the list</h2>
        <p className="mt-2 text-sm">
          Your spot is locked in. Find the details and your entry passes on your dashboard.
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
        <Link href={`/login?next=/events/${eventSlug}`} className="mt-5 inline-block">
          <Button variant="secondary">Sign in to register</Button>
        </Link>
      </aside>
    );
  }

  const qrUrl = upiQrUrl || (upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=Club&am=${feeAmount}` : null);

  /* -------------------------------- open form ------------------------------- */

  return (
    <aside className="brutal space-y-5 rounded-2xl bg-card p-5 sm:p-6 border-2 border-ink shadow-[4px_4px_0_var(--color-ink)]">
      <div>
        <div className="flex items-center gap-2">
          <span className="sticker inline-block bg-limepop px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
            Entries open
          </span>
          {isPaid && (
            <span className="sticker inline-block bg-zest px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
              Fee: ₹{feeAmount}
            </span>
          )}
        </div>
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

      {/* Paid Event Instructions & UPI Scanner */}
      {isPaid && (
        <div className="rounded-xl border-2 border-ink bg-paper p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
            <QrCode className="size-4 text-grape" />
            <span>Scan UPI QR Code to Pay ₹{feeAmount}</span>
          </div>

          {qrUrl && (
            <div className="flex justify-center py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="size-48 rounded-xl border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] bg-white p-2"
              />
            </div>
          )}

          {upiId && (
            <p className="text-center font-mono text-xs font-bold text-ink bg-white py-1.5 px-3 rounded-lg border border-ink/30">
              UPI ID: {upiId}
            </p>
          )}
        </div>
      )}

      {mode === "SOLO" && soloAllowed ? (
        <form action={soloSubmit} className="space-y-4">
          <input type="hidden" name="eventSlug" value={eventSlug} />

          {isPaid && (
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="transactionId" className="text-xs font-bold uppercase tracking-wide">
                  Transaction ID / UTR Number *
                </label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  required={isPaid}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 423987129038"
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <label htmlFor="paymentProofUrl" className="text-xs font-bold uppercase tracking-wide">
                  Payment Proof Screenshot URL *
                </label>
                <Input
                  id="paymentProofUrl"
                  name="paymentProofUrl"
                  required={isPaid}
                  value={paymentProofUrl}
                  onChange={(e) => setPaymentProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          )}

          <FormMessage state={soloState} />

          <SubmitButton
            size="lg"
            className="w-full bg-punch text-white border-2 border-ink hover:bg-punch/90"
            pendingLabel="Submitting registration..."
          >
            {isPaid ? `Submit Payment Proof (₹${feeAmount})` : "Register solo"}
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

          {isPaid && (
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="teamTransactionId" className="text-xs font-bold uppercase tracking-wide">
                  Transaction ID / UTR Number *
                </label>
                <Input
                  id="teamTransactionId"
                  name="transactionId"
                  required={isPaid}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 423987129038"
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <label htmlFor="teamPaymentProofUrl" className="text-xs font-bold uppercase tracking-wide">
                  Payment Proof Screenshot URL *
                </label>
                <Input
                  id="teamPaymentProofUrl"
                  name="paymentProofUrl"
                  required={isPaid}
                  value={paymentProofUrl}
                  onChange={(e) => setPaymentProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          )}

          <FormMessage state={teamState} />

          <SubmitButton
            size="lg"
            className="w-full bg-punch text-white border-2 border-ink hover:bg-punch/90"
            pendingLabel="Building your team…"
          >
            {isPaid ? `Submit Team Payment Proof (₹${feeAmount})` : "Register team"}
          </SubmitButton>
        </form>
      ) : null}
    </aside>
  );
}
