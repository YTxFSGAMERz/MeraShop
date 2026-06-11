import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, image, parentId, sortOrder, isActive } = body;

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Move or delete products first.' },
        { status: 400 }
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Delete subcategories first.' },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
