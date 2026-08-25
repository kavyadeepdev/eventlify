import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Building2, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { applyForClubAction } from "@/lib/actions";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Reveal from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Apply for Campus Club Recognition",
};

export default async function ClubApplicationPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/clubs/apply");

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

          <span className="sticker mt-6 inline-block bg-zest px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink">
            Official Onboarding
          </span>

          <h1 className="display mt-3 text-4xl sm:text-6xl text-paper">
            Apply for Club Recognition
          </h1>
          <p className="mt-2 text-sm sm:text-base text-paper/80 max-w-xl">
            Propose a new official student organization for your campus. Once reviewed by platform administrators, your club workspace will be provisioned automatically.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <form action={applyForClubAction} className="brutal rounded-2xl border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0_var(--color-ink)] space-y-6">
            <FormMessage />

            <div className="space-y-4">
              <h2 className="display text-2xl text-ink">1. Club Basic Details</h2>

              <div>
                <Label htmlFor="name">Proposed Club Name</Label>
                <Input id="name" name="name" placeholder="e.g. ACM Student Chapter" required className="mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" name="slug" placeholder="e.g. acm-bmsce" required className="mt-1 font-mono text-sm" />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="e.g. Technical, Cultural, Sports" required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Logo Asset URL (Optional)</Label>
                <Input id="logo" name="logo" placeholder="https://..." className="mt-1" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-ink/10">
              <h2 className="display text-2xl text-ink">2. Charter & Purpose</h2>

              <div>
                <Label htmlFor="description">Club Description & Mission</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Explain the purpose of your club, target student audience, and planned events..."
                  className="mt-1 w-full rounded-xl border-2 border-ink bg-paper p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-grape"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-ink/10">
              <h2 className="display text-2xl text-ink">3. Lead Contact Info</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Official Contact Email</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" defaultValue={user.email} required className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone Number</Label>
                  <Input id="contactPhone" name="contactPhone" placeholder="+91 98765 43210" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-ink/10 flex justify-end gap-3">
              <SubmitButton className="bg-punch text-white hover:bg-punch/90 border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]">
                Submit Application for Review
                <Send className="ml-2 size-4" />
              </SubmitButton>
            </div>
          </form>
        </Reveal>
      </main>
    </>
  );
}
