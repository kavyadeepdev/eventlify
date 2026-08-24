"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  callbackURL: string;
  label: string;
  pendingLabel?: string;
}

function GoogleMark() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Google is the only enabled provider — email/password is switched off in
 * `lib/auth.ts`.
 */
export default function GoogleButton({
  callbackURL,
  label,
  pendingLabel = "Opening Google…",
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL });
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Couldn't reach Google. Try again in a moment.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full gap-3"
        onClick={handleClick}
        disabled={loading}
      >
        <GoogleMark />
        {loading ? pendingLabel : label}
      </Button>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-ink bg-flame px-3 py-2 text-sm font-semibold text-white"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
