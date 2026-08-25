import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getClubs } from "@/lib/db-queries";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Campus Clubs Registry - Super Admin",
};

export default async function AdminClubsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/clubs");

  const clubs = await getClubs();

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-paper py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paper/70 transition-colors hover:text-paper"
          >
            <ArrowLeft className="size-4" />
            Back to Super Admin Dashboard
          </Link>

          <h1 className="display mt-4 text-4xl sm:text-6xl text-paper">
            Campus Clubs Registry
          </h1>
          <p className="mt-2 text-sm text-paper/80">
            Overview of all officially onboarded campus organizations and active clubs.
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Reveal key={club.id}>
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 space-y-4 shadow-[4px_4px_0_var(--color-ink)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="display text-2xl text-ink">{club.name}</h3>
                    <p className="font-mono text-xs text-ink/60 mt-0.5">/{club.slug}</p>
                  </div>

                  <span className="sticker px-3 py-1 text-xs font-bold uppercase tracking-widest bg-limepop text-ink">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-ink/80 line-clamp-2">{club.description}</p>

                <div className="pt-3 border-t-2 border-ink/10 flex items-center justify-between">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="text-xs font-bold uppercase tracking-wider text-grape hover:underline inline-flex items-center gap-1"
                  >
                    View Public Page
                    <ArrowRight className="size-3" />
                  </Link>

                  <Link
                    href={`/clubs/${club.slug}/admin`}
                    className="sticker bg-ink text-paper px-3 py-1 text-xs font-bold uppercase"
                  >
                    Admin Workspace
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </main>
    </>
  );
}
