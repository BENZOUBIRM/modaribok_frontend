"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { PublicationMedia } from "../publication-media"
import { PublicationActions } from "../publication-actions"
import { CommentSection } from "../comments/comment-section"
import { CreatePublication } from "../create-publication"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import type { MockPost, ReactionType, VisibilityPublication } from "@/types"
import { NavLink } from "@/components/ui/nav-link"
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
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const TEXT_LIMIT = 200

/**
 * A single publication card with header, body, media, actions, and comments.
 */
export function PublicationCard({
  post,
  onReact,
  onAddComment,
  onAddReply,
  onLoadReplies,
  onUpdatePost,
  onDeletePost,
  isAddingComment,
  isUpdating,
  isDeleting,
  forceSquareSingleImage,
  canDelete,
  scrollableComments,
}: {
  post: MockPost
  onReact?: (publicationId: number, reactionType: ReactionType) => void
  onAddComment?: (publicationId: number, content: string) => Promise<void> | void
  onAddReply?: (publicationId: number, parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (publicationId: number, commentId: number) => Promise<void> | void
  onUpdatePost?: (
    publicationId: number,
    payload: { content: string; visibility: VisibilityPublication },
  ) => Promise<boolean> | boolean
  onDeletePost?: (publicationId: number) => Promise<boolean> | boolean
  isAddingComment?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
  forceSquareSingleImage?: boolean
  canDelete?: boolean
  scrollableComments?: boolean
}) {
  const { dictionary, lang } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed
  const isRTL = lang === "ar"
  const [isExpanded, setIsExpanded] = useState(false)
  const [commentFocusSignal, setCommentFocusSignal] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isLong = post.text && post.text.length > TEXT_LIMIT
  const isOwner = user?.id === post.author.id
  const canShowDelete = canDelete ?? isOwner
  const canShowEdit = Boolean(onUpdatePost) && isOwner
  const hasMenuActions = canShowDelete || canShowEdit
  const editPostLabel = t.editPost
  const updatePostLabel = t.updatePost
  const visibilityMeta =
    post.visibility === "PUBLIC"
      ? { icon: "solar:global-linear", label: t.privacyPublic }
      : post.visibility === "FRIENDS"
        ? { icon: "solar:users-group-rounded-linear", label: t.privacyFriends }
        : post.visibility === "PRIVATE"
          ? { icon: "solar:lock-keyhole-linear", label: t.privacyPrivate }
          : null

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
    setCommentFocusSignal((current) => current + 1)
  }

  const handleUpdateSubmit = async (payload: {
    content: string
    visibility: VisibilityPublication
    mediaFiles: File[]
  }): Promise<boolean> => {
    if (!onUpdatePost) {
      return false
    }

    const updated = await onUpdatePost(post.id, payload)
    if (updated) {
      setShowEditModal(false)
    }

    return updated
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className={cn("flex items-center gap-3", isRTL && "text-right")}>
          <NavLink href={`/${lang}/profile`} className="shrink-0">
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          </NavLink>
          <div>
            <NavLink href={`/${lang}/profile`} className="text-sm font-semibold text-foreground leading-tight hover:underline">
              {post.author.name}
            </NavLink>
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
                      setShowEditModal(true)
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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

      {/* Media grid */}
      <PublicationMedia
        images={post.images}
        originalImages={post.originalImages}
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
      />

      {/* Comments section */}
      <CommentSection
        comments={post.comments}
        onAddComment={(content) => onAddComment?.(post.id, content)}
        onAddReply={(parentCommentId, content) => onAddReply?.(post.id, parentCommentId, content)}
        onLoadReplies={(commentId) => onLoadReplies?.(post.id, commentId)}
        isAddingComment={isAddingComment}
        focusSignal={commentFocusSignal}
        scrollable={scrollableComments}
      />

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

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="fixed right-4 top-4 z-90 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
            title={dictionary.common.close}
            aria-label={dictionary.common.close}
          >
            <Icon icon="lucide:x" className="size-5" />
          </button>
          <DialogHeader>
            <DialogTitle>{editPostLabel}</DialogTitle>
            <DialogDescription>
              {isRTL ? "يمكنك تعديل النص والخصوصية لهذا المنشور." : "Update your post text and privacy."}
            </DialogDescription>
          </DialogHeader>
          <CreatePublication
            mode="update"
            initialContent={post.text}
            initialVisibility={post.visibility ?? "PUBLIC"}
            onCancel={() => setShowEditModal(false)}
            onSubmit={handleUpdateSubmit}
            className="border-0"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
