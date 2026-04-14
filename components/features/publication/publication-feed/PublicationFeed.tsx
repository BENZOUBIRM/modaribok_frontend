"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { publicationService } from "@/services/api"
import {
  cacheCommentReactionState,
  hydrateCommentsWithReactionCache,
} from "@/lib/comment-reaction-cache"
import { hydrateCommentsWithServerReactions } from "@/lib/comment-reaction-hydration"
import {
  buildPublicationFeedCacheKey,
  getPublicationFeedCache,
  isPublicationFeedCacheFresh,
  setPublicationFeedCache,
} from "@/lib/publication-feed-cache"
import { showApiToast } from "@/lib/api-toast"
import type {
  CommentDto,
  FeedComment,
  FeedPost,
  PublicationDto,
  ReactionCountsByType,
  ReactionType,
  VisibilityPublication,
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

// Tuning knobs: adjust these values (after alignment with the project owner) to control
// how many posts/comments appear first and how many are loaded on each "show more" action.
const FEED_PAGE_SIZE = 5
const ROOT_COMMENTS_PAGE_SIZE = 2

type FeedPageLoadResult = {
  success: boolean
  posts: FeedPost[]
  page: number
  hasMore: boolean
  code?: string
}

type CommentPaginationState = {
  initialized: boolean
  nextPage: number
  hasMore: boolean
  isLoading: boolean
}

function mergePostsById(currentPosts: FeedPost[], incomingPosts: FeedPost[]): FeedPost[] {
  if (!incomingPosts.length) {
    return currentPosts
  }

  const existingIds = new Set(currentPosts.map((post) => post.id))
  const uniqueIncoming = incomingPosts.filter((post) => !existingIds.has(post.id))

  if (!uniqueIncoming.length) {
    return currentPosts
  }

  return [...currentPosts, ...uniqueIncoming]
}

function mergeCommentsById(currentComments: FeedComment[], incomingComments: FeedComment[]): FeedComment[] {
  if (!incomingComments.length) {
    return currentComments
  }

  const existingIds = new Set(currentComments.map((comment) => comment.id))
  const uniqueIncoming = incomingComments.filter((comment) => !existingIds.has(comment.id))

  if (!uniqueIncoming.length) {
    return currentComments
  }

  return [...currentComments, ...uniqueIncoming]
}

function resolveHasMoreFromPageMeta(
  currentPage: number,
  pageSize: number,
  pageContentLength: number,
  meta?: {
    last?: boolean
    totalPages?: number
    totalElements?: number
  },
): boolean {
  if (typeof meta?.totalPages === "number") {
    return currentPage < meta.totalPages - 1
  }

  if (typeof meta?.last === "boolean") {
    return !meta.last
  }

  if (typeof meta?.totalElements === "number") {
    return (currentPage + 1) * pageSize < meta.totalElements
  }

  return pageContentLength >= pageSize
}

function canViewerSeePublication(
  publication: Pick<PublicationDto, "visibility" | "user">,
  viewerUserId?: number,
): boolean {
  if (publication.visibility !== "PRIVATE") {
    return true
  }

  const authorId = resolveFeedUserId(publication.user)

  return Boolean(viewerUserId) && authorId > 0 && viewerUserId === authorId
}

function buildCommentPaginationSnapshot(posts: FeedPost[]): Record<number, CommentPaginationState> {
  return posts.reduce<Record<number, CommentPaginationState>>((acc, post) => {
    const loadedCommentsCount = post.comments.length
    const initialized = post.commentsCount === 0 || loadedCommentsCount > 0

    acc[post.id] = {
      initialized,
      nextPage: initialized
        ? Math.max(1, Math.floor(loadedCommentsCount / ROOT_COMMENTS_PAGE_SIZE))
        : 0,
      hasMore: loadedCommentsCount < post.commentsCount,
      isLoading: false,
    }

    return acc
  }, {})
}

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
  const [currentPage, setCurrentPage] = React.useState(0)
  const [hasMorePosts, setHasMorePosts] = React.useState(false)
  const [isLoadingMorePosts, setIsLoadingMorePosts] = React.useState(false)
  const [commentPaginationByPostId, setCommentPaginationByPostId] = React.useState<Record<number, CommentPaginationState>>({})
  const [addingCommentByPostId, setAddingCommentByPostId] = React.useState<Record<number, boolean>>({})
  const [updatingPostById, setUpdatingPostById] = React.useState<Record<number, boolean>>({})
  const [deletingPostById, setDeletingPostById] = React.useState<Record<number, boolean>>({})
  const [sharingPostById, setSharingPostById] = React.useState<Record<number, boolean>>({})

  const cacheKey = React.useMemo(
    () => buildPublicationFeedCacheKey({
      scopeUserId: userId,
      viewerUserId: user?.id,
      lang,
    }),
    [lang, user?.id, userId],
  )

  const fetchFeedPage = React.useCallback(async (pageToLoad: number): Promise<FeedPageLoadResult> => {
    if (userId) {
      if (pageToLoad > 0) {
        return {
          success: true,
          posts: [],
          page: 0,
          hasMore: false,
        }
      }

      let publicationItems: PublicationDto[] = []

      const userPublicationsResult = await publicationService.getUserPublications(userId)
      if (userPublicationsResult.success && userPublicationsResult.data) {
        publicationItems = Array.isArray(userPublicationsResult.data)
          ? userPublicationsResult.data
          : []
      } else {
        const fallbackFeedResult = await publicationService.getFeed(0, 50)

        if (!fallbackFeedResult.success || !fallbackFeedResult.data) {
          return {
            success: false,
            posts: [],
            page: 0,
            hasMore: false,
            code: userPublicationsResult.code ?? fallbackFeedResult.code ?? "NETWORK_ERROR",
          }
        }

        const fallbackItems = Array.isArray(fallbackFeedResult.data)
          ? fallbackFeedResult.data
          : (fallbackFeedResult.data.content ?? [])

        publicationItems = fallbackItems.filter((publication) => publication.user?.id === userId)
      }

      const visiblePublicationItems = publicationItems.filter((publication) =>
        canViewerSeePublication(publication, user?.id),
      )

      const reactionStates = await Promise.all(
        visiblePublicationItems.map((publication) =>
          loadReactionState(publication.id, publication.likesCount ?? 0, user?.id),
        ),
      )

      const mappedPosts = visiblePublicationItems.map((publication, index) => {
        const reactionState = reactionStates[index] ?? {
          reactionsCountByType: {},
          currentUserReaction: null,
        }

        return mapPublicationToFeedPost(
          publication,
          [],
          reactionState.reactionsCountByType,
          reactionState.currentUserReaction,
        )
      })

      return {
        success: true,
        posts: mappedPosts,
        page: 0,
        hasMore: false,
      }
    }

    const feedResult = await publicationService.getFeed(pageToLoad, FEED_PAGE_SIZE)

    if (!feedResult.success || !feedResult.data) {
      return {
        success: false,
        posts: [],
        page: pageToLoad,
        hasMore: false,
        code: feedResult.code ?? "NETWORK_ERROR",
      }
    }

    const feedPage = feedResult.data
    const publicationItems = Array.isArray(feedPage)
      ? feedPage
      : (feedPage.content ?? [])

    const resolvedPageNumber = Array.isArray(feedPage)
      ? pageToLoad
      : (typeof feedPage.number === "number" ? feedPage.number : pageToLoad)

    const resolvedHasMore = Array.isArray(feedPage)
      ? publicationItems.length >= FEED_PAGE_SIZE
      : resolveHasMoreFromPageMeta(
        resolvedPageNumber,
        FEED_PAGE_SIZE,
        publicationItems.length,
        {
          last: feedPage.last,
          totalPages: feedPage.totalPages,
          totalElements: feedPage.totalElements,
        },
      )

    const visiblePublicationItems = publicationItems.filter((publication) =>
      canViewerSeePublication(publication, user?.id),
    )

    const reactionStates = await Promise.all(
      visiblePublicationItems.map((publication) =>
        loadReactionState(publication.id, publication.likesCount ?? 0, user?.id),
      ),
    )

    const mappedPosts = visiblePublicationItems.map((publication, index) => {
      const reactionState = reactionStates[index] ?? {
        reactionsCountByType: {},
        currentUserReaction: null,
      }

      return mapPublicationToFeedPost(
        publication,
        [],
        reactionState.reactionsCountByType,
        reactionState.currentUserReaction,
      )
    })

    return {
      success: true,
      posts: mappedPosts,
      page: resolvedPageNumber,
      hasMore: resolvedHasMore,
    }
  }, [user?.id, userId])

  const bootstrapInitialComments = React.useCallback(async (
    incomingPosts: FeedPost[],
  ): Promise<{
    posts: FeedPost[]
    paginationByPostId: Record<number, CommentPaginationState>
  }> => {
    if (!incomingPosts.length) {
      return {
        posts: incomingPosts,
        paginationByPostId: {},
      }
    }

    const bootstrapResults = await Promise.all(
      incomingPosts.map(async (post) => {
        const rootCommentsResult = await publicationService.getRootComments(
          post.id,
          0,
          ROOT_COMMENTS_PAGE_SIZE,
        )

        if (!rootCommentsResult.success || !rootCommentsResult.data) {
          const loadedCommentsCount = post.comments.length
          const initialized = loadedCommentsCount > 0

          return {
            postId: post.id,
            comments: post.comments,
            pagination: {
              initialized,
              nextPage: initialized
                ? Math.max(1, Math.floor(loadedCommentsCount / ROOT_COMMENTS_PAGE_SIZE))
                : 0,
              hasMore: loadedCommentsCount < post.commentsCount,
              isLoading: false,
            },
          }
        }

        const pageData = rootCommentsResult.data
        const serverHydratedComments = await hydrateCommentsWithServerReactions(
          (pageData.content ?? []).map((comment) => mapCommentToFeedComment(comment)),
          user?.id,
        )
        const mappedComments = hydrateCommentsWithReactionCache(serverHydratedComments, user?.id)

        const pageNumber = typeof pageData.number === "number" ? pageData.number : 0
        const hasMoreFromMeta = resolveHasMoreFromPageMeta(
          pageNumber,
          ROOT_COMMENTS_PAGE_SIZE,
          mappedComments.length,
          {
            last: pageData.last,
            totalPages: pageData.totalPages,
            totalElements: pageData.totalElements,
          },
        )
        const fallbackTotalComments =
          typeof pageData.totalElements === "number"
            ? pageData.totalElements
            : (post.commentsCount > 0 ? post.commentsCount : undefined)
        const hasMore = typeof fallbackTotalComments === "number"
          ? mappedComments.length < fallbackTotalComments
          : hasMoreFromMeta

        return {
          postId: post.id,
          comments: mappedComments,
          pagination: {
            initialized: true,
            nextPage: pageNumber + 1,
            hasMore,
            isLoading: false,
          },
        }
      }),
    )

    const commentsByPostId = new Map<number, FeedComment[]>()
    const paginationByPostId: Record<number, CommentPaginationState> = {}

    bootstrapResults.forEach((result) => {
      commentsByPostId.set(result.postId, result.comments)
      paginationByPostId[result.postId] = result.pagination
    })

    return {
      posts: incomingPosts.map((post) => ({
        ...post,
        comments: commentsByPostId.get(post.id) ?? post.comments,
      })),
      paginationByPostId,
    }
  }, [user?.id])

  React.useEffect(() => {
    let isCancelled = false

    const cachedFeed = getPublicationFeedCache(cacheKey)

    if (cachedFeed) {
      setPosts(cachedFeed.posts)
      setErrorCode(cachedFeed.errorCode)
      setCurrentPage(cachedFeed.currentPage)
      setHasMorePosts(cachedFeed.hasMorePosts)
      setCommentPaginationByPostId(buildCommentPaginationSnapshot(cachedFeed.posts))
      setIsLoading(false)
    }

    const hasFreshCachedFeed = cachedFeed
      ? isPublicationFeedCacheFresh(cachedFeed)
      : false

    const shouldSkipNetworkLoad =
      refreshKey === 0
      && Boolean(cachedFeed)
      && !cachedFeed?.errorCode
      && hasFreshCachedFeed

    if (shouldSkipNetworkLoad) {
      return () => {
        isCancelled = true
      }
    }

    const loadInitialPage = async () => {
      if (!cachedFeed) {
        setIsLoading(true)
      } else {
        setErrorCode(null)
      }

      const firstPageResult = await fetchFeedPage(0)
      if (isCancelled) return

      if (!firstPageResult.success) {
        if (!cachedFeed) {
          setPosts([])
          setErrorCode(firstPageResult.code ?? "NETWORK_ERROR")
          setCurrentPage(0)
          setHasMorePosts(false)
        }
        setIsLoading(false)
        return
      }

      const firstPageWithComments = await bootstrapInitialComments(firstPageResult.posts)
      if (isCancelled) return

      setPosts(firstPageWithComments.posts)
      setCurrentPage(firstPageResult.page)
      setHasMorePosts(firstPageResult.hasMore)
      setCommentPaginationByPostId(firstPageWithComments.paginationByPostId)
      setErrorCode(null)
      setIsLoading(false)
    }

    void loadInitialPage()

    return () => {
      isCancelled = true
    }
  }, [bootstrapInitialComments, cacheKey, fetchFeedPage, refreshKey])

  const handleLoadMorePosts = React.useCallback(async () => {
    if (isLoading || isLoadingMorePosts || !hasMorePosts || Boolean(userId)) {
      return
    }

    setIsLoadingMorePosts(true)

    const nextPage = currentPage + 1
    const nextPageResult = await fetchFeedPage(nextPage)

    if (!nextPageResult.success) {
      setIsLoadingMorePosts(false)
      return
    }

    const nextPageWithComments = await bootstrapInitialComments(nextPageResult.posts)

    setPosts((currentPosts) => mergePostsById(currentPosts, nextPageWithComments.posts))
    setCommentPaginationByPostId((current) => ({
      ...current,
      ...nextPageWithComments.paginationByPostId,
    }))
    setCurrentPage(nextPageResult.page)
    setHasMorePosts(nextPageResult.hasMore)
    setIsLoadingMorePosts(false)
  }, [bootstrapInitialComments, currentPage, fetchFeedPage, hasMorePosts, isLoading, isLoadingMorePosts, userId])

  React.useEffect(() => {
    if (isLoading) {
      return
    }

    setPublicationFeedCache(cacheKey, {
      posts,
      errorCode,
      currentPage,
      hasMorePosts,
    })
  }, [cacheKey, currentPage, errorCode, hasMorePosts, isLoading, posts])

  const loadRootCommentsPage = React.useCallback(async (
    publicationId: number,
    pageToLoad: number,
    append: boolean,
  ): Promise<boolean> => {
    setCommentPaginationByPostId((current) => {
      const previous = current[publicationId]

      return {
        ...current,
        [publicationId]: {
          initialized: previous?.initialized ?? pageToLoad > 0,
          nextPage: previous?.nextPage ?? 0,
          hasMore: previous?.hasMore ?? true,
          isLoading: true,
        },
      }
    })

    const result = await publicationService.getRootComments(publicationId, pageToLoad, ROOT_COMMENTS_PAGE_SIZE)

    if (!result.success || !result.data) {
      setCommentPaginationByPostId((current) => {
        const previous = current[publicationId]
        if (!previous) {
          return current
        }

        return {
          ...current,
          [publicationId]: {
            ...previous,
            isLoading: false,
          },
        }
      })

      return false
    }

    const pageData = result.data
    const rawComments = pageData.content ?? []
    const serverHydratedComments = await hydrateCommentsWithServerReactions(
      rawComments.map((comment) => mapCommentToFeedComment(comment)),
      user?.id,
    )
    const mappedComments = hydrateCommentsWithReactionCache(serverHydratedComments, user?.id)

    const currentCommentPage = typeof pageData.number === "number" ? pageData.number : pageToLoad
    let hasMore = resolveHasMoreFromPageMeta(
      currentCommentPage,
      ROOT_COMMENTS_PAGE_SIZE,
      mappedComments.length,
      {
        last: pageData.last,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
      },
    )
    const nextPage = currentCommentPage + 1

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== publicationId) {
          return post
        }

        const previousCount = post.comments.length
        const nextComments = append
          ? mergeCommentsById(post.comments, mappedComments)
          : mappedComments

        const fallbackTotalComments =
          typeof pageData.totalElements === "number"
            ? pageData.totalElements
            : (post.commentsCount > 0 ? post.commentsCount : undefined)

        if (append && nextComments.length === previousCount) {
          hasMore = false
        } else if (typeof fallbackTotalComments === "number") {
          hasMore = nextComments.length < fallbackTotalComments
        }

        return {
          ...post,
          comments: nextComments,
        }
      }),
    )

    setCommentPaginationByPostId((current) => ({
      ...current,
      [publicationId]: {
        initialized: true,
        nextPage,
        hasMore,
        isLoading: false,
      },
    }))

    return true
  }, [user?.id])

  const handleCommentIntent = React.useCallback(async (publicationId: number) => {
    const commentState = commentPaginationByPostId[publicationId]
    if (commentState?.isLoading || commentState?.initialized) {
      return
    }

    const targetPost = posts.find((post) => post.id === publicationId)
    if (!targetPost || targetPost.commentsCount <= 0) {
      setCommentPaginationByPostId((current) => ({
        ...current,
        [publicationId]: {
          initialized: true,
          nextPage: 1,
          hasMore: false,
          isLoading: false,
        },
      }))
      return
    }

    await loadRootCommentsPage(publicationId, 0, false)
  }, [commentPaginationByPostId, loadRootCommentsPage, posts])

  const handleLoadMoreComments = React.useCallback(async (publicationId: number) => {
    const commentState = commentPaginationByPostId[publicationId]

    if (!commentState) {
      await handleCommentIntent(publicationId)
      return
    }

    if (commentState.isLoading || !commentState.hasMore) {
      return
    }

    await loadRootCommentsPage(publicationId, commentState.nextPage, true)
  }, [commentPaginationByPostId, handleCommentIntent, loadRootCommentsPage])

  const handleReact = async (publicationId: number, reactionType: ReactionType) => {
    const result = await publicationService.toggleReaction(publicationId, reactionType)
    if (!result.success || !result.data) {
      return
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? (() => {
            const nextReactionState = applyReactionToggleDelta({
              currentCounts: post.reactionsCountByType,
              previousReaction: post.currentUserReaction,
              selectedReaction: reactionType,
              status: result.data.status,
            })

            return {
              ...post,
              reactionsCountByType: nextReactionState.counts,
              likesCount: Object.values(nextReactionState.counts).reduce((sum, count) => sum + (count ?? 0), 0),
              currentUserReaction:
                parseReactionType(result.data?.currentUserReaction)
                ?? nextReactionState.currentUserReaction,
            }
          })()
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
    const parsedCurrentUserReaction = parseReactionType(result.data?.currentUserReaction)

    cacheCommentReactionState(user?.id, commentId, {
      reactionsCountByType: mappedCounts,
      currentUserReaction: parsedCurrentUserReaction,
      likesCount: totalReactions,
    })

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              comments: updateCommentReactionState(
                post.comments,
                commentId,
                mappedCounts,
                parsedCurrentUserReaction,
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
    const serverHydratedReplies = await hydrateCommentsWithServerReactions(
      repliesData.map((reply) => mapCommentToFeedComment(reply)),
      user?.id,
    )
    const mappedReplies = hydrateCommentsWithReactionCache(serverHydratedReplies, user?.id)

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
    let mappedRepliesFromServer: FeedComment[] | null = null

    if (repliesResult.success && repliesResult.data) {
      const repliesData: CommentDto[] = repliesResult.data
      const serverHydratedReplies = await hydrateCommentsWithServerReactions(
        repliesData.map((reply) => mapCommentToFeedComment(reply)),
        user?.id,
      )
      mappedRepliesFromServer = hydrateCommentsWithReactionCache(serverHydratedReplies, user?.id)
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== publicationId) {
          return post
        }

        if (mappedRepliesFromServer) {
          return {
            ...post,
            comments: replaceRepliesForComment(post.comments, parentCommentId, mappedRepliesFromServer),
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

  const handleUpdateComment = async (
    publicationId: number,
    commentId: number,
    content: string,
  ): Promise<boolean> => {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return false
    }

    const targetPost = posts.find((post) => post.id === publicationId)
    if (!targetPost || !containsCommentById(targetPost.comments, commentId)) {
      showApiToast("NETWORK_ERROR", {
        override: t.commentUpdateFailed,
      })
      return false
    }

    const updateResult = await publicationService.updateComment(commentId, trimmedContent)
    const resolvedContent = updateResult.success && updateResult.data?.content
      ? updateResult.data.content
      : trimmedContent

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              comments: updateCommentContent(post.comments, commentId, resolvedContent),
            }
          : post,
      ),
    )

    showApiToast("SUCCESS", {
      override: t.commentUpdatedSuccess,
    })

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

  const handleSharePublication = async (
    publicationId: number,
    payload: { content: string; visibility: VisibilityPublication },
  ): Promise<boolean> => {
    if (sharingPostById[publicationId]) {
      return false
    }
    const trimmedContent = payload.content.trim()

    setSharingPostById((current) => ({
      ...current,
      [publicationId]: true,
    }))

    const result = await publicationService.createPublication({
      content: trimmedContent,
      visibility: payload.visibility,
      sharedPublicationId: publicationId,
    })

    setSharingPostById((current) => ({
      ...current,
      [publicationId]: false,
    }))

    if (!result.success || !result.data) {
      return false
    }

    const createdSharedPost = mapPublicationToFeedPost(result.data, [], {}, null)
    const shouldPrependToCurrentFeed = !userId || user?.id === userId

    setPosts((currentPosts) => {
      const withUpdatedShareCount = currentPosts.map((post) =>
        post.id === publicationId
          ? {
              ...post,
              sharesCount: post.sharesCount + 1,
            }
          : post,
      )

      if (!shouldPrependToCurrentFeed) {
        return withUpdatedShareCount
      }

      if (withUpdatedShareCount.some((post) => post.id === createdSharedPost.id)) {
        return withUpdatedShareCount
      }

      return [createdSharedPost, ...withUpdatedShareCount]
    })

    return true
  }

  const handleUpdatePost = async (
    publicationId: number,
    payload: {
      content: string
      visibility: "PUBLIC" | "FRIENDS" | "PRIVATE"
      mediaFiles: File[]
      mediaIdsToRemove: number[]
    },
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
      mediaFiles: payload.mediaFiles,
      mediaIdsToRemove: payload.mediaIdsToRemove,
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
              media: updatedPublication.media ?? [],
              images: updatedImages,
              originalImages: updatedOriginalImages,
              videos: updatedVideos,
              videoThumbnails: updatedVideoThumbnails,
              sharedPublication: mapSharedPublicationToFeedData(updatedPublication.sharedPublication),
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
      {!isLoading && !errorCode && posts.map((post, index) => {
        const commentState = commentPaginationByPostId[post.id]

        return (
          <div key={post.id} className="space-y-4">
            <PublicationCard
              post={post}
              onReact={handleReact}
              onReactComment={handleReactComment}
              onAddComment={handleAddComment}
              onCommentIntent={handleCommentIntent}
              onAddReply={handleAddReply}
              onLoadReplies={handleLoadReplies}
              onUpdateComment={handleUpdateComment}
              onLoadMoreComments={handleLoadMoreComments}
              onDeleteComment={handleDeleteComment}
              onReportComment={handleReportComment}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              onSharePublication={handleSharePublication}
              totalCommentsCount={post.commentsCount}
              areCommentsInitialized={commentState?.initialized ?? false}
              hasMoreComments={commentState?.hasMore ?? false}
              isLoadingMoreComments={commentState?.isLoading ?? false}
              isAddingComment={Boolean(addingCommentByPostId[post.id])}
              isUpdating={Boolean(updatingPostById[post.id])}
              isDeleting={Boolean(deletingPostById[post.id])}
              isSharing={Boolean(sharingPostById[post.id])}
            />
            {/* Insert friend suggestions after the 1st post */}
            {showSuggestions && index === 0 && <FriendSuggestions />}
          </div>
        )
      })}

      {!isLoading && !errorCode && hasMorePosts && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void handleLoadMorePosts()}
            disabled={isLoadingMorePosts}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMorePosts ? <Spinner className="size-4" /> : null}
            {isLoadingMorePosts ? t.loading : t.showMore}
          </button>
        </div>
      )}

    </div>
  )
}

