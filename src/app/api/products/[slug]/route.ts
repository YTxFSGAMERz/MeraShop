import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await db.product.findUnique({
      where: {
        slug,
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        reviews: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Compute additional fields
    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
    const effectivePrice = product.salePrice ?? product.basePrice
    const discountPercent =
      product.salePrice && product.salePrice < product.basePrice
        ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
        : 0

    // Group variants by name (e.g., "Color" -> ["Red", "Blue"], "Size" -> ["S", "M"])
    const variantGroups = product.variants.reduce<
      Record<string, Array<{ id: string; value: string; price: number | null; stock: number }>>
    >((acc, variant) => {
      if (!acc[variant.name]) {
        acc[variant.name] = []
      }
      acc[variant.name].push({
        id: variant.id,
        value: variant.value,
        price: variant.price,
        stock: variant.stock,
      })
      return acc
    }, {})

    // Calculate review distribution
    const reviewDistribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, star) => {
      acc[star] = product.reviews.filter((r) => r.rating === star).length
      return acc
    }, {})

    // Parse specifications JSON if present
    let specifications: Record<string, string> | null = null
    if (product.specifications) {
      try {
        specifications = JSON.parse(product.specifications)
      } catch {
        specifications = null
      }
    }

    // Parse tags
    const tags = product.tags ? product.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      effectivePrice,
      discountPercent,
      primaryImage: primaryImage?.url || null,
      primaryImageAlt: primaryImage?.altText || product.name,
      category: product.category,
      brand: product.brand,
      images: product.images,
      variants: product.variants,
      variantGroups,
      reviews: product.reviews,
      reviewDistribution,
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      totalSold: product.totalSold,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestseller: product.isBestseller,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      shippingFree: product.shippingFree,
      returnPolicy: product.returnPolicy,
      tags,
      specifications,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('[API /products/[slug]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
