"use client"

import * as React from "react"
import {
  usePhoneInput,
  CountrySelector,
  defaultCountries,
  parseCountry,
} from "react-international-phone"
import "react-international-phone/style.css"
import { Label } from "./label"
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
  value: externalValue,
  onChange,
  placeholder,
  error = false,
  success = false,
  disabled = false,
  required = false,
  className,
}: PhoneInputFieldProps) {
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

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
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
        <div className="react-international-phone-input-container">
          <CountrySelector
            selectedCountry={country.iso2}
            onSelect={(c) => setCountry(c.iso2)}
            countries={countries}
            disabled={disabled}
          />
          <input
            ref={inputRef}
            type="tel"
            value={inputValue}
            onChange={handlePhoneValueChange}
            placeholder={placeholder}
            disabled={disabled}
            className="react-international-phone-input"
          />
        </div>
      </div>
    </div>
  )
}

// Block parent re-renders: only re-render when visual/behaviour props change.
const PhoneInputField = React.memo(PhoneInputFieldInner, (prev, next) => {
  return (
    prev.label === next.label &&
    prev.disabled === next.disabled &&
    prev.error === next.error &&
    prev.success === next.success &&
    prev.required === next.required &&
    prev.className === next.className &&
    prev.placeholder === next.placeholder
  )
})

export { PhoneInputField }
