/**
 * ──────────────────────────────────────────────────────────────
 * Publication Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for publications (posts), comments, and
 * related feed data structures.
 */

import type { MockUser } from "./profile"

/** A comment on a publication (recursive for replies) */
export interface MockComment {
  id: number
  author: MockUser
  text: string
  createdAt: string
  likesCount: number
  replies: MockComment[]
}

/** A single publication / post in the feed */
export interface MockPost {
  id: number
  author: MockUser
  text: string
  images: string[]
  createdAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  comments: MockComment[]
}
