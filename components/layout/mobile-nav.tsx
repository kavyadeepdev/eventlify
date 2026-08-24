"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "./nav-links";

interface MobileNavProps {
  isSignedIn: boolean;
}

export default function MobileNav({ isSignedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {open ? (
        <div className="absolute inset-x-3 top-[76px] z-50 overflow-hidden rounded-2xl border-2 border-ink bg-card p-3 shadow-[7px_7px_0_var(--color-ink)]">
          <div className="mb-2 flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-paper">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-limepop">AfterClass</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-paper/55">BMSCE live</span>
          </div>
          <ul className="space-y-1">
            {NAV_LINKS.filter(
              (link) => isSignedIn || link.href !== "/dashboard"
            ).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  scroll
                  onClick={() => setOpen(false)}
                  className="display block min-h-12 rounded-xl px-4 py-3 text-2xl active:bg-limepop"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
