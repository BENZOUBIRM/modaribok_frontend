import { notFound } from "next/navigation"

/**
 * Catch-all route for any path under /[lang]/... that doesn't match a known page.
 * Calling notFound() triggers app/[lang]/not-found.tsx which renders
 * INSIDE the layout with all providers (theme, i18n, auth shell).
 */
export default function CatchAllPage() {
  notFound()
}
