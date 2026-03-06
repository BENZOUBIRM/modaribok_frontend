export interface ImageUploadFieldProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  value?: File | null
  onChange?: (file: File | null) => void
  disabled?: boolean
  className?: string
}
