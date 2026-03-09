import Link from "next/link"

/**
 * Root-level 404 — renders without any providers.
 * Minimal standalone page with brand styling. Links to / (middleware handles locale).
 */
export default function RootNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen items-center justify-center bg-[#EDF3FA] font-sans antialiased p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg flex flex-col sm:flex-row">
          {/* Left — decorative */}
          <div className="flex flex-col items-center justify-center gap-3 bg-[#eaf0fd] p-10 sm:w-2/5">
            <span className="text-8xl font-extrabold tracking-tighter text-[#2869E8]/80">
              404
            </span>
          </div>
          {/* Right — content */}
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <h1 className="text-2xl font-bold text-[#1F2A3D]">
              Page Not Found
            </h1>
            <p className="text-sm text-[#6B7B8F] leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2869E8] px-6 py-3 text-sm font-medium text-white hover:bg-[#153B89] transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
