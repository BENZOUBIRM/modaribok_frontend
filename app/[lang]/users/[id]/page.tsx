import { notFound } from "next/navigation"

import { OtherUserProfilePage } from "@/components/pages/profile"

interface UserProfileDetailRouteProps {
  params: Promise<{ id: string }>
}

export default async function UserProfileDetailRoute({ params }: UserProfileDetailRouteProps) {
  const { id } = await params
  const targetUserId = Number(id)

  if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
    notFound()
  }

  return <OtherUserProfilePage targetUserId={targetUserId} />
}
