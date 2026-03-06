import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"

type SpinnerProps = Omit<React.ComponentProps<typeof Icon>, "icon">

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Icon
      icon="svg-spinners:bouncing-ball"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
