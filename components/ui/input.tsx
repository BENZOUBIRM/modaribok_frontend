import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  iconClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, iconClassName, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative w-full">
          {startIcon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground",
                iconClassName
              )}
            >
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-transparent border-field-border h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground md:text-sm",
              "hover:border-primary/50 focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30 aria-invalid:border-destructive aria-invalid:hover:border-destructive",
              "data-[success=true]:border-success data-[success=true]:ring-success/20 data-[success=true]:ring-[2px] data-[success=true]:hover:border-success",
              "data-[error=true]:border-destructive data-[error=true]:ring-destructive/20 data-[error=true]:ring-[2px] data-[error=true]:hover:border-destructive",
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground",
                iconClassName
              )}
            >
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-transparent border-field-border h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground md:text-sm",
          "hover:border-primary/50 focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30 aria-invalid:border-destructive aria-invalid:hover:border-destructive",
          "data-[success=true]:border-success data-[success=true]:ring-success/20 data-[success=true]:ring-[2px] data-[success=true]:hover:border-success",
          "data-[error=true]:border-destructive data-[error=true]:ring-destructive/20 data-[error=true]:ring-[2px] data-[error=true]:hover:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
