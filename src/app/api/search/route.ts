import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all' // products, categories, all

    if (!q || q.length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        query: q || '',
      })
    }

    const results: {
      products: Array<Record<string, unknown>>
      categories: Array<Record<string, unknown>>
      query: string
    } = {
      products: [],
      categories: [],
      query: q,
    }

    // Search products
    if (type === 'all' || type === 'products') {
      const products = await db.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortDescription: { contains: q, mode: 'insensitive' } },
            { tags: { contains: q, mode: 'insensitive' } },
            { brand: { name: { contains: q, mode: 'insensitive' } } },
            { category: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 20,
        orderBy: { totalSold: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      results.products = products.map((product) => {
        const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
        const effectivePrice = product.salePrice ?? product.basePrice
        const discountPercent =
          product.salePrice && product.salePrice < product.basePrice
            ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
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
          category: product.category,
          brand: product.brand,
          avgRating: product.avgRating,
          reviewCount: product.reviewCount,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isBestseller: product.isBestseller,
          stock: product.stock,
          shippingFree: product.shippingFree,
        }
      })
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      const categories = await db.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true, deletedAt: null },
              },
            },
          },
        },
      })

      results.categories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        productCount: category._count.products,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('[API /search] Error:', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
