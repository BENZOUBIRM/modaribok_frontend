import * as followService from "./follow.service"
import * as publicationService from "./publication.service"
import * as profileService from "./profile.service"

export interface UserProfileStats {
  posts: number
  followers: number
  following: number
}

function sanitizeCount(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }

  return Math.max(0, Math.floor(fallback))
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

async function resolvePostsCount(
  userId: number,
  fallbackPosts?: number,
): Promise<number> {
  const postsResult = await publicationService.getUserPublications(userId)
  if (postsResult.success) {
    return sanitizeCount(Array.isArray(postsResult.data) ? postsResult.data.length : 0)
  }

  // Fallback 1: profile payload may include publications or explicit counters.
  const profileResult = await profileService.getUserProfileById(userId)
  if (profileResult.success && profileResult.data) {
    const postsFromProfile =
      profileResult.data.postsCount
      ?? profileResult.data.publicationsCount
      ?? (Array.isArray(profileResult.data.publications) ? profileResult.data.publications.length : undefined)

    if (typeof postsFromProfile === "number" && Number.isFinite(postsFromProfile)) {
      return sanitizeCount(postsFromProfile)
    }
  }

  // Fallback 2: infer from feed first page if profile/user-publications are unavailable.
  const feedResult = await publicationService.getFeed(0, 50)
  if (feedResult.success && feedResult.data) {
    const feedItems = Array.isArray(feedResult.data)
      ? feedResult.data
      : (feedResult.data.content ?? [])

    const matched = feedItems.filter((publication) => {
      const authorId = parsePositiveUserId(publication.user?.id)
      return authorId === userId
    })

    return sanitizeCount(matched.length)
  }

  return sanitizeCount(fallbackPosts)
}

export async function getUserProfileStats(
  userId: number,
  fallback?: Partial<UserProfileStats>,
): Promise<UserProfileStats> {
  const [followersResult, followingResult, posts] = await Promise.all([
    followService.getFollowersCount(userId),
    followService.getFollowingCount(userId),
    resolvePostsCount(userId, fallback?.posts),
  ])

  const followers = followersResult.success
    ? sanitizeCount(followersResult.data)
    : sanitizeCount(fallback?.followers)

  const following = followingResult.success
    ? sanitizeCount(followingResult.data)
    : sanitizeCount(fallback?.following)

  return {
    posts,
    followers,
    following,
  }
}
