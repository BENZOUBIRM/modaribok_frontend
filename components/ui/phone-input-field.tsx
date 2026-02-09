"use client"

import * as React from "react"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface PhoneInputFieldProps {
  label?: string
  value: string
  onChange: (phone: string) => void
  placeholder?: string
  error?: boolean
  success?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Simple phone input — plain <input type="tel"> with LTR direction.
 * Format: "+212 600000000"
 *
 * Replaces the heavy react-international-phone library which
 * caused severe input lag by re-loading all country data on
 * every keystroke.
 */
function PhoneInputFieldInner({
  label,
  value,
  onChange,
  placeholder,
  error = false,
  success = false,
  disabled = false,
  required = false,
  className,
}: PhoneInputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ltr:ml-1 rtl:mr-1">*</span>}
        </Label>
      )}
      <Input
        type="tel"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "+212 600000000"}
        disabled={disabled}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          success && "border-green-500 focus-visible:ring-green-500",
        )}
      />
    </div>
  )
}

const PhoneInputField = React.memo(PhoneInputFieldInner)

export { PhoneInputField }
