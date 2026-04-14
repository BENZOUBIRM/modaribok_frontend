import { publicationService } from "@/services/api"
import type { FeedComment, ReactionCountsByType, ReactionType } from "@/types"
import { cacheCommentReactionState } from "./comment-reaction-cache"

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

const COMMENT_REACTION_BATCH_SIZE = 8

type CommentReactionSnapshot = {
  reactionsCountByType: ReactionCountsByType
  currentUserReaction: ReactionType | null
  likesCount: number
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

function collectCommentIds(comments: FeedComment[]): number[] {
  const ids: number[] = []

  const visit = (nodes: FeedComment[]) => {
    nodes.forEach((node) => {
      ids.push(node.id)

      if (node.replies.length) {
        visit(node.replies)
      }
    })
  }

  visit(comments)

  return ids
}

function applySnapshotsRecursive(
  comments: FeedComment[],
  snapshots: Map<number, CommentReactionSnapshot>,
): [FeedComment[], boolean] {
  let hasChanged = false

  const nextComments = comments.map((comment) => {
    let nextComment = comment
    let hasCommentChanged = false

    const snapshot = snapshots.get(comment.id)
    if (snapshot) {
      const likesCountChanged = comment.likesCount !== snapshot.likesCount
      const reactionChanged = (comment.currentUserReaction ?? null) !== snapshot.currentUserReaction
      const countsChanged = REACTION_TYPES.some(
        (type) => (comment.reactionsCountByType?.[type] ?? 0) !== (snapshot.reactionsCountByType[type] ?? 0),
      )
      const isSnapshotMissing =
        typeof comment.reactionsCountByType === "undefined"
        || typeof comment.currentUserReaction === "undefined"

      if (likesCountChanged || reactionChanged || countsChanged || isSnapshotMissing) {
        nextComment = {
          ...nextComment,
          likesCount: snapshot.likesCount,
          reactionsCountByType: snapshot.reactionsCountByType,
          currentUserReaction: snapshot.currentUserReaction,
        }
        hasCommentChanged = true
      }
    }

    if (nextComment.replies.length) {
      const [nextReplies, hasRepliesChanged] = applySnapshotsRecursive(nextComment.replies, snapshots)
      if (hasRepliesChanged) {
        nextComment = {
          ...nextComment,
          replies: nextReplies,
        }
        hasCommentChanged = true
      }
    }

    if (hasCommentChanged) {
      hasChanged = true
      return nextComment
    }

    return comment
  })

  return [hasChanged ? nextComments : comments, hasChanged]
}

async function fetchCommentReactionSnapshots(
  commentIds: number[],
  userId?: number | null,
): Promise<Map<number, CommentReactionSnapshot>> {
  const uniqueCommentIds = Array.from(
    new Set(commentIds.filter((id) => Number.isFinite(id) && id > 0)),
  )
  const snapshots = new Map<number, CommentReactionSnapshot>()

  for (let start = 0; start < uniqueCommentIds.length; start += COMMENT_REACTION_BATCH_SIZE) {
    const batchIds = uniqueCommentIds.slice(start, start + COMMENT_REACTION_BATCH_SIZE)

    const batchEntries = await Promise.all(
      batchIds.map(async (commentId) => {
        const result = await publicationService.getCommentReactions(commentId)
        if (!result.success || !result.data) {
          return null
        }

        const reactionsCountByType = normalizeReactionCounts(result.data.reactionsCount ?? {})
        const currentUserReaction = parseReactionType(result.data.currentUserReaction)
        const likesCount = Object.values(reactionsCountByType).reduce(
          (sum, count) => sum + (count ?? 0),
          0,
        )
        const snapshot: CommentReactionSnapshot = {
          reactionsCountByType,
          currentUserReaction,
          likesCount,
        }

        cacheCommentReactionState(userId, commentId, snapshot)

        return [commentId, snapshot] as const
      }),
    )

    batchEntries.forEach((entry) => {
      if (!entry) {
        return
      }

      const [commentId, snapshot] = entry
      snapshots.set(commentId, snapshot)
    })
  }

  return snapshots
}

export async function hydrateCommentsWithServerReactions(
  comments: FeedComment[],
  userId?: number | null,
): Promise<FeedComment[]> {
  if (!comments.length) {
    return comments
  }

  const commentIds = collectCommentIds(comments)
  if (!commentIds.length) {
    return comments
  }

  const snapshots = await fetchCommentReactionSnapshots(commentIds, userId)
  if (!snapshots.size) {
    return comments
  }

  const [nextComments, hasChanged] = applySnapshotsRecursive(comments, snapshots)

  return hasChanged ? nextComments : comments
}
