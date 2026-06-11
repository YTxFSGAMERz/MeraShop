import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Banners API error:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, image, linkUrl, linkText, position, sortOrder, isActive, startsAt, expiresAt } = body;

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        position: position || 'hero',
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
