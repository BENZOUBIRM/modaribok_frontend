"use client"

import * as React from "react"
import {
  usePhoneInput,
  CountrySelector,
  defaultCountries,
  parseCountry,
} from "react-international-phone"
import "react-international-phone/style.css"
import { Icon } from "@iconify/react"
import { Label } from "../primitives/label"
import { ValidationTooltip } from "../validation-tooltip"
import { cn } from "@/lib/utils"

interface PhoneInputFieldProps {
  label?: string
  /** HTML id for the input — used by <Label htmlFor> */
  id?: string
  value: string
  onChange: (phone: string) => void
  /** Called when the input loses focus (needed for RHF "touched" tracking) */
  onBlur?: () => void
  /** Reports the current country dial code whenever country changes */
  onDialCodeChange?: (dialCode: string) => void
  placeholder?: string
  error?: boolean
  /** Error message shown in tooltip on hover of the error icon */
  errorMessage?: string
  success?: boolean
  /** Success message shown in tooltip on hover of the success icon */
  successMessage?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

/*
 * Country whitelist — reduces dial-code matching from 240+ to ~22.
 * Computed once at module level (never re-created).
 */
const ALLOWED = new Set([
  // North Africa
  "ma", "dz", "tn", "ly", "eg",
  // Middle East
  "sa", "ae", "qa", "kw", "bh", "om", "jo", "lb", "iq", "ps", "tr",
  // Europe (popular)
  "fr", "de", "es", "it", "gb", "nl", "be", "ch", "pt", "se",
  // Americas
  "us", "ca",
])

const PREFERRED = ["ma", "dz", "sa", "ae", "us", "fr"]

const countries = defaultCountries
  .filter((c) => {
    const { iso2 } = parseCountry(c)
    return ALLOWED.has(iso2)
  })
  .sort((a, b) => {
    const aPreferred = PREFERRED.indexOf(parseCountry(a).iso2)
    const bPreferred = PREFERRED.indexOf(parseCountry(b).iso2)
    // Preferred countries first (in order), rest after
    if (aPreferred !== -1 && bPreferred !== -1) return aPreferred - bPreferred
    if (aPreferred !== -1) return -1
    if (bPreferred !== -1) return 1
    return 0
  })

/**
 * Phone input with country flags & dial codes.
 *
 * Uses `usePhoneInput` hook + native <input> instead of the heavy
 * composite `<PhoneInput>` component. This avoids re-rendering the
 * full country dropdown / flag list on every keystroke.
 *
 * The hook processes dial-code matching internally, but React only
 * reconciles a plain <input> element (near-zero cost) + a lightweight
 * CountrySelector that only re-renders when the *country* changes.
 */
function PhoneInputFieldInner({
  label,
  id,
  value: externalValue,
  onChange,
  onBlur,
  onDialCodeChange,
  placeholder,
  error = false,
  errorMessage,
  success = false,
  successMessage,
  disabled = false,
  required = false,
  className,
}: PhoneInputFieldProps) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  // Stable ref for the parent callback — never causes re-renders.
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "ma",
      countries,
      value: externalValue,
      onChange: (data) => {
        onChangeRef.current(data.phone)
      },
    })

  // Report dial code whenever country changes
  const onDialCodeChangeRef = React.useRef(onDialCodeChange)
  React.useEffect(() => {
    onDialCodeChangeRef.current = onDialCodeChange
  })
  React.useEffect(() => {
    onDialCodeChangeRef.current?.(country.dialCode)
  }, [country.dialCode])

  // Build validation icon with tooltip
  let validationIcon: React.ReactNode = null
  if (error) {
    const icon = (
      <span className="text-destructive">
        <Icon icon="solar:danger-circle-bold" className="size-4" />
      </span>
    )
    validationIcon = errorMessage ? (
      <ValidationTooltip content={errorMessage} variant="error" anchor="fixed-end">
        {icon}
      </ValidationTooltip>
    ) : icon
  } else if (success) {
    const icon = (
      <span className="text-success">
        <Icon icon="solar:check-circle-bold" className="size-4" />
      </span>
    )
    validationIcon = successMessage ? (
      <ValidationTooltip content={successMessage} variant="success" anchor="fixed-end">
        {icon}
      </ValidationTooltip>
    ) : icon
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required && (
            <span className="text-destructive ltr:ml-1 rtl:mr-1">*</span>
          )}
        </Label>
      )}
      <div
        className={cn(
          "phone-input-wrapper",
          error && "phone-input-error",
          success && "phone-input-success",
        )}
      >
        <div className="react-international-phone-input-container relative">
          <CountrySelector
            selectedCountry={country.iso2}
            onSelect={(c) => setCountry(c.iso2)}
            countries={countries}
            disabled={disabled}
          />
          <input
            ref={inputRef}
            id={inputId}
            type="tel"
            value={inputValue}
            onChange={handlePhoneValueChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="react-international-phone-input"
          />
          {validationIcon && (
            <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
              {validationIcon}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Block parent re-renders: only re-render when visual/behaviour props change.
const PhoneInputField = React.memo(PhoneInputFieldInner, (prev, next) => {
  return (
    prev.label === next.label &&
    prev.id === next.id &&
    prev.disabled === next.disabled &&
    prev.error === next.error &&
    prev.errorMessage === next.errorMessage &&
    prev.success === next.success &&
    prev.successMessage === next.successMessage &&
    prev.required === next.required &&
    prev.className === next.className &&
    prev.placeholder === next.placeholder &&
    prev.onBlur === next.onBlur &&
    prev.onDialCodeChange === next.onDialCodeChange
  )
})

export { PhoneInputField }
