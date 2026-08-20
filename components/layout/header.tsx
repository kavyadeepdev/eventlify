"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Compass, Building2, LogIn, UserPlus, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const Header = () => {
  const pathname = usePathname();
  const sessionResult = authClient.useSession();
  const session = sessionResult?.data;

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const navLinks = [
    { name: "Explore Events", href: "/events", icon: Compass },
    { name: "Partnered Clubs", href: "/clubs", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            CP
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Campus Pulse
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Home
            </Button>
          </Link>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/events" className="md:hidden">
            <Button variant="ghost" size="icon-sm">
              <Search className="w-4 h-4" />
            </Button>
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Hi, {session.user?.name || "Student"}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
