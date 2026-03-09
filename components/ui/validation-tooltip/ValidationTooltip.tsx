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
  /**
   * Bubble anchor strategy.
   * - "auto" (default): direction-aware (right in LTR, left in RTL)
   * - "fixed-end": always anchors right — use when the icon is at
   *   physical right regardless of direction (e.g. phone input).
   */
  anchor?: "auto" | "fixed-end"
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
  anchor = "auto",
  className,
}: ValidationTooltipProps) {
  return (
    <span className={cn(styles.tooltip, className)}>
      {children}
      <span
        className={cn(
          styles.bubble,
          variant === "error" ? styles.error : styles.success,
          anchor === "fixed-end" && styles.bubbleFixedEnd,
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
