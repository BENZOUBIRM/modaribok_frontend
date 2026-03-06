"use client"

import Image from "next/image"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"

/**
 * User profile card for the activity panel sidebar.
 * Displays avatar, name, handle, and stats (posts, followers, following).
 */
export function UserProfileCard() {
  const { dictionary } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.profile

  if (!user) return null

  const avatarSrc = user.profileImageUrl || "/images/default-user.jpg"
  const handle = `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`

  const stats = [
    { label: t.posts, value: "548" },
    { label: t.followers, value: "12.7K" },
    { label: t.following, value: "221" },
  ]

  return (
    <div className="p-4 border-b border-border">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <Image
          src={avatarSrc}
          alt={`${user.firstName} ${user.lastName}`}
          width={80}
          height={80}
          className="size-20 rounded-full object-cover border-2 border-border"
        />
        <h3 className="font-bold text-foreground mt-2 text-sm">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-xs text-muted-foreground">{handle}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 mt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="font-bold text-foreground text-sm">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
