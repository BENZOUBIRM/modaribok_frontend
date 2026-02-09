"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { SignupPage } from "@/components/pages/auth/SignupPage"

export default function SignupRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.lang || "en"}`)
    }
  }, [isAuthenticated, isLoading, router, params.lang])

  if (isLoading || isAuthenticated) return null

  return <SignupPage />
}
