"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreatePublication, PublicationFeed } from "@/components/features/publication"
import { PublicationCard } from "@/components/features/publication"
import { Spinner } from "@/components/ui/spinner"
import { Callout } from "@/components/ui/callout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog"
import { publicationService } from "@/services/api"
import { useAuth } from "@/providers/auth-provider"
import type { UserRole } from "@/types/auth"
import type { CommentDto, FeedComment, FeedPost, PublicationDto, ReactionCountsByType, ReactionType } from "@/types"
import { ProfilePatternOverlay } from "./ProfilePatternOverlay"

type ProfileType = "user" | "store" | "coach"

interface ProfileViewsProps {
  lang: "ar" | "en"
  profileType: ProfileType
  displayName: string
  handle: string
  avatarUrl: string
  userRole: UserRole
  userId: number
}

type ImagePostItem = {
  id: number
  previewImage: string
  imageCount: number
  post: FeedPost
}

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

function mapPublicationToImagePost(publication: PublicationDto): ImagePostItem | null {
  const imageMedia = (publication.media ?? []).filter((media) => media.mediaType === "image")
  if (imageMedia.length === 0) {
    return null
  }

  const authorFirstName = publication.user?.firstName ?? ""
  const authorLastName = publication.user?.lastName ?? ""
  const authorFullName = `${authorFirstName} ${authorLastName}`.trim() || "User"
  const handleRaw = `${authorFirstName}${authorLastName}`.replace(/\s+/g, "").toLowerCase()

  const post: FeedPost = {
    id: publication.id,
    author: {
      id: publication.user?.id ?? 0,
      name: authorFullName,
      handle: handleRaw ? `@${handleRaw}` : "@user",
      avatarUrl: publication.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: publication.content ?? "",
    images: imageMedia.map((media) => media.thumbnailUrl || media.url).filter(Boolean),
    originalImages: imageMedia.map((media) => media.url).filter(Boolean),
    visibility: publication.visibility,
    createdAt: formatPostDate(publication.createdAt),
    likesCount: publication.likesCount ?? 0,
    commentsCount: publication.commentsCount ?? 0,
    sharesCount: publication.sharesCount ?? 0,
    comments: [],
    reactionsCountByType: undefined,
    currentUserReaction: null,
  }

  return {
    id: publication.id,
    previewImage: post.images[0] ?? post.originalImages?.[0] ?? "",
    imageCount: post.images.length,
    post,
  }
}

function mapCommentToFeedComment(comment: CommentDto): FeedComment {
  const firstName = comment.user?.firstName ?? ""
  const lastName = comment.user?.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "User"
  const handleRaw = `${firstName}${lastName}`.replace(/\s+/g, "").toLowerCase()

  return {
    id: comment.id,
    author: {
      id: comment.user?.id ?? 0,
      name: fullName,
      handle: handleRaw ? `@${handleRaw}` : "@user",
      avatarUrl: comment.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: comment.content,
    isDeleted: comment.isDeleted,
    createdAt: formatPostDate(comment.createdAt),
    likesCount: 0,
    parentCommentId: comment.parentCommentId,
    repliesCount: comment.repliesCount ?? 0,
    replies: (comment.replies ?? []).map((reply) => mapCommentToFeedComment(reply)),
  }
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

function markCommentAsDeleted(
  comments: FeedComment[],
  targetCommentId: number,
  deletedText: string,
): { comments: FeedComment[]; didUpdate: boolean } {
  let hasUpdated = false

  const nextComments = comments.map((comment) => {
    if (comment.id === targetCommentId) {
      hasUpdated = true
      return {
        ...comment,
        text: deletedText,
        isDeleted: true,
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    const nestedResult = markCommentAsDeleted(comment.replies, targetCommentId, deletedText)
    if (!nestedResult.didUpdate) {
      return comment
    }

    hasUpdated = true
    return {
      ...comment,
      replies: nestedResult.comments,
    }
  })

  return {
    comments: hasUpdated ? nextComments : comments,
    didUpdate: hasUpdated,
  }
}

function formatPostDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}-${month}-${year} • ${hours}:${minutes}`
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

function ProfileImagesTab({ lang, userId, emptyTitle, emptyDesc, refreshKey, onPublished }: {
  lang: "ar" | "en"
  userId?: number
  emptyTitle: string
  emptyDesc: string
  refreshKey?: number
  onPublished?: () => void
}) {
  const { user } = useAuth()
  const [imagePosts, setImagePosts] = React.useState<ImagePostItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [activePostIndex, setActivePostIndex] = React.useState<number | null>(null)
  const [addingCommentByPostId, setAddingCommentByPostId] = React.useState<Record<number, boolean>>({})
  const [updatingPostById, setUpdatingPostById] = React.useState<Record<number, boolean>>({})
  const [deletingPostById, setDeletingPostById] = React.useState<Record<number, boolean>>({})
  const [showCreator, setShowCreator] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const loadImagePosts = async () => {
      if (!userId) {
        setImagePosts([])
        setErrorCode(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorCode(null)

      const userPublicationsResult = await publicationService.getUserPublications(userId)

      if (!isMounted) return

      let publications: PublicationDto[] = []

      if (userPublicationsResult.success && userPublicationsResult.data) {
        publications = Array.isArray(userPublicationsResult.data) ? userPublicationsResult.data : []
      } else {
        const fallbackFeedResult = await publicationService.getFeed(0, 50)

        if (!isMounted) return

        if (!fallbackFeedResult.success || !fallbackFeedResult.data) {
          setImagePosts([])
          setErrorCode(userPublicationsResult.code ?? fallbackFeedResult.code ?? "NETWORK_ERROR")
          setIsLoading(false)
          return
        }

        const fallbackItems = Array.isArray(fallbackFeedResult.data)
          ? fallbackFeedResult.data
          : (fallbackFeedResult.data.content ?? [])

        publications = fallbackItems.filter((publication) => publication.user?.id === userId)
      }

      const mapped = publications
        .map((publication) => mapPublicationToImagePost(publication))
        .filter((item): item is ImagePostItem => Boolean(item))

      const commentsResults = await Promise.all(
        mapped.map((item) => publicationService.getRootComments(item.post.id, 0, 10)),
      )

      const reactionsResults = await Promise.all(
        mapped.map((item) =>
          loadReactionState(item.post.id, item.post.likesCount ?? 0, user?.id),
        ),
      )

      const withInteractions = mapped.map((item, index) => {
        const comments = commentsResults[index]?.success
          ? commentsResults[index]?.data?.content ?? []
          : []
        const reactionState = reactionsResults[index]

        return {
          ...item,
          post: {
            ...item.post,
            comments: comments.map((comment) => mapCommentToFeedComment(comment)),
            reactionsCountByType: reactionState.reactionsCountByType ?? {},
            currentUserReaction: reactionState.currentUserReaction,
          },
        }
      })

      setImagePosts(withInteractions)
      setIsLoading(false)
    }

    loadImagePosts()

    return () => {
      isMounted = false
    }
  }, [lang, user?.id, userId, refreshKey])

  const hasActivePost = activePostIndex !== null && imagePosts[activePostIndex]
  const isRTL = lang === "ar"
  const deletedCommentText = lang === "ar" ? "تم حذف التعليق" : "Comment deleted"
  const canGoPrevious = activePostIndex !== null && activePostIndex > 0
  const canGoNext = activePostIndex !== null && activePostIndex < imagePosts.length - 1

  const handleReact = async (publicationId: number, reactionType: ReactionType) => {
    const result = await publicationService.toggleReaction(publicationId, reactionType)
    if (!result.success || !result.data) {
      return
    }

    const mappedCounts = normalizeReactionCounts(result.data.reactionsCount ?? {})
    const totalReactions = Object.values(mappedCounts).reduce((sum, count) => sum + (count ?? 0), 0)

    setImagePosts((currentPosts) =>
      currentPosts.map((item) =>
        item.post.id === publicationId
          ? {
              ...item,
              post: {
                ...item.post,
                reactionsCountByType: mappedCounts,
                likesCount: totalReactions,
                currentUserReaction: parseReactionType(result.data?.currentUserReaction),
              },
            }
          : item,
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

    setImagePosts((currentPosts) =>
      currentPosts.map((item) =>
        item.post.id === publicationId
          ? {
              ...item,
              post: {
                ...item.post,
                comments: [createdComment, ...item.post.comments],
                commentsCount: item.post.commentsCount + 1,
              },
            }
          : item,
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

    setImagePosts((currentPosts) =>
      currentPosts.map((item) =>
        item.post.id === publicationId
          ? {
              ...item,
              post: {
                ...item.post,
                comments: replaceRepliesForComment(item.post.comments, parentCommentId, mappedReplies),
              },
            }
          : item,
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

    setImagePosts((currentPosts) =>
      currentPosts.map((item) => {
        if (item.post.id !== publicationId) {
          return item
        }

        if (repliesResult.success && repliesResult.data) {
          const repliesData: CommentDto[] = repliesResult.data
          const mappedReplies = repliesData.map((reply) => mapCommentToFeedComment(reply))

          return {
            ...item,
            post: {
              ...item.post,
              comments: replaceRepliesForComment(item.post.comments, parentCommentId, mappedReplies),
              commentsCount: item.post.commentsCount + 1,
            },
          }
        }

        const createdReply = mapCommentToFeedComment(createdReplyDto)

        return {
          ...item,
          post: {
            ...item.post,
            comments: appendReplyToComment(item.post.comments, parentCommentId, createdReply),
            commentsCount: item.post.commentsCount + 1,
          },
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

    setImagePosts((currentPosts) =>
      currentPosts.map((item) => {
        if (item.post.id !== publicationId) {
          return item
        }

        const deletionResult = markCommentAsDeleted(item.post.comments, commentId, deletedCommentText)
        if (!deletionResult.didUpdate) {
          return item
        }

        return {
          ...item,
          post: {
            ...item.post,
            comments: deletionResult.comments,
            commentsCount: Math.max(0, item.post.commentsCount - 1),
          },
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

    setImagePosts((currentPosts) => {
      const filtered = currentPosts.filter((item) => item.post.id !== publicationId)

      setActivePostIndex((currentIndex) => {
        if (currentIndex === null) return currentIndex
        if (filtered.length === 0) return null

        const removedIndex = currentPosts.findIndex((item) => item.post.id === publicationId)
        if (removedIndex === -1) return currentIndex

        if (currentIndex > removedIndex) {
          return currentIndex - 1
        }

        if (currentIndex === removedIndex) {
          return Math.min(currentIndex, filtered.length - 1)
        }

        return currentIndex
      })

      return filtered
    })

    onPublished?.()
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
    const updatedImages = (updatedPublication.media ?? [])
      .filter((media) => media.mediaType === "image")
      .map((media) => media.thumbnailUrl || media.url)
      .filter(Boolean)
    const updatedOriginalImages = (updatedPublication.media ?? [])
      .filter((media) => media.mediaType === "image")
      .map((media) => media.url)
      .filter(Boolean)

    setImagePosts((currentPosts) =>
      currentPosts.map((item) => {
        if (item.post.id !== publicationId) {
          return item
        }

        const previewImage = updatedImages[0] ?? updatedOriginalImages[0] ?? item.previewImage

        return {
          ...item,
          previewImage,
          imageCount: updatedImages.length || item.imageCount,
          post: {
            ...item.post,
            text: updatedPublication.content ?? "",
            visibility: updatedPublication.visibility,
            images: updatedImages,
            originalImages: updatedOriginalImages,
            likesCount: updatedPublication.likesCount ?? item.post.likesCount,
            commentsCount: updatedPublication.commentsCount ?? item.post.commentsCount,
            sharesCount: updatedPublication.sharesCount ?? item.post.sharesCount,
          },
        }
      }),
    )

    return true
  }

  return (
    <div className="mt-4">
      <div className={`mb-3 flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => setShowCreator(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
        >
          <Icon icon="solar:add-circle-linear" className="size-4" />
          {lang === "ar" ? "إنشاء منشور" : "Create post"}
        </button>
      </div>

      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setShowCreator(false)}
            className="fixed right-4 top-4 z-90 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
            title={lang === "ar" ? "إغلاق" : "Close"}
            aria-label={lang === "ar" ? "إغلاق" : "Close"}
          >
            <Icon icon="lucide:x" className="size-5" />
          </button>
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "إنشاء منشور" : "Create post"}</DialogTitle>
            <DialogDescription>
              {lang === "ar" ? "شارك صورة أو فيديو جديداً من تبويب الصور." : "Share a new photo or video from the images tab."}
            </DialogDescription>
          </DialogHeader>
          <CreatePublication
            onPublished={() => {
              setShowCreator(false)
              onPublished?.()
            }}
          />
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-muted/20">
          <Spinner className="size-12" />
        </div>
      )}

      {!isLoading && errorCode && (
        <Callout variant="error" title={lang === "ar" ? "حدث خطأ" : "An error occurred"}>
          {errorCode}
        </Callout>
      )}

      {!isLoading && !errorCode && imagePosts.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDesc} />
      )}

      {!isLoading && !errorCode && imagePosts.length > 0 && (
        <div dir={isRTL ? "rtl" : "ltr"} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imagePosts.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePostIndex(index)}
              className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/20 p-1"
              title={lang === "ar" ? "فتح المنشور" : "Open post"}
            >
              <Image
                src={item.previewImage}
                alt={lang === "ar" ? "صورة منشور" : "Post image"}
                width={800}
                height={800}
                className="h-full w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />

              {item.imageCount > 1 && (
                <span className={`absolute top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] font-semibold text-white ${isRTL ? "left-2" : "right-2"}`}>
                  <Icon icon="solar:gallery-wide-linear" className="size-3.5" />
                  {item.imageCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {hasActivePost && (
        <div
          className="fixed inset-0 z-70 overflow-y-auto bg-black/75 p-4"
          onClick={() => setActivePostIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActivePostIndex(null)}
            className="fixed right-4 top-4 z-90 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
            title={lang === "ar" ? "إغلاق" : "Close"}
            aria-label={lang === "ar" ? "إغلاق" : "Close"}
          >
            <Icon icon="lucide:x" className="size-5" />
          </button>

          <div className="mx-auto flex min-h-full w-full max-w-4xl items-start justify-center pt-14 pb-4 md:items-center md:py-4">
            <div
              className="relative w-full"
              onClick={(event) => event.stopPropagation()}
            >
            {canGoPrevious && (
              <button
                type="button"
                onClick={() => setActivePostIndex((current) => (current !== null ? current - 1 : current))}
                className={`absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 md:inline-flex dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 ${isRTL ? "-right-12" : "-left-12"}`}
                title={lang === "ar" ? "المنشور السابق" : "Previous post"}
              >
                <Icon icon={isRTL ? "lucide:chevron-right" : "lucide:chevron-left"} className="size-5" />
              </button>
            )}

            {canGoNext && (
              <button
                type="button"
                onClick={() => setActivePostIndex((current) => (current !== null ? current + 1 : current))}
                className={`absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 md:inline-flex dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 ${isRTL ? "-left-12" : "-right-12"}`}
                title={lang === "ar" ? "المنشور التالي" : "Next post"}
              >
                <Icon icon={isRTL ? "lucide:chevron-left" : "lucide:chevron-right"} className="size-5" />
              </button>
            )}

            <PublicationCard
              post={imagePosts[activePostIndex].post}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onLoadReplies={handleLoadReplies}
              onDeleteComment={handleDeleteComment}
              onReportComment={handleReportComment}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              isAddingComment={Boolean(addingCommentByPostId[imagePosts[activePostIndex].post.id])}
              isUpdating={Boolean(updatingPostById[imagePosts[activePostIndex].post.id])}
              isDeleting={Boolean(deletingPostById[imagePosts[activePostIndex].post.id])}
              forceSquareSingleImage
              canDelete={Boolean(userId && user?.id === userId)}
              scrollableComments
            />

            <div className={`mt-3 flex items-center justify-between md:hidden ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-10">
                {canGoPrevious && (
                  <button
                    type="button"
                    onClick={() => setActivePostIndex((current) => (current !== null ? current - 1 : current))}
                    className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
                    title={lang === "ar" ? "المنشور السابق" : "Previous post"}
                    aria-label={lang === "ar" ? "المنشور السابق" : "Previous post"}
                  >
                    <Icon icon={isRTL ? "lucide:chevron-right" : "lucide:chevron-left"} className="size-5" />
                  </button>
                )}
              </div>

              <div className={`w-10 ${isRTL ? "text-left" : "text-right"}`}>
                {canGoNext && (
                  <button
                    type="button"
                    onClick={() => setActivePostIndex((current) => (current !== null ? current + 1 : current))}
                    className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
                    title={lang === "ar" ? "المنشور التالي" : "Next post"}
                    aria-label={lang === "ar" ? "المنشور التالي" : "Next post"}
                  >
                    <Icon icon={isRTL ? "lucide:chevron-left" : "lucide:chevron-right"} className="size-5" />
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function labels(lang: "ar" | "en") {
  return lang === "ar"
    ? {
        posts: "منشور",
        followers: "متابعين",
        following: "أتابع",
        subscribe: "اشترك الآن",
        profileButton: "تعديل الملف الشخصي",
        report: "عرض الأرشيف",
        tabPosts: "منشورات",
        tabImages: "صور",
        tabVideos: "فيديوهات",
        tabEvents: "أحداث",
        emptyTitle: "لا يوجد محتوى بعد",
        emptyDesc: "سيظهر المحتوى هنا بعد ربط المنطق.",
        privateAccounts: "حساباتي الخاصة",
        aboutUser:
          "نؤمن دائمًا بصناعة فرق من البداية بطريقة منهجية، وهدفنا تقديم تجربة متكاملة وقابلة للتطوير مع تقدم مستواك الرياضي.",
        aboutStore:
          "نوفّر لك أفضل المنتجات المختارة بعناية مع تجربة شراء سلسة وخدمة موثوقة، وسيتم ربط بيانات المنتجات الحقيقية لاحقًا.",
        aboutCoach:
          "مدرب معتمد بخبرة عملية، أساعدك على بناء خطة واضحة تناسب أهدافك مع متابعة مستمرة وتوجيه شخصي.",
        certificates: "شهادات التدريب",
        sessions: "مواعيد العمل",
        packages: "الحصص التدريبية",
        prices: "الأسعار",
        links: "روابط التواصل",
        products: "منتجات المتجر",
      }
    : {
        posts: "Posts",
        followers: "Followers",
        following: "Following",
        subscribe: "Subscribe",
        profileButton: "Edit profile",
        report: "View archive",
        tabPosts: "Posts",
        tabImages: "Images",
        tabVideos: "Videos",
        tabEvents: "Events",
        emptyTitle: "No content yet",
        emptyDesc: "Content will appear here once logic is connected.",
        privateAccounts: "Private accounts",
        aboutUser:
          "We provide a progressive training experience with a practical methodology designed to grow with your goals.",
        aboutStore:
          "We curate high-quality products with a smooth shopping experience. Real product data will be connected later.",
        aboutCoach:
          "Certified coach with practical experience, helping you build a clear plan with consistent guidance.",
        certificates: "Training certificates",
        sessions: "Working schedule",
        packages: "Training packages",
        prices: "Pricing",
        links: "Social links",
        products: "Store products",
      }
}

function ProfileHeader({
  lang,
  profileType,
  displayName,
  handle,
  avatarUrl,
  about,
  userRole,
}: {
  lang: "ar" | "en"
  profileType: ProfileType
  displayName: string
  handle: string
  avatarUrl: string
  about: string
  userRole: UserRole
}) {
  const t = labels(lang)
  const isRTL = lang === "ar"
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)

  const closePreview = () => {
    setIsPreviewOpen(false)
    setZoom(1)
  }

  const zoomIn = () => setZoom((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))))
  const zoomOut = () => setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))))
  const resetZoom = () => setZoom(1)
  const badgeType =
    profileType === "store"
      ? "STORE"
      : profileType === "coach"
        ? "COACH"
        : userRole === "ADMIN"
          ? "ADMIN"
          : "USER"

  const roleBadgeConfig =
    lang === "ar"
      ? {
          USER: {
            label: "مستخدم",
            icon: "solar:user-linear",
            className: "border-success/30 bg-success/15 text-success",
          },
          ADMIN: {
            label: "مدير",
            icon: "solar:shield-user-linear",
            className: "border-destructive/30 bg-destructive/15 text-destructive",
          },
          STORE: {
            label: "متجر",
            icon: "solar:shop-linear",
            className: "border-warning/30 bg-warning/15 text-warning",
          },
          COACH: {
            label: "مدرب",
            icon: "solar:medal-ribbons-star-linear",
            className: "border-primary/30 bg-primary/15 text-primary",
          },
        }
      : {
          USER: {
            label: "User",
            icon: "solar:user-linear",
            className: "border-success/30 bg-success/15 text-success",
          },
          ADMIN: {
            label: "Admin",
            icon: "solar:shield-user-linear",
            className: "border-destructive/30 bg-destructive/15 text-destructive",
          },
          STORE: {
            label: "Store",
            icon: "solar:shop-linear",
            className: "border-warning/30 bg-warning/15 text-warning",
          },
          COACH: {
            label: "Coach",
            icon: "solar:medal-ribbons-star-linear",
            className: "border-primary/30 bg-primary/15 text-primary",
          },
        }

  const roleBadge = roleBadgeConfig[badgeType]

  React.useEffect(() => {
    if (!isPreviewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isPreviewOpen])

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {isRTL ? (
        <>
          <div className="space-y-5">
              <div dir="ltr" className="flex items-center justify-between gap-3">
              <button
                type="button"
                title="إضافة"
                aria-label="إضافة"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              >
                <Icon icon="solar:add-circle-linear" className="size-5" />
              </button>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button className="hidden sm:inline-flex rounded-md border border-border bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  عرض الأرشيف
                </button>
                <button className="hidden sm:inline-flex rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                  تعديل الملف الشخصي
                </button>
                <button className="hidden sm:inline-flex items-center gap-1 rounded-md bg-warning px-4 py-1.5 text-sm font-semibold text-warning-foreground">
                  <Icon icon="solar:crown-bold" className="size-4" />
                  ترقية إلى حساب مدرب
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title="خيارات"
                      aria-label="خيارات"
                      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
                    >
                      <Icon icon="solar:menu-dots-linear" className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="sm:hidden min-w-56 space-y-1 p-2">
                    <DropdownMenuItem className="justify-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 focus:bg-muted/80 dark:hover:bg-muted/80 dark:focus:bg-muted/80 data-highlighted:bg-muted/80 dark:data-highlighted:bg-muted/80">
                      عرض الأرشيف
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 dark:hover:bg-primary/90 dark:focus:bg-primary/90 data-highlighted:bg-primary/90 dark:data-highlighted:bg-primary/90">
                      تعديل الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-warning px-4 py-2 text-sm font-semibold text-warning-foreground hover:bg-warning/90 focus:bg-warning/90 dark:hover:bg-warning/90 dark:focus:bg-warning/90 data-highlighted:bg-warning/90 dark:data-highlighted:bg-warning/90">
                      <Icon icon="solar:crown-bold" className="size-4" />
                      ترقية إلى حساب مدرب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>

              <div className="relative overflow-hidden rounded-lg">
                <ProfilePatternOverlay />
                <div dir="ltr" className="relative z-10 px-2 py-3 md:px-3 md:py-4 flex flex-col items-center gap-4 md:flex-row md:items-center">
                <div className="order-2 w-full md:order-1 md:flex-1">
                  <div className="flex items-center justify-center gap-8 sm:gap-12">
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">548</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">منشور</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">12.7K</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">متابعين</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">221</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">أتابع</span>
                    </div>
                  </div>
                </div>

                <div dir="ltr" className="order-1 flex flex-col items-center gap-2 text-center md:order-2 md:flex-row md:items-start md:gap-3 md:text-right">
                  <div className="order-2 min-w-0 md:order-1">
                    <div className="mb-1 flex items-center justify-end gap-2">
                      <h1 className="text-[28px] sm:text-[34px] font-bold leading-none text-foreground">{displayName}</h1>
                    </div>
                    <p className="text-center text-sm text-muted-foreground md:text-right">{handle}</p>
                    <div className="mt-1 flex justify-center md:justify-end">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${roleBadge.className}`}>
                        <Icon icon={roleBadge.icon} className="size-3.5" />
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="order-1 relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer md:order-2"
                    title="عرض الصورة"
                    aria-label="عرض الصورة"
                  >
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={132}
                      height={132}
                      className="size-24 sm:size-28 rounded-full object-cover ring-2 ring-primary/80"
                    />
                  </button>
                </div>
                </div>
              </div>
          </div>

          <div className="mt-5 border-t border-border pt-4 text-right">
            <h3 className="mb-2 text-lg font-bold text-foreground">نبذة</h3>
            <p className="text-base leading-8 text-muted-foreground">{about}</p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center justify-start gap-2">
                <button className="hidden sm:inline-flex rounded-md border border-border bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  {t.report}
                </button>
                <button className="hidden sm:inline-flex rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                  {t.profileButton}
                </button>
                <button className="hidden sm:inline-flex items-center gap-1 rounded-md bg-warning px-4 py-1.5 text-sm font-semibold text-warning-foreground">
                  <Icon icon="solar:crown-bold" className="size-4" />
                  Upgrade to coach account
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground" type="button" title="Options" aria-label="Options">
                      <Icon icon="solar:menu-dots-linear" className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="sm:hidden min-w-56 space-y-1 p-2">
                    <DropdownMenuItem className="justify-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 focus:bg-muted/80 dark:hover:bg-muted/80 dark:focus:bg-muted/80 data-highlighted:bg-muted/80 dark:data-highlighted:bg-muted/80">
                      {t.report}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 dark:hover:bg-primary/90 dark:focus:bg-primary/90 data-highlighted:bg-primary/90 dark:data-highlighted:bg-primary/90">
                      {t.profileButton}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-warning px-4 py-2 text-sm font-semibold text-warning-foreground hover:bg-warning/90 focus:bg-warning/90 dark:hover:bg-warning/90 dark:focus:bg-warning/90 data-highlighted:bg-warning/90 dark:data-highlighted:bg-warning/90">
                      <Icon icon="solar:crown-bold" className="size-4" />
                      Upgrade to coach account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                type="button"
                title="Add"
                aria-label="Add"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              >
                <Icon icon="solar:add-circle-linear" className="size-5" />
              </button>
              </div>

              <div className="relative overflow-hidden rounded-lg">
                <ProfilePatternOverlay />
                <div className="relative z-10 px-2 py-3 md:px-3 md:py-4 flex flex-col items-center gap-4 md:flex-row md:items-center">
                <div className="order-1 flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-3 md:text-left">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    title="Preview image"
                    aria-label="Preview image"
                  >
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={132}
                      height={132}
                      className="size-24 sm:size-28 rounded-full object-cover ring-2 ring-primary/80"
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-start gap-2">
                      <h1 className="text-[28px] sm:text-[34px] font-bold leading-none text-foreground">{displayName}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">{handle}</p>
                    <div className="mt-1 flex justify-center md:justify-start">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${roleBadge.className}`}>
                        <Icon icon={roleBadge.icon} className="size-3.5" />
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-2 w-full md:flex-1">
                  <div className="flex items-center justify-center gap-10 sm:gap-14">
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">221</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.following}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">12.7K</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.followers}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">548</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.posts}</span>
                    </div>
                  </div>
                </div>
                </div>
              </div>
          </div>

          <div className="mt-5 border-t border-border pt-4 text-left">
            <h3 className="mb-2 text-lg font-bold text-foreground">Bio</h3>
            <p className="text-base leading-8 text-muted-foreground">{about}</p>
          </div>
        </>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ar" ? "معاينة الصورة الشخصية" : "Profile image preview"}
          onClick={closePreview}
        >
          <div
            className="mx-auto flex h-full w-full max-w-5xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-50"
                  title={lang === "ar" ? "تصغير" : "Zoom out"}
                  aria-label={lang === "ar" ? "تصغير" : "Zoom out"}
                >
                  <Icon icon="solar:minus-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-50"
                  title={lang === "ar" ? "تكبير" : "Zoom in"}
                  aria-label={lang === "ar" ? "تكبير" : "Zoom in"}
                >
                  <Icon icon="solar:add-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="inline-flex items-center rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/20"
                >
                  {lang === "ar" ? "إعادة" : "Reset"}
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20"
                  title={lang === "ar" ? "إغلاق" : "Close"}
                  aria-label={lang === "ar" ? "إغلاق" : "Close"}
                >
                  <Icon icon="solar:close-circle-linear" className="size-5" />
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 overflow-hidden rounded-2xl border border-white/20 bg-black/30"
              onWheel={(event) => {
                event.preventDefault()
                if (event.deltaY < 0) {
                  zoomIn()
                } else {
                  zoomOut()
                }
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={1000}
                  height={1000}
                  className="max-h-full w-auto max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyProfileTabs({ lang, userId }: { lang: "ar" | "en"; userId?: number }) {
  const t = labels(lang)
  const isRTL = lang === "ar"
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handlePublished = () => {
    setRefreshKey((current) => current + 1)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList variant="line" className={`w-full justify-between border-b border-border pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <TabsTrigger value="posts" className="cursor-pointer">
            <span className={`inline-flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Icon icon="solar:document-text-linear" className="size-4" />
              {t.tabPosts}
            </span>
          </TabsTrigger>
          <TabsTrigger value="images" className="cursor-pointer">
            <span className={`inline-flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Icon icon="solar:gallery-linear" className="size-4" />
              {t.tabImages}
            </span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="cursor-pointer">
            <span className={`inline-flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Icon icon="solar:videocamera-record-linear" className="size-4" />
              {t.tabVideos}
            </span>
          </TabsTrigger>
          <TabsTrigger value="events" className="cursor-pointer">
            <span className={`inline-flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Icon icon="solar:calendar-linear" className="size-4" />
              {t.tabEvents}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {userId ? (
            <div className="mt-4" dir={isRTL ? "rtl" : "ltr"}>
              <CreatePublication onPublished={handlePublished} className="mb-4" />
              <PublicationFeed
                userId={userId}
                showHeader={false}
                showSuggestions={false}
                refreshKey={refreshKey}
                emptyState={<EmptyState title={t.emptyTitle} description={t.emptyDesc} />}
              />
            </div>
          ) : (
            <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
          )}
        </TabsContent>
        <TabsContent value="images">
          <ProfileImagesTab
            lang={lang}
            userId={userId}
            emptyTitle={t.emptyTitle}
            emptyDesc={t.emptyDesc}
            refreshKey={refreshKey}
            onPublished={handlePublished}
          />
        </TabsContent>
        <TabsContent value="videos">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
        <TabsContent value="events">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center mt-4">
      <div className="mx-auto mb-2 size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Icon icon="solar:document-linear" className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function ChipsRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
          {item}
        </span>
      ))}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function UserProfileView({ lang, displayName, handle, avatarUrl, userRole, userId }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="user"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutUser}
      />
      <EmptyProfileTabs lang={lang} userId={userId} />
    </div>
  )
}

function StoreProfileView({ lang, displayName, handle, avatarUrl, userRole, userId }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="store"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutStore}
      />

      <SectionCard title={t.links}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              https://example.com
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t.products}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-background p-2">
              <div className="aspect-square rounded-md bg-muted/50" />
              <p className="mt-2 text-xs font-medium text-foreground">{lang === "ar" ? "منتج" : "Product"} {index + 1}</p>
              <p className="text-[11px] text-muted-foreground">97.50 {lang === "ar" ? "درهم" : "MAD"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <EmptyProfileTabs lang={lang} userId={userId} />
    </div>
  )
}

function CoachProfileView({ lang, displayName, handle, avatarUrl, userRole, userId }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="coach"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutCoach}
      />

      <SectionCard title={t.certificates}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-background p-3">
              <div className="h-16 rounded-md bg-muted/50" />
              <p className="mt-2 text-xs text-foreground">{lang === "ar" ? "شهادة تدريب" : "Training certificate"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t.sessions}>
        <ChipsRow items={lang === "ar" ? ["الأحد 6:30 ص", "الإثنين 6:30 ص", "الثلاثاء 6:30 ص", "الأربعاء 1:00 م"] : ["Sunday 6:30 AM", "Monday 6:30 AM", "Tuesday 6:30 AM", "Wednesday 1:00 PM"]} />
      </SectionCard>

      <SectionCard title={t.packages}>
        <ChipsRow items={lang === "ar" ? ["دورة اللياقة", "الجري مع الأصدقاء", "كرة القدم"] : ["Fitness cycle", "Run with friends", "Football"]} />
      </SectionCard>

      <SectionCard title={t.prices}>
        <ChipsRow items={lang === "ar" ? ["الجلسة 40 درهم", "الأسبوع 400 درهم", "الشهر 4000 درهم"] : ["Session 40 MAD", "Week 400 MAD", "Month 4000 MAD"]} />
      </SectionCard>

      <SectionCard title={t.links}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              https://example.com
            </div>
          ))}
        </div>
      </SectionCard>

      <EmptyProfileTabs lang={lang} userId={userId} />
    </div>
  )
}

export function ProfileViews({ lang, profileType, displayName, handle, avatarUrl, userRole, userId }: ProfileViewsProps) {
  if (profileType === "store") {
    return <StoreProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} userId={userId} />
  }

  if (profileType === "coach") {
    return <CoachProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} userId={userId} />
  }

  return <UserProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} userId={userId} />
}
