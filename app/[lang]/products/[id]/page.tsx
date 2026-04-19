import { notFound } from "next/navigation"

import { ProductDetailsPage } from "@/components/pages/products"
import { getProductById } from "@/components/pages/products/shared"

interface ProductDetailsRouteProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailsRoute({ params }: ProductDetailsRouteProps) {
  const { id } = await params
  const rawId = decodeURIComponent(id ?? "").trim()
  const productId = Number(rawId)

  if (!Number.isFinite(productId) || !getProductById(productId)) {
    notFound()
  }

  return <ProductDetailsPage productId={productId} />
}
