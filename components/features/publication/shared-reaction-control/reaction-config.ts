import type { ReactionType } from "@/types"

export const REACTION_ICON_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "solar:like-bold",
  LOVE: "solar:heart-bold",
  HAHA: "emojione:smiling-face-with-open-mouth-and-closed-eyes",
  STRONG: "game-icons:strong",
  FIRE: "solar:fire-bold",
  CLAP: "mdi:hand-clap",
  MUSCLE: "game-icons:biceps",
  HEALTHY: "solar:heart-pulse-2-bold",
  MOTIVATION: "solar:bolt-bold",
  GOAL: "solar:target-bold",
  PROGRESS: "solar:chart-2-bold",
  CHAMPION: "solar:cup-star-bold",
}

export const REACTION_COLOR_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "text-primary",
  LOVE: "text-rose-500",
  HAHA: "text-amber-500",
  STRONG: "text-violet-500",
  FIRE: "text-orange-500",
  CLAP: "text-sky-500",
  MUSCLE: "text-indigo-500",
  HEALTHY: "text-emerald-500",
  MOTIVATION: "text-yellow-500",
  GOAL: "text-fuchsia-500",
  PROGRESS: "text-cyan-500",
  CHAMPION: "text-lime-500",
}

export const REACTION_ACTIVE_BG_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "bg-blue-500/15 hover:bg-blue-500/25",
  LOVE: "bg-rose-500/15 hover:bg-rose-500/25",
  HAHA: "bg-amber-500/15 hover:bg-amber-500/25",
  STRONG: "bg-violet-500/15 hover:bg-violet-500/25",
  FIRE: "bg-orange-500/15 hover:bg-orange-500/25",
  CLAP: "bg-sky-500/15 hover:bg-sky-500/25",
  MUSCLE: "bg-indigo-500/15 hover:bg-indigo-500/25",
  HEALTHY: "bg-emerald-500/15 hover:bg-emerald-500/25",
  MOTIVATION: "bg-yellow-500/15 hover:bg-yellow-500/25",
  GOAL: "bg-fuchsia-500/15 hover:bg-fuchsia-500/25",
  PROGRESS: "bg-cyan-500/15 hover:bg-cyan-500/25",
  CHAMPION: "bg-lime-500/15 hover:bg-lime-500/25",
}

export const REACTION_PICKER_ACTIVE_BG_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "bg-blue-500/15 dark:bg-blue-400/20",
  LOVE: "bg-rose-500/15 dark:bg-rose-400/20",
  HAHA: "bg-amber-500/15 dark:bg-amber-400/20",
  STRONG: "bg-violet-500/15 dark:bg-violet-400/20",
  FIRE: "bg-orange-500/15 dark:bg-orange-400/20",
  CLAP: "bg-sky-500/15 dark:bg-sky-400/20",
  MUSCLE: "bg-indigo-500/15 dark:bg-indigo-400/20",
  HEALTHY: "bg-emerald-500/15 dark:bg-emerald-400/20",
  MOTIVATION: "bg-yellow-500/15 dark:bg-yellow-400/20",
  GOAL: "bg-fuchsia-500/15 dark:bg-fuchsia-400/20",
  PROGRESS: "bg-cyan-500/15 dark:bg-cyan-400/20",
  CHAMPION: "bg-lime-500/15 dark:bg-lime-400/20",
}

export const REACTION_PICKER_ACTIVE_BORDER_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "border-blue-500/50 dark:border-blue-400/60",
  LOVE: "border-rose-500/50 dark:border-rose-400/60",
  HAHA: "border-amber-500/50 dark:border-amber-400/60",
  STRONG: "border-violet-500/50 dark:border-violet-400/60",
  FIRE: "border-orange-500/50 dark:border-orange-400/60",
  CLAP: "border-sky-500/50 dark:border-sky-400/60",
  MUSCLE: "border-indigo-500/50 dark:border-indigo-400/60",
  HEALTHY: "border-emerald-500/50 dark:border-emerald-400/60",
  MOTIVATION: "border-yellow-500/50 dark:border-yellow-400/60",
  GOAL: "border-fuchsia-500/50 dark:border-fuchsia-400/60",
  PROGRESS: "border-cyan-500/50 dark:border-cyan-400/60",
  CHAMPION: "border-lime-500/50 dark:border-lime-400/60",
}

export const REACTION_ORDER: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "STRONG",
  "FIRE",
  "CLAP",
  "MUSCLE",
  "HEALTHY",
  "MOTIVATION",
  "GOAL",
  "PROGRESS",
  "CHAMPION",
]

export const REACTION_ICON_BURST_COLOR_CLASSES: Record<ReactionType, string[]> = {
  LIKE: ["text-blue-400", "text-blue-500", "text-blue-600"],
  LOVE: ["text-rose-400", "text-rose-500", "text-rose-600"],
  HAHA: ["text-amber-400", "text-amber-500", "text-amber-600"],
  STRONG: ["text-violet-400", "text-violet-500", "text-violet-600"],
  FIRE: ["text-orange-400", "text-orange-500", "text-orange-600"],
  CLAP: ["text-sky-400", "text-sky-500", "text-sky-600"],
  MUSCLE: ["text-indigo-400", "text-indigo-500", "text-indigo-600"],
  HEALTHY: ["text-emerald-400", "text-emerald-500", "text-emerald-600"],
  MOTIVATION: ["text-yellow-400", "text-yellow-500", "text-yellow-600"],
  GOAL: ["text-fuchsia-400", "text-fuchsia-500", "text-fuchsia-600"],
  PROGRESS: ["text-cyan-400", "text-cyan-500", "text-cyan-600"],
  CHAMPION: ["text-lime-400", "text-lime-500", "text-lime-600"],
}

export const REACTION_ICON_BURST_ACCENT_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "solar:star-bold",
  LOVE: "solar:heart-bold",
  HAHA: "emojione:smiling-face-with-open-mouth-and-closed-eyes",
  STRONG: "solar:bolt-bold",
  FIRE: "solar:fire-bold",
  CLAP: "mdi:hand-clap",
  MUSCLE: "game-icons:biceps",
  HEALTHY: "solar:heart-pulse-2-bold",
  MOTIVATION: "solar:rocket-bold",
  GOAL: "solar:target-bold",
  PROGRESS: "solar:chart-2-bold",
  CHAMPION: "solar:cup-star-bold",
}

export function formatReactionLabel(type: ReactionType): string {
  return `${type.charAt(0)}${type.slice(1).toLowerCase()}`
}
