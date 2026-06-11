import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') // hero, category, sidebar

    const now = new Date()

    // Build where clause
    const where: Prisma.BannerWhereInput = {
      isActive: true,
      OR: [
        { startsAt: null, expiresAt: null },
        { startsAt: null, expiresAt: { gte: now } },
        { startsAt: { lte: now }, expiresAt: null },
        { startsAt: { lte: now }, expiresAt: { gte: now } },
      ],
    }

    if (position) {
      where.position = position
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('[API /banners] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}
