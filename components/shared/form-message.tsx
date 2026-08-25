import { CircleAlert, CircleCheck } from "lucide-react";
import { ActionState } from "@/lib/action-state";

/** Renders the success / error line returned by a server action. */
export default function FormMessage({ state }: { state?: ActionState }) {
  if (!state) return null;

  if (state.error) {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-xl border-2 border-ink bg-flame px-3 py-2 text-sm font-semibold text-white"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" />
        {state.error}
      </p>
    );
  }

  if (state.message) {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-xl border-2 border-ink bg-limepop px-3 py-2 text-sm font-semibold text-ink"
      >
        <CircleCheck className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    );
  }

  return null;
}
