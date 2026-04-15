"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"

/**
 * "Write a comment" input bar with user avatar and send arrow.
 * Optionally shows an @handle tag when replying to someone.
 */
export function CommentInput({
  replyTo,
  onCancelReply,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  inputRef,
}: {
  replyTo?: string
  onCancelReply?: () => void
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  isSubmitting?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const { dictionary, isRTL } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed

  const avatarSrc = user?.profileImageUrl || "/images/default-user.jpg"

  const canSubmit = Boolean(value?.trim()) && !isSubmitting

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    onSubmit?.()
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3" dir={isRTL ? "rtl" : "ltr"}>
      <Image
        src={avatarSrc}
        alt={user?.firstName ?? ""}
        width={32}
        height={32}
        className="size-8 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 relative">
        {replyTo && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
              {replyTo}
            </span>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                title={t.cancel || "Cancel"}
              >
                <Icon icon="solar:close-circle-linear" className="size-4" />
              </button>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={replyTo ? `${t.reply} ${replyTo}...` : t.writeComment}
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleSubmit()
            }
          }}
          className={cn(
            "w-full h-9 rounded-full bg-surface border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
            isRTL ? "pr-4 pl-10 text-right" : "pl-4 pr-10"
          )}
        />
        <button
          title={t.comment}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "cursor-pointer absolute top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            isRTL ? "left-1" : "right-1",
            replyTo && "top-auto bottom-1 translate-y-0",
            !canSubmit && "cursor-not-allowed opacity-50"
          )}
        >
          <Icon
            icon={isRTL ? "solar:arrow-to-top-right-bold" : "solar:arrow-to-top-left-bold"}
            className="size-4"
          />
        </button>
      </div>
    </div>
  )
}
