"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Renders a publication's image/video grid.
 * - 1 image: full-width
 * - 2 images: side-by-side
 * - 3+ images: 1 large + 2 small grid
 */
export function PublicationMedia({ images }: { images: string[] }) {
  if (!images.length) return null

  if (images.length === 1) {
    return (
      <div className="px-4 pb-3">
        <div className="rounded-lg overflow-hidden">
          <Image
            src={images[0]}
            alt="Post media"
            width={600}
            height={400}
            className="w-full max-h-[400px] object-cover"
          />
        </div>
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Post media ${i + 1}`}
              width={300}
              height={300}
              className="w-full h-56 object-cover"
            />
          ))}
        </div>
      </div>
    )
  }

  // 3+ images: masonry layout
  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
        {images.slice(0, 3).map((img, i) => (
          <div
            key={i}
            className={cn(
              i === 0 && images.length === 3 && "row-span-1"
            )}
          >
            <Image
              src={img}
              alt={`Post media ${i + 1}`}
              width={300}
              height={300}
              className="w-full h-56 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
