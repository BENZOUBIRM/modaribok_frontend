import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "rounded-lg border-2 border-dashed p-4",
  {
    variants: {
      variant: {
        info: "border-accent/50 bg-accent/5 dark:border-accent/40 dark:bg-accent/10",
        success:
          "border-success/50 bg-success/5 dark:border-success/40 dark:bg-success/10",
        warning:
          "border-warning/50 bg-warning/5 dark:border-warning/40 dark:bg-warning/10",
        error:
          "border-destructive/50 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconMap = {
  info: "solar:lightbulb-bolt-bold",
  success: "solar:check-circle-bold",
  warning: "solar:danger-triangle-bold",
  error: "solar:close-circle-bold",
} as const

const iconColorMap = {
  info: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
} as const

interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  title?: string
  icon?: string
}

function Callout({
  className,
  variant = "info",
  title,
  icon,
  children,
  ...props
}: CalloutProps) {
  const resolvedVariant = variant ?? "info"
  const resolvedIcon = icon ?? iconMap[resolvedVariant]

  return (
    <div className={cn(calloutVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-3">
        <Icon
          icon={resolvedIcon}
          className={cn("size-5 shrink-0 mt-0.5", iconColorMap[resolvedVariant])}
        />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground text-sm mb-1">
              {title}
            </h4>
          )}
          {children && (
            <div className="text-xs text-muted-foreground">{children}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const MemoizedCallout = React.memo(Callout)

export { MemoizedCallout as Callout, calloutVariants }
