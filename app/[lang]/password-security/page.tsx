"use client"

import { useDictionary } from "@/providers/dictionary-provider"

export default function PasswordSecurityPage() {
  const { dictionary, lang } = useDictionary()
  const comingSoon = lang === "ar" ? "قريبًا" : "Coming soon"

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{dictionary.profile.menu.passwordSecurity}</h1>
        <p className="text-sm text-muted-foreground">{comingSoon}</p>
      </div>
    </div>
  )
}
