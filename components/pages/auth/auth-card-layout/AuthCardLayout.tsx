"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"

interface AuthCardLayoutProps {
  children: React.ReactNode
  /** Extra classes applied to the form panel (right side) */
  formClassName?: string
}

/**
 * Shared layout wrapper for Login and Signup pages.
 *
 * Renders:
 *  - An identical outer card shell (same max-width, min-height, border, shadow)
 *  - An identical image panel on the left (same image, same sizing)
 *  - A form panel on the right that receives `children`
 *
 * This guarantees that both pages have pixel-identical card dimensions
 * and the running-man image is always the same size.
 */
function AuthCardLayout({ children, formClassName }: AuthCardLayoutProps) {
  const { isRTL } = useDictionary()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 lg:p-10">
      <div
        className={cn(
          "w-full max-w-5xl bg-background rounded-2xl shadow-lg border border-border",
          "dark:shadow-[0_10px_15px_-3px_rgb(255,255,255,0.05),0_4px_6px_-4px_rgb(255,255,255,0.05)]",
          "overflow-hidden flex flex-col lg:flex-row",
          "min-h-125 lg:min-h-150"
        )}
      >
        {/* Left Side — Image (identical on both pages) */}
        <div
          className={cn(
            "hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#eaf0fd]",
            isRTL ? "rounded-r-2xl" : "rounded-l-2xl"
          )}
        >
          <Image
            src="/images/man-running.png"
            alt="Modaribok"
            fill
            className="object-contain w-[90%] h-[90%] drop-shadow-2xl"
            priority
            objectFit="cover"
          />
        </div>

        {/* Right Side — Form */}
        <div
          className={cn(
            "flex-1 flex flex-col justify-center lg:w-1/2 bg-background",
            formClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthCardLayout }
