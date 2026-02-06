import { NextRequest, NextResponse } from "next/server"
import { defaultLocale, locales, type Locale } from "@/i18n/settings"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Try to get locale from cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && locales.includes(cookieLocale as typeof locales[number])) {
    return NextResponse.redirect(
      new URL(`/${cookieLocale}${pathname}`, request.url)
    )
  }

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language")
  let detectedLocale = defaultLocale

  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, quality] = lang.trim().split(";q=")
        return { code: code.split("-")[0], quality: quality ? parseFloat(quality) : 1 }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { code } of preferredLanguages) {
      if (locales.includes(code as typeof locales[number])) {
        detectedLocale = code as typeof locales[number]
        break
      }
    }
  }

  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  )
}

export const config = {
  matcher: ["/((?!_next|api|images|fonts|favicon.ico).*)"],
}
