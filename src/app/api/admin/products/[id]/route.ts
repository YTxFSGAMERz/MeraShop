import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product || product.deletedAt) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    } = body;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(categoryId !== undefined && { categoryId }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(sku !== undefined && { sku }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(tags !== undefined && { tags }),
        ...(specifications !== undefined && { specifications }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isNewArrival !== undefined && { isNewArrival }),
        ...(isBestseller !== undefined && { isBestseller }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete
    await db.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
