import localFont from "next/font/local"

// Work Sans — English typography (per Modaribok Brand Guidelines)
// Weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
// Paths are relative to this file (lib/fonts.ts) → go up one level to reach public/
export const workSans = localFont({
  src: [
    {
      path: "../public/fonts/en/WorkSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/en/WorkSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/en/WorkSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/en/WorkSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/en/WorkSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-work-sans",
  display: "swap",
})

// Neo Sans Arabic — Arabic typography (per Modaribok Brand Guidelines)
// Weights: Regular (400), Medium (500), Bold (700), Black (900)
export const neoSansArabic = localFont({
  src: [
    {
      path: "../public/fonts/ar/Neo Sans Arabic Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ar/NeoSansArabicMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ar/NeoSansArabicBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ar/NeoSansArabicBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-neo-sans-arabic",
  display: "swap",
})
