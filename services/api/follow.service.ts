import { isAxiosError } from "axios"

import type { PaginationMeta } from "@/types"
import apiClient from "./client"

interface ApiResponse<T> {
  status: boolean
  code: string
  data: T
}

type ApiResult<T> = {
  success: boolean
  data?: T
  code?: string
}

interface PageLike<T> {
  content?: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
  last?: boolean
  // Some backends return snake_case keys
  total_elements?: number
  total_pages?: number
  page?: number
  isLast?: boolean
}

interface FollowActionResponse {
  id: number
  followerId: number
  followingId: number
  status: "ACTIVE" | "PENDING"
  createdAt: string
}

export interface FollowUserDto {
  id: number
  firstName: string
  lastName: string
  profilePicture: string | null
}

export async function followUser(
  userId: number,
): Promise<ApiResult<FollowActionResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<FollowActionResponse>>(`/users/${userId}/follow`)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function unfollowUser(
  userId: number,
): Promise<ApiResult<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(`/users/${userId}/follow`)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getFollowers(
  userId: number,
  page = 0,
  size = 20,
): Promise<ApiResult<PaginationMeta<FollowUserDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<FollowUserDto>>>(
      `/users/${userId}/followers`,
      {
        // Count calls are informational and should not spam toasts on failures.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _skipToast: true as any,
        params: { page, size },
      },
    )

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getFollowing(
  userId: number,
  page = 0,
  size = 20,
): Promise<ApiResult<PaginationMeta<FollowUserDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<FollowUserDto>>>(
      `/users/${userId}/following`,
      {
        // Count calls are informational and should not spam toasts on failures.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _skipToast: true as any,
        params: { page, size },
      },
    )

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function isFollowingUser(
  currentUserId: number,
  targetUserId: number,
): Promise<boolean> {
  const size = 100
  let page = 0
  let visitedPages = 0
  const MAX_PAGES = 200
  const visitedSignatures = new Set<string>()

  while (visitedPages < MAX_PAGES) {
    const result = await getFollowing(currentUserId, page, size)
    if (!result.success || !result.data) {
      return false
    }

    const normalized = normalizePage(result.data, page, size)
    const content = normalized.content
    if (content.some((followedUser) => followedUser.id === targetUserId)) {
      return true
    }

    const signature = `${normalized.page}:${content.map((item) => item.id).join(",")}`
    if (visitedSignatures.has(signature)) {
      return false
    }

    visitedSignatures.add(signature)

    if (
      normalized.last
      || content.length === 0
      || content.length < normalized.size
      || page >= normalized.totalPages - 1
    ) {
      return false
    }

    page += 1
    visitedPages += 1
  }

  return false
}

export async function getFollowersCount(userId: number): Promise<ApiResult<number>> {
  return getFollowCount("followers", userId)
}

export async function getFollowingCount(userId: number): Promise<ApiResult<number>> {
  return getFollowCount("following", userId)
}

async function getFollowCount(
  type: "followers" | "following",
  userId: number,
): Promise<ApiResult<number>> {
  const size = 100
  let page = 0
  let visitedPages = 0
  const MAX_PAGES = 200
  let totalCount = 0
  const visitedSignatures = new Set<string>()

  while (visitedPages < MAX_PAGES) {
    const result = type === "followers"
      ? await getFollowers(userId, page, size)
      : await getFollowing(userId, page, size)

    if (!result.success || !result.data) {
      return {
        success: false,
        code: result.code,
      }
    }

    const normalized = normalizePage(result.data, page, size)

    if (typeof normalized.totalElements === "number") {
      return {
        success: true,
        data: Math.max(0, normalized.totalElements),
        code: result.code,
      }
    }

    const signature = `${normalized.page}:${normalized.content.map((item) => item.id).join(",")}`
    if (visitedSignatures.has(signature)) {
      break
    }

    visitedSignatures.add(signature)
    totalCount += normalized.content.length

    if (
      normalized.last
      || normalized.content.length === 0
      || normalized.content.length < normalized.size
      || page >= normalized.totalPages - 1
    ) {
      break
    }

    page += 1
    visitedPages += 1
  }

  return {
    success: true,
    data: Math.max(0, totalCount),
  }
}

function normalizePage(
  pageData: PageLike<FollowUserDto>,
  fallbackPage: number,
  fallbackSize: number,
): {
  content: FollowUserDto[]
  totalElements?: number
  totalPages: number
  page: number
  size: number
  last: boolean
} {
  const content = Array.isArray(pageData?.content) ? pageData.content : []

  const totalElements = typeof pageData?.totalElements === "number"
    ? pageData.totalElements
    : typeof pageData?.total_elements === "number"
      ? pageData.total_elements
      : undefined

  const page = typeof pageData?.number === "number"
    ? pageData.number
    : typeof pageData?.page === "number"
      ? pageData.page
      : fallbackPage

  const size = typeof pageData?.size === "number" && pageData.size > 0
    ? pageData.size
    : fallbackSize

  const totalPages = typeof pageData?.totalPages === "number"
    ? Math.max(1, pageData.totalPages)
    : typeof pageData?.total_pages === "number"
      ? Math.max(1, pageData.total_pages)
      : content.length < size
        ? page + 1
        : page + 2

  const last = typeof pageData?.last === "boolean"
    ? pageData.last
    : typeof pageData?.isLast === "boolean"
      ? pageData.isLast
      : content.length < size

  return {
    content,
    totalElements,
    totalPages,
    page,
    size,
    last,
  }
}

function handleApiError(error: unknown): { success: false; code?: string } {
  if (isAxiosError(error) && error.response) {
    return {
      success: false,
      code: error.response.data?.code,
    }
  }

  return {
    success: false,
    code: "NETWORK_ERROR",
  }
}
