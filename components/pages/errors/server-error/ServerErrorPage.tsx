"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Button } from "@/components/ui/button"

interface ServerErrorPageProps {
  reset?: () => void
}

export function ServerErrorPage({ reset }: ServerErrorPageProps) {
  const { dictionary, lang, isRTL } = useDictionary()
  const t = dictionary.errors.serverError

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
            "flex flex-col items-center justify-center gap-4 bg-red-50 p-10 lg:w-1/2",
            "dark:bg-destructive/10",
            isRTL ? "rounded-r-2xl" : "rounded-l-2xl"
          )}
        >
          <div className="flex size-28 items-center justify-center rounded-full bg-destructive/15">
            <Icon icon="solar:server-bold-duotone" className="size-16 text-destructive" />
          </div>
          <span className="text-8xl font-extrabold tracking-tighter text-destructive/80">
            500
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

          <div className="flex items-center gap-3 mt-2">
            {reset && (
              <Button onClick={reset} variant="outline" size="lg">
                <Icon icon="solar:refresh-bold" className="size-5 ltr:mr-2 rtl:ml-2" />
                {t.retry}
              </Button>
            )}
            <Button asChild size="lg">
              <Link href={`/${lang}`}>
                <Icon icon="solar:home-2-bold" className="size-5 ltr:mr-2 rtl:ml-2" />
                {t.backHome}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
