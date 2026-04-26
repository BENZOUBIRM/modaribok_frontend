import { notFound } from "next/navigation"

import { GymDetailsPage } from "@/components/pages/gyms"
import { getGymById } from "@/components/pages/gyms/shared"

interface GymDetailsRouteProps {
  params: Promise<{ id: string }>
}

export default async function GymDetailsRoute({ params }: GymDetailsRouteProps) {
  const { id } = await params
  const rawId = decodeURIComponent(id ?? "").trim()
  const gymId = Number(rawId)

  if (!Number.isFinite(gymId) || !getGymById(gymId)) {
    notFound()
  }

  return <GymDetailsPage gymId={gymId} />
}
