/**
 * ──────────────────────────────────────────────────────────────
 * Error Code Registry — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Maps every backend error/success code to its toast variant
 * and whether it should auto-display a toast via the global
 * Axios interceptor.
 *
 * Source of truth: ErrorCode.java on the backend.
 */

export type ToastVariant = "success" | "error" | "warning" | "info"

interface CodeConfig {
  variant: ToastVariant
  /** If true, the Axios interceptor auto-shows a toast for this code */
  autoToast: boolean
}

/**
 * Complete registry — keyed by the CODE STRING value
 * (the string passed in the JSON `code` field, not the Java enum name).
 */
export const ERROR_CODE_REGISTRY: Record<string, CodeConfig> = {
  /* ── System ── */
  ERROR_SYSTEM_000:                          { variant: "error",   autoToast: true  },
  SUCCESS:                                   { variant: "success", autoToast: false },
  MALFORMED_JSONE_017:                       { variant: "error",   autoToast: true  },

  /* ── Auth — Success ── */
  AUTH_SUCCESS_000:                           { variant: "success", autoToast: true  },
  AUTH_USER_CREATED_003:                      { variant: "success", autoToast: true  },
  AUTH_USER_PROFILE_COMPLETED_006:            { variant: "success", autoToast: true  },
  AUTH_LOGOUT_SUCCESS_013:                    { variant: "success", autoToast: true  },

  /* ── Auth — Errors ── */
  AUTH_PHONE_EXISTS_001:                      { variant: "error",   autoToast: true  },
  AUTH_EMAIL_EXISTS_002:                      { variant: "error",   autoToast: true  },
  AUTH_USER_NOT_FOUND_EMAIL_004:              { variant: "error",   autoToast: true  },
  AUTH_USER_NOT_FOUND_EMAIL_005:              { variant: "error",   autoToast: true  },
  AUTH_USER_NOT_FOUND_007:                    { variant: "error",   autoToast: true  },
  AUTH_PASSWORD_INCORRECT_009:                { variant: "error",   autoToast: true  },

  /* ── Auth — Validation ── */
  AUTH_VALIDATION_ERROR_001:                  { variant: "error",   autoToast: true  },
  AUTH_EMAIL_INVALID_002:                     { variant: "error",   autoToast: true  },
  AUTH_PASSWORD_TOO_SHORT_003:                { variant: "error",   autoToast: true  },
  AUTH_EMAIL_REQUIRED_004:                    { variant: "error",   autoToast: true  },
  AUTH_PHONE_REQUIRED_005:                    { variant: "error",   autoToast: true  },
  AUTH_PASSWORD_REQUIRED_006:                 { variant: "error",   autoToast: true  },
  AUTH_FIRST_NAME_REQUIRED_007:               { variant: "error",   autoToast: true  },
  AUTH_LAST_NAME_REQUIRED_008:                { variant: "error",   autoToast: true  },
  AUTH_EMAIL_OR_PHONE_PRVD_012:               { variant: "error",   autoToast: true  },
  AUTH_BIRTHDAY_MUST_PAST_015:                { variant: "error",   autoToast: true  },
  AUTH_GENDER_INVALID_016:                    { variant: "error",   autoToast: true  },

  /* ── Auth — Token ── */
  AUTH_TOKEN_INVALID_009:                     { variant: "error",   autoToast: true  },
  AUTH_TOKEN_EXPIRED_010:                     { variant: "warning", autoToast: true  },
  AUTH_TOKEN_ERROR_011:                       { variant: "error",   autoToast: true  },
  AUTH_TOKEN_REQUIRED_018:                    { variant: "warning", autoToast: true  },

  /* ── Auth — Password Reset ── */
  AUTH_FORGOT_PASSWORD_SUCCESS_EMAIL_026:     { variant: "success", autoToast: true  },
  AUTH_FORGOT_PASSWORD_SUCCESS_WHATSAPP_027:  { variant: "success", autoToast: true  },
  AUTH_EMAIL_SEND_FAILED_028:                 { variant: "error",   autoToast: true  },
  AUTH_WHATSAPP_SEND_FAILED_029:              { variant: "error",   autoToast: true  },
  AUTH_RESET_PASSWORD_SUCCESS_030:            { variant: "success", autoToast: true  },
  AUTH_RESET_TOKEN_INVALID_031:               { variant: "error",   autoToast: true  },
  AUTH_RESET_TOKEN_EXPIRED_032:               { variant: "warning", autoToast: true  },
  AUTH_PASSWORD_MISMATCH_033:                 { variant: "error",   autoToast: true  },
  AUTH_RESET_TOKEN_BLACKLISTED_034:           { variant: "error",   autoToast: true  },

  /* ── OAuth2 ── */
  OAUTH2_SUCCESS_019:                         { variant: "success", autoToast: true  },
  OAUTH2_USER_CREATED_020:                    { variant: "success", autoToast: true  },
  OAUTH2_USER_UPDATED_021:                    { variant: "success", autoToast: false },
  OAUTH2_AUTHENTICATION_FAILED_022:           { variant: "error",   autoToast: true  },
  OAUTH2_EMAIL_CONFLICT_023:                  { variant: "error",   autoToast: true  },
  OAUTH2_PROVIDER_NOT_SUPPORTED_024:          { variant: "error",   autoToast: true  },
  OAUTH2_USER_INFO_MISSING_025:               { variant: "error",   autoToast: true  },

  /* ── Roles ── */
  ROLE_CREATED_010:                           { variant: "success", autoToast: true  },
  ROLE_DELETED_011:                           { variant: "success", autoToast: true  },
  ROLE_UPDATED_012:                           { variant: "success", autoToast: true  },
  ROLE_EXISTE_013:                            { variant: "error",   autoToast: true  },
  ROLE_NOT_FOUND_014:                         { variant: "error",   autoToast: true  },
  ROLE_NAME_ALREADY_EXISTE_015:               { variant: "error",   autoToast: true  },

  /* ── Sports ── */
  SPORT_NAME_REQUIRED_001:                    { variant: "error",   autoToast: true  },
  SPORT_ALREADY_EXISTE_002:                   { variant: "error",   autoToast: true  },
  SPORT_CREATED_003:                          { variant: "success", autoToast: true  },
  SPORT_NAME_NOT_EXISTE_004:                  { variant: "error",   autoToast: true  },
  SPORT_NOT_FOUND_BY_ID_005:                  { variant: "error",   autoToast: true  },
  SPORT_UPDATED_006:                          { variant: "success", autoToast: true  },
  SPORT_DELETED_007:                          { variant: "success", autoToast: true  },

  /* ── Certificates ── */
  CERTIFICAT_NAME_REQUIRED_001:               { variant: "error",   autoToast: true  },
  CERTIFICAT_CREATED_003:                     { variant: "success", autoToast: true  },
  CERTIFICAT_NOT_FOUND_BY_ID_005:             { variant: "error",   autoToast: true  },
  CERTIFICAT_UPDATED_006:                     { variant: "success", autoToast: true  },
  CERTIFICAT_DELETED_007:                     { variant: "success", autoToast: true  },

  /* ── Files ── */
  FILE_STORAGE_ERROR_001:                     { variant: "error",   autoToast: true  },
  FILE_NOT_FOUND_002:                         { variant: "error",   autoToast: true  },
  FILE_EMPTY_003:                             { variant: "error",   autoToast: true  },
  FILE_TOO_LARGE_004:                         { variant: "error",   autoToast: true  },
  FILE_TYPE_NOT_ALLOWED_005:                  { variant: "error",   autoToast: true  },
  FILE_NOT_FOUND_001:                         { variant: "error",   autoToast: true  },

  /* ── Publications ── */
  PUBLICATION_CREATED_001:                    { variant: "success", autoToast: true  },
  PUBLICATION_CONTENT_OR_MEDIA_REQUIRED_002:  { variant: "error",   autoToast: true  },
  PUBLICATION_MAX_MEDIA_EXCEEDED_003:         { variant: "error",   autoToast: true  },
  PUBLICATION_NOT_FOUND_004:                  { variant: "error",   autoToast: true  },
  PUBLICATION_SHARED_NOT_FOUND_005:           { variant: "error",   autoToast: true  },
  PUBLICATION_DELETED_007:                    { variant: "success", autoToast: true  },
  PUBLICATION_INVALID_VISIBILITY_010:         { variant: "error",   autoToast: true  },
  PUBLICATION_UPDATED_SUCCESS:                { variant: "success", autoToast: true  },
  PUBLICATION_UNAUTHORIZED_009:               { variant: "error",   autoToast: true  },

  /* ── Reactions ── */
  REACTION_TOGGLED_SUCCESS:                   { variant: "success", autoToast: false },
  REACTION_INVALID_TYPE_001:                  { variant: "error",   autoToast: true  },

  /* ── Entity ── */
  INVALID_ENTITY_TYPE_002:                    { variant: "error",   autoToast: true  },

  /* ── Comments ── */
  COMMENT_CREATED_SUCCESS:                    { variant: "success", autoToast: false },
  COMMENT_DELETED_SUCCESS:                    { variant: "success", autoToast: true  },
  COMMENT_NOT_FOUND_001:                      { variant: "error",   autoToast: true  },
  COMMENT_CONTENT_REQUIRED_002:               { variant: "error",   autoToast: true  },
  COMMENT_PARENT_MISMATCH_003:                { variant: "error",   autoToast: true  },
  COMMENT_UNAUTHORIZED_004:                   { variant: "error",   autoToast: true  },

  /* ── Reports ── */
  PUBLICATION_REPORTED_SUCCESS:               { variant: "success", autoToast: true  },
  PUBLICATION_ALREADY_REPORTED_001:           { variant: "warning", autoToast: true  },

  /* ── Hide / Restore ── */
  PUBLICATION_HIDDEN_SUCCESS:                 { variant: "success", autoToast: true  },
  PUBLICATION_RESTORED_SUCCESS:               { variant: "success", autoToast: true  },
  HIDE_REASON_REQUIRED_001:                   { variant: "error",   autoToast: true  },
  HIDE_REASON_TOO_LONG:                       { variant: "error",   autoToast: true  },

  /* ── Account ── */
  ACCOUNT_TYPE_CHANGED_SUCCESS:               { variant: "success", autoToast: true  },
  INVALID_ACCOUNT_TYPE:                       { variant: "error",   autoToast: true  },
  ACCOUNT_TYPE_REQUIRED:                      { variant: "error",   autoToast: true  },

  /* ── Global Validation ── */
  FIRST_NAME_SIZE_INVALID:                    { variant: "error",   autoToast: true  },
  LAST_NAME_SIZE_INVALID:                     { variant: "error",   autoToast: true  },
  EMAIL_TOO_LONG:                             { variant: "error",   autoToast: true  },
  PASSWORD_WEAK:                              { variant: "error",   autoToast: true  },
  EMAIL_OR_PHONE_INVALID_LENGTH:              { variant: "error",   autoToast: true  },
  ROLE_NAME_REQUIRED:                         { variant: "error",   autoToast: true  },
  ROLE_NAME_SIZE_INVALID:                     { variant: "error",   autoToast: true  },
  CONTENT_REQUIRED:                           { variant: "error",   autoToast: true  },
  CONTENT_TOO_LONG:                           { variant: "error",   autoToast: true  },
  REACTION_TYPE_REQUIRED:                     { variant: "error",   autoToast: true  },
  REASON_REQUIRED:                            { variant: "error",   autoToast: true  },
  DESCRIPTION_TOO_LONG:                       { variant: "error",   autoToast: true  },
  PUBLICATION_CONTENT_TOO_LONG:               { variant: "error",   autoToast: true  },

  /* ── Follow ── */
  FOLLOW_SUCCESS:                             { variant: "success", autoToast: true  },
  UNFOLLOW_SUCCESS:                           { variant: "success", autoToast: true  },
  FOLLOW_REQUEST_ACCEPTED:                    { variant: "success", autoToast: true  },
  FOLLOW_REQUEST_REJECTED:                    { variant: "success", autoToast: true  },
  FOLLOW_ALREADY_EXISTS:                      { variant: "warning", autoToast: true  },
  FOLLOW_NOT_FOUND:                           { variant: "error",   autoToast: true  },
  FOLLOW_CANNOT_FOLLOW_YOURSELF:              { variant: "warning", autoToast: true  },
  FOLLOW_REQUEST_NOT_FOUND:                   { variant: "error",   autoToast: true  },
  FOLLOW_REQUEST_NOT_PENDING:                 { variant: "warning", autoToast: true  },
  FOLLOW_ACCOUNT_NOT_PRIVATE:                 { variant: "info",    autoToast: true  },

  /* ── Frontend-only ── */
  NETWORK_ERROR:                              { variant: "error",   autoToast: true  },
  UNKNOWN_ERROR:                              { variant: "error",   autoToast: true  },
}

/** Look up the config for a code, falling back to UNKNOWN_ERROR. */
export function getCodeConfig(code: string): CodeConfig {
  return ERROR_CODE_REGISTRY[code] ?? ERROR_CODE_REGISTRY.UNKNOWN_ERROR
}
