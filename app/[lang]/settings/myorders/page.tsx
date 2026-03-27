"use client"

import { useDictionary } from "@/providers/dictionary-provider"
import { Spinner } from "@/components/ui/spinner"

export default function SettingsMyOrdersPage() {
  const { dictionary } = useDictionary()

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{dictionary.profile.sections.orders}</h1>
        <div className="flex items-center justify-center py-2">
          <Spinner className="size-7" />
        </div>
      </div>
    </div>
  )
}