function mapPublicationToFeedPost(
  publication: PublicationDto,
  comments: FeedComment[],
  reactionsCountByType: ReactionCountsByType,
  currentUserReaction: ReactionType | null,
): FeedPost {
  const resolvedLikesCount = Object.values(reactionsCountByType ?? {}).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  )
  const authorId = resolveFeedUserId(publication.user)
  const authorFirstName = publication.user?.firstName ?? ""
  const authorLastName = publication.user?.lastName ?? ""
  const authorFullName = `${authorFirstName} ${authorLastName}`.trim() || "User"
  const mediaItems = publication.media ?? []
  const imageMedia = mediaItems.filter((media) => media.mediaType === "image")
  const videoMedia = mediaItems.filter((media) => media.mediaType === "video")

  return {
    id: publication.id,
    author: {
      id: authorId,
      name: authorFullName,
      handle: buildHandle(authorFirstName, authorLastName),
      avatarUrl: publication.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: publication.content ?? "",
    media: mediaItems.map((media) => ({
      id: media.id,
      mediaType: media.mediaType,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl ?? null,
      displayOrder: media.displayOrder,
    })),
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
    sharedPublication: mapSharedPublicationToFeedData(publication.sharedPublication),
    visibility: publication.visibility,
    createdAt: formatDateTime(publication.createdAt),
    likesCount: resolvedLikesCount > 0 ? resolvedLikesCount : (publication.likesCount ?? 0),
    commentsCount: publication.commentsCount ?? 0,
    sharesCount: publication.sharesCount ?? 0,
    comments,
    reactionsCountByType,
    currentUserReaction,
  }
}

