"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "type"> {
  pendingLabel?: string;
}

/**
 * Submit button that reads the enclosing form's pending state, so server
 * actions get a disabled + spinner treatment for free.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Working…",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
