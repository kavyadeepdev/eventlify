import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Check, X, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getClubApplications } from "@/lib/db-queries";
import { reviewApplicationAction } from "@/lib/actions";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Club Onboarding Queue - Super Admin",
};

export default async function AdminApplicationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/applications");

  const applications = await getClubApplications();
  const pendingApps = applications.filter((app) => app.status === "PENDING");
  const reviewedApps = applications.filter((app) => app.status !== "PENDING");

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

          <span className="sticker mt-6 inline-block bg-punch px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Super Admin Control Center
          </span>

          <h1 className="display mt-3 text-4xl sm:text-6xl text-paper">
            Club Onboarding Queue
          </h1>
          <p className="mt-2 text-sm text-paper/80">
            Review submitted club proposals, inspect charters, and provision official club workspaces.
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <FormMessage />

        {/* Pending Proposals */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-3xl text-ink">
              Pending Applications ({pendingApps.length})
            </h2>
          </div>

          {pendingApps.length > 0 ? (
            <div className="space-y-6">
              {pendingApps.map((app) => (
                <Reveal key={app.id}>
                  <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 sm:p-8 space-y-6 shadow-[6px_6px_0_var(--color-ink)]">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink/10 pb-4">
                      <div>
                        <span className="sticker inline-block bg-zest px-3 py-1 text-xs font-bold uppercase text-ink border-2 border-ink">
                          {app.category}
                        </span>
                        <h3 className="display mt-2 text-3xl text-ink">{app.name}</h3>
                        <p className="font-mono text-xs text-ink/60 mt-0.5">Proposed Slug: /{app.slug}</p>
                      </div>

                      <div className="text-right text-xs text-ink/70">
                        <p className="font-bold">Applicant:</p>
                        <p>{app.applicantName || app.contactEmail}</p>
                        <p className="font-mono">{app.contactEmail}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-xs uppercase tracking-wider text-ink/60">Description & Mission:</p>
                      <p className="text-sm text-ink/90 bg-paper p-4 rounded-xl border-2 border-ink">{app.description}</p>
                    </div>

                    {/* Review Action Controls */}
                    <div className="pt-4 border-t-2 border-ink/10 flex flex-wrap items-center justify-end gap-3">
                      <form action={reviewApplicationAction} className="inline-block">
                        <input type="hidden" name="applicationId" value={app.id} />
                        <input type="hidden" name="action" value="REJECT" />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="rejectionReason"
                            placeholder="Rejection feedback..."
                            className="rounded-lg border-2 border-ink bg-paper px-3 py-1 text-xs text-ink focus:outline-none"
                          />
                          <SubmitButton className="bg-punch text-white hover:bg-punch/90 border-2 border-ink text-xs px-3 py-1">
                            <X className="mr-1 size-3" />
                            Reject
                          </SubmitButton>
                        </div>
                      </form>

                      <form action={reviewApplicationAction} className="inline-block">
                        <input type="hidden" name="applicationId" value={app.id} />
                        <input type="hidden" name="action" value="APPROVE" />
                        <SubmitButton className="bg-limepop text-ink hover:bg-limepop/90 border-2 border-ink text-xs px-4 py-2 font-bold shadow-[2px_2px_0_var(--color-ink)]">
                          <Check className="mr-1 size-4" />
                          Approve & Provision Workspace
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="brutal rounded-2xl border-2 border-ink bg-paper p-8 text-center">
              <p className="font-bold text-ink text-lg">No Pending Proposals</p>
              <p className="text-xs text-ink/70 mt-1">All submitted club applications have been reviewed.</p>
            </div>
          )}
        </section>

        {/* Reviewed Proposals History */}
        {reviewedApps.length > 0 && (
          <section className="space-y-4 pt-8 border-t-2 border-ink/10">
            <h2 className="display text-2xl text-ink">Application History ({reviewedApps.length})</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewedApps.map((app) => (
                <div key={app.id} className="brutal rounded-xl border-2 border-ink bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-ink text-base">{app.name}</h4>
                    <span
                      className={`sticker px-2 py-0.5 text-[10px] font-bold uppercase ${
                        app.status === "APPROVED" ? "bg-limepop text-ink" : "bg-punch text-white"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 font-mono">/{app.slug}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
