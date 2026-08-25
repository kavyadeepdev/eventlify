import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Sliders,
  Key,
  Users,
  Check,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import { getClubBySlug, getEventsByClubSlug } from "@/lib/db-queries";
import { getSessionUser } from "@/lib/session";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import { reviewPaymentAction } from "@/lib/actions";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = {
  title: "Club Admin Workspace",
};

export default async function ClubAdminPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [clubData, user] = await Promise.all([
    getClubBySlug(slug),
    getSessionUser(),
  ]);

  if (!clubData?.club) notFound();
  if (!user) redirect(`/login?next=/clubs/${slug}/admin`);

  const { club, members, roles } = clubData;

  // Verify organiser access
  const isOrganiser = members.some((m) => m.userId === user.id);
  if (!isOrganiser) {
    redirect(`/clubs/${slug}`);
  }

  const events = await getEventsByClubSlug(slug);

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-paper py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/clubs/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paper/70 transition-colors hover:text-paper"
          >
            <ArrowLeft className="size-4" />
            Back to Public Club Page
          </Link>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="sticker inline-block bg-zest px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink">
                Club Control Center
              </span>
              <h1 className="display mt-3 text-4xl sm:text-6xl text-paper">
                {club.name} Admin Portal
              </h1>
              <p className="mt-1 text-sm text-paper/70">
                Manage branding, custom roles, payment verification, and headless BaaS settings.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/events/new`}
                className="sticker inline-flex items-center gap-2 bg-limepop px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink hover:bg-limepop/90 transition-transform active:scale-95"
              >
                <Plus className="size-4" />
                Publish Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal>
            <Tilt max={6}>
              <div className="brutal rounded-2xl bg-zest p-5 text-ink">
                <p className="display text-4xl">{events.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest">Hosted Events</p>
              </div>
            </Tilt>
          </Reveal>

          <Reveal>
            <Tilt max={6}>
              <div className="brutal rounded-2xl bg-limepop p-5 text-ink">
                <p className="display text-4xl">{members.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest">Active Officers</p>
              </div>
            </Tilt>
          </Reveal>

          <Reveal>
            <Tilt max={6}>
              <div className="brutal rounded-2xl bg-aqua p-5 text-ink">
                <p className="display text-4xl">{roles?.length || 1}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest">Custom Roles</p>
              </div>
            </Tilt>
          </Reveal>

          <Reveal>
            <Tilt max={6}>
              <div className="brutal rounded-2xl bg-punch p-5 text-white">
                <p className="display text-4xl">ACTIVE</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest">Club Status</p>
              </div>
            </Tilt>
          </Reveal>
        </div>

        {/* Custom Discord Roles Management */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="display text-3xl text-ink">Custom Club Roles</h2>
              <p className="text-sm text-ink/70">Create Discord-style custom roles with custom colors and permission flags.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <div key={role.id} className="brutal rounded-2xl border-2 border-ink bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border-2 border-ink text-ink"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name}
                    </span>
                    <span className="text-xs text-ink/60 font-semibold">Rank #{role.rank}</span>
                  </div>
                  <div className="space-y-1 pt-2 border-t-2 border-ink/10 text-xs text-ink/80">
                    <p className="font-bold">Granted Permissions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.permissions.map((perm) => (
                        <span key={perm} className="bg-paper px-2 py-0.5 rounded border border-ink/30 text-[10px] font-mono">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-5 space-y-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border-2 border-ink bg-grape text-white">
                  Club Admin (Owner)
                </span>
                <p className="text-xs text-ink/70">Full permissions: MANAGE_CLUB, MANAGE_ROLES, MANAGE_MEMBERS, MANAGE_EVENTS, MANAGE_ATTENDANCE, MANAGE_API_KEYS</p>
              </div>
            )}
          </div>
        </section>

        {/* Headless BaaS & API Keys */}
        <section className="brutal rounded-2xl border-2 border-ink bg-paper p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="sticker inline-block bg-grape px-3 py-1 text-xs font-bold uppercase tracking-widest text-white border-2 border-ink">
                Headless BaaS Config
              </span>
              <h2 className="display mt-2 text-3xl text-ink">API Keys & CORS Control</h2>
              <p className="text-sm text-ink/70 mt-1">
                Use Eventlify as your headless backend database single source of truth for external club websites.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-ink/10">
            <div className="space-y-3">
              <h3 className="font-bold text-ink">Configured Allowed Origins (CORS)</h3>
              <div className="rounded-xl border-2 border-ink bg-white p-4 font-mono text-xs text-ink space-y-1">
                <p>https://acm-bmsce.in</p>
                <p>https://acm.vercel.app</p>
                <p>http://localhost:3000</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-ink">Active API Keys</h3>
              <div className="rounded-xl border-2 border-ink bg-white p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-ink">Live Website Key</p>
                  <p className="font-mono text-xs text-ink/60 mt-0.5">ev_live_9f82...k38a</p>
                </div>
                <span className="sticker bg-limepop px-2 py-0.5 text-[10px] font-bold text-ink">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
