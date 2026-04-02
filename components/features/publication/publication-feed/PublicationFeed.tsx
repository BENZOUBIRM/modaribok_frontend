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
import { Spinner } from "@/components/ui/spinner"
import { PublicationCard } from "../publication-card"
import { FriendSuggestions } from "@/components/features/suggestions"
import type { PublicationFeedProps } from "./PublicationFeed.types"

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
export function PublicationFeed({
  refreshKey = 0,
  userId,
  showHeader = true,
  showSuggestions = true,
  emptyState,
}: PublicationFeedProps) {
  const { dictionary, lang } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed
  const isRTL = lang === "ar"

  const [posts, setPosts] = React.useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [addingCommentByPostId, setAddingCommentByPostId] = React.useState<Record<number, boolean>>({})
  const [updatingPostById, setUpdatingPostById] = React.useState<Record<number, boolean>>({})
  const [deletingPostById, setDeletingPostById] = React.useState<Record<number, boolean>>({})

  React.useEffect(() => {
    let isMounted = true

    const loadFeed = async () => {
      setIsLoading(true)
      setErrorCode(null)

      let publicationItems: PublicationDto[] = []

      if (userId) {
        const userPublicationsResult = await publicationService.getUserPublications(userId)

        if (!isMounted) return

        if (userPublicationsResult.success && userPublicationsResult.data) {
          publicationItems = Array.isArray(userPublicationsResult.data)
            ? userPublicationsResult.data
            : []
        } else {
          const fallbackFeedResult = await publicationService.getFeed(0, 50)

          if (!isMounted) return

          if (!fallbackFeedResult.success || !fallbackFeedResult.data) {
            setPosts([])
            setErrorCode(userPublicationsResult.code ?? fallbackFeedResult.code ?? "NETWORK_ERROR")
            setIsLoading(false)
            return
          }

          const fallbackItems = Array.isArray(fallbackFeedResult.data)
            ? fallbackFeedResult.data
            : (fallbackFeedResult.data.content ?? [])

          publicationItems = fallbackItems.filter((publication) => publication.user?.id === userId)
        }
      } else {
        const feedResult = await publicationService.getFeed(0, 10)

        if (!isMounted) return

        if (!feedResult.success || !feedResult.data) {
          setPosts([])
          setErrorCode(feedResult.code ?? "NETWORK_ERROR")
          setIsLoading(false)
          return
        }

        publicationItems = Array.isArray(feedResult.data)
          ? feedResult.data
          : (feedResult.data.content ?? [])
      }

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
        )
      })

      setPosts(mappedPosts)
      setIsLoading(false)
    }

    loadFeed()

    return () => {
      isMounted = false
    }
  }, [lang, user?.id, refreshKey, userId])

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

  const handleReactComment = async (
    publicationId: number,
    commentId: number,
    reactionType: ReactionType,
  ) => {
    const result = await publicationService.toggleCommentReaction(commentId, reactionType)
    if (!result.success || !result.data) {
      return
    }

    const mappedCounts = normalizeReactionCounts(result.data.reactionsCount ?? {})
    const totalReactions = Object.values(mappedCounts).reduce((sum, count) => sum + (count ?? 0), 0)

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              comments: updateCommentReactionState(
                post.comments,
                commentId,
                mappedCounts,
                parseReactionType(result.data?.currentUserReaction),
                totalReactions,
              ),
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

    const createdComment = mapCommentToFeedComment(result.data)

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

  const handleLoadReplies = async (publicationId: number, parentCommentId: number) => {
    const result = await publicationService.getReplies(parentCommentId)
    if (!result.success || !result.data) {
      return
    }

    const repliesData: CommentDto[] = result.data
    const mappedReplies = repliesData.map((reply) => mapCommentToFeedComment(reply))

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              comments: replaceRepliesForComment(post.comments, parentCommentId, mappedReplies),
            }
          : post,
      ),
    )
  }

  const handleAddReply = async (
    publicationId: number,
    parentCommentId: number,
    content: string,
  ): Promise<boolean> => {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return false
    }

    const createResult = await publicationService.addComment(
      publicationId,
      trimmedContent,
      parentCommentId,
    )

    if (!createResult.success || !createResult.data) {
      return false
    }

    const createdReplyDto: CommentDto = createResult.data

    const repliesResult = await publicationService.getReplies(parentCommentId)

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== publicationId) {
          return post
        }

        if (repliesResult.success && repliesResult.data) {
          const repliesData: CommentDto[] = repliesResult.data
          const mappedReplies = repliesData.map((reply) => mapCommentToFeedComment(reply))

          return {
            ...post,
            comments: replaceRepliesForComment(post.comments, parentCommentId, mappedReplies),
            commentsCount: post.commentsCount + 1,
          }
        }

        const createdReply = mapCommentToFeedComment(createdReplyDto)

        return {
          ...post,
          comments: appendReplyToComment(post.comments, parentCommentId, createdReply),
          commentsCount: post.commentsCount + 1,
        }
      }),
    )

    return true
  }

  const handleDeleteComment = async (publicationId: number, commentId: number): Promise<boolean> => {
    const result = await publicationService.deleteComment(commentId)

    if (!result.success) {
      return false
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== publicationId) {
          return post
        }

        const deletionResult = removeCommentFromTree(post.comments, commentId)
        if (deletionResult.removedTotal === 0) {
          return post
        }

        return {
          ...post,
          comments: deletionResult.comments,
          commentsCount: Math.max(0, post.commentsCount - deletionResult.removedTotal),
        }
      }),
    )

    return true
  }

  const handleReportComment = async (publicationId: number, commentId: number): Promise<boolean> => {
    void publicationId
    void commentId
    // Static placeholder for now until backend comment-report endpoint is available.
    return true
  }

  const handleDeletePost = async (publicationId: number) => {
    if (deletingPostById[publicationId]) {
      return false
    }

    setDeletingPostById((current) => ({
      ...current,
      [publicationId]: true,
    }))

    const result = await publicationService.deletePublication(publicationId)

    setDeletingPostById((current) => ({
      ...current,
      [publicationId]: false,
    }))

    if (!result.success) {
      return false
    }

    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== publicationId))
    return true
  }

  const handleUpdatePost = async (
    publicationId: number,
    payload: { content: string; visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" },
  ): Promise<boolean> => {
    if (updatingPostById[publicationId]) {
      return false
    }

    setUpdatingPostById((current) => ({
      ...current,
      [publicationId]: true,
    }))

    const result = await publicationService.updatePublication(publicationId, {
      content: payload.content,
      visibility: payload.visibility,
    })

    setUpdatingPostById((current) => ({
      ...current,
      [publicationId]: false,
    }))

    if (!result.success || !result.data) {
      return false
    }

    const updatedPublication = result.data
    const mediaItems = updatedPublication.media ?? []
    const imageMedia = mediaItems.filter((media) => media.mediaType === "image")
    const videoMedia = mediaItems.filter((media) => media.mediaType === "video")

    const updatedImages = imageMedia
      .map((media) => media.thumbnailUrl || media.url)
      .filter(Boolean)
    const updatedOriginalImages = imageMedia
      .map((media) => media.url)
      .filter(Boolean)
    const updatedVideos = videoMedia
      .map((media) => media.url)
      .filter(Boolean)
    const updatedVideoThumbnails = videoMedia.map((media) => media.thumbnailUrl ?? null)

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              text: updatedPublication.content ?? "",
              visibility: updatedPublication.visibility,
              images: updatedImages,
              originalImages: updatedOriginalImages,
              videos: updatedVideos,
              videoThumbnails: updatedVideoThumbnails,
              likesCount: updatedPublication.likesCount ?? post.likesCount,
              commentsCount: updatedPublication.commentsCount ?? post.commentsCount,
              sharesCount: updatedPublication.sharesCount ?? post.sharesCount,
            }
          : post,
      ),
    )

    return true
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {showHeader && (
        <div className="flex items-center gap-2">
          <Icon icon="solar:document-text-linear" className="size-5 text-primary" />
          <h2 className="font-bold text-base text-foreground">{t.latestPosts}</h2>
        </div>
      )}

      {isLoading && (
        <div
          className={
            showHeader
              ? "flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background"
              : "flex min-h-56 items-center justify-center rounded-lg border border-border bg-muted/20"
          }
        >
          <Spinner className="size-12" />
        </div>
      )}

      {!isLoading && errorCode && (
        <Callout variant="error" title={dictionary.common.error}>
          {errorCode}
        </Callout>
      )}

      {!isLoading && !errorCode && posts.length === 0 && emptyState}

      {/* Posts with suggestions injected */}
      {!isLoading && !errorCode && posts.map((post, index) => (
        <div key={post.id} className="space-y-4">
          <PublicationCard
            post={post}
            onReact={handleReact}
            onReactComment={handleReactComment}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
            onLoadReplies={handleLoadReplies}
            onDeleteComment={handleDeleteComment}
            onReportComment={handleReportComment}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            isAddingComment={Boolean(addingCommentByPostId[post.id])}
            isUpdating={Boolean(updatingPostById[post.id])}
            isDeleting={Boolean(deletingPostById[post.id])}
          />
          {/* Insert friend suggestions after the 1st post */}
          {showSuggestions && index === 0 && <FriendSuggestions />}
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
): FeedPost {
  const authorFirstName = publication.user?.firstName ?? ""
  const authorLastName = publication.user?.lastName ?? ""
  const authorFullName = `${authorFirstName} ${authorLastName}`.trim() || "User"
  const mediaItems = publication.media ?? []
  const imageMedia = mediaItems.filter((media) => media.mediaType === "image")
  const videoMedia = mediaItems.filter((media) => media.mediaType === "video")

  return {
    id: publication.id,
    author: {
      id: publication.user?.id ?? 0,
      name: authorFullName,
      handle: buildHandle(authorFirstName, authorLastName),
      avatarUrl: publication.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: publication.content ?? "",
    images: imageMedia
      .map((media) => media.thumbnailUrl || media.url)
      .filter(Boolean),
    originalImages: imageMedia
      .map((media) => media.url)
      .filter(Boolean),
    videos: videoMedia
      .map((media) => media.url)
      .filter(Boolean),
    videoThumbnails: videoMedia.map((media) => media.thumbnailUrl ?? null),
    visibility: publication.visibility,
    createdAt: formatDateTime(publication.createdAt),
    likesCount: publication.likesCount ?? 0,
    commentsCount: publication.commentsCount ?? 0,
    sharesCount: publication.sharesCount ?? 0,
    comments: comments.map((comment) => mapCommentToFeedComment(comment)),
    reactionsCountByType,
    currentUserReaction,
  }
}

function mapCommentToFeedComment(comment: CommentDto): FeedComment {
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
    isDeleted: comment.isDeleted,
    createdAt: formatDateTime(comment.createdAt),
    likesCount: 0,
    reactionsCountByType: undefined,
    currentUserReaction: null,
    parentCommentId: comment.parentCommentId,
    repliesCount: comment.repliesCount ?? 0,
    replies: (comment.replies ?? []).map((reply) => mapCommentToFeedComment(reply)),
  }
}

function updateCommentReactionState(
  comments: FeedComment[],
  targetCommentId: number,
  reactionsCountByType: ReactionCountsByType,
  currentUserReaction: ReactionType | null,
  likesCount: number,
): FeedComment[] {
  const [updatedComments] = updateCommentReactionStateRecursive(
    comments,
    targetCommentId,
    reactionsCountByType,
    currentUserReaction,
    likesCount,
  )

  return updatedComments
}

function updateCommentReactionStateRecursive(
  comments: FeedComment[],
  targetCommentId: number,
  reactionsCountByType: ReactionCountsByType,
  currentUserReaction: ReactionType | null,
  likesCount: number,
): [FeedComment[], boolean] {
  let hasUpdated = false

  const nextComments = comments.map((comment) => {
    if (comment.id === targetCommentId) {
      hasUpdated = true
      return {
        ...comment,
        likesCount,
        reactionsCountByType,
        currentUserReaction,
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    const [updatedReplies, nestedUpdated] = updateCommentReactionStateRecursive(
      comment.replies,
      targetCommentId,
      reactionsCountByType,
      currentUserReaction,
      likesCount,
    )

    if (!nestedUpdated) {
      return comment
    }

    hasUpdated = true
    return {
      ...comment,
      replies: updatedReplies,
    }
  })

  return [hasUpdated ? nextComments : comments, hasUpdated]
}

function replaceRepliesForComment(
  comments: FeedComment[],
  parentCommentId: number,
  replies: FeedComment[],
): FeedComment[] {
  const [updatedComments] = replaceRepliesForCommentRecursive(comments, parentCommentId, replies)
  return updatedComments
}

function replaceRepliesForCommentRecursive(
  comments: FeedComment[],
  parentCommentId: number,
  replies: FeedComment[],
): [FeedComment[], boolean] {
  let hasUpdated = false

  const nextComments = comments.map((comment) => {
    if (comment.id === parentCommentId) {
      hasUpdated = true
      return {
        ...comment,
        replies,
        repliesCount: replies.length,
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    const [updatedReplies, nestedUpdated] = replaceRepliesForCommentRecursive(
      comment.replies,
      parentCommentId,
      replies,
    )

    if (!nestedUpdated) {
      return comment
    }

    hasUpdated = true
    return {
      ...comment,
      replies: updatedReplies,
    }
  })

  return [hasUpdated ? nextComments : comments, hasUpdated]
}

function appendReplyToComment(
  comments: FeedComment[],
  parentCommentId: number,
  reply: FeedComment,
): FeedComment[] {
  const [updatedComments] = appendReplyToCommentRecursive(comments, parentCommentId, reply)
  return updatedComments
}

function appendReplyToCommentRecursive(
  comments: FeedComment[],
  parentCommentId: number,
  reply: FeedComment,
): [FeedComment[], boolean] {
  let hasUpdated = false

  const nextComments = comments.map((comment) => {
    if (comment.id === parentCommentId) {
      hasUpdated = true
      return {
        ...comment,
        replies: [...comment.replies, reply],
        repliesCount: comment.repliesCount + 1,
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    const [updatedReplies, nestedUpdated] = appendReplyToCommentRecursive(
      comment.replies,
      parentCommentId,
      reply,
    )

    if (!nestedUpdated) {
      return comment
    }

    hasUpdated = true
    return {
      ...comment,
      replies: updatedReplies,
    }
  })

  return [hasUpdated ? nextComments : comments, hasUpdated]
}

function removeCommentFromTree(
  comments: FeedComment[],
  targetCommentId: number,
): { comments: FeedComment[]; removedTotal: number; removedDirect: number } {
  let removedTotal = 0
  let removedDirect = 0

  const nextComments: FeedComment[] = []

  comments.forEach((comment) => {
    if (comment.id === targetCommentId) {
      removedTotal += 1
      removedDirect += 1
      return
    }

    if (!comment.replies.length) {
      nextComments.push(comment)
      return
    }

    const nestedResult = removeCommentFromTree(comment.replies, targetCommentId)
    if (nestedResult.removedTotal === 0) {
      nextComments.push(comment)
      return
    }

    removedTotal += nestedResult.removedTotal
    nextComments.push({
      ...comment,
      replies: nestedResult.comments,
      repliesCount: Math.max(0, comment.repliesCount - nestedResult.removedDirect),
    })
  })

  if (removedTotal === 0) {
    return {
      comments,
      removedTotal: 0,
      removedDirect: 0,
    }
  }

  return {
    comments: nextComments,
    removedTotal,
    removedDirect,
  }
}

function buildHandle(firstName?: string, lastName?: string): string {
  const raw = `${firstName ?? ""}${lastName ?? ""}`.replace(/\s+/g, "").toLowerCase()
  return raw ? `@${raw}` : "@user"
}

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}-${month}-${year} • ${hours}:${minutes}`
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
