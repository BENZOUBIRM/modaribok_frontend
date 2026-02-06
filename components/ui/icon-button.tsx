import * as React from "react"
import { Button, buttonVariants } from "./button"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "size" | "children">,
    Pick<VariantProps<typeof buttonVariants>, "variant"> {
  icon: React.ReactNode
  size?: "default" | "xs" | "sm" | "lg"
  "aria-label": string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "default", variant = "default", className, ...props }, ref) => {
    // Map regular sizes to icon sizes
    const iconSizeMap = {
      xs: "icon-xs",
      sm: "icon-sm",
      default: "icon",
      lg: "icon-lg",
    } as const

    const iconSize = iconSizeMap[size]

    return (
      <Button
        ref={ref}
        variant={variant}
        size={iconSize}
        className={className}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }
