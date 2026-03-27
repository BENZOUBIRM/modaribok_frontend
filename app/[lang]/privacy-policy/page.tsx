import { redirect } from "next/navigation"

interface LegacyRoutePageProps {
  params: Promise<{ lang: string }>
}

export default async function PrivacyPolicyPage({ params }: LegacyRoutePageProps) {
  const { lang } = await params
  redirect(`/${lang}/settings/privacy-policy`)
}
