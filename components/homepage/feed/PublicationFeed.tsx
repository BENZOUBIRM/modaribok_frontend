"use client"

import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { PublicationCard } from "./PublicationCard"
import { FriendSuggestions } from "@/components/homepage/suggestions/FriendSuggestions"
import { getMockPosts } from "@/components/homepage/mock-data"

/**
 * Main feed container — "Latest Posts" tab + list of publications.
 * Inserts friend suggestions between posts.
 */
export function PublicationFeed() {
  const { dictionary, lang } = useDictionary()
  const t = dictionary.feed
  const posts = getMockPosts(lang)

  return (
    <div className="space-y-4">
      {/* Tab header */}
      <div className="flex items-center gap-2">
        <Icon icon="solar:document-text-linear" className="size-5 text-primary" />
        <h2 className="font-bold text-base text-foreground">{t.latestPosts}</h2>
      </div>

      {/* Posts with suggestions injected */}
      {posts.map((post, index) => (
        <div key={post.id} className="space-y-4">
          <PublicationCard post={post} />
          {/* Insert friend suggestions after the 1st post */}
          {index === 0 && <FriendSuggestions />}
        </div>
      ))}
    </div>
  )
}
