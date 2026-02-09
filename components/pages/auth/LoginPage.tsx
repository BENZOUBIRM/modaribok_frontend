"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { InputField } from "@/components/ui/input-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

/** URL of the admin dashboard (separate Vite app) */
const ADMIN_DASHBOARD_URL = "http://localhost:5173/dashboard"

function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { dictionary, lang, isRTL } = useDictionary()
  const { login } = useAuth()
  const router = useRouter()
  const t = dictionary.auth.login

  // Map backend error codes → i18n keys
  const resolveErrorMessage = (code?: string, fallback?: string): string => {
    const codeMap: Record<string, string> = {
      AUTH_ERROR_001: t.errors.emailRequired,
      AUTH_ERROR_002: t.errors.passwordRequired,
      AUTH_ERROR_003: t.errors.invalidCredentials,
      AUTH_ERROR_LOCKED: t.errors.accountLocked,
    }
    if (code && codeMap[code]) return codeMap[code]
    if (fallback === "networkError") return t.errors.networkError
    return fallback || t.errors.serverError
  }

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!email.trim()) {
      toast.error(t.errors.emailRequired)
      return
    }

    if (!password.trim()) {
      toast.error(t.errors.passwordRequired)
      return
    }

    setIsLoading(true)

    try {
      const result = await login({ emailOrPhone: email, password })

      if (result.success && result.user) {
        toast.success(t.success)

        // Role-based redirect
        if (result.user.role === "ADMIN") {
          // Redirect admins to the external dashboard
          window.location.href = ADMIN_DASHBOARD_URL
        } else {
          // Normal users stay in the Next.js app
          router.push(`/${lang}`)
        }
      } else {
        // Show translated error
        toast.error(resolveErrorMessage(result.code, result.error))
      }
    } catch {
      toast.error(t.errors.serverError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-background rounded-2xl shadow-lg border border-border dark:shadow-[0_10px_15px_-3px_rgb(255,255,255,0.05),0_4px_6px_-4px_rgb(255,255,255,0.05)] overflow-hidden flex flex-col lg:flex-row min-h-125 lg:min-h-150">

        {/* Left Side - Image */}
        <div
          className={cn(
            "hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#eaf0fd]",
            isRTL ? "rounded-r-2xl" : "rounded-l-2xl"
          )}
        >
          <Image
            src="/images/man-running.png"
            alt="Online personal trainer"
            fill
            objectFit="cover"
            className="object-contain w-[90%] h-[90%] drop-shadow-2xl"
            priority
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center lg:w-1/2 bg-background p-6 lg:p-10">

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t.subtitle}
            </p>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <InputField
              label={t.emailOrUsername}
              placeholder={t.emailPlaceholder}
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <InputField
              label={t.password}
              placeholder={t.passwordPlaceholder}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-end mb-6">
            <button
              className="text-sm text-primary hover:underline cursor-pointer"
              disabled={isLoading}
            >
              {t.forgotPassword}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-11 text-base mb-4"
            onClick={handleLogin}
            disabled={isLoading}
            loading={isLoading}
          >
            {t.loginButton}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">
                {t.orContinueWith}
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className={cn("flex items-center justify-center gap-4 mb-4")}>
            <Button variant="outline" size="icon-lg" className="rounded-full" disabled>
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
        </div>
      </div>
    </div>
  )
}

export { LoginPage }
