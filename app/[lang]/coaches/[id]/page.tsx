import { notFound } from "next/navigation"

import { CoachProfilePage, getCoachById } from "@/components/pages/coaches"

interface CoachDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoachDetailsRoute({ params }: CoachDetailsPageProps) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || !getCoachById(numericId)) {
    notFound()
  }

  return <CoachProfilePage coachId={id} />
}
