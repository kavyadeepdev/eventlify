import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Your pass",
  description: "Your AfterClass pass.",
};

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/onboarding");

  const issuedOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 sm:max-w-2xl sm:py-12 lg:max-w-3xl">
      <OnboardingFlow name={user.name} issuedOn={issuedOn} />
    </main>
  );
}
