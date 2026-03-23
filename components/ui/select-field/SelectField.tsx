import * as React from "react"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/label"
import { ValidationTooltip } from "../validation-tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"

interface SelectOption {
  value: string
  label: React.ReactNode
}

interface SelectFieldProps {
  label?: string
  placeholder?: string
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
  success?: boolean
  tooltipContent?: React.ReactNode
  tooltipVariant?: "error" | "success"
  containerClassName?: string
  triggerClassName?: string
}

export function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  error,
  success,
  tooltipContent,
  tooltipVariant,
  containerClassName,
  triggerClassName,
}: SelectFieldProps) {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  const resolvedVariant = tooltipVariant ?? (hasError ? "error" : "success")
  const resolvedTooltip = tooltipContent ?? (hasError ? error : undefined)

  let validationIcon: React.ReactNode = null
  if (hasSuccess) {
    validationIcon = <Icon icon="solar:check-circle-bold" className="size-4" />
  } else if (hasError) {
    validationIcon = <Icon icon="solar:danger-circle-bold" className="size-4" />
  }

  const validationElement = validationIcon ? (
    resolvedTooltip ? (
      <ValidationTooltip content={resolvedTooltip} variant={resolvedVariant}>
        <span className={cn(hasError ? "text-destructive" : "text-success")}>{validationIcon}</span>
      </ValidationTooltip>
    ) : (
      <span className={cn(hasError ? "text-destructive" : "text-success")}>{validationIcon}</span>
    )
  ) : null

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            className={cn(
              "w-full h-9 bg-transparent border-field-border",
              hasError && "border-destructive",
              hasSuccess && "border-success",
              validationElement && "ltr:pr-14 rtl:pl-14",
              triggerClassName,
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {validationElement && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-60 pointer-events-none",
              "ltr:right-10 rtl:left-10",
            )}
          >
            {validationElement}
          </div>
        )}
      </div>
    </div>
  )
}
