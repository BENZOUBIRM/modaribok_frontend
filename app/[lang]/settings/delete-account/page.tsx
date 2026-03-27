"use client"

import { useDictionary } from "@/providers/dictionary-provider"

export default function SettingsDeleteAccountPage() {
  const { dictionary, lang } = useDictionary()
  const comingSoon = lang === "ar" ? "قريبًا" : "Coming soon"

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold mb-2 text-destructive">{dictionary.profile.menu.deleteAccount}</h1>
        <p className="text-sm text-muted-foreground">{comingSoon}</p>
      </div>
    </div>
  )
}
