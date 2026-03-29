/**
 * ──────────────────────────────────────────────────────────────
 * Publication Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for publication backend DTOs and
 * UI feed models.
 */

import type { MockUser } from "./profile"

export interface PaginationMeta<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type VisibilityPublication = "PUBLIC" | "FRIENDS" | "PRIVATE"
export type MediaType = "image" | "video"
export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "HAHA"
  | "STRONG"
  | "FIRE"
  | "CLAP"
  | "MUSCLE"
  | "HEALTHY"
  | "MOTIVATION"
  | "GOAL"
  | "PROGRESS"
  | "CHAMPION"

export interface PublicationUserDto {
  id: number
  firstName: string
  lastName: string
  profileImageUrl: string | null
}

export interface PublicationMediaDto {
  id: number
  mediaType: MediaType
  url: string
  thumbnailUrl: string | null
  displayOrder: number
}

export interface SharedPublicationDto {
  id: number
  content: string | null
  visibility: VisibilityPublication
  createdAt: string
  user: PublicationUserDto
  media: PublicationMediaDto[]
}

export interface PublicationDto {
  id: number
  content: string | null
  visibility: VisibilityPublication
  createdAt: string
  updatedAt: string
  user: PublicationUserDto
  media: PublicationMediaDto[]
  sharedPublication: SharedPublicationDto | null
  likesCount: number
  commentsCount: number
  sharesCount: number
}

export interface CommentUserDto {
  id: number
  firstName: string
  lastName: string
  profileImageUrl: string | null
}

export interface CommentDto {
  id: number
  content: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user: CommentUserDto
  parentCommentId: number | null
  repliesCount: number
  replies: CommentDto[]
}

export interface ReactionUserDto {
  reactionId: number
  user: {
    id: number
    firstName: string
    lastName: string
    profileImageUrl: string | null
  }
  reactionType: ReactionType
  reactedAt: string
}

export type ReactionCountsByType = Partial<Record<ReactionType, number>>

export interface ReactionToggleResponseDto {
  status: "added" | "updated" | "removed"
  currentUserReaction: string | null
  reactionsCount: Record<string, number>
}

export interface FeedUser {
  id: number
  name: string
  handle: string
  avatarUrl: string
}

export interface FeedComment {
  id: number
  author: FeedUser
  text: string
  isDeleted?: boolean
  createdAt: string
  likesCount: number
  parentCommentId: number | null
  repliesCount: number
  replies: FeedComment[]
}

export interface FeedPost {
  id: number
  author: FeedUser
  text: string
  images: string[]
  originalImages?: string[]
  videos?: string[]
  videoThumbnails?: Array<string | null>
  visibility?: VisibilityPublication
  createdAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  comments: FeedComment[]
  reactionsCountByType?: ReactionCountsByType
  currentUserReaction?: ReactionType | null
}

/** A comment on a publication (recursive for replies) */
export type MockComment = FeedComment

/** A single publication / post in the feed */
export type MockPost = FeedPost

export type FeedMapperUser = MockUser
