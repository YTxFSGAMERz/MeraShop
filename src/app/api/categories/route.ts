import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    // Fetch all active categories
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            sortOrder: true,
            parentId: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true, deletedAt: null },
                },
              },
            },
          },
        },
        _count: {
          select: {
            products: {
              where: { isActive: true, deletedAt: null },
            },
          },
        },
      },
    })

    // Optionally include first 4 products per category
    let result: Array<typeof categories[number] & { products?: Array<Record<string, unknown>> }> =
      categories

    if (includeProducts) {
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await db.product.findMany({
            where: {
              categoryId: category.id,
              isActive: true,
              deletedAt: null,
            },
            take: 4,
            orderBy: { totalSold: 'desc' },
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
                orderBy: { sortOrder: 'asc' },
              },
              brand: {
                select: { id: true, name: true, slug: true },
              },
            },
          })

          const transformedProducts = products.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary) || product.images[0]
            const effectivePrice = product.salePrice ?? product.basePrice
            const discountPercent =
              product.salePrice && product.salePrice < product.basePrice
                ? Math.round(
                    ((product.basePrice - product.salePrice) / product.basePrice) * 100
                  )
                : 0

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              shortDescription: product.shortDescription,
              basePrice: product.basePrice,
              salePrice: product.salePrice,
              effectivePrice,
              discountPercent,
              primaryImage: primaryImage?.url || null,
              primaryImageAlt: primaryImage?.altText || product.name,
              brand: product.brand,
              avgRating: product.avgRating,
              reviewCount: product.reviewCount,
              isFeatured: product.isFeatured,
              isNewArrival: product.isNewArrival,
              isBestseller: product.isBestseller,
              shippingFree: product.shippingFree,
            }
          })

          return {
            ...category,
            products: transformedProducts,
          }
        })
      )
      result = categoriesWithProducts
    }

    // Build tree structure: only top-level categories (parentId === null) with children
    const topLevelCategories = result.filter((c) => !c.parentId)

    return NextResponse.json({
      categories: topLevelCategories,
    })
  } catch (error) {
    console.error('[API /categories] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
