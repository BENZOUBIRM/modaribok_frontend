"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import { AuthCardLayout } from "@/components/pages/auth/auth-card-layout"
import { InputField } from "@/components/ui/input-field"
import { Button } from "@/components/ui/button"
import { forgotPassword } from "@/services/api/auth.service"
import type { ForgotPasswordFormData } from "@/lib/validations/auth"
import { getForgotPasswordRules } from "@/lib/validations/auth"
import { useRetriggerOnLangChange } from "@/hooks/use-retrigger-on-lang-change"
import type { ForgotPasswordData } from "@/types/auth"

function ForgotPasswordPage() {
  const { dictionary, lang, isRTL } = useDictionary()
  const t = dictionary.auth.forgotPassword
  const v = dictionary.auth.validation

  const [successData, setSuccessData] = React.useState<ForgotPasswordData | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ForgotPasswordFormData>({
    mode: "onChange",
    defaultValues: { emailOrPhone: "" },
  })

  const rules = getForgotPasswordRules(v)

  // Re-trigger validation after client-side language switch
  useRetriggerOnLangChange(errors, trigger)

  // Chrome autofill prevention (same pattern as LoginPage)
  const [readOnly, setReadOnly] = React.useState(true)
  const handleFocus = () => { if (readOnly) setReadOnly(false) }

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await forgotPassword(data.emailOrPhone.trim())

    if (result.success && result.data) {
      setSuccessData(result.data)
    }
    // Error toasts handled by global interceptor
  }

  const handleTryAgain = () => {
    setSuccessData(null)
  }

  /** Field state helper (same pattern as LoginPage) */
  const fieldState = (name: keyof ForgotPasswordFormData) => {
    const error = errors[name]?.message
    const dirty = dirtyFields[name]
    const valid = dirty && !error
    return {
      error: error ?? undefined,
      success: valid,
      tooltipContent: error ?? (valid ? v.looksGood : undefined),
      tooltipVariant: (error ? "error" : "success") as "error" | "success",
    }
  }

  /* ── Success state ── */
  if (successData) {
    const isEmail = successData.sentVia === "email"
    const messageLabel = isEmail ? t.successMessageEmail : t.successMessageWhatsapp

    return (
      <AuthCardLayout formClassName="p-8 lg:p-12">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 mb-6">
            <Icon
              icon={isEmail ? "solar:letter-bold" : "solar:chat-round-dots-bold"}
              className="size-8 text-green-600 dark:text-green-400"
            />
          </span>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {t.successTitle}
          </h1>
          <p className="text-muted-foreground text-base mb-2">
            {messageLabel}
          </p>
          <p className="text-foreground font-semibold text-base mb-4" dir="ltr">
            {successData.sentTo}
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            {t.successNote}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTryAgain}
            >
              {t.tryAgain}
            </Button>
            <Link
              href={`/${lang}/login`}
              className="text-sm text-primary hover:underline font-medium text-center"
            >
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </AuthCardLayout>
    )
  }

  /* ── Form state ── */
  return (
    <AuthCardLayout formClassName="p-8 lg:p-12">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-muted-foreground text-base">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email / Phone Field */}
        <div className="mb-6">
          <InputField
            label={t.emailOrPhone}
            placeholder={t.emailPlaceholder}
            type="text"
            autoComplete="username"
            readOnly={readOnly}
            onFocus={handleFocus}
            disabled={isSubmitting}
            className="h-11 text-base"
            {...register("emailOrPhone", rules.emailOrPhone)}
            {...fieldState("emailOrPhone")}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-lg mb-5"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t.submitButton}
        </Button>
      </form>

      {/* Back to Login */}
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={`/${lang}/login`}
          className="text-primary hover:underline font-medium"
        >
          <Icon
            icon={isRTL ? "solar:arrow-right-linear" : "solar:arrow-left-linear"}
            className="inline size-4 align-text-bottom ltr:mr-1 rtl:ml-1"
          />
          {t.backToLogin}
        </Link>
      </p>
    </AuthCardLayout>
  )
}

export { ForgotPasswordPage }
