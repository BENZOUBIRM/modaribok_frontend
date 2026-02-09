import type { Metadata } from "next"
import { notFound } from "next/navigation"

import "@/app/globals.css"
import { workSans, neoSansArabic } from "@/lib/fonts"
import { getDictionary } from "@/i18n/get-dictionary"
import { isValidLocale, localeDirection } from "@/i18n/settings"
import type { Locale } from "@/i18n/settings"
import { ThemeProvider } from "@/providers/theme-provider"
import { DictionaryProvider } from "@/providers/dictionary-provider"
import { AuthProvider } from "@/providers/auth-provider"
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

  // Both variable classes must be on <html> so the @font-face rules
  // and CSS variables (--font-work-sans, --font-neo-sans-arabic) are injected.
  // The locale-specific className is applied to <body> to set the actual font.
  const fontClassName = locale === "ar" ? neoSansArabic.className : workSans.className

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${workSans.variable} ${neoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <body className={`${fontClassName} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DictionaryProvider dictionary={dictionary} lang={locale}>
            <AuthProvider>
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
            </AuthProvider>
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
