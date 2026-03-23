import { isAxiosError } from "axios"
import apiClient from "./client"
import type { CompleteProfileRequest, Sport, UserProfile } from "@/types"

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
