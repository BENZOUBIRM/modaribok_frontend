"use client"

import Image from "next/image"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"

type GymCardData = {
  id: number
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  locationAr: string
  locationEn: string
  genderTagsAr: string[]
  genderTagsEn: string[]
  categoryTagsAr: string[]
  categoryTagsEn: string[]
  imageSrc: string
}

const GYMS: GymCardData[] = [
  {
    id: 1,
    titleAr: "تكنو جيم غزة",
    titleEn: "Techno Gym Gaza",
    descriptionAr: "صالاتنا الرياضية هي المساحة المثالية لتحقيق أهدافك الصحية واللياقية. مجهزة بأحدث الأجهزة والمعدات مع أجواء تدريبية متكاملة، وخدمة مستمرة لتطوير أدائك الرياضي خطوة بخطوة.",
    descriptionEn: "Our gyms are designed to help you reach your health and fitness goals with modern equipment, balanced training atmosphere, and continuous support.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الكريم محمود، بالقرب من مدرسة الماجدة وسيلة، مكتب شمس",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Karim Mahmoud St., near Al-Majida Waseela School, Shams Office",
    genderTagsAr: ["نساء"],
    genderTagsEn: ["Women"],
    categoryTagsAr: ["كرة السلة", "كرة القدم"],
    categoryTagsEn: ["Basketball", "Football"],
    imageSrc: "/images/man-running.png",
  },
  {
    id: 2,
    titleAr: "فريندس جيم",
    titleEn: "Friends Gym",
    descriptionAr: "صالاتنا الرياضية تقدم تجربة تدريب مرنة ومتكاملة مع مدربين مختصين، وبرامج يومية مناسبة لكل المستويات في بيئة محفزة.",
    descriptionEn: "A flexible gym experience with specialist coaches and daily programs suitable for all levels in a motivating environment.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الكريم محمود، بالقرب من مدرسة الماجدة وسيلة، مكتب شمس",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Karim Mahmoud St., near Al-Majida Waseela School, Shams Office",
    genderTagsAr: ["رجال"],
    genderTagsEn: ["Men"],
    categoryTagsAr: ["الجري مع الأصدقاء", "كرة السلة"],
    categoryTagsEn: ["Running with friends", "Basketball"],
    imageSrc: "/images/default-user-1.png",
  },
  {
    id: 3,
    titleAr: "أوكسجين جيم",
    titleEn: "Oxygen Gym",
    descriptionAr: "نوفر لك بيئة تدريب حديثة، ومرافق منظمة، وخطط تطوير أسبوعية تساعدك على الاستمرار وتحقيق نتائج فعلية.",
    descriptionEn: "Modern training setup, organized facilities, and weekly progress plans that keep you consistent and moving forward.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الكريم محمود، بالقرب من مدرسة الماجدة وسيلة، مكتب شمس",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Karim Mahmoud St., near Al-Majida Waseela School, Shams Office",
    genderTagsAr: ["رجال", "نساء"],
    genderTagsEn: ["Men", "Women"],
    categoryTagsAr: ["كرة السلة", "كرة القدم"],
    categoryTagsEn: ["Basketball", "Football"],
    imageSrc: "/images/default-user.jpg",
  },
]

