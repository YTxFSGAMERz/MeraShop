import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const category = await db.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
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

    if (!category || !category.isActive) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Also get product count including child categories
    const childCategoryIds = category.children.map((c) => c.id)
    const allCategoryIds = [category.id, ...childCategoryIds]

    const totalProductCount = await db.product.count({
      where: {
        categoryId: { in: allCategoryIds },
        isActive: true,
        deletedAt: null,
      },
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        parent: category.parent,
        children: category.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          image: child.image,
          productCount: child._count.products,
        })),
        directProductCount: category._count.products,
        totalProductCount,
      },
    })
  } catch (error) {
    console.error('[API /categories/[slug]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}
