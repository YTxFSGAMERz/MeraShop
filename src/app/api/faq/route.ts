import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Prisma.FAQWhereInput = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    // Group FAQs by category
    const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
      const cat = faq.category || 'general'
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(faq)
      return acc
    }, {})

    return NextResponse.json({
      faqs,
      grouped,
    })
  } catch (error) {
    console.error('[API /faq] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}
