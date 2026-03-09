"use client"

import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Button } from "@/components/ui/button"

interface ServerErrorPageProps {
  reset?: () => void
}

export function ServerErrorPage({ reset }: ServerErrorPageProps) {
  const { dictionary, lang } = useDictionary()
  const router = useRouter()
  const t = dictionary.errors.serverError

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
      <div
        className={cn(
          "w-full max-w-3xl bg-card rounded-2xl shadow-lg border border-border",
          "dark:shadow-[0_10px_15px_-3px_rgb(255,255,255,0.05),0_4px_6px_-4px_rgb(255,255,255,0.05)]",
          "overflow-hidden flex flex-col sm:flex-row"
        )}
      >
        {/* Decorative panel */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 bg-red-50 p-8 sm:p-10 sm:w-2/5",
            "dark:bg-destructive/10"
          )}
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/15">
            <Icon
              icon="solar:server-bold-duotone"
              className="size-12 text-destructive"
            />
          </div>
          <span className="text-7xl font-extrabold tracking-tighter text-destructive/80">
            {t.code}
          </span>
        </div>

        {/* Content panel */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 sm:p-8 text-center">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed text-balance">
              {t.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            {reset && (
              <Button onClick={reset} variant="outline" size="lg">
                <Icon icon="solar:refresh-bold" className="size-5" />
                {t.retry}
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => router.replace(`/${lang}`)}
            >
              <Icon icon="solar:home-2-bold" className="size-5" />
              {t.backHome}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
