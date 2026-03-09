"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const { dictionary, lang, isRTL } = useDictionary()
  const t = dictionary.errors.notFound

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 lg:p-10">
      <div
        className={cn(
          "w-full max-w-5xl bg-card rounded-2xl shadow-lg border border-border",
          "dark:shadow-[0_10px_15px_-3px_rgb(255,255,255,0.05),0_4px_6px_-4px_rgb(255,255,255,0.05)]",
          "overflow-hidden flex flex-col lg:flex-row",
          "min-h-100 lg:min-h-125"
        )}
      >
        {/* Decorative panel */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 bg-[#eaf0fd] p-10 lg:w-1/2",
            "dark:bg-primary/10",
            isRTL ? "rounded-r-2xl" : "rounded-l-2xl"
          )}
        >
          <div className="flex size-28 items-center justify-center rounded-full bg-primary/15">
            <Icon icon="solar:ghost-bold-duotone" className="size-16 text-primary" />
          </div>
          <span className="text-8xl font-extrabold tracking-tighter text-primary/80">
            404
          </span>
        </div>

        {/* Content panel */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 lg:p-12 text-center lg:w-1/2">
          <div className="space-y-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base text-balance leading-relaxed">
              {t.description}
            </p>
          </div>

          <Button asChild size="lg" className="mt-2">
            <Link href={`/${lang}`}>
              <Icon icon="solar:home-2-bold" className="size-5 ltr:mr-2 rtl:ml-2" />
              {t.backHome}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