function GymCard({ gym, isRTL }: { gym: GymCardData; isRTL: boolean }) {
  const title = isRTL ? gym.titleAr : gym.titleEn
  const description = isRTL ? gym.descriptionAr : gym.descriptionEn
  const location = isRTL ? gym.locationAr : gym.locationEn
  const genderTags = isRTL ? gym.genderTagsAr : gym.genderTagsEn
  const categoryTags = isRTL ? gym.categoryTagsAr : gym.categoryTagsEn

  const isFemaleTag = (tag: string): boolean => {
    const normalized = tag.trim().toLowerCase()
    return normalized === "نساء" || normalized === "women" || normalized === "female"
  }

  const isMaleTag = (tag: string): boolean => {
    const normalized = tag.trim().toLowerCase()
    return normalized === "رجال" || normalized === "men" || normalized === "male"
  }

  const getCategoryIcon = (tag: string): string => {
    const normalized = tag.trim().toLowerCase()

    if (
      normalized === "الجري مع الأصدقاء"
      || normalized === "running with friends"
      || normalized === "run with friends"
      || normalized === "running"
    ) {
      return "solar:running-2-linear"
    }

    if (normalized === "دورة اللياقة" || normalized === "fitness cycle" || normalized === "fitness") {
      return "solar:dumbbell-large-2-linear"
    }

    if (normalized === "كرة السلة" || normalized === "basketball") {
      return "mdi:basketball"
    }

    if (normalized === "كرة القدم" || normalized === "football" || normalized === "soccer") {
      return "mdi:soccer"
    }

    return "solar:ball-linear"
  }

  return (
    <article
      dir="ltr"
      className="group overflow-hidden rounded-xl border border-border/35 bg-card/80 p-3 transition-all duration-200 hover:border-border/55 hover:bg-card"
    >
      <div className="flex gap-3 max-sm:flex-col">
        <div dir={isRTL ? "rtl" : "ltr"} className={`min-w-0 flex-1 ${isRTL ? "order-1" : "order-2"}`}>
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div className={`flex flex-wrap gap-1.5 ${isRTL ? "order-2 justify-start" : "order-2 justify-end"}`}>
              {genderTags.map((tag) => (
                <span
                  key={`${gym.id}-${tag}`}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={isFemaleTag(tag)
                    ? "inline-flex items-center gap-1 rounded-full bg-pink-500/16 px-2 py-0.5 text-[11px] font-semibold text-pink-500"
                    : isMaleTag(tag)
                      ? "inline-flex items-center gap-1 rounded-full bg-blue-500/16 px-2 py-0.5 text-[11px] font-semibold text-blue-500"
                      : "inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary"
                  }
                >
                  {tag}
                  <Icon
                    icon={isFemaleTag(tag) ? "solar:women-linear" : isMaleTag(tag) ? "solar:men-linear" : "solar:user-linear"}
                    className="size-3"
                  />
                </span>
              ))}
            </div>

            <h3 className={`inline-flex items-center gap-1.5 text-lg font-bold text-foreground ${isRTL ? "order-1" : "order-1"}`}>
              {isRTL ? (
                <>
                  <span>{title}</span>
                  <Icon icon="solar:dumbbells-bold" className="size-4.5 text-primary" />
                </>
              ) : (
                <>
                  <Icon icon="solar:dumbbells-bold" className="size-4.5 text-primary" />
                  <span>{title}</span>
                </>
              )}
            </h3>
          </div>

          <p className={`line-clamp-2 text-[13px] leading-6 text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {description}
          </p>

          <div className="my-2 border-t border-border/25" />

          <p
            dir={isRTL ? "rtl" : "ltr"}
            className={`inline-flex w-full items-start gap-1.5 text-[12px] text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
          >
            <Icon icon="solar:map-point-bold" className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="line-clamp-1">{location}</span>
          </p>

          <div dir={isRTL ? "rtl" : "ltr"} className="mt-2.5 flex flex-wrap justify-start gap-1.5">
            {categoryTags.map((tag, index) => (
              <span
                key={`${gym.id}-${tag}-${index}`}
                dir={isRTL ? "rtl" : "ltr"}
                className={index % 2 === 0
                  ? "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success whitespace-nowrap"
                  : "inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 text-[11px] font-semibold text-destructive whitespace-nowrap"
                }
              >
                <Icon icon={getCategoryIcon(tag)} className="size-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={`relative h-37 w-49 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/30 max-sm:h-42 max-sm:w-full ${isRTL ? "order-2" : "order-1"}`}>
          <Image
            src={gym.imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 196px"
          />
          <span className="pointer-events-none absolute inset-0 bg-black/12" />
        </div>
      </div>
    </article>
  )
}

export function GymsPage() {
  const { isRTL, lang } = useDictionary()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">
      <div dir={isRTL ? "rtl" : "ltr"} className="mb-3 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-bold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
          {lang === "ar" ? "صالات رياضية" : "Gyms"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title={lang === "ar" ? "إضافة" : "Add"}
            aria-label={lang === "ar" ? "إضافة" : "Add"}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
          >
            <Icon icon="lucide:plus" className="size-5" />
          </button>

          <button
            type="button"
            title={lang === "ar" ? "تصفية" : "Filter"}
            aria-label={lang === "ar" ? "تصفية" : "Filter"}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
          >
            <Icon icon="lucide:sliders-horizontal" className="size-5" />
          </button>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="space-y-3">
          {GYMS.map((gym) => (
            <GymCard key={gym.id} gym={gym} isRTL={isRTL} />
          ))}
        </div>
      </section>
    </div>
  )
}
