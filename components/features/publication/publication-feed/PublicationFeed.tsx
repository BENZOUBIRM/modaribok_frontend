"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { publicationService } from "@/services/api"
import type {
  CommentDto,
  FeedComment,
  FeedPost,
  PublicationDto,
  ReactionCountsByType,
  ReactionType,
} from "@/types"
import { Callout } from "@/components/ui/callout"
import { PublicationCard } from "../publication-card"
import { FriendSuggestions } from "@/components/features/suggestions"

const REACTION_TYPES: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "STRONG",
  "FIRE",
  "CLAP",
  "MUSCLE",
  "HEALTHY",
  "MOTIVATION",
  "GOAL",
  "PROGRESS",
  "CHAMPION",
]

/**
 * Main feed container — "Latest Posts" tab + list of publications.
 * Inserts friend suggestions between posts.
 */
export function PublicationFeed() {
  const { dictionary, lang } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed

  const [posts, setPosts] = React.useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [addingCommentByPostId, setAddingCommentByPostId] = React.useState<Record<number, boolean>>({})

  React.useEffect(() => {
    let isMounted = true

    const loadFeed = async () => {
      setIsLoading(true)
      setErrorCode(null)

      const feedResult = await publicationService.getFeed(0, 10)

      if (!isMounted) return

      if (!feedResult.success || !feedResult.data) {
        setPosts([])
        setErrorCode(feedResult.code ?? "NETWORK_ERROR")
        setIsLoading(false)
        return
      }

      const publicationItems = feedResult.data.content ?? []

      const commentsResults = await Promise.all(
        publicationItems.map((publication) =>
          publicationService.getRootComments(publication.id, 0, 10),
        ),
      )

      const reactionsResults = await Promise.all(
        publicationItems.map((publication) =>
          loadReactionState(publication.id, publication.likesCount ?? 0, user?.id),
        ),
      )

      if (!isMounted) return

      const mappedPosts = publicationItems.map((publication, index) => {
        const comments = commentsResults[index]?.success
          ? commentsResults[index]?.data?.content ?? []
          : []

        const reactionState = reactionsResults[index]
        const reactionsCountByType = reactionState.reactionsCountByType ?? {}

        return mapPublicationToFeedPost(
          publication,
          comments,
          reactionsCountByType,
          reactionState.currentUserReaction,
          lang,
          t.ago,
        )
      })

      setPosts(mappedPosts)
      setIsLoading(false)
    }

    loadFeed()

    return () => {
      isMounted = false
    }
  }, [lang, t.ago.now, t.ago.minutes, t.ago.hours, t.ago.days, user?.id])

  const handleReact = async (publicationId: number, reactionType: ReactionType) => {
    const result = await publicationService.toggleReaction(publicationId, reactionType)
    if (!result.success || !result.data) {
      return
    }

    const mappedCounts = normalizeReactionCounts(result.data.reactionsCount)
    const totalReactions = Object.values(mappedCounts).reduce((sum, count) => sum + (count ?? 0), 0)

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              reactionsCountByType: mappedCounts,
              likesCount: totalReactions,
              currentUserReaction: parseReactionType(result.data?.currentUserReaction),
            }
          : post,
      ),
    )
  }

  const handleAddComment = async (publicationId: number, content: string) => {
    const trimmedContent = content.trim()
    if (!trimmedContent || addingCommentByPostId[publicationId]) {
      return
    }

    setAddingCommentByPostId((current) => ({
      ...current,
      [publicationId]: true,
    }))

    const result = await publicationService.addComment(publicationId, trimmedContent)

    setAddingCommentByPostId((current) => ({
      ...current,
      [publicationId]: false,
    }))

    if (!result.success || !result.data) {
      return
    }

    const createdComment = mapCommentToFeedComment(result.data, lang, t.ago)

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              comments: [createdComment, ...post.comments],
              commentsCount: post.commentsCount + 1,
            }
          : post,
      ),
    )
  }

  return (
    <div className="space-y-4">
      {/* Tab header */}
      <div className="flex items-center gap-2">
        <Icon icon="solar:document-text-linear" className="size-5 text-primary" />
        <h2 className="font-bold text-base text-foreground">{t.latestPosts}</h2>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {dictionary.common.loading}
        </div>
      )}

      {!isLoading && errorCode && (
        <Callout variant="error" title={dictionary.common.error}>
          {errorCode}
        </Callout>
      )}

      {/* Posts with suggestions injected */}
      {!isLoading && !errorCode && posts.map((post, index) => (
        <div key={post.id} className="space-y-4">
          <PublicationCard
            post={post}
            onReact={handleReact}
            onAddComment={handleAddComment}
            isAddingComment={Boolean(addingCommentByPostId[post.id])}
          />
          {/* Insert friend suggestions after the 1st post */}
          {index === 0 && <FriendSuggestions />}
        </div>
      ))}
    </div>
  )
}

function mapPublicationToFeedPost(
  publication: PublicationDto,
  comments: CommentDto[],
  reactionsCountByType: ReactionCountsByType,
  currentUserReaction: ReactionType | null,
  lang: string,
  agoTexts: { now: string; minutes: string; hours: string; days: string },
): FeedPost {
  const authorFirstName = publication.user?.firstName ?? ""
  const authorLastName = publication.user?.lastName ?? ""
  const authorFullName = `${authorFirstName} ${authorLastName}`.trim() || "User"

  return {
    id: publication.id,
    author: {
      id: publication.user?.id ?? 0,
      name: authorFullName,
      handle: buildHandle(authorFirstName, authorLastName),
      avatarUrl: publication.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: publication.content ?? "",
    images: (publication.media ?? [])
      .filter((media) => media.mediaType === "image")
      .map((media) => media.thumbnailUrl || media.url)
      .filter(Boolean),
    createdAt: formatRelativeTime(publication.createdAt, lang, agoTexts),
    likesCount: publication.likesCount ?? 0,
    commentsCount: publication.commentsCount ?? 0,
    sharesCount: publication.sharesCount ?? 0,
    comments: comments.map((comment) => mapCommentToFeedComment(comment, lang, agoTexts)),
    reactionsCountByType,
    currentUserReaction,
  }
}

function mapCommentToFeedComment(
  comment: CommentDto,
  lang: string,
  agoTexts: { now: string; minutes: string; hours: string; days: string },
): FeedComment {
  const firstName = comment.user?.firstName ?? ""
  const lastName = comment.user?.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "User"

  return {
    id: comment.id,
    author: {
      id: comment.user?.id ?? 0,
      name: fullName,
      handle: buildHandle(firstName, lastName),
      avatarUrl: comment.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: comment.content,
    createdAt: formatRelativeTime(comment.createdAt, lang, agoTexts),
    likesCount: 0,
    replies: (comment.replies ?? []).map((reply) => mapCommentToFeedComment(reply, lang, agoTexts)),
  }
}

function buildHandle(firstName?: string, lastName?: string): string {
  const raw = `${firstName ?? ""}${lastName ?? ""}`.replace(/\s+/g, "").toLowerCase()
  return raw ? `@${raw}` : "@user"
}

function formatRelativeTime(
  isoDate: string,
  lang: string,
  agoTexts: { now: string; minutes: string; hours: string; days: string },
): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) {
    return agoTexts.now
  }

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) {
    return agoTexts.minutes.replace("{count}", String(minutes))
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return agoTexts.hours.replace("{count}", String(hours))
  }

  const days = Math.floor(hours / 24)
  if (days <= 30) {
    return agoTexts.days.replace("{count}", String(days))
  }

  return new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

async function loadReactionState(
  publicationId: number,
  totalReactions: number,
  currentUserId?: number,
): Promise<{ reactionsCountByType: ReactionCountsByType; currentUserReaction: ReactionType | null }> {
  if (!totalReactions) {
    return {
      reactionsCountByType: {},
      currentUserReaction: null,
    }
  }

  const size = 100
  let page = 0
  let hasNext = true
  const counts: ReactionCountsByType = {}
  let currentUserReaction: ReactionType | null = null

  while (hasNext) {
    const result = await publicationService.getReactionUsers(publicationId, {
      page,
      size,
    })

    if (!result.success || !result.data) {
      return {
        reactionsCountByType: counts,
        currentUserReaction,
      }
    }

    result.data.content.forEach((reaction) => {
      const key = reaction.reactionType
      counts[key] = (counts[key] ?? 0) + 1

      if (currentUserId && reaction.user?.id === currentUserId) {
        currentUserReaction = key
      }
    })

    if (result.data.last || result.data.content.length < size || page >= result.data.totalPages - 1) {
      hasNext = false
    } else {
      page += 1
    }
  }

  if (!Object.keys(counts).length && totalReactions > 0) {
    counts.LIKE = totalReactions
  }

  const orderedCounts: ReactionCountsByType = {}
  REACTION_TYPES.forEach((type) => {
    if (counts[type]) {
      orderedCounts[type] = counts[type]
    }
  })

  return {
    reactionsCountByType: orderedCounts,
    currentUserReaction,
  }
}

function parseReactionType(value?: string | null): ReactionType | null {
  if (!value) return null
  const parsed = value.toUpperCase() as ReactionType
  return REACTION_TYPES.includes(parsed) ? parsed : null
}

function normalizeReactionCounts(rawCounts: Record<string, number>): ReactionCountsByType {
  const normalized: ReactionCountsByType = {}

  Object.entries(rawCounts ?? {}).forEach(([key, value]) => {
    const reactionType = key.toUpperCase() as ReactionType
    if (!REACTION_TYPES.includes(reactionType)) {
      return
    }

    normalized[reactionType] = value
  })

  const ordered: ReactionCountsByType = {}
  REACTION_TYPES.forEach((type) => {
    if (normalized[type]) {
      ordered[type] = normalized[type]
    }
  })

  return ordered
}
