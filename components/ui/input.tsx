import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border-[3px] border-ink bg-card px-4 py-2 text-base font-medium transition-all outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:shadow-[4px_4px_0_var(--color-grape)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
