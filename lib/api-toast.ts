/**
 * ──────────────────────────────────────────────────────────────
 * API Toast — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Centralized toast display for API response codes.
 *
 * The dictionary reference is injected at runtime by the
 * ApiToastProvider so this module can resolve i18n messages
 * without being a React component.
 */

import { toast } from "sonner"
import { getCodeConfig, type ToastVariant } from "@/lib/error-codes"

/* ──────────────── Dictionary Sync ──────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _dictionary: any = null

/**
 * Called by ApiToastProvider whenever the dictionary changes
 * (mount, language switch). Keeps i18n in sync for non-React code.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setToastDictionary(dict: any): void {
  _dictionary = dict
}

/* ──────────────── Resolve Message ──────────────── */

interface ResolvedMessage {
  message: string
  variant: ToastVariant
}

/**
 * Look up a backend code → i18n message + toast variant.
 *
 * Falls back to `apiMessages.UNKNOWN_ERROR` when the code
 * has no translation entry.
 */
export function resolveApiMessage(code: string): ResolvedMessage {
  const config = getCodeConfig(code)
  const messages = _dictionary?.apiMessages as Record<string, string> | undefined

  const message =
    messages?.[code] ??
    messages?.UNKNOWN_ERROR ??
    "An unexpected error occurred."

  return { message, variant: config.variant }
}

/* ──────────────── Show Toast ──────────────── */

interface ShowToastOptions {
  /** Override the i18n message with a custom string */
  override?: string
  /** Optional description line shown below the title */
  description?: string
}

/**
 * Resolve a backend code and display the corresponding toast.
 *
 * Called automatically by the Axios interceptor, but can also
 * be called manually from any page/component.
 */
export function showApiToast(code: string, options?: ShowToastOptions): void {
  const { message, variant } = resolveApiMessage(code)
  const text = options?.override ?? message

  const toastFn =
    variant === "success" ? toast.success :
    variant === "warning" ? toast.warning :
    variant === "info"    ? toast.info    :
    toast.error

  toastFn(text, {
    id: code,
    description: options?.description,
  })
}
