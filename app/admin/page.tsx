import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ShieldAlert,
  Users,
  Building2,
  Calendar,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getAdminStats } from "@/lib/db-queries";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";
import Tilt from "@/components/shared/tilt";
import CountUp from "@/components/shared/count-up";

export const metadata: Metadata = {
  title: "Super Admin Control Center",
};

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");

  const stats = await getAdminStats();

  const kpis = [
    { label: "Total Students", value: stats.totalUsers, tone: "bg-zest text-ink", icon: Users },
    { label: "Active Clubs", value: stats.totalClubs, tone: "bg-limepop text-ink", icon: Building2 },
    { label: "Pending Proposals", value: stats.pendingApplications, tone: "bg-punch text-white", icon: FileCheck },
    { label: "Total Events", value: stats.totalEvents, tone: "bg-grape text-white", icon: Calendar },
    { label: "Total Registrations", value: stats.totalRegistrations, tone: "bg-aqua text-ink", icon: TrendingUp },
    { label: "Turnout Rate", value: `${stats.turnoutRatePercentage}%`, tone: "bg-flame text-white", icon: Sparkles },
  ];

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-paper py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="sticker inline-block bg-punch px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Super Admin Control Center
          </span>
          <h1 className="display mt-3 text-4xl sm:text-6xl text-paper">
            Platform Operations
          </h1>
          <p className="mt-2 text-sm sm:text-base text-paper/80 max-w-lg">
            Site-wide metrics, club onboarding review queue, global event moderation, and system role management.
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Reveal key={kpi.label}>
                <Tilt max={6}>
                  <div className={`brutal shine rounded-2xl border-2 border-ink p-5 ${kpi.tone} shadow-[4px_4px_0_var(--color-ink)]`}>
                    <div className="flex items-center justify-between">
                      <Icon className="size-6 opacity-80" />
                      <span className="text-xs font-bold uppercase tracking-widest">KPI</span>
                    </div>
                    <p className="display mt-3 text-4xl sm:text-5xl">
                      {typeof kpi.value === "number" ? <CountUp value={kpi.value} /> : kpi.value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest opacity-90">
                      {kpi.label}
                    </p>
                  </div>
                </Tilt>
              </Reveal>
            );
          })}
        </div>

        {/* Super Admin Quick Actions */}
        <section className="space-y-6">
          <h2 className="display text-3xl text-ink">Management Modules</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal>
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 shadow-[5px_5px_0_var(--color-ink)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border-2 border-ink bg-zest p-3 text-ink">
                    <FileCheck className="size-6" />
                  </div>
                  {stats.pendingApplications > 0 && (
                    <span className="sticker bg-punch px-2 py-0.5 text-xs font-bold text-white">
                      {stats.pendingApplications} PENDING
                    </span>
                  )}
                </div>
                <h3 className="display text-2xl text-ink">Onboarding Queue</h3>
                <p className="text-xs text-ink/70">
                  Review submitted club proposals, inspect charters, and provision official workspaces.
                </p>
                <Link
                  href="/admin/applications"
                  className="sticker inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-xs font-bold uppercase w-full justify-center"
                >
                  Review Applications
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 shadow-[5px_5px_0_var(--color-ink)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border-2 border-ink bg-limepop p-3 text-ink">
                    <Building2 className="size-6" />
                  </div>
                </div>
                <h3 className="display text-2xl text-ink">Club Directory</h3>
                <p className="text-xs text-ink/70">
                  Audit campus clubs, inspect active events, or suspend/reactivate club status.
                </p>
                <Link
                  href="/admin/clubs"
                  className="sticker inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-xs font-bold uppercase w-full justify-center"
                >
                  Manage Clubs
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 shadow-[5px_5px_0_var(--color-ink)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border-2 border-ink bg-grape p-3 text-white">
                    <Users className="size-6" />
                  </div>
                </div>
                <h3 className="display text-2xl text-ink">User System Roles</h3>
                <p className="text-xs text-ink/70">
                  Search platform users by USN, Name, or Email and promote/demote Super Admin privileges.
                </p>
                <Link
                  href="/admin/users"
                  className="sticker inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-xs font-bold uppercase w-full justify-center"
                >
                  Manage System Roles
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
