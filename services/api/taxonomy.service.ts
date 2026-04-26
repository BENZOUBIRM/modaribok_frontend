import { isAxiosError } from "axios"
import apiClient from "./client"

interface ApiResponse<T> {
  status: boolean
  code?: string
  data: T
}

type ApiResult<T> = {
  success: boolean
  data?: T
  code?: string
}

export interface MultilingualNameEntity {
  id: number
  nameAr: string | null
  nameFr: string | null
  nameEn: string | null
}

export interface MultilingualNamePayload {
  nameAr?: string
  nameFr?: string
  nameEn?: string
}

async function getCollection(path: string): Promise<ApiResult<MultilingualNameEntity[]>> {
  try {
    const response = await apiClient.get<ApiResponse<MultilingualNameEntity[]>>(path)

    return {
      success: true,
      data: response.data.data ?? [],
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

async function getById(path: string): Promise<ApiResult<MultilingualNameEntity>> {
  try {
    const response = await apiClient.get<ApiResponse<MultilingualNameEntity>>(path)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

async function createOne(path: string, payload: MultilingualNamePayload): Promise<ApiResult<MultilingualNameEntity>> {
  try {
    const response = await apiClient.post<ApiResponse<MultilingualNameEntity>>(path, payload)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

async function updateOne(path: string, payload: MultilingualNamePayload): Promise<ApiResult<MultilingualNameEntity>> {
  try {
    const response = await apiClient.put<ApiResponse<MultilingualNameEntity>>(path, payload)

    return {
      success: true,
      data: response.data.data,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

async function deleteOne(path: string): Promise<ApiResult<void>> {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(path)

    return {
      success: true,
      code: response.data.code,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

function handleApiError(error: unknown): ApiResult<never> {
  if (isAxiosError(error)) {
    return {
      success: false,
      code: (error.response?.data?.code as string | undefined) ?? "NETWORK_ERROR",
    }
  }

  return {
    success: false,
    code: "NETWORK_ERROR",
  }
}

export async function getSports(): Promise<ApiResult<MultilingualNameEntity[]>> {
  return getCollection("/sport")
}

export async function getSportById(sportId: number): Promise<ApiResult<MultilingualNameEntity>> {
  return getById(`/sport/${sportId}`)
}

export async function createSport(payload: MultilingualNamePayload): Promise<ApiResult<MultilingualNameEntity>> {
  return createOne("/sport", payload)
}

export async function updateSport(
  sportId: number,
  payload: MultilingualNamePayload,
): Promise<ApiResult<MultilingualNameEntity>> {
  return updateOne(`/sport/${sportId}`, payload)
}

export async function deleteSport(sportId: number): Promise<ApiResult<void>> {
  return deleteOne(`/sport/${sportId}`)
}

export async function getCertifications(): Promise<ApiResult<MultilingualNameEntity[]>> {
  return getCollection("/certificat")
}

export async function getCertificationById(certificationId: number): Promise<ApiResult<MultilingualNameEntity>> {
  return getById(`/certificat/${certificationId}`)
}

export async function createCertification(payload: MultilingualNamePayload): Promise<ApiResult<MultilingualNameEntity>> {
  return createOne("/certificat", payload)
}

export async function updateCertification(
  certificationId: number,
  payload: MultilingualNamePayload,
): Promise<ApiResult<MultilingualNameEntity>> {
  return updateOne(`/certificat/${certificationId}`, payload)
}

export async function deleteCertification(certificationId: number): Promise<ApiResult<void>> {
  return deleteOne(`/certificat/${certificationId}`)
}
