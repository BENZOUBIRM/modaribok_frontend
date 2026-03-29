import { isAxiosError } from "axios"
import apiClient from "./client"
import type { SuggestionCursorPageDto } from "@/types"

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

export async function getSuggestions(params?: {
  size?: number
  cursorScore?: number
  cursorUserId?: number
}): Promise<ApiResult<SuggestionCursorPageDto>> {
  try {
    const response = await apiClient.get(
      "/users/me/suggestions",
      {
        params: {
          size: params?.size ?? 20,
          cursorScore: params?.cursorScore,
          cursorUserId: params?.cursorUserId,
        },
      },
    )

    const responseData = response.data as ApiResponse<SuggestionCursorPageDto>

    return {
      success: true,
      data: responseData.data,
      code: responseData.code,
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
