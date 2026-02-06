"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { InputField } from "@/components/ui/input-field"
import { PhoneInputField } from "@/components/ui/phone-input-field"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"

function SignupPage() {
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [profileImage, setProfileImage] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { dictionary, lang, isRTL } = useDictionary()
  const t = dictionary.auth.signup

  // Email validation regex
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Handle form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      toast.error(t.errors.firstNameRequired)
      return
    }

    if (!lastName.trim()) {
      toast.error(t.errors.lastNameRequired)
      return
    }

    if (!email.trim()) {
      toast.error(t.errors.emailRequired)
      return
    }

    if (!isValidEmail(email)) {
      toast.error(t.errors.emailInvalid)
      return
    }

    if (!phone.trim() || phone.length < 6) {
      toast.error(t.errors.phoneRequired)
      return
    }

    if (!password.trim()) {
      toast.error(t.errors.passwordRequired)
      return
    }

    if (password.length < 8) {
      toast.error(t.errors.passwordTooShort)
      return
    }

    setIsLoading(true)

    // TODO: connect to backend
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success(t.success)
    setIsLoading(false)
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
            alt="Join Modaribok"
            fill
            objectFit="cover"
            className="object-contain w-[90%] h-[90%] drop-shadow-2xl"
            priority
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center lg:w-1/2 bg-background p-6 lg:p-10 overflow-y-auto">

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t.subtitle}
            </p>
          </div>

          {/* Profile Image Upload */}
          <div className="mb-4">
            <ImageUploadField
              label={t.uploadImage}
              value={profileImage}
              onChange={setProfileImage}
              disabled={isLoading}
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputField
              label={t.firstName}
              placeholder={t.firstNamePlaceholder}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
            <InputField
              label={t.lastName}
              placeholder={t.lastNamePlaceholder}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <InputField
              label={t.email}
              placeholder={t.emailPlaceholder}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Phone Field */}
          <div className="mb-4">
            <PhoneInputField
              label={t.phone}
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={setPhone}
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <InputField
              label={t.password}
              placeholder={t.passwordPlaceholder}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Info Note */}
          <div className="mb-4">
            <Callout variant="info" title={t.noteTitle}>
              {t.noteText}
            </Callout>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-11 text-base mb-4"
            onClick={handleSignup}
            disabled={isLoading}
            loading={isLoading}
          >
            {t.signupButton}
          </Button>

          {/* Divider 
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
          */}

          {/* Social Login Buttons 
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="outline" size="icon-lg" className="rounded-full" disabled>
              <Icon icon="flat-color-icons:google" className="size-5" />
            </Button>
            <Button variant="outline" size="icon-lg" className="rounded-full" disabled>
              <Icon icon="logos:facebook" className="size-5" />
            </Button>
          </div>
          */}
          

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t.haveAccount}{" "}
            <Link
              href={`/${lang}/login`}
              className="text-primary hover:underline font-medium"
            >
              {t.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export { SignupPage }
