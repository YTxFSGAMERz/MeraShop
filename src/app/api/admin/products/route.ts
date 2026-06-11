import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    const brands = await db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        categoryId: p.categoryId,
        brand: p.brand?.name || null,
        brandId: p.brandId,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        sku: p.sku,
        stock: p.stock,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
        image: p.images[0]?.url || null,
        variantCount: p._count.variants,
        totalSold: p.totalSold,
        avgRating: p.avgRating,
        createdAt: p.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
      brands,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      brandId,
      basePrice,
      salePrice,
      sku,
      stock,
      tags,
      specifications,
      isFeatured,
      isNewArrival,
      isBestseller,
      isActive,
      images,
      variants,
    } = body;

    const product = await db.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        shortDescription,
        categoryId,
        brandId: brandId || null,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku,
        stock: parseInt(stock) || 0,
        tags,
        specifications,
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isBestseller: isBestseller || false,
        isActive: isActive !== false,
        images: images?.length
          ? {
              create: images.map((img: { url: string; altText?: string; sortOrder?: number; isPrimary?: boolean }, i: number) => ({
                url: img.url,
                altText: img.altText || name,
                sortOrder: img.sortOrder ?? i,
                isPrimary: img.isPrimary ?? i === 0,
              })),
            }
          : undefined,
        variants: variants?.length
          ? {
              create: variants.map((v: { name: string; value: string; sku?: string; price?: number; stock?: number }) => ({
                name: v.name,
                value: v.value,
                sku: v.sku,
                price: v.price ? parseFloat(String(v.price)) : null,
                stock: v.stock || 0,
              })),
            }
          : undefined,
      },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
