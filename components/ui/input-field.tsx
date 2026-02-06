import * as React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Label } from "./label"

interface InputFieldProps extends Omit<React.ComponentProps<typeof Input>, 'endIcon'> {
  label?: string
  error?: string
  success?: boolean
  helperText?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  containerClassName?: string
}

function InputField({
  label,
  error,
  success,
  helperText,
  showSuccessIcon = true,
  showErrorIcon = true,
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

  // For password inputs, the eye toggle is built into Input — skip endIcon override
  let endIcon: React.ReactNode = null
  let endIconClassName = "text-muted-foreground"

  if (!isPassword) {
    if (hasSuccess && showSuccessIcon) {
      endIcon = <Icon icon="solar:check-circle-bold" className="size-4" />
      endIconClassName = "text-success"
    } else if (hasError && showErrorIcon) {
      endIcon = <Icon icon="solar:danger-circle-bold" className="size-4" />
      endIconClassName = "text-destructive"
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        type={type}
        data-success={hasSuccess || undefined}
        data-error={hasError || undefined}
        aria-invalid={hasError}
        startIcon={startIcon}
        endIcon={endIcon}
        iconClassName={endIcon ? endIconClassName : iconClassName}
        className={className}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

export { InputField }
