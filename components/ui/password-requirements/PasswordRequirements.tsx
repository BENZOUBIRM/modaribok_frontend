import * as React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import type { PasswordRequirement } from "@/lib/validations/auth"
import styles from "./PasswordRequirements.module.css"

interface PasswordRequirementsProps {
  /** Heading text, e.g. "Password must contain:" */
  title: string
  /** Array of { label, met } requirements */
  requirements: PasswordRequirement[]
  /** Additional class names */
  className?: string
}

/**
 * Checklist showing password requirements with live green-check / grey-circle states.
 * Designed to be used as tooltip content inside ValidationTooltip.
 */
function PasswordRequirements({
  title,
  requirements,
  className,
}: PasswordRequirementsProps) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {requirements.map((req) => (
          <li
            key={req.label}
            className={cn(styles.item, req.met ? styles.met : styles.unmet)}
          >
            <Icon
              icon={
                req.met
                  ? "solar:check-circle-bold"
                  : "solar:close-circle-bold"
              }
              className={cn(
                styles.icon,
                req.met ? styles.iconMet : styles.iconUnmet,
              )}
            />
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { PasswordRequirements }
export type { PasswordRequirementsProps }
