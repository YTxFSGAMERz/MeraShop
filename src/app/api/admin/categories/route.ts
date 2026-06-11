import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: { where: { deletedAt: null } }, children: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, parentId, sortOrder, isActive } = body;

    const category = await db.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        image,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
