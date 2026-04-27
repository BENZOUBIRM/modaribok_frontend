import { notFound } from "next/navigation"

import { CoachProfilePage } from "@/components/pages/coaches"
import { getCoachById } from "@/components/pages/coaches/shared"

interface PageProps {
  params: Promise<{
    id: string
    lang: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const coachId = Number(id)
  if (!Number.isFinite(coachId) || !getCoachById(coachId)) {
    notFound()
  }

  return <CoachProfilePage coachId={coachId} />
}