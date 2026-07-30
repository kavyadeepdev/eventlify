"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/app/lib/auth-client";
import Image from "next/image";

const Header = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const handleSignOut = async () => {
    const res = await authClient.signOut();
    return res;
  };
  return (
    <header className="flex justify-between mx-40 py-6">
      <div>
        <h1>Event App</h1>
      </div>
      <nav>
        {session ? (
          <Button onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <div>
            <Link href={"/login"}>
              <Button>Login</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
