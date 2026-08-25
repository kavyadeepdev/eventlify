import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getClubApplications } from "@/lib/db-queries";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Club Application Status",
};

export default async function ClubApplicationStatusPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/clubs/apply/status");

  const applications = await getClubApplications();
  const userApps = applications.filter((app) => app.applicantId === user.id);

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-paper py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paper/70 transition-colors hover:text-paper"
          >
            <ArrowLeft className="size-4" />
            Back to Clubs Directory
          </Link>

          <h1 className="display mt-4 text-4xl sm:text-6xl text-paper">
            Application Status Tracker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-paper/80">
            Track your submitted proposals for official campus club recognition.
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        {userApps.length > 0 ? (
          userApps.map((app) => (
            <Reveal key={app.id}>
              <div className="brutal rounded-2xl border-2 border-ink bg-white p-6 sm:p-8 space-y-4 shadow-[5px_5px_0_var(--color-ink)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="sticker inline-block bg-zest px-3 py-1 text-xs font-bold uppercase text-ink border-2 border-ink">
                      {app.category}
                    </span>
                    <h2 className="display mt-2 text-2xl text-ink">{app.name}</h2>
                    <p className="font-mono text-xs text-ink/60 mt-0.5">Slug: /{app.slug}</p>
                  </div>

                  <div>
                    {app.status === "PENDING" && (
                      <span className="sticker inline-flex items-center gap-1.5 bg-zest px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
                        <Clock className="size-4 animate-spin-slow" />
                        Under Review
                      </span>
                    )}
                    {app.status === "APPROVED" && (
                      <span className="sticker inline-flex items-center gap-1.5 bg-limepop px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
                        <CheckCircle2 className="size-4" />
                        Approved
                      </span>
                    )}
                    {app.status === "REJECTED" && (
                      <span className="sticker inline-flex items-center gap-1.5 bg-punch px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                        <XCircle className="size-4" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-ink/80">{app.description}</p>

                {app.status === "APPROVED" && (
                  <div className="pt-4 border-t-2 border-ink/10 flex justify-end">
                    <Link
                      href={`/clubs/${app.slug}/admin`}
                      className="sticker inline-flex items-center gap-2 bg-grape text-white px-4 py-2 text-xs font-bold uppercase tracking-widest"
                    >
                      Open Club Admin Workspace
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                )}

                {app.status === "REJECTED" && app.rejectionReason && (
                  <div className="rounded-xl border-2 border-ink bg-punch/10 p-4 text-xs text-ink space-y-1">
                    <p className="font-bold text-punch">Reviewer Feedback:</p>
                    <p>{app.rejectionReason}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))
        ) : (
          <div className="brutal rounded-2xl border-2 border-ink bg-paper p-8 text-center space-y-4">
            <h3 className="display text-2xl text-ink">No Submitted Applications</h3>
            <p className="text-sm text-ink/70 max-w-md mx-auto">
              You haven't submitted any club onboarding applications yet. Submit a proposal to start a new club!
            </p>
            <Link
              href="/clubs/apply"
              className="sticker inline-flex items-center gap-2 bg-limepop text-ink px-4 py-2 text-xs font-bold uppercase"
            >
              Apply for Recognition Now
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
