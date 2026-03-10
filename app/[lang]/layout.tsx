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
import { NavigationProvider } from "@/providers/navigation-provider"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = isValidLocale(lang) ? (lang as Locale) : "en"
  const dictionary = await getDictionary(locale)
  return {
    title: `${dictionary.common.appName} | Modaribok`,
    description: dictionary.auth.login.metaDescription,
    icons: {
      icon: [
        { url: "/images/favicon/favicon.ico", sizes: "any" },
        { url: "/images/favicon/favicon.svg", type: "image/svg+xml" },
        { url: "/images/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: "/images/favicon/apple-touch-icon.png",
    },
    manifest: "/images/favicon/site.webmanifest",
  }
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
          <DictionaryProvider
            dictionary={dictionary}
            lang={locale}
            fontClasses={{ en: workSans.className, ar: neoSansArabic.className }}
          >
            <AuthProvider>
              <NavigationProvider>
                <AuthenticatedShell>
                  {children}
                </AuthenticatedShell>
              </NavigationProvider>
            </AuthProvider>
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
