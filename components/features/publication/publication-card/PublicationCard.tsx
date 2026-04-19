"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { PublicationMedia } from "../publication-media"
import { PublicationActions } from "../publication-actions"
import { CommentSection } from "../comments/comment-section"
import { CreatePublication } from "../create-publication"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { useNavRouter } from "@/hooks/use-nav-router"
import type { MockPost, ReactionType, VisibilityPublication } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog"
import { Textarea } from "@/components/ui/primitives/textarea"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const TEXT_LIMIT = 200

function resolveVisibilityMeta(
  visibility: VisibilityPublication | undefined,
  labels: {
    privacyPublic: string
    privacyFriends: string
    privacyPrivate: string
  },
) {
  if (visibility === "PUBLIC") {
    return { icon: "solar:global-linear", label: labels.privacyPublic }
  }

  if (visibility === "FRIENDS") {
    return { icon: "solar:users-group-rounded-linear", label: labels.privacyFriends }
  }

  if (visibility === "PRIVATE") {
    return { icon: "solar:lock-keyhole-linear", label: labels.privacyPrivate }
  }

  return null
}

/**
 * A single publication card with header, body, media, actions, and comments.
 */
export function PublicationCard({
  post,
  className,
  currentUserId,
  followStateByUserId,
  isFollowBusyByUserId,
  onFollowUser,
  onUnfollowUser,
  onReact,
  onReactComment,
  onAddComment,
  onCommentIntent,
  onAddReply,
  onLoadReplies,
  onUpdateComment,
  onLoadMoreComments,
  onDeleteComment,
  onReportComment,
  onUpdatePost,
  onDeletePost,
  onSharePublication,
  totalCommentsCount,
  areCommentsInitialized,
  hasMoreComments,
  isLoadingMoreComments,
  isAddingComment,
  isUpdating,
  isDeleting,
  isSharing,
  forceSquareSingleImage,
  canDelete,
  scrollableComments,
}: {
  post: MockPost
  className?: string
  currentUserId?: number
  followStateByUserId?: Record<number, "follow" | "following">
  isFollowBusyByUserId?: Record<number, boolean>
  onFollowUser?: (targetUserId: number) => Promise<boolean> | boolean
  onUnfollowUser?: (targetUserId: number) => Promise<boolean> | boolean
  onReact?: (publicationId: number, reactionType: ReactionType) => void
  onReactComment?: (publicationId: number, commentId: number, reactionType: ReactionType) => void
  onAddComment?: (publicationId: number, content: string) => Promise<void> | void
  onCommentIntent?: (publicationId: number) => Promise<void> | void
  onAddReply?: (publicationId: number, parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (publicationId: number, commentId: number) => Promise<void> | void
  onUpdateComment?: (publicationId: number, commentId: number, content: string) => Promise<boolean> | boolean
  onLoadMoreComments?: (publicationId: number) => Promise<void> | void
  onDeleteComment?: (publicationId: number, commentId: number) => Promise<boolean> | boolean
  onReportComment?: (publicationId: number, commentId: number) => Promise<boolean> | boolean
  onUpdatePost?: (
    publicationId: number,
    payload: {
      content: string
      visibility: VisibilityPublication
      mediaFiles: File[]
      mediaIdsToRemove: number[]
    },
  ) => Promise<boolean> | boolean
  onDeletePost?: (publicationId: number) => Promise<boolean> | boolean
  onSharePublication?: (
    publicationId: number,
    payload: { content: string; visibility: VisibilityPublication },
  ) => Promise<boolean> | boolean
  totalCommentsCount?: number
  areCommentsInitialized?: boolean
  hasMoreComments?: boolean
  isLoadingMoreComments?: boolean
  isAddingComment?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
  isSharing?: boolean
  forceSquareSingleImage?: boolean
  canDelete?: boolean
  scrollableComments?: boolean
}) {
  const { dictionary, lang } = useDictionary()
  const { user } = useAuth()
  const router = useNavRouter()
  const t = dictionary.feed
  const isRTL = lang === "ar"
  const [isExpanded, setIsExpanded] = useState(false)
  const [commentFocusSignal, setCommentFocusSignal] = useState(0)
  const [isEditingInline, setIsEditingInline] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareText, setShareText] = useState("")
  const [shareVisibility, setShareVisibility] = useState<VisibilityPublication>("PUBLIC")
  const [isShareTextExpanded, setIsShareTextExpanded] = useState(false)
  const [isShareSubmitting, setIsShareSubmitting] = useState(false)
  const isLong = post.text && post.text.length > TEXT_LIMIT
  const isOwner = user?.id === post.author.id
  const canShowDelete = canDelete ?? isOwner
  const canShowEdit = Boolean(onUpdatePost) && isOwner
  const canShowReport = true
  const hasMenuActions = canShowDelete || canShowEdit || canShowReport
  const sharedPost = post.sharedPublication
  const shareSourcePost = sharedPost ?? post
  const shareTargetPublicationId = shareSourcePost.id
  const editPostLabel = t.editPost
  const reportPostLabel = t.reportPost
  const updatePostLabel = t.updatePost
  const visibilityMeta = resolveVisibilityMeta(post.visibility, {
    privacyPublic: t.privacyPublic,
    privacyFriends: t.privacyFriends,
    privacyPrivate: t.privacyPrivate,
  })
  const sharedVisibilityMeta = resolveVisibilityMeta(sharedPost?.visibility, {
    privacyPublic: t.privacyPublic,
    privacyFriends: t.privacyFriends,
    privacyPrivate: t.privacyPrivate,
  })
  const shareSourceVisibilityMeta = resolveVisibilityMeta(shareSourcePost.visibility, {
    privacyPublic: t.privacyPublic,
    privacyFriends: t.privacyFriends,
    privacyPrivate: t.privacyPrivate,
  })
  const shareVisibilityMeta = resolveVisibilityMeta(shareVisibility, {
    privacyPublic: t.privacyPublic,
    privacyFriends: t.privacyFriends,
    privacyPrivate: t.privacyPrivate,
  })
  const shareVisibilityOptions: Array<{
    value: VisibilityPublication
    label: string
    icon: string
  }> = [
    {
      value: "PUBLIC",
      label: t.privacyPublic,
      icon: "solar:global-linear",
    },
    {
      value: "FRIENDS",
      label: t.privacyFriends,
      icon: "solar:users-group-rounded-linear",
    },
    {
      value: "PRIVATE",
      label: t.privacyPrivate,
      icon: "solar:lock-keyhole-linear",
    },
  ]
  const shareMediaPreviewItems = [
    ...(shareSourcePost.images ?? []).map((src, index) => ({
      key: `share-image-${index}`,
      type: "image" as const,
      src,
      poster: null,
    })),
    ...(shareSourcePost.videos ?? []).map((src, index) => ({
      key: `share-video-${index}`,
      type: "video" as const,
      src,
      poster: shareSourcePost.videoThumbnails?.[index] ?? null,
    })),
  ]
  const visibleShareMediaPreviewItems = shareMediaPreviewItems.slice(0, 3)
  const remainingShareMediaPreviewCount = Math.max(shareMediaPreviewItems.length - visibleShareMediaPreviewItems.length, 0)
  const isShareBusy = Boolean(isSharing) || isShareSubmitting
  const followLabel = lang === "ar" ? "متابعة" : "Follow"
  const followingLabel = lang === "ar" ? "متابَع" : "Following"
  const notificationsLabel = lang === "ar" ? "الإشعارات" : "Notifications"
  const blockLabel = lang === "ar" ? "حظر" : "Block"
  const unfollowLabel = lang === "ar" ? "إلغاء المتابعة" : "Unfollow"
  const followProcessingLabel = lang === "ar" ? "جاري المعالجة..." : "Processing..."

  const canShowFollowActionForUser = useCallback((targetUserId: number): boolean => {
    return Boolean(currentUserId)
      && targetUserId > 0
      && targetUserId !== currentUserId
      && Boolean(onFollowUser)
      && Boolean(onUnfollowUser)
  }, [currentUserId, onFollowUser, onUnfollowUser])

  const resolveFollowStateForUser = useCallback((targetUserId: number): "follow" | "following" => {
    const resolved = followStateByUserId?.[targetUserId]
    return resolved === "following" ? "following" : "follow"
  }, [followStateByUserId])

  const isFollowBusyForUser = useCallback((targetUserId: number): boolean => {
    return Boolean(isFollowBusyByUserId?.[targetUserId])
  }, [isFollowBusyByUserId])

  const handleFollowClick = useCallback(async (targetUserId: number) => {
    if (!onFollowUser || isFollowBusyForUser(targetUserId)) {
      return
    }

    await onFollowUser(targetUserId)
  }, [isFollowBusyForUser, onFollowUser])

  const handleUnfollowClick = useCallback(async (targetUserId: number) => {
    if (!onUnfollowUser || isFollowBusyForUser(targetUserId)) {
      return
    }

    await onUnfollowUser(targetUserId)
  }, [isFollowBusyForUser, onUnfollowUser])

  const renderFollowAction = useCallback((targetUserId: number) => {
    if (!canShowFollowActionForUser(targetUserId)) {
      return null
    }

    const followState = resolveFollowStateForUser(targetUserId)
    const isBusy = isFollowBusyForUser(targetUserId)

    if (isBusy) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-muted-foreground">
          {followProcessingLabel}
        </span>
      )
    }

    if (followState === "follow") {
      return (
        <button
          type="button"
          onClick={() => void handleFollowClick(targetUserId)}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          {followLabel}
          <Icon icon="solar:user-plus-linear" className="size-3.5" />
        </button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-success transition-colors hover:text-success/80 hover:underline"
          >
            {followingLabel}
            <Icon icon="solar:user-check-linear" className="size-3.5" />
            <Icon icon="solar:alt-arrow-down-linear" className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={lang === "ar" ? "start" : "end"} className="min-w-36">
          <DropdownMenuItem disabled>
            <Icon icon="solar:bell-linear" className="size-4" />
            <span>{notificationsLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Icon icon="solar:user-block-linear" className="size-4" />
            <span>{blockLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              void handleUnfollowClick(targetUserId)
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Icon icon="solar:user-minus-linear" className="size-4" />
            <span>{unfollowLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }, [
    blockLabel,
    canShowFollowActionForUser,
    followLabel,
    followProcessingLabel,
    followingLabel,
    handleFollowClick,
    handleUnfollowClick,
    isFollowBusyForUser,
    lang,
    notificationsLabel,
    resolveFollowStateForUser,
    unfollowLabel,
  ])

  const handleDeleteConfirm = async () => {
    if (!onDeletePost) {
      setShowDeleteConfirm(false)
      return
    }

    const deleted = await onDeletePost(post.id)
    if (deleted) {
      setShowDeleteConfirm(false)
    }
  }

  const handleCommentClick = () => {
    void onCommentIntent?.(post.id)
    setCommentFocusSignal((current) => current + 1)
  }

  const handleUpdateSubmit = async (payload: {
    content: string
    visibility: VisibilityPublication
    mediaFiles: File[]
    mediaIdsToRemove: number[]
  }): Promise<boolean> => {
    if (!onUpdatePost) {
      return false
    }

    const updated = await onUpdatePost(post.id, payload)
    if (updated) {
      setIsEditingInline(false)
    }

    return updated
  }

  const handleOpenUserProfile = useCallback((params: {
    userId: number | string
    avatarUrl?: string
    displayName?: string
  }) => {
    void params.avatarUrl
    void params.displayName

    const targetUserIdRaw = `${params.userId ?? ""}`.trim()
    if (!targetUserIdRaw) {
      return
    }

    const targetUserIdNumber = Number(targetUserIdRaw)

    if (Number.isFinite(targetUserIdNumber) && targetUserIdNumber > 0 && user?.id === targetUserIdNumber) {
      router.push(`/${lang}/profile`)
      return
    }

    router.push(`/${lang}/users/${encodeURIComponent(targetUserIdRaw)}`)
  }, [lang, router, user?.id])

  const handleOpenShareModal = () => {
    if (!onSharePublication || isShareBusy) {
      return
    }

    setShareText("")
    setShareVisibility(shareSourcePost.visibility ?? "PUBLIC")
    setIsShareTextExpanded(false)
    setShowShareModal(true)
  }

  const handleShareSubmit = async () => {
    if (!onSharePublication || isShareBusy) {
      return
    }

    setIsShareSubmitting(true)

    const shared = await onSharePublication(shareTargetPublicationId, {
      content: shareText,
      visibility: shareVisibility,
    })

    setIsShareSubmitting(false)

    if (shared) {
      setShowShareModal(false)
      setShareText("")
      setIsShareTextExpanded(false)
    }
  }

  return (
    <div className={cn("bg-card rounded-xl overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,0.05)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.16)]", className)} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className={cn("flex items-center gap-3", isRTL && "text-right")}>
          <button
            type="button"
            onClick={() => handleOpenUserProfile({
              userId: post.author.id,
              avatarUrl: post.author.avatarUrl,
              displayName: post.author.name,
            })}
            className="cursor-pointer shrink-0 rounded-full"
          >
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          </button>
          <div>
            <div
              dir={isRTL && canShowFollowActionForUser(post.author.id) ? "ltr" : undefined}
              className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse justify-end" : "justify-start")}
            >
              <button
                type="button"
                onClick={() => handleOpenUserProfile({
                  userId: post.author.id,
                  avatarUrl: post.author.avatarUrl,
                  displayName: post.author.name,
                })}
                className="cursor-pointer text-sm font-semibold text-foreground leading-tight hover:underline"
              >
                <bdi>{post.author.name}</bdi>
              </button>
              {canShowFollowActionForUser(post.author.id) && (
                <span className="mx-1 text-muted-foreground">-</span>
              )}
              <span dir={isRTL ? "rtl" : "ltr"} className="inline-flex items-center">
                {renderFollowAction(post.author.id)}
              </span>
            </div>
            <p className={cn("mt-0.5 text-xs text-muted-foreground", isRTL && "text-right")}>
              <span className="inline-flex items-center gap-1.5">
                <span dir="ltr" className="tabular-nums">
                  {post.createdAt}
                </span>
                {visibilityMeta && (
                  <span
                    className="inline-flex items-center"
                    title={visibilityMeta.label}
                    aria-label={visibilityMeta.label}
                  >
                    <Icon icon={visibilityMeta.icon} className="size-3.5 text-muted-foreground" />
                  </span>
                )}
              </span>
            </p>
          </div>
        </div>
        {hasMenuActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="More options"
                className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted/70 dark:hover:bg-muted/40"
              >
                <Icon icon="solar:menu-dots-bold" className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === "ar" ? "start" : "end"} className="z-100 min-w-44">
              {canShowEdit && (
                <DropdownMenuItem
                  onSelect={() => {
                    if (!isUpdating) {
                      setIsEditingInline(true)
                    }
                  }}
                  className="cursor-pointer"
                >
                  {isUpdating ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Icon icon="solar:pen-linear" className="size-4" />
                  )}
                  <span>{isUpdating ? updatePostLabel : editPostLabel}</span>
                </DropdownMenuItem>
              )}
              {canShowDelete && (
                <DropdownMenuItem
                  onSelect={() => setShowDeleteConfirm(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                  <span>{t.deletePost}</span>
                </DropdownMenuItem>
              )}
              {canShowReport && (
                <DropdownMenuItem
                  onSelect={() => {
                    // Static for now; backend flow will be connected later.
                  }}
                  className="cursor-pointer"
                >
                  <Icon icon="solar:flag-2-linear" className="size-4" />
                  <span>{reportPostLabel}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditingInline ? (
        <div className="px-4 pb-4">
          <CreatePublication
            mode="update"
            initialContent={post.text}
            initialVisibility={post.visibility ?? "PUBLIC"}
            initialMedia={post.media ?? []}
            allowMediaAdditions={!Boolean(sharedPost)}
            onCancel={() => setIsEditingInline(false)}
            onSubmit={handleUpdateSubmit}
            className="border-border/35"
          />
        </div>
      ) : (
        <>
          {/* Body text */}
          {post.text && (
            <div className="px-4 pb-3">
              <p className={cn("text-sm text-foreground leading-relaxed", isRTL && "text-right")}>
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

          {sharedPost && (
            <div className="px-4 pb-3">
              <div className="overflow-hidden rounded-xl border border-border/35 bg-muted/25">
                <div className="px-3 py-3">
                  <div className={cn("flex items-center gap-2", isRTL && "text-right")}>
                    <button
                      type="button"
                      onClick={() => handleOpenUserProfile({
                        userId: sharedPost.author.id,
                        avatarUrl: sharedPost.author.avatarUrl,
                        displayName: sharedPost.author.name,
                      })}
                      className="cursor-pointer shrink-0 rounded-full"
                    >
                      <Image
                        src={sharedPost.author.avatarUrl}
                        alt={sharedPost.author.name}
                        width={34}
                        height={34}
                        className="size-8.5 rounded-full object-cover"
                      />
                    </button>
                    <div>
                      <div
                        dir={isRTL && canShowFollowActionForUser(sharedPost.author.id) ? "ltr" : undefined}
                        className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse justify-end" : "justify-start")}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenUserProfile({
                            userId: sharedPost.author.id,
                            avatarUrl: sharedPost.author.avatarUrl,
                            displayName: sharedPost.author.name,
                          })}
                          className="cursor-pointer text-sm font-semibold leading-tight text-foreground hover:underline"
                        >
                          <bdi>{sharedPost.author.name}</bdi>
                        </button>
                        {canShowFollowActionForUser(sharedPost.author.id) && (
                          <span className="mx-1 text-muted-foreground">-</span>
                        )}
                        <span dir={isRTL ? "rtl" : "ltr"} className="inline-flex items-center">
                          {renderFollowAction(sharedPost.author.id)}
                        </span>
                      </div>
                      <p className={cn("mt-0.5 text-xs text-muted-foreground", isRTL && "text-right")}>
                        <span className="inline-flex items-center gap-1.5">
                          <span dir="ltr" className="tabular-nums">
                            {sharedPost.createdAt}
                          </span>
                          {sharedVisibilityMeta && (
                            <span
                              className="inline-flex items-center"
                              title={sharedVisibilityMeta.label}
                              aria-label={sharedVisibilityMeta.label}
                            >
                              <Icon icon={sharedVisibilityMeta.icon} className="size-3.5 text-muted-foreground" />
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {sharedPost.text && (
                  <div className="px-3 pb-2">
                    <p className={cn("text-sm text-foreground leading-relaxed", isRTL && "text-right")}>
                      {sharedPost.text}
                    </p>
                  </div>
                )}

                {(sharedPost.images.length > 0 || (sharedPost.videos?.length ?? 0) > 0) && (
                  <PublicationMedia
                    images={sharedPost.images}
                    originalImages={sharedPost.originalImages}
                    videos={sharedPost.videos}
                    videoThumbnails={sharedPost.videoThumbnails}
                  />
                )}
              </div>
            </div>
          )}

          {/* Media grid */}
          <PublicationMedia
            images={post.images}
            originalImages={post.originalImages}
            videos={post.videos}
            videoThumbnails={post.videoThumbnails}
            forceSquareSingle={forceSquareSingleImage}
          />

          {/* Actions: like, comment, share */}
          <PublicationActions
            publicationId={post.id}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
            reactionsCountByType={post.reactionsCountByType}
            currentUserReaction={post.currentUserReaction}
            onReact={onReact}
            onCommentClick={handleCommentClick}
            onShare={handleOpenShareModal}
            isSharing={isShareBusy}
          />

          {/* Comments section */}
          <CommentSection
            comments={post.comments}
            totalCommentsCount={totalCommentsCount ?? post.commentsCount}
            areCommentsInitialized={areCommentsInitialized}
            hasMoreComments={hasMoreComments}
            isLoadingMoreComments={isLoadingMoreComments}
            onLoadMoreComments={() => onLoadMoreComments?.(post.id)}
            onAddComment={(content) => onAddComment?.(post.id, content)}
            onReactComment={(commentId, reactionType) => onReactComment?.(post.id, commentId, reactionType)}
            onOpenUserProfile={handleOpenUserProfile}
            onAddReply={(parentCommentId, content) => onAddReply?.(post.id, parentCommentId, content) ?? false}
            onLoadReplies={(commentId) => onLoadReplies?.(post.id, commentId)}
            onUpdateComment={(commentId, content) => onUpdateComment?.(post.id, commentId, content) ?? false}
            onDeleteComment={(commentId) => onDeleteComment?.(post.id, commentId) ?? false}
            onReportComment={(commentId) => onReportComment?.(post.id, commentId) ?? false}
            isAddingComment={isAddingComment}
            focusSignal={commentFocusSignal}
            scrollable={scrollableComments}
          />
        </>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-orange-500/10">
              <Icon
                icon="solar:danger-triangle-bold"
                className="size-8 text-orange-500"
              />
            </AlertDialogMedia>
            <AlertDialogTitle className={cn(lang === "ar" && "font-arabic")}>{t.deletePostConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className={cn(lang === "ar" && "font-arabic")}>{t.deletePostConfirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(lang === "ar" && "font-arabic")}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              className={cn("inline-flex items-center gap-2", lang === "ar" && "font-arabic")}
            >
              {isDeleting ? <Spinner className="size-4" /> : null}
              {t.deletePost}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-h-[88vh] sm:max-w-2xl" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setShowShareModal(false)}
            className="fixed right-4 top-4 z-90 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border/30 bg-background/85 text-foreground transition-colors hover:border-border/60 hover:bg-muted/80 dark:border-zinc-700/40 dark:bg-zinc-900/80 dark:text-white dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            title={dictionary.common.close}
            aria-label={dictionary.common.close}
          >
            <Icon icon="lucide:x" className="size-5" />
          </button>
          <DialogHeader>
            <DialogTitle>{t.share}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? "أضف نصا وحدد الخصوصية قبل مشاركة هذا المنشور."
                : "Add text and choose privacy before sharing this publication."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-[42vh] overflow-y-auto pe-1 ps-0.5">
              <div className="overflow-hidden rounded-xl border border-border/35 bg-muted/20">
                <div className="px-3 py-3">
                  <div className={cn("flex items-center gap-2", isRTL && "text-right")}>
                    <button
                      type="button"
                      onClick={() => handleOpenUserProfile({
                        userId: shareSourcePost.author.id,
                        avatarUrl: shareSourcePost.author.avatarUrl,
                        displayName: shareSourcePost.author.name,
                      })}
                      className="cursor-pointer shrink-0 rounded-full"
                    >
                      <Image
                        src={shareSourcePost.author.avatarUrl}
                        alt={shareSourcePost.author.name}
                        width={34}
                        height={34}
                        className="size-8.5 rounded-full object-cover"
                      />
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleOpenUserProfile({
                          userId: shareSourcePost.author.id,
                          avatarUrl: shareSourcePost.author.avatarUrl,
                          displayName: shareSourcePost.author.name,
                        })}
                        className="cursor-pointer text-sm font-semibold leading-tight text-foreground hover:underline"
                      >
                        {shareSourcePost.author.name}
                      </button>
                      <p className={cn("mt-0.5 text-xs text-muted-foreground", isRTL && "text-right")}>
                        <span className="inline-flex items-center gap-1.5">
                          <span dir="ltr" className="tabular-nums">
                            {shareSourcePost.createdAt}
                          </span>
                          {shareSourceVisibilityMeta && (
                            <span
                              className="inline-flex items-center"
                              title={shareSourceVisibilityMeta.label}
                              aria-label={shareSourceVisibilityMeta.label}
                            >
                              <Icon icon={shareSourceVisibilityMeta.icon} className="size-3.5 text-muted-foreground" />
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {shareSourcePost.text && (
                  <div className="px-3 pb-2">
                    <p className={cn("text-sm text-foreground leading-relaxed", isRTL && "text-right")}>
                      {shareSourcePost.text}
                    </p>
                  </div>
                )}

                {visibleShareMediaPreviewItems.length > 0 && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-3 gap-2">
                      {visibleShareMediaPreviewItems.map((mediaItem, mediaIndex) => {
                        const shouldShowMoreOverlay =
                          remainingShareMediaPreviewCount > 0
                          && mediaIndex === visibleShareMediaPreviewItems.length - 1

                        return (
                          <div
                            key={mediaItem.key}
                            className="relative h-20 overflow-hidden rounded-md border border-border/35 bg-muted/30"
                          >
                            {mediaItem.type === "image" ? (
                              mediaItem.src ? (
                                <Image
                                  src={mediaItem.src}
                                  alt={shareSourcePost.author.name}
                                  fill
                                  sizes="(max-width: 768px) 30vw, 160px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Icon icon="lucide:image-off" className="size-4" />
                                </div>
                              )
                            ) : mediaItem.poster ? (
                              <>
                                <Image
                                  src={mediaItem.poster}
                                  alt={shareSourcePost.author.name}
                                  fill
                                  sizes="(max-width: 768px) 30vw, 160px"
                                  className="object-cover"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                                  <Icon icon="solar:play-bold" className="size-4" />
                                </span>
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-black/50 text-white">
                                <Icon icon="solar:videocamera-record-linear" className="size-4" />
                              </div>
                            )}

                            {shouldShowMoreOverlay && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                                +{remainingShareMediaPreviewCount}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-1">
              {isShareTextExpanded ? (
                <Textarea
                  value={shareText}
                  onChange={(event) => setShareText(event.target.value)}
                  onBlur={() => {
                    if (!shareText.trim()) {
                      setIsShareTextExpanded(false)
                    }
                  }}
                  placeholder={isRTL ? "أضف نصا مع المشاركة..." : "Add text to your share..."}
                  className={cn(
                    "min-h-28 resize-none rounded-xl border-border/40 bg-surface text-sm focus-visible:ring-2 focus-visible:ring-primary/30",
                    isRTL ? "text-right" : "text-left",
                  )}
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  placeholder={isRTL ? "أضف نصا مع المشاركة..." : "Add text to your share..."}
                  className={cn(
                    "cursor-text h-10 w-full rounded-full border border-border/40 bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
                    isRTL ? "text-right" : "text-left",
                  )}
                  onFocus={() => setIsShareTextExpanded(true)}
                  onClick={() => setIsShareTextExpanded(true)}
                  readOnly
                />
              )}
            </div>

            <div className={cn("flex items-center justify-between gap-2", isRTL && "flex-row-reverse")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border/35 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted/50"
                  >
                    <Icon icon={shareVisibilityMeta?.icon ?? "solar:global-linear"} className="size-4" />
                    <span>{shareVisibilityMeta?.label ?? t.privacyPublic}</span>
                    <Icon icon="solar:alt-arrow-down-linear" className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-44">
                  {shareVisibilityOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setShareVisibility(option.value)}
                      className={cn(
                        "flex items-center gap-2",
                        option.value === shareVisibility && "bg-muted dark:bg-muted/60",
                      )}
                    >
                      <Icon icon={option.icon} className="size-4" />
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="cursor-pointer rounded-md border border-border/35 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-border/60 hover:bg-muted/60"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShareSubmit()}
                  disabled={!onSharePublication || isShareBusy}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isShareBusy ? <Spinner className="size-4" /> : <Icon icon="solar:share-linear" className="size-4" />}
                  {t.share}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
