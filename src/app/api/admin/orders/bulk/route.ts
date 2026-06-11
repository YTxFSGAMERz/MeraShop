import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, status } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Action and order IDs are required' },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per bulk operation' },
        { status: 400 }
      );
    }

    let affected = 0;

    switch (action) {
      case 'updateStatus': {
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
          return NextResponse.json(
            { error: `Valid status (${validStatuses.join('/')}) is required` },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = { status };

        // Set deliveredAt when status is 'delivered'
        if (status === 'delivered') {
          updateData.deliveredAt = new Date();
        }

        const result = await db.order.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });
        affected = result.count;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: updateStatus' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, affected });
  } catch (error) {
    console.error('Bulk orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
