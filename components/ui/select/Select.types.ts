import type * as SelectPrimitive from "@radix-ui/react-select"

export type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}
