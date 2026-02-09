"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { LoginPage } from "@/components/pages/auth/LoginPage"

export default function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.lang || "en"}`)
    }
  }, [isAuthenticated, isLoading, router, params.lang])

  if (isLoading || isAuthenticated) return null

  return <LoginPage />
}
