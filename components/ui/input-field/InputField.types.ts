import type { Input } from "../input"

export interface InputFieldProps extends Omit<React.ComponentProps<typeof Input>, 'endIcon'> {
  label?: string
  error?: string
  success?: boolean
  helperText?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  containerClassName?: string
}
