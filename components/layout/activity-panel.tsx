"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/*  Shared scrollable content used by both desktop and mobile panels   */
/* ------------------------------------------------------------------ */
function PanelContent() {
  const { dictionary } = useDictionary()

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Upcoming Events */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:calendar-linear" className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">
            {dictionary.activity.upcomingEvents}
          </h3>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium">Team Meeting</p>
            <p className="text-xs text-muted-foreground mt-1">Today, 2:00 PM</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">Project Review</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tomorrow, 10:00 AM
            </p>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:bell-linear" className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">
            {dictionary.activity.recentNotifications}
          </h3>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm">New comment on your task</p>
            <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm">Task deadline approaching</p>
            <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:chart-2-linear" className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">
            {dictionary.activity.timeline}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm">Task completed</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm">New file uploaded</p>
              <p className="text-xs text-muted-foreground">3 hours ago</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm">Meeting rescheduled</p>
              <p className="text-xs text-muted-foreground">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
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
  const { dictionary, isRTL } = useDictionary()

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
          {/* Scrollable content */}
          <div className="flex-1 flex flex-col min-w-[224px] overflow-hidden">
            <div className="flex items-center justify-between h-16 shrink-0 px-4 border-b border-border">
              <h2 className="font-bold text-lg">
                {dictionary.activity.title}
              </h2>
            </div>
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
                ? "rounded-r-lg border-r border-t border-b border-border"
                : "rounded-l-lg border-l border-t border-b border-border"
            )}
          >
            {isRTL ? (
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="size-4 text-muted-foreground"
              />
            ) : (
              <Icon
                icon="solar:alt-arrow-left-linear"
                className="size-4 text-muted-foreground"
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
                "fixed top-0 h-full w-80 bg-background border-border z-[70] flex flex-col",
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
