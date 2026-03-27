import { redirect } from "next/navigation"

interface SettingsPageProps {
  params: Promise<{ lang: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { lang } = await params
  redirect(`/${lang}/settings/profile`)
}
