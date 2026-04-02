import { isAxiosError } from "axios"
import apiClient from "./client"
import type {
  CommentDto,
  PaginationMeta,
  PublicationDto,
  ReactionToggleResponseDto,
  ReactionType,
  ReactionUserDto,
  VisibilityPublication,
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

export async function getUserPublications(
  userId: number,
): Promise<ApiResult<PublicationDto[]>> {
  try {
    const response = await apiClient.get<ApiResponse<PublicationDto[]>>(`/publications/user/${userId}`)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function createPublication(params: {
  content?: string
  visibility: VisibilityPublication
  mediaFiles?: File[]
  sharedPublicationId?: number | null
}): Promise<ApiResult<PublicationDto>> {
  try {
    const formData = new FormData()

    const publicationPayload: {
      content?: string
      visibility: VisibilityPublication
      sharedPublicationId?: number | null
    } = {
      visibility: params.visibility,
    }

    if (params.content?.trim()) {
      publicationPayload.content = params.content.trim()
    }

    if (params.sharedPublicationId !== undefined) {
      publicationPayload.sharedPublicationId = params.sharedPublicationId
    }

    formData.append(
      "publication",
      new Blob([JSON.stringify(publicationPayload)], { type: "application/json" }),
    )

    for (const mediaFile of params.mediaFiles ?? []) {
      formData.append("media", mediaFile)
    }

    const response = await apiClient.post<ApiResponse<PublicationDto>>(
      "/publications",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
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

export async function updatePublication(
  publicationId: number,
  params: {
    content?: string
    visibility?: VisibilityPublication
  },
): Promise<ApiResult<PublicationDto>> {
  try {
    const payload: {
      content?: string
      visibility?: VisibilityPublication
    } = {}

    if (params.content !== undefined) {
      payload.content = params.content
    }

    if (params.visibility !== undefined) {
      payload.visibility = params.visibility
    }

    const response = await apiClient.put<ApiResponse<PublicationDto>>(
      `/publications/${publicationId}`,
      payload,
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

export async function getRootComments(
  publicationId: number,
  page = 0,
  size = 10,
): Promise<ApiResult<PaginationMeta<CommentDto>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginationMeta<CommentDto>>>(
      `/publications/${publicationId}/comments`,
      {
        // Non-critical in feed/profile listing; handled gracefully by caller.
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

export async function addComment(
  publicationId: number,
  content: string,
  parentCommentId?: number,
): Promise<ApiResult<CommentDto>> {
  try {
    const payload = parentCommentId
      ? { content, parentCommentId }
      : { content }

    const response = await apiClient.post<ApiResponse<CommentDto>>(
      `/publications/${publicationId}/comments`,
      payload,
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

export async function deleteComment(commentId: number): Promise<ApiResult<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(`/comments/${commentId}`)

    return {
      success: true,
      data: response.data.data,
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
        // Non-critical in feed/profile listing; handled gracefully by caller.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _skipToast: true as any,
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

export async function toggleCommentReaction(
  commentId: number,
  type: ReactionType,
): Promise<ApiResult<ReactionToggleResponseDto>> {
  try {
    const response = await apiClient.post<ApiResponse<ReactionToggleResponseDto>>(
      `/comments/${commentId}/reactions`,
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

export async function deletePublication(
  publicationId: number,
): Promise<ApiResult<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(`/publications/${publicationId}`)

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
