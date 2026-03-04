"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { PublicationMedia } from "./PublicationMedia"
import { PublicationActions } from "./PublicationActions"
import { CommentSection } from "./CommentSection"
import { useDictionary } from "@/providers/dictionary-provider"
import type { MockPost } from "@/components/homepage/mock-data"

const TEXT_LIMIT = 200

/**
 * A single publication card with header, body, media, actions, and comments.
 */
export function PublicationCard({ post }: { post: MockPost }) {
  const { dictionary } = useDictionary()
  const t = dictionary.feed
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = post.text && post.text.length > TEXT_LIMIT

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight cursor-pointer hover:underline">
              {post.author.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.createdAt}
            </p>
          </div>
        </div>
        <button title="More options" className="cursor-pointer p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
          <Icon icon="solar:menu-dots-bold" className="size-5" />
        </button>
      </div>

      {/* Body text */}
      {post.text && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed">
            {isLong && !isExpanded ? `${post.text.slice(0, TEXT_LIMIT)}…` : post.text}
          </p>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer text-xs font-medium text-primary hover:underline mt-1"
            >
              {isExpanded ? t.showLess : t.showMore}
            </button>
          )}
        </div>
      )}

      {/* Media grid */}
      <PublicationMedia images={post.images} />

      {/* Actions: like, comment, share */}
      <PublicationActions
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        sharesCount={post.sharesCount}
      />

      {/* Comments section */}
      <CommentSection comments={post.comments} />
    </div>
  )
}
