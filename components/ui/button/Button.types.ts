import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "./Button"

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  iconClassName?: string
  loading?: boolean
  divided?: boolean
}
