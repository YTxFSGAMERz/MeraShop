import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, image, linkUrl, linkText, position, sortOrder, isActive, startsAt, expiresAt } = body;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image !== undefined && { image }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(linkText !== undefined && { linkText }),
        ...(position !== undefined && { position }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Update banner error:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
