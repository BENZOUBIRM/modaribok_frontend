import { redirect } from "next/navigation"

interface LegacyRoutePageProps {
  params: Promise<{ lang: string }>
}

export default async function NotificationsPage({ params }: LegacyRoutePageProps) {
  const { lang } = await params
  redirect(`/${lang}/settings/notifications`)
}