function mapSharedPublicationToFeedData(
  sharedPublication: PublicationDto["sharedPublication"],
): FeedPost["sharedPublication"] {
  if (!sharedPublication) {
    return null
  }

  const authorId = resolveFeedUserId(sharedPublication.user)
  const authorFirstName = sharedPublication.user?.firstName ?? ""
  const authorLastName = sharedPublication.user?.lastName ?? ""
  const authorFullName = `${authorFirstName} ${authorLastName}`.trim() || "User"
  const mediaItems = sharedPublication.media ?? []
  const imageMedia = mediaItems.filter((media) => media.mediaType === "image")
  const videoMedia = mediaItems.filter((media) => media.mediaType === "video")

  return {
    id: sharedPublication.id,
    author: {
      id: authorId,
      name: authorFullName,
      handle: buildHandle(authorFirstName, authorLastName),
      avatarUrl: sharedPublication.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: sharedPublication.content ?? "",
    media: mediaItems.map((media) => ({
      id: media.id,
      mediaType: media.mediaType,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl ?? null,
      displayOrder: media.displayOrder,
    })),
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
    visibility: sharedPublication.visibility,
    createdAt: formatDateTime(sharedPublication.createdAt),
  }
}

function mapCommentToFeedComment(comment: CommentDto): FeedComment {
  const rawComment = comment as unknown as Record<string, unknown>
  const authorId = resolveFeedUserId(comment.user)
  const firstName = comment.user?.firstName ?? ""
  const lastName = comment.user?.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "User"
  const rawReactionsCount = (
    rawComment.reactionsCountByType
    ?? rawComment.reactionsCount
  ) as Record<string, number> | null | undefined
  const hasReactionsCountField =
    Object.prototype.hasOwnProperty.call(rawComment, "reactionsCountByType")
    || Object.prototype.hasOwnProperty.call(rawComment, "reactionsCount")
  const normalizedReactionsCount = rawReactionsCount
    ? normalizeReactionCounts(rawReactionsCount)
    : {}
  const normalizedReactionsLikesCount = Object.values(normalizedReactionsCount).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  )
  const hasLikesCountField = Object.prototype.hasOwnProperty.call(rawComment, "likesCount")
    && typeof rawComment.likesCount === "number"
  const likesCount = hasLikesCountField
    ? Math.max(0, Number(rawComment.likesCount))
    : normalizedReactionsLikesCount
  const hasCurrentUserReactionField = Object.prototype.hasOwnProperty.call(rawComment, "currentUserReaction")
  const currentUserReaction = hasCurrentUserReactionField
    ? parseReactionType(rawComment.currentUserReaction as string | null | undefined)
    : undefined

  return {
    id: comment.id,
    author: {
      id: authorId,
      name: fullName,
      handle: buildHandle(firstName, lastName),
      avatarUrl: comment.user?.profileImageUrl || "/images/default-user.jpg",
    },
    text: comment.content,
    isDeleted: comment.isDeleted,
    createdAt: formatDateTime(comment.createdAt),
    likesCount,
    reactionsCountByType: hasReactionsCountField ? normalizedReactionsCount : undefined,
    currentUserReaction,
    parentCommentId: comment.parentCommentId,
    repliesCount: comment.repliesCount ?? 0,
    replies: (comment.replies ?? []).map((reply) => mapCommentToFeedComment(reply)),
  }
}

