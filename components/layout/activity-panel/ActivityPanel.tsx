"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserProfileCard } from "@/components/features/profile"
import { CurrentEvents } from "@/components/features/events"
import { EventInvitations } from "@/components/features/events"
import { EventCalendar } from "@/components/features/events"
import { EventSchedule } from "@/components/features/events"
import { EventLegend } from "@/components/features/events"

/* ------------------------------------------------------------------ */
/*  Shared scrollable content used by both desktop and mobile panels   */
/* ------------------------------------------------------------------ */
function PanelContent() {
  return (
    <div className="flex-1 overflow-y-auto">
      <UserProfileCard />
      <CurrentEvents />
      <EventInvitations />
      <EventCalendar />
      <EventSchedule />
      <EventLegend />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Desktop expanded panel — full viewport height, next to navbar      */
/* ------------------------------------------------------------------ */
export function ActivityPanelDesktop({
  isOpen,
}: {
  isOpen: boolean
}) {
  const { isRTL } = useDictionary()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "shrink-0 flex flex-col bg-card overflow-hidden",
            isRTL ? "border-r border-border" : "border-l border-border"
          )}
        >
          <div className="flex-1 flex flex-col min-w-[224px] overflow-hidden">
            <PanelContent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile overlay panel                                               */
/* ------------------------------------------------------------------ */
export default function ActivityPanelMobile({
  isOpen,
  onClose,
  onToggle,
}: {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}) {
  const { dictionary, isRTL } = useDictionary()

  return (
    <>
      {/* Floating trigger pill */}
      {!isOpen && (
        <div
          className={cn(
            "fixed top-1/2 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer",
            isRTL ? "left-2" : "right-2"
          )}
          onClick={onToggle}
        >
          <div
            className={cn(
              "h-20 w-6 bg-card flex items-center justify-center shadow-md",
              isRTL
                ? "rounded-r-lg border-r border-t border-b border-primary-200"
                : "rounded-l-lg border-l border-t border-b border-primary-200"
            )}
          >
            {isRTL ? (
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="size-4 text-primary"
              />
            ) : (
              <Icon
                icon="solar:alt-arrow-left-linear"
                className="size-4 text-primary"
              />
            )}
          </div>
        </div>
      )}

      {/* Overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-0 h-full w-80 bg-card border-border z-[70] flex flex-col",
                isRTL ? "left-0 border-r" : "right-0 border-l"
              )}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-lg">
                  {dictionary.activity.title}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon
                    icon="material-symbols:close-rounded"
                    className="size-5"
                  />
                </Button>
              </div>
              <PanelContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
