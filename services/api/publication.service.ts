import { isAxiosError } from "axios"
import apiClient from "./client"
import type {
  CommentDto,
  PaginationMeta,
  PublicationDto,
  ReactionToggleResponseDto,
  ReactionType,
  ReactionUserDto,
} from "@/types"

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

export async function getFeed(
  page = 0,
  size = 10,
): Promise<ApiResult<PaginationMeta<PublicationDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<PublicationDto>>>("/publications", {
      params: { page, size },
    })

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getRootComments(
  publicationId: number,
  page = 0,
  size = 10,
): Promise<ApiResult<PaginationMeta<CommentDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<CommentDto>>>(
      `/publications/${publicationId}/comments`,
      {
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

export async function addComment(
  publicationId: number,
  content: string,
): Promise<ApiResult<CommentDto>> {
  try {
    const response = await apiClient.post<ApiResponse<CommentDto>>(
      `/publications/${publicationId}/comments`,
      { content },
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

export async function getReplies(commentId: number): Promise<ApiResult<CommentDto[]>> {
  try {
    const response = await apiClient.get<ApiResponse<CommentDto[]>>(`/comments/${commentId}/replies`)

    return {
      success: true,
      data: response.data.data ?? [],
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function getReactionUsers(
  publicationId: number,
  params?: {
    type?: ReactionType
    page?: number
    size?: number
  },
): Promise<ApiResult<PaginationMeta<ReactionUserDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<ReactionUserDto>>>(
      `/publications/${publicationId}/reactions/users`,
      {
        params: {
          type: params?.type,
          page: params?.page ?? 0,
          size: params?.size ?? 100,
        },
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

export async function toggleReaction(
  publicationId: number,
  type: ReactionType,
): Promise<ApiResult<ReactionToggleResponseDto>> {
  try {
    const response = await apiClient.post<ApiResponse<ReactionToggleResponseDto>>(
      `/publications/${publicationId}/reactions`,
      { type },
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
