import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',').filter(Boolean).slice(0, 4);

    if (ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await db.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    // Transform and preserve order from the requested IDs
    const transformed = ids.map((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;

      const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
      const effectivePrice = product.salePrice ?? product.basePrice;
      const discountPercent =
        product.salePrice && product.salePrice < product.basePrice
          ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
          : 0;

      // Group variants by name
      const variantGroups = product.variants.reduce<
        Record<string, Array<{ id: string; value: string; price: number | null; stock: number }>>
      >((acc, variant) => {
        if (!acc[variant.name]) {
          acc[variant.name] = [];
        }
        acc[variant.name].push({
          id: variant.id,
          value: variant.value,
          price: variant.price,
          stock: variant.stock,
        });
        return acc;
      }, {});

      // Parse specifications
      let specifications: Record<string, string> | null = null;
      if (product.specifications) {
        try {
          specifications = JSON.parse(product.specifications);
        } catch {
          specifications = null;
        }
      }

      // Parse tags
      const tags = product.tags
        ? product.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.shortDescription || product.description,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        effectivePrice,
        discountPercent,
        primaryImage: primaryImage?.url || null,
        primaryImageAlt: primaryImage?.altText || product.name,
        category: product.category,
        brand: product.brand,
        images: product.images,
        variantGroups,
        avgRating: product.avgRating,
        reviewCount: product.reviewCount,
        totalSold: product.totalSold,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestseller: product.isBestseller,
        stock: product.stock,
        shippingFree: product.shippingFree,
        returnPolicy: product.returnPolicy,
        tags,
        specifications,
        sku: product.sku,
        weight: product.weight,
        dimensions: product.dimensions,
      };
    }).filter(Boolean);

    return NextResponse.json({ products: transformed });
  } catch (error) {
    console.error('[API /products/compare] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products for comparison' },
      { status: 500 }
    );
  }
}
