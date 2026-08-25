import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Set up your pass",
  description: "Add your USN and picture to finish setting up AfterClass.",
};

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/onboarding");

  // Note there is deliberately no `redirect` for students who already have a
  // USN. Next re-renders the current route once a server action resolves, so
  // redirecting on the presence of a USN would fire the moment the pass is
  // issued and skip the reveal. The flow handles the already-set-up case.
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <OnboardingFlow
        name={user.name}
        email={user.email}
        defaultImage={user.image}
        existingUsn={user.usn}
      />
    </main>
  );
}
