import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper",
        secondary: "bg-zest text-ink",
        accent: "bg-grape text-white",
        lime: "bg-limepop text-ink",
        punch: "bg-punch text-white",
        destructive: "bg-flame text-white",
        outline: "bg-card text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