function parsePositiveUserId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function resolveFeedUserId(user: unknown): number {
  if (!user || typeof user !== "object") {
    return 0
  }

  const raw = user as Record<string, unknown>

  return (
    parsePositiveUserId(raw.id)
    ?? parsePositiveUserId(raw.userId)
    ?? parsePositiveUserId(raw.user_id)
    ?? 0
  )
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

function updateCommentContent(
  comments: FeedComment[],
  targetCommentId: number,
  content: string,
): FeedComment[] {
  const [updatedComments] = updateCommentContentRecursive(comments, targetCommentId, content)
  return updatedComments
}

function updateCommentContentRecursive(
  comments: FeedComment[],
  targetCommentId: number,
  content: string,
): [FeedComment[], boolean] {
  let hasUpdated = false

  const nextComments = comments.map((comment) => {
    if (comment.id === targetCommentId) {
      hasUpdated = true
      return {
        ...comment,
        text: content,
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    const [updatedReplies, nestedUpdated] = updateCommentContentRecursive(
      comment.replies,
      targetCommentId,
      content,
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

function containsCommentById(comments: FeedComment[], targetCommentId: number): boolean {
  return comments.some((comment) => {
    if (comment.id === targetCommentId) {
      return true
    }

    return containsCommentById(comment.replies, targetCommentId)
  })
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

function applyReactionToggleDelta(params: {
  currentCounts?: ReactionCountsByType
  previousReaction?: ReactionType | null
  selectedReaction: ReactionType
  status: "added" | "updated" | "removed"
}): { counts: ReactionCountsByType; currentUserReaction: ReactionType | null } {
  const counts: ReactionCountsByType = { ...(params.currentCounts ?? {}) }

  const decrement = (reactionType: ReactionType | null | undefined) => {
    if (!reactionType) {
      return
    }

    const nextValue = (counts[reactionType] ?? 0) - 1
    if (nextValue > 0) {
      counts[reactionType] = nextValue
      return
    }

    delete counts[reactionType]
  }

  const increment = (reactionType: ReactionType) => {
    counts[reactionType] = (counts[reactionType] ?? 0) + 1
  }

  let currentUserReaction: ReactionType | null = params.previousReaction ?? null

  if (params.status === "removed") {
    decrement(params.previousReaction ?? params.selectedReaction)
    currentUserReaction = null
  } else {
    if (params.previousReaction && params.previousReaction !== params.selectedReaction) {
      decrement(params.previousReaction)
    }

    if (params.previousReaction !== params.selectedReaction || params.status === "added") {
      increment(params.selectedReaction)
    }

    currentUserReaction = params.selectedReaction
  }

  const ordered: ReactionCountsByType = {}
  REACTION_TYPES.forEach((type) => {
    if (counts[type]) {
      ordered[type] = counts[type]
    }
  })

  return {
    counts: ordered,
    currentUserReaction,
  }
}
