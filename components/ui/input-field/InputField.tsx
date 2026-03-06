import * as React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { Input } from "../input"
import { Label } from "../primitives/label"
import { ValidationTooltip } from "../validation-tooltip"

interface InputFieldProps extends Omit<React.ComponentProps<typeof Input>, 'endIcon'> {
  label?: string
  error?: string
  success?: boolean
  helperText?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  /** Rich content to display inside the tooltip bubble (overrides default error text) */
  tooltipContent?: React.ReactNode
  /** Tooltip variant — defaults to "error" when error is set, "success" when success */
  tooltipVariant?: "error" | "success"
  containerClassName?: string
}

function InputField({
  label,
  error,
  success,
  helperText,
  showSuccessIcon = true,
  showErrorIcon = true,
  tooltipContent,
  tooltipVariant,
  containerClassName,
  className,
  id,
  startIcon,
  iconClassName,
  type,
  ...props
}: InputFieldProps) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  const hasError = !!error
  const hasSuccess = success && !hasError
  const isPassword = type === "password"

  // Determine tooltip content & variant
  const resolvedVariant = tooltipVariant ?? (hasError ? "error" : "success")
  const resolvedTooltip = tooltipContent ?? (hasError ? error : undefined)

  // Build the validation icon (if needed)
  let validationIcon: React.ReactNode = null
  if (hasSuccess && showSuccessIcon) {
    validationIcon = (
      <Icon icon="solar:check-circle-bold" className="size-4" />
    )
  } else if (hasError && showErrorIcon) {
    validationIcon = (
      <Icon icon="solar:danger-circle-bold" className="size-4" />
    )
  }

  // Wrap the icon in a tooltip when we have tooltip content
  let validationElement: React.ReactNode = null
  if (validationIcon) {
    if (resolvedTooltip) {
      validationElement = (
        <ValidationTooltip content={resolvedTooltip} variant={resolvedVariant}>
          <span className={cn(hasError ? "text-destructive" : "text-success")}>
            {validationIcon}
          </span>
        </ValidationTooltip>
      )
    } else {
      validationElement = (
        <span className={cn(hasError ? "text-destructive" : "text-success")}>
          {validationIcon}
        </span>
      )
    }
  }

  /*
   * For password inputs the eye toggle is built into <Input>.
   * We place the validation icon to the LEFT of the eye toggle
   * by using a custom overlay rather than the endIcon slot.
   */
  let endIcon: React.ReactNode = null
  let endIconClassName = "text-muted-foreground"

  if (!isPassword && validationElement) {
    // For non-password inputs, use the endIcon slot directly
    endIcon = validationElement
    endIconClassName = hasError ? "text-destructive" : "text-success"
  }

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={inputId}
          type={type}
          data-success={hasSuccess || undefined}
          data-error={hasError || undefined}
          aria-invalid={hasError}
          startIcon={startIcon}
          endIcon={endIcon}
          iconClassName={endIcon ? endIconClassName : iconClassName}
          className={cn(
            // Extra padding for password fields when showing a validation icon
            isPassword && validationElement && "ltr:pr-18 rtl:pl-18",
            className,
          )}
          {...props}
        />
        {/* Password validation icon — positioned left of the eye toggle */}
        {isPassword && validationElement && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10",
              "ltr:right-10 rtl:left-10",
            )}
          >
            {validationElement}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

export { InputField }
