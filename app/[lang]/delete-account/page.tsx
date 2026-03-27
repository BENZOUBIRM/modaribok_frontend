import { redirect } from "next/navigation"

interface LegacyRoutePageProps {
  params: Promise<{ lang: string }>
}

export default async function DeleteAccountPage({ params }: LegacyRoutePageProps) {
  const { lang } = await params
  redirect(`/${lang}/settings/delete-account`)
}
