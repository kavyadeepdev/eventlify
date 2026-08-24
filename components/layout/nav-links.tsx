"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { name: "Events", href: "/events" },
  { name: "Clubs", href: "/clubs" },
  { name: "My pass", href: "/dashboard" },
] as const;

/** Desktop nav. Split out as a client island so the header can stay a Server Component. */
export default function NavLinks({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 rounded-full border border-ink/12 bg-white/55 p-1 md:flex">
      {NAV_LINKS.filter(
        (link) => isSignedIn || link.href !== "/dashboard"
      ).map((link) => {
        // `/events/new` must not light up while `/events` is active, so the
        // most specific matching link wins.
        const isActive =
          pathname === link.href ||
          (pathname.startsWith(`${link.href}/`) &&
            !NAV_LINKS.some(
              (other) =>
                other.href !== link.href &&
                other.href.startsWith(`${link.href}/`) &&
                pathname.startsWith(other.href)
            ));

        return (
          <Link
            key={link.href}
            href={link.href}
            scroll
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] transition-all",
              isActive
                ? "border-ink bg-limepop text-ink"
                : "border-transparent text-ink/60 hover:bg-ink hover:text-white"
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
