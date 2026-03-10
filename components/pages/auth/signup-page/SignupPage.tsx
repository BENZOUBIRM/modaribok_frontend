"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { AuthCardLayout } from "@/components/pages/auth/auth-card-layout"
import { InputField } from "@/components/ui/input-field"
import { PhoneInputField } from "@/components/ui/phone-input-field"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { NavLink } from "@/components/ui/nav-link"
import type { SignupFormData } from "@/lib/validations/auth"
import {
  getSignupRules,
  getPasswordRequirements,
  isPasswordValid,
} from "@/lib/validations/auth"
import { removeDialCode } from "react-international-phone"
import { useRetriggerOnLangChange } from "@/hooks/use-retrigger-on-lang-change"
import { useNavRouter } from "@/hooks/use-nav-router"

/** Backend OAuth2 authorization URL for Google */
const GOOGLE_OAUTH2_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api")
    .replace(/\/api$/, "") + "/oauth2/authorization/google"

/** Check if user has entered enough local digits (ignoring dial code). */
function isPhoneValid(phone: string, dialCode: string): boolean {
  const local = removeDialCode({ phone, dialCode })
  const digits = local.replace(/\D/g, "")
  return digits.length >= 7
}

/** Check if user has entered any local digits beyond the dial code. */
function hasLocalDigits(phone: string, dialCode: string): boolean {
  const local = removeDialCode({ phone, dialCode })
  return local.replace(/\D/g, "").length > 0
}

function SignupPage() {
  const [signupSuccess, setSignupSuccess] = React.useState(false)
  const { dictionary, lang } = useDictionary()
  const { signup } = useAuth()
  const router = useNavRouter()
  const t = dictionary.auth.signup
  const v = dictionary.auth.validation

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors, isSubmitting, isSubmitted, dirtyFields },
  } = useForm<SignupFormData>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      profileImage: null,
    },
  })

  const rules = getSignupRules(v)

  // Re-trigger validation after client-side language switch
  useRetriggerOnLangChange(errors, trigger)

  // Track dial code for phone validation (updated by PhoneInputField callback)
  const dialCodeRef = React.useRef("212")

  // Watch password for live requirements checklist
  const passwordValue = watch("password")
  const passwordReqs = getPasswordRequirements(passwordValue ?? "", v)
  const allPasswordMet = isPasswordValid(passwordValue ?? "")

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    const result = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      profileImage: data.profileImage,
    })

    if (result.success) {
      setSignupSuccess(true)
      // Show success callout for 2 seconds, then redirect to login
      setTimeout(() => {
        router.push(`/${lang}/login`)
      }, 2000)
    }
    // Error toasts are handled automatically by the global interceptor
  }

  /** Determine field state for InputField props */
  const fieldState = (name: keyof Omit<SignupFormData, "phone" | "profileImage">) => {
    const error = errors[name]?.message
    const dirty = dirtyFields[name]
    const valid = dirty && !error

    // Special handling for password: show requirements checklist
    if (name === "password") {
      // After submit, show required error for untouched empty password
      if (isSubmitted && !dirty && error) {
        return { error }
      }
      const showReqs = dirty && !allPasswordMet
      return {
        error: showReqs ? " " : undefined, // non-empty string triggers error styling
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

    return {
      error: error ?? undefined,
      success: valid,
      tooltipContent: error ?? (valid ? v.looksGood : undefined),
      tooltipVariant: (error ? "error" : "success") as "error" | "success",
    }
  }

  // Show success callout after signup (before redirect)
  if (signupSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-lg space-y-6">
          <Callout variant="success" title={t.success}>
            {dictionary.home.signupSuccess}
          </Callout>
        </div>
      </div>
    )
  }

  return (
    <AuthCardLayout formClassName="p-5 lg:p-8 overflow-y-auto">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-lg lg:text-xl font-bold text-foreground mb-1">
          {t.title}
        </h1>
        <p className="text-muted-foreground text-xs">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Profile Image Upload */}
        <div className="mb-3">
          <Controller
            name="profileImage"
            control={control}
            render={({ field }) => (
              <ImageUploadField
                label={t.uploadImage}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <InputField
            label={t.firstName}
            placeholder={t.firstNamePlaceholder}
            autoComplete="given-name"
            disabled={isSubmitting}
            {...register("firstName", rules.firstName)}
            {...fieldState("firstName")}
          />
          <InputField
            label={t.lastName}
            placeholder={t.lastNamePlaceholder}
            autoComplete="family-name"
            disabled={isSubmitting}
            {...register("lastName", rules.lastName)}
            {...fieldState("lastName")}
          />
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <InputField
            label={t.email}
            placeholder={t.emailPlaceholder}
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email", rules.email)}
            {...fieldState("email")}
          />
        </div>

        {/* Phone Field */}
        <div className="mb-3">
          <Controller
            name="phone"
            control={control}
            rules={{
              required: v.phoneRequired,
              validate: (val) => isPhoneValid(val, dialCodeRef.current) || v.phoneInvalid,
            }}
            render={({ field, fieldState: fs }) => {
              const typed = hasLocalDigits(field.value, dialCodeRef.current)
              const hasError = !!fs.error && typed
              const valid = !fs.error && typed
              return (
                <PhoneInputField
                  label={t.phone}
                  placeholder={t.phonePlaceholder}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onDialCodeChange={(dc) => { dialCodeRef.current = dc }}
                  disabled={isSubmitting}
                  error={hasError}
                  errorMessage={fs.error?.message}
                  success={valid}
                  successMessage={v.looksGood}
                />
              )
            }}
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <InputField
            label={t.password}
            placeholder={t.passwordPlaceholder}
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("password", rules.password)}
            {...fieldState("password")}
          />
        </div>

        {/* Info Note */}
        <div className="mb-3">
          <Callout variant="info" title={t.noteTitle}>
            {t.noteText}
          </Callout>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 text-sm mb-3"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t.signupButton}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-4 text-muted-foreground">
            {t.orContinueWith}
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          onClick={() => { window.location.href = GOOGLE_OAUTH2_URL }}
          disabled={isSubmitting}
        >
          <Icon icon="flat-color-icons:google" className="size-5" />
        </Button>
        <Button variant="outline" size="icon-lg" className="rounded-full" disabled>
          <Icon icon="logos:facebook" className="size-5" />
        </Button>
      </div>

      {/* Login Link */}
      <p className="text-center text-xs text-muted-foreground">
        {t.haveAccount}{" "}
        <NavLink
          href={`/${lang}/login`}
          className="text-primary hover:underline font-medium"
        >
          {t.loginLink}
        </NavLink>
      </p>
    </AuthCardLayout>
  )
}

export { SignupPage }
