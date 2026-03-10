"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Button } from "@/components/ui/button"
import { useNavRouter } from "@/hooks/use-nav-router"

export function NotFoundPage() {
  const { dictionary, lang } = useDictionary()
  const router = useNavRouter()
  const t = dictionary.errors.notFound

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
            "flex flex-col items-center justify-center gap-3 bg-[#eaf0fd] p-8 sm:p-10 sm:w-2/5",
            "dark:bg-primary/10"
          )}
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/15">
            <Icon
              icon="solar:ghost-bold-duotone"
              className="size-12 text-primary"
            />
          </div>
          <span className="text-7xl font-extrabold tracking-tighter text-primary/80">
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

          <Button
            size="lg"
            className="mt-1"
            onClick={() => router.replace(`/${lang}`)}
          >
            <Icon icon="solar:home-2-bold" className="size-5" />
            {t.backHome}
          </Button>
        </div>
      </div>
    </div>
  )
}
