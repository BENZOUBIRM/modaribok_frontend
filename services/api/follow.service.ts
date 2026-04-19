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
  totalElements?: number | string
  totalPages?: number | string
  number?: number | string
  size?: number | string
  last?: boolean | string
  // Some backends return snake_case keys
  total_elements?: number | string
  total_pages?: number | string
  page?: number | string
  isLast?: boolean | string
  // Other common aliases
  totalItems?: number | string
  total_items?: number | string
  totalCount?: number | string
  total_count?: number | string
  pageNumber?: number | string
  pageSize?: number | string
  page_size?: number | string
  limit?: number | string
  is_last?: boolean | string
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

    const signature = content.map((item) => item.id).join(",")
    if (visitedSignatures.has(signature)) {
      return false
    }

    visitedSignatures.add(signature)

    if (
      normalized.last
      || content.length === 0
      || normalized.page >= normalized.totalPages - 1
    ) {
      return false
    }

    page = normalized.page + 1
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
  const uniqueFollowedUserIds = new Set<number>()
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

    const signature = normalized.content.map((item) => item.id).join(",")
    if (visitedSignatures.has(signature)) {
      break
    }

    visitedSignatures.add(signature)
    normalized.content.forEach((followedUser) => {
      if (typeof followedUser.id === "number" && Number.isFinite(followedUser.id) && followedUser.id > 0) {
        uniqueFollowedUserIds.add(followedUser.id)
      }
    })

    if (
      normalized.last
      || normalized.content.length === 0
      || normalized.page >= normalized.totalPages - 1
    ) {
      break
    }

    page = normalized.page + 1
    visitedPages += 1
  }

  return {
    success: true,
    data: Math.max(0, uniqueFollowedUserIds.size),
  }
}

function parseNonNegativeInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value)
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed)
    }
  }

  return undefined
}

function parsePositiveInteger(value: unknown): number | undefined {
  const parsed = parseNonNegativeInteger(value)
  if (typeof parsed === "number" && parsed > 0) {
    return parsed
  }

  return undefined
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true") {
      return true
    }

    if (normalized === "false") {
      return false
    }
  }

  return undefined
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

  const totalElements =
    parseNonNegativeInteger(pageData?.totalElements)
    ?? parseNonNegativeInteger(pageData?.total_elements)
    ?? parseNonNegativeInteger(pageData?.totalItems)
    ?? parseNonNegativeInteger(pageData?.total_items)
    ?? parseNonNegativeInteger(pageData?.totalCount)
    ?? parseNonNegativeInteger(pageData?.total_count)

  const page =
    parseNonNegativeInteger(pageData?.number)
    ?? parseNonNegativeInteger(pageData?.page)
    ?? parseNonNegativeInteger(pageData?.pageNumber)
    ?? fallbackPage

  const size =
    parsePositiveInteger(pageData?.size)
    ?? parsePositiveInteger(pageData?.pageSize)
    ?? parsePositiveInteger(pageData?.page_size)
    ?? parsePositiveInteger(pageData?.limit)
    ?? fallbackSize

  const explicitTotalPages =
    parsePositiveInteger(pageData?.totalPages)
    ?? parsePositiveInteger(pageData?.total_pages)

  const totalPages = explicitTotalPages
    ?? (typeof totalElements === "number" && size > 0
      ? Math.max(1, Math.ceil(totalElements / size))
      : content.length === 0
        ? page + 1
        : page + 2)

  const explicitLast =
    parseBoolean(pageData?.last)
    ?? parseBoolean(pageData?.isLast)
    ?? parseBoolean(pageData?.is_last)

  const last = typeof explicitLast === "boolean"
    ? explicitLast
    : typeof totalElements === "number" && size > 0
      ? (page + 1) * size >= totalElements
      : content.length === 0

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
