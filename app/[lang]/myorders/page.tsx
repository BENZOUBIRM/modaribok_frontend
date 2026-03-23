"use client"

import { useDictionary } from "@/providers/dictionary-provider"

export default function MyOrdersPage() {
  const { dictionary } = useDictionary()

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{dictionary.profile.sections.orders}</h1>
        <p className="text-sm text-muted-foreground">{dictionary.common.loading}</p>
      </div>
    </div>
  )
}
