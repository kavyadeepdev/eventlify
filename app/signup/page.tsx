import Link from "next/link";
import { CalendarCheck, ClipboardCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import GoogleButton from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Join",
  description: "Create your AfterClass account with your BMSCE Google account.",
};

type SearchParams = Promise<{ next?: string }>;

const perks = [
  { Icon: CalendarCheck, text: "Register for hackathons, workshops and talks" },
  { Icon: Users, text: "Form a team and register together" },
  { Icon: ClipboardCheck, text: "Track your registrations and attendance" },
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center">
        <span className="sticker inline-block bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          Create your account
        </span>
        <h1 className="display mt-6 text-[3.8rem] leading-[0.9] sm:text-7xl">
          Join
          <br />
          AfterClass
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Sign in with your BMSCE Google account to register for events and
          manage your team entries.
        </p>
      </div>

      <div className="brutal mt-10 space-y-6 rounded-2xl bg-card p-6 sm:p-8">
        <ul className="space-y-3">
          {perks.map(({ Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3 text-sm font-semibold"
            >
              <Icon className="size-5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        <GoogleButton
          callbackURL={next && next.startsWith("/") ? next : "/dashboard"}
          label="Sign up with Google"
        />

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold underline decoration-[3px] underline-offset-4 hover:text-grape"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
