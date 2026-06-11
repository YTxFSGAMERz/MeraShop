import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    // Batch insert events (limit to 50 per request)
    const eventsToInsert = events.slice(0, 50).map((event: Record<string, unknown>) => ({
      eventType: String(event.eventType || 'unknown'),
      userId: event.userId ? String(event.userId) : null,
      sessionId: event.sessionId ? String(event.sessionId) : null,
      data: event.data ? JSON.stringify(event.data) : null,
      url: event.url ? String(event.url) : null,
      referrer: event.referrer ? String(event.referrer) : null,
      userAgent: event.userAgent ? String(event.userAgent) : null,
    }));

    await db.analyticsEvent.createMany({
      data: eventsToInsert,
    });

    return NextResponse.json({ success: true, count: eventsToInsert.length });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track events' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    const where: Record<string, unknown> = {};
    if (eventType) where.eventType = eventType;

    const events = await db.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get event counts by type
    const eventCounts = await db.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
    });

    return NextResponse.json({
      events,
      eventCounts: eventCounts.map((ec) => ({
        eventType: ec.eventType,
        count: ec._count.eventType,
      })),
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
