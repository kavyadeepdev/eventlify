import { createAuthClient } from "better-auth/react";

/**
 * Leaving `baseURL` unset makes the client call the origin it's served from,
 * which keeps sign-in working on any port and in deployed environments. Set
 * NEXT_PUBLIC_BETTER_AUTH_URL only when auth lives on a different origin.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
