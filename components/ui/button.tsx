import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[transform,box-shadow] cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:border-primary/90 dark:hover:bg-primary/80",
        destructive:
          "bg-destructive text-white border border-destructive hover:bg-destructive/90 hover:border-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/90 dark:hover:bg-destructive/80",
        outline:
          "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground hover:border-border dark:bg-transparent dark:border-border dark:hover:bg-white/10 dark:hover:border-border dark:hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/80 hover:border-secondary/80 dark:hover:bg-secondary/70",
        accent:
          "bg-accent text-accent-foreground border border-accent hover:bg-accent/90 hover:border-accent/90 dark:hover:bg-accent/80",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  iconClassName?: string
  loading?: boolean
  divided?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      startIcon,
      endIcon,
      iconClassName,
      loading,
      divided,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading
    const hasIcon = startIcon || endIcon || loading

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size }),
          divided && "gap-0 px-0",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span
              className={cn(
                "inline-flex items-center shrink-0",
                divided && "border-r border-white/20 dark:border-black/20",
                divided && size === "xs" && "px-1.5 h-full",
                divided && size === "sm" && "px-2 h-full",
                divided && size === "default" && "px-3 h-full",
                divided && size === "lg" && "px-4 h-full",
                iconClassName
              )}
            >
              <Spinner className="size-4" />
            </span>
            <span
              className={cn(
                divided && size === "xs" && "px-1.5",
                divided && size === "sm" && "px-2.5",
                divided && size === "default" && "px-3",
                divided && size === "lg" && "px-5"
              )}
            >
              {children}
            </span>
          </>
        ) : (
          <>
            {startIcon && divided ? (
              <>
                <span
                  className={cn(
                    "inline-flex items-center shrink-0",
                    "border-r border-white/20 dark:border-black/20",
                    size === "xs" && "px-1.5 h-full",
                    size === "sm" && "px-2 h-full",
                    size === "default" && "px-3 h-full",
                    size === "lg" && "px-4 h-full",
                    iconClassName
                  )}
                >
                  {startIcon}
                </span>
                <span
                  className={cn(
                    size === "xs" && "px-1.5",
                    size === "sm" && "px-2.5",
                    size === "default" && "px-3",
                    size === "lg" && "px-5"
                  )}
                >
                  {children}
                </span>
              </>
            ) : startIcon ? (
              <>
                <span className={cn("inline-flex shrink-0", iconClassName)}>
                  {startIcon}
                </span>
                {children}
              </>
            ) : null}

            {!startIcon && children && !divided && children}

            {!startIcon && children && divided && (
              <span
                className={cn(
                  size === "xs" && "px-2",
                  size === "sm" && "px-3",
                  size === "default" && "px-4",
                  size === "lg" && "px-6"
                )}
              >
                {children}
              </span>
            )}

            {endIcon && divided ? (
              <>
                {!startIcon && (
                  <span
                    className={cn(
                      size === "xs" && "px-1.5",
                      size === "sm" && "px-2.5",
                      size === "default" && "px-3",
                      size === "lg" && "px-5"
                    )}
                  >
                    {children}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center shrink-0",
                    "border-l border-white/20 dark:border-black/20",
                    size === "xs" && "px-1.5 h-full",
                    size === "sm" && "px-2 h-full",
                    size === "default" && "px-3 h-full",
                    size === "lg" && "px-4 h-full",
                    iconClassName
                  )}
                >
                  {endIcon}
                </span>
              </>
            ) : endIcon ? (
              <>
                {!startIcon && children}
                <span className={cn("inline-flex shrink-0", iconClassName)}>
                  {endIcon}
                </span>
              </>
            ) : null}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
