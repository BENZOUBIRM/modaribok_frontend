import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./ValidationTooltip.module.css"

interface ValidationTooltipProps {
  /** The content shown inside the tooltip bubble */
  content: React.ReactNode
  /** Visual variant — controls bubble color */
  variant: "error" | "success"
  /** The trigger element (usually an icon) */
  children: React.ReactNode
  /** Additional class names on the wrapper */
  className?: string
}

/**
 * Hover/focus tooltip that appears above its trigger as a chat-bubble.
 * Pure CSS — no Radix dependency, no JS state.
 */
function ValidationTooltip({
  content,
  variant,
  children,
  className,
}: ValidationTooltipProps) {
  return (
    <span className={cn(styles.tooltip, className)}>
      {children}
      <span
        className={cn(
          styles.bubble,
          variant === "error" ? styles.error : styles.success,
        )}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}

export { ValidationTooltip }
export type { ValidationTooltipProps }
