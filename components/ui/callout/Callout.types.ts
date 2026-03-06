import type { VariantProps } from "class-variance-authority"
import type { calloutVariants } from "./Callout"

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  title?: string
  icon?: string
}
