/**
 * ──────────────────────────────────────────────────────────────
 * JWT Utilities — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Client-side JWT decoding helpers.
 *
 * These do NOT verify the signature — verification is the
 * backend's responsibility. We only decode the payload to
 * extract user claims for hydrating the auth state after
 * an OAuth2 redirect callback.
 */

import type { User, UserRole } from "@/types/auth"

/* ──────────────── Payload Decoder ──────────────── */

/**
 * Decode the payload (middle segment) of a JWT without
 * verifying the signature. Returns `null` on malformed tokens.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    // base64url → base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/* ──────────────── User Extraction ──────────────── */

/**
 * Extract a `User` object from the claims embedded in a JWT.
 *
 * Handles multiple possible claim naming conventions
 * (camelCase, snake_case, OIDC standard claims) so it works
 * regardless of exactly how the backend serialises the payload.
 *
 * Returns `null` if the token cannot be decoded or
 * essential claims (email) are missing.
 */
export function extractUserFromJwt(token: string): User | null {
  const claims = decodeJwtPayload(token)
  if (!claims) return null

  const email = pick(claims, "email", "sub", "mail") as string | undefined
  if (!email) return null

  return {
    id: (pick(claims, "id", "userId", "user_id") ?? 0) as number,
    firstName: (pick(claims, "firstName", "first_name", "given_name") ?? "") as string,
    lastName: (pick(claims, "lastName", "last_name", "family_name") ?? "") as string,
    email,
    phone: (pick(claims, "phone", "phoneNumber", "phone_number") ?? "") as string,
    role: (pick(claims, "role", "roles") ?? "USER") as UserRole,
    profileImageUrl: (pick(claims, "profileImageUrl", "profile_image_url", "picture") ?? null) as string | null,
  }
}

/* ──────────────── Helpers ──────────────── */

/**
 * Return the first truthy value found among the given keys in `obj`.
 */
function pick(
  obj: Record<string, unknown>,
  ...keys: string[]
): unknown | undefined {
  for (const key of keys) {
    const val = obj[key]
    if (val !== undefined && val !== null && val !== "") {
      // Handle arrays (e.g. "roles": ["ADMIN"])
      if (Array.isArray(val)) return val[0]
      return val
    }
  }
  return undefined
}
