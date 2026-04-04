import { isAxiosError } from "axios"
import apiClient from "./client"
import type { CompleteProfileRequest, OtherUserProfile, Sport, UserProfile } from "@/types"

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

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function normalizeOtherUserProfile(payload: unknown, fallbackUserId: number): OtherUserProfile {
  if (!payload || typeof payload !== "object") {
    return {
      id: fallbackUserId,
    }
  }

  const raw = payload as Record<string, unknown>

  const resolvedProfileImageUrl =
    (typeof raw.profileImageUrl === "string" ? raw.profileImageUrl : null)
      ?? (typeof raw.profilePicture === "string" ? raw.profilePicture : null)
      ?? (typeof raw.profilePictureUrl === "string" ? raw.profilePictureUrl : null)

  const normalizedId = parseNumber(raw.id) ?? fallbackUserId

  return {
    id: normalizedId,
    firstName: typeof raw.firstName === "string" ? raw.firstName : undefined,
    lastName: typeof raw.lastName === "string" ? raw.lastName : undefined,
    city: typeof raw.city === "string" ? raw.city : undefined,
    country: typeof raw.country === "string" ? raw.country : undefined,
    gender: typeof raw.gender === "string" ? raw.gender : undefined,
    birthday: typeof raw.birthday === "string" ? raw.birthday : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    profileImageUrl: resolvedProfileImageUrl,
    profilePicture: typeof raw.profilePicture === "string" ? raw.profilePicture : undefined,
    profilePictureUrl: typeof raw.profilePictureUrl === "string" ? raw.profilePictureUrl : undefined,
    followersCount:
      parseNumber(raw.followersCount)
      ?? parseNumber(raw.followerCount)
      ?? parseNumber(raw.followers),
    followingCount:
      parseNumber(raw.followingCount)
      ?? parseNumber(raw.following),
    postsCount:
      parseNumber(raw.postsCount)
      ?? parseNumber(raw.publicationsCount)
      ?? parseNumber(raw.posts),
    publicationsCount: parseNumber(raw.publicationsCount),
    sports: Array.isArray(raw.sports) ? (raw.sports as OtherUserProfile["sports"]) : undefined,
    publications: Array.isArray(raw.publications)
      ? (raw.publications as OtherUserProfile["publications"])
      : undefined,
  }
}

export async function getMyProfile(): Promise<ApiResult<UserProfile>> {
  try {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/users/me")
    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getUserProfileById(
  userId: number,
): Promise<ApiResult<OtherUserProfile>> {
  try {
    const response = await apiClient.get<ApiResponse<unknown>>(`/users/${userId}`)
    const normalizedProfile = normalizeOtherUserProfile(response.data.data, userId)

    return {
      success: true,
      data: normalizedProfile,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function completeProfile(
  payload: CompleteProfileRequest,
): Promise<ApiResult<null>> {
  try {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/completeProfil",
      payload,
    )

    return {
      success: true,
      code: response.data.code,
      data: null,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getSports(): Promise<ApiResult<Sport[]>> {
  try {
    const response = await apiClient.get<ApiResponse<Sport[]>>("/sport")

    return {
      success: true,
      data: response.data.data ?? [],
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
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
