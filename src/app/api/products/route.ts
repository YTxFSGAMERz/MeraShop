import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const featured = searchParams.get('featured')
    const newArrival = searchParams.get('newArrival')
    const bestseller = searchParams.get('bestseller')

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
    }

    if (category) {
      where.category = {
        slug: category,
        isActive: true,
      }
    }

    if (brand) {
      where.brand = {
        slug: brand,
        isActive: true,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (newArrival === 'true') {
      where.isNewArrival = true
    }

    if (bestseller === 'true') {
      where.isBestseller = true
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc':
        orderBy = { salePrice: 'asc' }
        break
      case 'price_desc':
        orderBy = { salePrice: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'rating':
        orderBy = { avgRating: 'desc' }
        break
      case 'bestseller':
        orderBy = { totalSold: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Count total matching products
    const total = await db.product.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Fetch products with relations
    const products = await db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            stock: true,
          },
        },
      },
    })

    // Transform products to include computed fields
    const transformedProducts = products.map((product) => {
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
        variants: product.variants,
        avgRating: product.avgRating,
        reviewCount: product.reviewCount,
        totalSold: product.totalSold,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestseller: product.isBestseller,
        stock: product.stock,
        shippingFree: product.shippingFree,
        tags: product.tags,
        createdAt: product.createdAt,
      }
    })

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('[API /products] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
