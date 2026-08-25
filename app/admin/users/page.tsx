import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Shield, UserCheck, Search } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getUsers } from "@/lib/db-queries";
import { updateUserRoleAction } from "@/lib/actions";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import WaveEdge from "@/components/shared/wave-edge";
import Reveal from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "User System Roles - Super Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/users");

  const { q } = await searchParams;
  const usersList = await getUsers(q);

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
            Platform User System Roles
          </h1>
          <p className="mt-2 text-sm text-paper/80">
            Search registered campus users and manage Super Admin system privileges.
          </p>
        </div>
      </section>

      <WaveEdge fill="var(--color-ink)" className="bg-background" />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <FormMessage />

        {/* Search Bar */}
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search users by Name, Email, or USN..."
            className="w-full rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-sm text-ink shadow-[3px_3px_0_var(--color-ink)] focus:outline-none"
          />
          <button
            type="submit"
            className="sticker bg-zest text-ink border-2 border-ink px-5 py-2.5 text-xs font-bold uppercase"
          >
            Search
          </button>
        </form>

        <div className="brutal rounded-2xl border-2 border-ink bg-white overflow-hidden shadow-[6px_6px_0_var(--color-ink)]">
          <div className="divide-y-2 divide-ink/10">
            {usersList.map((u) => {
              const isSuperAdmin = u.systemRole === "SUPER_ADMIN";
              return (
                <div key={u.id} className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-paper/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-ink text-base">{u.name}</h4>
                      <span
                        className={`sticker px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isSuperAdmin ? "bg-punch text-white" : "bg-paper text-ink"
                        }`}
                      >
                        {u.systemRole || "USER"}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 mt-0.5">{u.email} {u.usn ? `· USN: ${u.usn}` : ""}</p>
                  </div>

                  <form action={updateUserRoleAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value={isSuperAdmin ? "USER" : "SUPER_ADMIN"} />
                    <SubmitButton
                      className={`text-xs px-3 py-1 border-2 border-ink ${
                        isSuperAdmin
                          ? "bg-paper text-ink hover:bg-paper/90"
                          : "bg-punch text-white hover:bg-punch/90"
                      }`}
                    >
                      {isSuperAdmin ? "Revoke Super Admin" : "Promote to Super Admin"}
                    </SubmitButton>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
