import type { Metadata } from "next"
import { notFound } from "next/navigation"

import "@/app/globals.css"
import { workSans, neoSansArabic } from "@/lib/fonts"
import { getDictionary } from "@/i18n/get-dictionary"
import { isValidLocale, localeDirection } from "@/i18n/settings"
import type { Locale } from "@/i18n/settings"
import { ThemeProvider } from "@/providers/theme-provider"
import { DictionaryProvider } from "@/providers/dictionary-provider"
import { Navbar } from "@/components/shared/navbar"

export const metadata: Metadata = {
  title: "Modaribok | مدربك",
  description: "Your sports journey starts here — رحلتك الرياضية تبدأ هنا",
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    notFound()
  }

  const locale = lang as Locale
  const direction = localeDirection[locale]
  const dictionary = await getDictionary(locale)

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${neoSansArabic.variable} antialiased`}
        style={{
          "--font-active": locale === "ar"
            ? "var(--font-neo-sans-arabic)"
            : "var(--font-work-sans)",
        } as React.CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DictionaryProvider dictionary={dictionary} lang={locale}>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
