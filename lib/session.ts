import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * The session user as this app needs it. `slug` and `usn` come from the
 * `additionalFields` configured on the Better Auth user model in `lib/auth.ts`.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  slug: string;
  usn: string | null;
}

/**
 * Reads the Better Auth session on the server. Returns `null` when signed out
 * (or when auth is misconfigured locally) so pages can render a signed-out UI
 * instead of crashing.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as
      | (Record<string, unknown> & { id: string; name: string; email: string })
      | undefined;

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: (user.image as string | null) ?? null,
      slug: (user.slug as string | undefined) ?? "",
      usn: (user.usn as string | null) ?? null,
    };
  } catch (error) {
    console.error("getSessionUser error:", error);
    return null;
  }
}
