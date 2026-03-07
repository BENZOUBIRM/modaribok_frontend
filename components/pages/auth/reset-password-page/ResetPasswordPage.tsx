"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import { AuthCardLayout } from "@/components/pages/auth/auth-card-layout"
import { InputField } from "@/components/ui/input-field"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { Button } from "@/components/ui/button"
import { resetPassword } from "@/services/api/auth.service"
import type { ResetPasswordFormData } from "@/lib/validations/auth"
import {
  getResetPasswordRules,
  getPasswordRequirements,
  isPasswordValid,
} from "@/lib/validations/auth"

function ResetPasswordPage() {
  const { dictionary, lang, isRTL } = useDictionary()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const t = dictionary.auth.resetPassword
  const v = dictionary.auth.validation

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, isSubmitted, dirtyFields },
  } = useForm<ResetPasswordFormData>({
    mode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const rules = getResetPasswordRules(
    { ...v, passwordMismatch: dictionary.auth.passwordMismatch },
    () => watch("newPassword"),
  )

  const passwordValue = watch("newPassword")
  const passwordReqs = getPasswordRequirements(passwordValue ?? "", v)
  const allPasswordMet = isPasswordValid(passwordValue ?? "")

  // Re-validate confirmPassword whenever newPassword changes
  React.useEffect(() => {
    if (dirtyFields.confirmPassword) {
      trigger("confirmPassword")
    }
  }, [passwordValue, trigger, dirtyFields.confirmPassword])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    const result = await resetPassword(token, data.newPassword, data.confirmPassword)

    if (result.success) {
      // Success toast auto-fired by interceptor (AUTH_RESET_PASSWORD_SUCCESS_030)
      router.push(`/${lang}/login`)
    }
    // Error toasts (invalid/expired/blacklisted token, mismatch) auto-handled by interceptor
  }

  /** Field state helper for new password — shows PasswordRequirements tooltip */
  const newPasswordState = () => {
    const error = errors.newPassword?.message
    const dirty = dirtyFields.newPassword

    if (isSubmitted && !dirty && error) {
      return { error }
    }

    const showReqs = dirty && !allPasswordMet
    return {
      error: showReqs ? " " : undefined,
      success: dirty && allPasswordMet,
      tooltipContent: dirty ? (
        <PasswordRequirements
          title={v.passwordRequirements}
          requirements={passwordReqs}
        />
      ) : undefined,
      tooltipVariant: (showReqs ? "error" : "success") as "error" | "success",
    }
  }

  /** Field state helper for confirm password */
  const confirmPasswordState = () => {
    const error = errors.confirmPassword?.message
    const dirty = dirtyFields.confirmPassword
    const valid = dirty && !error
    return {
      error: error ?? undefined,
      success: valid,
      tooltipContent: error ?? (valid ? v.looksGood : undefined),
      tooltipVariant: (error ? "error" : "success") as "error" | "success",
    }
  }

  /* ── Invalid / missing token state ── */
  if (!token) {
    return (
      <AuthCardLayout formClassName="p-8 lg:p-12">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
            <Icon
              icon="solar:shield-warning-bold"
              className="size-8 text-destructive"
            />
          </span>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {t.invalidLinkTitle}
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            {t.invalidLinkMessage}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href={`/${lang}/forgot-password`}>
              <Button className="w-full">{t.requestNewLink}</Button>
            </Link>
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
        {/* New Password */}
        <div className="mb-5">
          <InputField
            label={t.newPassword}
            placeholder={t.newPasswordPlaceholder}
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="h-11 text-base"
            {...register("newPassword", rules.newPassword)}
            {...newPasswordState()}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <InputField
            label={t.confirmPassword}
            placeholder={t.confirmPasswordPlaceholder}
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="h-11 text-base"
            {...register("confirmPassword", rules.confirmPassword)}
            {...confirmPasswordState()}
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

export { ResetPasswordPage }
