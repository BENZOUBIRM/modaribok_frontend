import { getDictionary } from "@/i18n/get-dictionary"
import type { Locale } from "@/i18n/settings"

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as Locale)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          {dictionary.common.appName}
        </h1>
        <p className="text-muted-foreground text-lg">
          {lang === "ar"
            ? "رحلتك الرياضية تبدأ هنا"
            : "Your sports journey starts here"}
        </p>
      </div>
    </div>
  )
}
