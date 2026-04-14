import { notFound } from "next/navigation"

import { OtherUserProfilePage } from "@/components/pages/profile"

interface UserProfileDetailRouteProps {
  params: Promise<{ id: string }>
}

export default async function UserProfileDetailRoute({ params }: UserProfileDetailRouteProps) {
  const { id } = await params
  const targetUserId = decodeURIComponent(id ?? "").trim()

  if (!targetUserId) {
    notFound()
  }

  return <OtherUserProfilePage targetUserId={targetUserId} />
}
