import { notFound, redirect } from "next/navigation"

interface CatchAllPageProps {
  params: Promise<{ lang: string; catchAll: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "undefined") {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item))
      return
    }

    query.set(key, value)
  })

  return query.toString()
}

/**
 * Catch-all route for any path under /[lang]/... that doesn't match a known page.
 *
 * OAuth callback URLs sometimes come in multiple legacy variants (e.g. /{lang}/callback,
 * /{lang}/oauth/callback). If an unknown localized path ends in "callback", forward it
 * to the canonical callback route so authentication can complete instead of showing 404.
 */
export default async function CatchAllPage({
  params,
  searchParams,
}: CatchAllPageProps) {
  const { lang, catchAll } = await params
  const normalizedSegments = (catchAll ?? []).map((segment) => segment.toLowerCase())

  if (normalizedSegments[normalizedSegments.length - 1] === "callback") {
    const queryString = buildQueryString(await searchParams)
    redirect(`/${lang}/auth/callback${queryString ? `?${queryString}` : ""}`)
  }

  notFound()
}
