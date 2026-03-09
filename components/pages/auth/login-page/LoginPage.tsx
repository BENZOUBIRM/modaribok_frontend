"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { AuthCardLayout } from "@/components/pages/auth/auth-card-layout"
import { InputField } from "@/components/ui/input-field"
import { Button } from "@/components/ui/button"
import type { LoginFormData } from "@/lib/validations/auth"
import { getLoginRules } from "@/lib/validations/auth"
import { useRetriggerOnLangChange } from "@/hooks/use-retrigger-on-lang-change"

/** Backend OAuth2 authorization URL for Google */
const GOOGLE_OAUTH2_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api")
    .replace(/\/api$/, "") + "/oauth2/authorization/google"

function LoginPage() {
  const { dictionary, lang, isRTL } = useDictionary()
  const { login } = useAuth()
  const router = useRouter()
  const t = dictionary.auth.login
  const v = dictionary.auth.validation

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<LoginFormData>({
    mode: "onChange",
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  })

  const rules = getLoginRules(v)

  // Re-trigger validation after client-side language switch
  useRetriggerOnLangChange(errors, trigger)

  // Prevent Chrome from auto-filling fields on page load.
  // Fields start readOnly; when the user clicks/focuses, readOnly is removed
  // and Chrome shows the saved-credentials dropdown instead.
  const [readOnly, setReadOnly] = React.useState(true)
  const handleFocus = () => { if (readOnly) setReadOnly(false) }

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    const result = await login({ emailOrPhone: data.emailOrPhone, password: data.password })

    if (result.success && result.user) {
      // Redirect — success toast is handled by the global interceptor
      if (result.user.role === "ADMIN") {
        router.push(`/${lang}/dashboard`)
      } else {
        router.push(`/${lang}`)
      }
    }
    // Error toasts are handled automatically by the global interceptor
  }

  /** Determine field state for InputField props */
  const fieldState = (name: keyof LoginFormData) => {
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
        {/* Email Field */}
        <div className="mb-5">
          <InputField
            label={t.emailOrUsername}
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

        {/* Password Field */}
        <div className="mb-5">
          <InputField
            label={t.password}
            placeholder={t.passwordPlaceholder}
            type="password"
            autoComplete="current-password"
            readOnly={readOnly}
            onFocus={handleFocus}
            disabled={isSubmitting}
            className="h-11 text-base"
            {...register("password", rules.password)}
            {...fieldState("password")}
          />
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-end mb-8">
          <Link
            href={`/${lang}/forgot-password`}
            className="text-sm text-primary hover:underline cursor-pointer"
            tabIndex={isSubmitting ? -1 : undefined}
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-lg mb-5"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t.loginButton}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-4 text-muted-foreground">
            {t.orContinueWith}
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className={cn("flex items-center justify-center gap-4 mb-5")}>
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

      {/* Signup Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t.noAccount}{" "}
        <Link
          href={`/${lang}/signup`}
          className="text-primary hover:underline font-medium"
        >
          {t.signupLink}
        </Link>
      </p>
    </AuthCardLayout>
  )
}

export { LoginPage }
