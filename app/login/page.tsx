import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import GoogleButton from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to AfterClass with your BMSCE Google account.",
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <main className="grid min-h-[calc(100vh-76px)] min-w-0 lg:grid-cols-2">
      {/* Poster side */}
      <section className="relative hidden overflow-hidden border-r-[3px] border-ink bg-grape p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="halftone absolute inset-0 opacity-20" />

        <div className="relative">
          <span className="sticker inline-block bg-zest px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
            AfterClass
          </span>
          <h2 className="display mt-8 text-7xl leading-[0.85]">
            One login.
            <br />
            <span className="text-limepop">Every</span>
            <br />
            BMSCE
            <br />
            event.
          </h2>
        </div>

        <ul className="relative space-y-3 text-sm text-white/85">
          <li>→ Register as an individual or as a team</li>
          <li>→ Keep every registration in one place</li>
          <li>→ Track your attendance across the semester</li>
        </ul>
      </section>

      {/* Form side */}
      <section className="flex min-w-0 items-center justify-center px-4 py-12 sm:px-8 sm:py-16">
        <div className="min-w-0 w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="display text-5xl">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Continue with your BMSCE Google account. New students get their
              pass on the way in.
            </p>
          </div>

          <div className="brutal space-y-5 rounded-2xl bg-card p-6">
            <GoogleButton
              callbackURL={next && next.startsWith("/") ? next : "/dashboard"}
              label="Continue with Google"
            />

            <p className="text-center text-xs text-muted-foreground">
              First time here? Signing in creates your pass — no separate
              account to set up.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Only <span className="font-semibold text-ink">@bmsce.ac.in</span>{" "}
            accounts can sign in.
          </p>
        </div>
      </section>
    </main>
  );
}
