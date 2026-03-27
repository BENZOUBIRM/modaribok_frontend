import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import type { SpinnerProps, SpinnerTone } from "./Spinner.types"

const toneClasses: Record<SpinnerTone, string> = {
  inherit: "text-current",
  primary: "text-primary",
  muted: "text-muted-foreground",
  inverse: "text-white dark:text-black",
  success: "text-emerald-500 dark:text-emerald-400",
  warning: "text-amber-500 dark:text-amber-400",
  danger: "text-destructive",
}

function Spinner({ className, tone = "inherit", ...props }: SpinnerProps) {
  return (
    <Icon
      icon="svg-spinners:gooey-balls-2"
      role="status"
      aria-label="Loading"
      className={cn("size-4", toneClasses[tone], className)}
      {...props}
    />
  )
}

export { Spinner }
