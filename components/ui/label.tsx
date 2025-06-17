import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-medium leading-6 text-foreground mb-1",
        className
      )}
      {...props}
    />
  )
}

export { Label }