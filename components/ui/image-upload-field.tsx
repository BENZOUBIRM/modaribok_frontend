"use client"

import * as React from "react"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"

interface ImageUploadFieldProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  value?: File | null
  onChange?: (file: File | null) => void
  disabled?: boolean
  className?: string
}

function ImageUploadField({
  label,
  accept = ".png,.jpg,.jpeg",
  maxSizeMB = 5,
  value,
  onChange,
  disabled = false,
  className,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Generate preview URL when value changes
  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null)
  }, [value])

  const acceptedFormats = accept
    .split(",")
    .map((f) => f.trim().replace(".", ""))
    .join(", ")

  const handleFile = (file: File) => {
    // Validate type
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!accept.split(",").some((a) => a.trim() === ext)) {
      return
    }
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return
    }
    onChange?.(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        title="Upload image"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          "border-primary/40 hover:border-primary/60 bg-primary/5",
          isDragging && "border-primary bg-primary/5",
          disabled && "pointer-events-none opacity-50",
          preview && "p-3"
        )}
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="size-20 rounded-full object-cover ring-2 ring-primary/20"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute -top-1 ltr:-right-1 rtl:-left-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/80 transition-colors"
            >
              <Icon icon="solar:close-circle-bold" className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Icon
                icon="solar:camera-add-bold"
                className="size-5 text-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {label ?? `(${acceptedFormats})`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export { ImageUploadField }
