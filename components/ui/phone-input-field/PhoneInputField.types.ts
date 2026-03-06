export interface PhoneInputFieldProps {
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
