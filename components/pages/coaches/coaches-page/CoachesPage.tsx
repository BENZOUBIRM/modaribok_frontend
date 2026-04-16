"use client"

import Image from "next/image"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"

interface TrainerCardData {
  id: number
  nameAr: string
  nameEn: string
  statusAr: string
  statusEn: string
  descriptionAr: string
  descriptionEn: string
  tagAr: string
  tagEn: string
  mutualLeadAr: string
  mutualLeadEn: string
  mutualLabelAr: string
  mutualLabelEn: string
}

const DEFAULT_AVATAR = "/images/default-user.jpg"

const COACHES: TrainerCardData[] = [
  {
    id: 1,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 2,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 3,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 4,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 5,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 6,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    statusAr: "اونلاين",
    statusEn: "Online",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    tagAr: "مدرب لياقة بدنية",
    tagEn: "Fitness coach",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
]

function CoachesCard({ data, isRTL }: { data: TrainerCardData; isRTL: boolean }) {
  const title = isRTL ? data.nameAr : data.nameEn
  const status = isRTL ? data.statusAr : data.statusEn
  const description = isRTL ? data.descriptionAr : data.descriptionEn
  const tag = isRTL ? data.tagAr : data.tagEn
  const mutualLead = isRTL ? data.mutualLeadAr : data.mutualLeadEn
  const mutualLabel = isRTL ? data.mutualLabelAr : data.mutualLabelEn

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-border/55 hover:shadow-[0_12px_28px_rgba(34,95,236,0.18)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative h-56 w-full overflow-hidden border-b border-border/20 bg-muted/50 sm:h-64">
        <Image
          src={DEFAULT_AVATAR}
          alt={title}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
        />
      </div>

      <div className="space-y-3 p-3">
        <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <h3 className={`line-clamp-2 min-h-12 min-w-0 flex-1 text-lg font-extrabold leading-6 text-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {title}
          </h3>

          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-500">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            {status}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-200/65 px-3 py-2 text-center text-sm leading-6 text-muted-foreground dark:bg-zinc-700/55">
          <span className="line-clamp-2 wrap-break-word">{description}</span>
        </div>

        <div className="space-y-2">
          <div dir="ltr" className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <span className="inline-flex shrink-0 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-500">
              {tag}
            </span>
          </div>

          <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex shrink-0 items-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative size-7 overflow-hidden rounded-full border border-card/70 shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
                  style={{
                    marginInlineStart: index === 0 ? 0 : -8,
                    zIndex: 20 - index,
                  }}
                >
                  <Image
                    src={DEFAULT_AVATAR}
                    alt="mutual"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/25" />
                </div>
              ))}
            </div>

            <div className={`min-w-0 leading-6 text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
              <p className="truncate text-[15px]">{mutualLead}</p>
              <p className="truncate text-[15px]">{mutualLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <span className={`absolute bottom-0 h-1 w-0 bg-[#2f66f6] transition-all duration-300 group-hover:w-full ${isRTL ? "right-0" : "left-0"}`} />
    </article>
  )
}

export function CoachesPage() {
  const { isRTL, lang } = useDictionary()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div dir={isRTL ? "rtl" : "ltr"} className="mb-3 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-bold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
          {lang === "ar" ? "المدربين" : "Coaches"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
            title={lang === "ar" ? "إضافة" : "Add"}
            aria-label={lang === "ar" ? "إضافة" : "Add"}
          >
            <Icon icon="lucide:plus" className="size-5" />
          </button>

          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
            title={lang === "ar" ? "تصفية" : "Filter"}
            aria-label={lang === "ar" ? "تصفية" : "Filter"}
          >
            <Icon icon="lucide:sliders-horizontal" className="size-5" />
          </button>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {COACHES.map((coach) => (
            <CoachesCard key={coach.id} data={coach} isRTL={isRTL} />
          ))}
        </div>
      </section>
    </div>
  )
}
