import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { select: { id: true, productName: true, quantity: true, totalPrice: true } },
          payment: { select: { method: true, status: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user?.name || o.shippingName,
        email: o.user?.email,
        phone: o.user?.phone || o.shippingPhone,
        status: o.status,
        total: o.totalAmount,
        subtotal: o.subtotal,
        shippingCost: o.shippingCost,
        discountAmount: o.discountAmount,
        taxAmount: o.taxAmount,
        items: o.items.length,
        orderItems: o.items,
        payment: o.payment,
        shippingAddress: {
          name: o.shippingName,
          phone: o.shippingPhone,
          address1: o.shippingAddress1,
          address2: o.shippingAddress2,
          city: o.shippingCity,
          state: o.shippingState,
          pincode: o.shippingPincode,
          country: o.shippingCountry,
        },
        trackingNumber: o.trackingNumber,
        trackingUrl: o.trackingUrl,
        couponCode: o.couponCode,
        adminNotes: o.adminNotes,
        customerNotes: o.customerNotes,
        estimatedDelivery: o.estimatedDelivery,
        deliveredAt: o.deliveredAt,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
