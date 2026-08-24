import Link from "next/link";
import { ArrowUpRight, LogIn } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import AfterClassMark from "@/components/brand/afterclass-mark";
import ScrollProgress from "@/components/shared/scroll-progress";
import NavLinks from "./nav-links";
import MobileNav from "./mobile-nav";
import UserMenu from "./user-menu";

export default async function Header() {
  const user = await getSessionUser();
  const dashboardHref = "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="AfterClass home">
          <AfterClassMark className="size-10 shrink-0 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 sm:size-11" />
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[1.28rem] font-extrabold leading-none tracking-[-0.065em] sm:text-[1.55rem]">
              <span>After</span><span className="text-grape">Class</span>
            </span>
            <span className="mt-1 hidden text-[8px] font-black uppercase tracking-[0.23em] text-ink/45 sm:block">
              BMSCE culture, live
            </span>
          </span>
        </Link>

        <NavLinks isSignedIn={Boolean(user)} />

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu
              name={user.name}
              image={user.image}
              dashboardHref={dashboardHref}
            />
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5 bg-ink max-[350px]:size-9 max-[350px]:p-0" aria-label="Sign in">
                <LogIn className="size-4" />
                <span className="max-[350px]:hidden">Sign in</span>
                <ArrowUpRight className="hidden size-3.5 sm:block" />
              </Button>
            </Link>
          )}
          <MobileNav isSignedIn={Boolean(user)} />
        </div>
      </div>

      <ScrollProgress />
    </header>
  );
}
