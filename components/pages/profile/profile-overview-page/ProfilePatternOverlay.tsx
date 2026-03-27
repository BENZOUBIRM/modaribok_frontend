"use client"

import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"

type PatternIconKey =
  | "dumbbell"
  | "goal"
  | "fire"
  | "pulse"
  | "cup"
  | "ball"
  | "run"
  | "bolt"
  | "clap"
  | "muscle"

const PATTERN_ICON_BY_KEY: Record<PatternIconKey, string> = {
  dumbbell: "solar:dumbbells-large-minimalistic-linear",
  goal: "solar:target-linear",
  fire: "solar:fire-bold",
  pulse: "solar:heart-pulse-2-linear",
  cup: "solar:cup-star-linear",
  ball: "solar:ball-linear",
  run: "solar:running-2-linear",
  bolt: "solar:bolt-bold",
  clap: "mdi:hand-clap",
  muscle: "game-icons:biceps",
}

type PatternPoint = {
  icon: PatternIconKey
  top: string
  left: string
  size: "size-4" | "size-5"
  rotate: string
  className?: string
}

const BASE_POINTS: PatternPoint[] = [
  { icon: "goal", top: "7%", left: "20%", size: "size-4", rotate: "-10deg" },
  { icon: "cup", top: "8%", left: "33%", size: "size-4", rotate: "9deg" },
  { icon: "fire", top: "7%", left: "67%", size: "size-4", rotate: "-9deg" },
  { icon: "run", top: "8%", left: "80%", size: "size-5", rotate: "11deg" },
  { icon: "dumbbell", top: "16%", left: "14%", size: "size-5", rotate: "-8deg" },
  { icon: "pulse", top: "14%", left: "28%", size: "size-5", rotate: "8deg" },
  { icon: "goal", top: "13%", left: "72%", size: "size-4", rotate: "-11deg" },
  { icon: "ball", top: "16%", left: "86%", size: "size-4", rotate: "10deg" },
  { icon: "bolt", top: "24%", left: "12%", size: "size-4", rotate: "-13deg" },
  { icon: "clap", top: "23%", left: "24%", size: "size-4", rotate: "9deg" },
  { icon: "muscle", top: "22%", left: "76%", size: "size-4", rotate: "-8deg" },
  { icon: "dumbbell", top: "24%", left: "88%", size: "size-5", rotate: "12deg" },
  { icon: "goal", top: "35%", left: "13%", size: "size-4", rotate: "10deg" },
  { icon: "run", top: "36%", left: "24%", size: "size-5", rotate: "-9deg" },
  { icon: "cup", top: "35%", left: "76%", size: "size-4", rotate: "11deg" },
  { icon: "pulse", top: "37%", left: "87%", size: "size-5", rotate: "-10deg" },
  { icon: "goal", top: "51%", left: "11%", size: "size-4", rotate: "-8deg" },
  { icon: "dumbbell", top: "50%", left: "22%", size: "size-5", rotate: "8deg" },
  { icon: "ball", top: "49%", left: "34%", size: "size-4", rotate: "-12deg" },
  { icon: "fire", top: "51%", left: "66%", size: "size-4", rotate: "10deg" },
  { icon: "pulse", top: "50%", left: "78%", size: "size-5", rotate: "-7deg" },
  { icon: "bolt", top: "51%", left: "89%", size: "size-4", rotate: "9deg" },
  { icon: "run", top: "62%", left: "13%", size: "size-5", rotate: "-11deg" },
  { icon: "clap", top: "63%", left: "26%", size: "size-4", rotate: "10deg" },
  { icon: "goal", top: "61%", left: "38%", size: "size-4", rotate: "-9deg" },
  { icon: "muscle", top: "62%", left: "62%", size: "size-4", rotate: "8deg" },
  { icon: "cup", top: "63%", left: "74%", size: "size-4", rotate: "-10deg" },
  { icon: "ball", top: "62%", left: "86%", size: "size-4", rotate: "11deg" },
  { icon: "fire", top: "73%", left: "18%", size: "size-4", rotate: "7deg" },
  { icon: "dumbbell", top: "74%", left: "82%", size: "size-5", rotate: "-8deg" },
]

const SMALL_SCREEN_POINTS: PatternPoint[] = [
  { icon: "goal", top: "11%", left: "10%", size: "size-4", rotate: "8deg", className: "sm:hidden" },
  { icon: "cup", top: "11%", left: "90%", size: "size-4", rotate: "-9deg", className: "sm:hidden" },
  { icon: "dumbbell", top: "29%", left: "9%", size: "size-5", rotate: "-7deg", className: "sm:hidden" },
  { icon: "run", top: "30%", left: "91%", size: "size-5", rotate: "11deg", className: "sm:hidden" },
  { icon: "fire", top: "56%", left: "8%", size: "size-4", rotate: "12deg", className: "sm:hidden" },
  { icon: "bolt", top: "58%", left: "92%", size: "size-4", rotate: "-10deg", className: "sm:hidden" },
  { icon: "muscle", top: "69%", left: "12%", size: "size-4", rotate: "9deg", className: "sm:hidden" },
  { icon: "pulse", top: "70%", left: "88%", size: "size-5", rotate: "-8deg", className: "sm:hidden" },
]

const LARGE_SCREEN_POINTS: PatternPoint[] = [
  { icon: "goal", top: "10%", left: "8%", size: "size-4", rotate: "8deg", className: "hidden lg:block" },
  { icon: "run", top: "11%", left: "92%", size: "size-5", rotate: "-11deg", className: "hidden lg:block" },
  { icon: "dumbbell", top: "25%", left: "8%", size: "size-5", rotate: "-7deg", className: "hidden lg:block" },
  { icon: "fire", top: "25%", left: "92%", size: "size-4", rotate: "10deg", className: "hidden lg:block" },
  { icon: "muscle", top: "48%", left: "7%", size: "size-4", rotate: "12deg", className: "hidden lg:block" },
  { icon: "clap", top: "49%", left: "93%", size: "size-4", rotate: "-9deg", className: "hidden lg:block" },
  { icon: "cup", top: "66%", left: "9%", size: "size-4", rotate: "-10deg", className: "hidden lg:block" },
  { icon: "pulse", top: "66%", left: "91%", size: "size-5", rotate: "8deg", className: "hidden lg:block" },
]

const PATTERN_POINTS = [...BASE_POINTS, ...SMALL_SCREEN_POINTS, ...LARGE_SCREEN_POINTS]

export function ProfilePatternOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-16 md:hidden">
      {PATTERN_POINTS.map((point, index) => (
        <Icon
          key={`${point.icon}-${index}`}
          icon={PATTERN_ICON_BY_KEY[point.icon]}
          className={cn(point.size, "absolute text-muted-foreground/85", point.className)}
          style={{ top: point.top, left: point.left, transform: `rotate(${point.rotate})` }}
        />
      ))}
    </div>
  )
}
