/**
 * Shared shape for server action results.
 *
 * This lives outside `lib/actions.ts` on purpose: a `"use server"` module may
 * only export async functions, so the state type and its initial value can't
 * be exported from there.
 */
export interface ActionState {
  ok: boolean;
  message: string | null;
  error: string | null;
}

export const idleState: ActionState = { ok: false, message: null, error: null };
