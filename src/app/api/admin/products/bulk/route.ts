import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, status } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Action and product IDs are required' },
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
      case 'delete': {
        // Soft delete: set deletedAt and isActive=false
        const result = await db.product.updateMany({
          where: {
            id: { in: ids },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            isActive: false,
          },
        });
        affected = result.count;
        break;
      }

      case 'changeStatus': {
        if (!status || !['active', 'draft', 'archived'].includes(status)) {
          return NextResponse.json(
            { error: 'Valid status (active/draft/archived) is required' },
            { status: 400 }
          );
        }

        const isActive = status === 'active';
        // For 'draft' and 'archived', we set isActive to false
        // 'archived' also gets a soft delete timestamp to distinguish from draft
        const updateData: { isActive: boolean; deletedAt: Date | null } = {
          isActive,
          deletedAt: null,
        };

        if (status === 'archived') {
          updateData.deletedAt = new Date();
        }

        const result = await db.product.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });
        affected = result.count;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: delete, changeStatus' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, affected });
  } catch (error) {
    console.error('Bulk products API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
