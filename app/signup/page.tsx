import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
