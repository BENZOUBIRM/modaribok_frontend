import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { useLanguage } from "@/i18n/LanguageContext"
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

export function PhoneInputField({
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
  const { isRTL } = useLanguage()

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(isRTL && "font-arabic")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "phone-input-wrapper",
          error && "phone-input-error",
          success && "phone-input-success"
        )}
      >
        <PhoneInput
          defaultCountry="ma"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          inputClassName={cn(isRTL && "font-arabic")}
          countrySelectorStyleProps={{
            buttonClassName: cn(isRTL && "font-arabic"),
          }}
          preferredCountries={["ma", "ae", "sa", "us", "gb"]}
        />
      </div>
    </div>
  )
}
