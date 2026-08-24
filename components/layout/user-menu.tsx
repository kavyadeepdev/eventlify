"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Ticket } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/shared/avatar";

interface UserMenuProps {
  name: string;
  image: string | null;
  dashboardHref: string;
}

export default function UserMenu({ name, image, dashboardHref }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={dashboardHref}
        className="flex items-center gap-2 rounded-full border-[3px] border-ink bg-card py-1 pl-1 pr-3 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
      >
        <Avatar name={name} image={image} size="sm" className="border-2" />
        <span className="hidden max-w-24 truncate text-xs font-bold uppercase sm:inline">
          {name.split(" ")[0]}
        </span>
        <Ticket className="size-4 sm:hidden" />
      </Link>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleSignOut}
        disabled={signingOut}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
