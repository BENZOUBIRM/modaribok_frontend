import * as React from "react"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/label"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { ValidationTooltip } from "../validation-tooltip"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFieldProps {
  label?: string
  placeholder?: string
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  error?: string
  success?: boolean
  tooltipContent?: React.ReactNode
  tooltipVariant?: "error" | "success"
  containerClassName?: string
}

export function MultiSelectField({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  disabled,
  error,
  success,
  tooltipContent,
  tooltipVariant,
  containerClassName,
}: MultiSelectFieldProps) {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label)

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

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value))
      return
    }
    onChange([...selectedValues, value])
  }

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full h-9 justify-between font-normal",
                !selectedLabels.length && "text-muted-foreground",
                hasError && "border-destructive",
                hasSuccess && "border-success",
                validationElement && "ltr:pr-14 rtl:pl-14",
              )}
              disabled={disabled}
            >
              <span className="truncate text-start">
                {selectedLabels.length
                  ? selectedLabels.join(", ")
                  : placeholder}
              </span>
              <Icon icon="solar:alt-arrow-down-linear" className="size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedValues.includes(option.value)}
                onSelect={() => toggleValue(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
