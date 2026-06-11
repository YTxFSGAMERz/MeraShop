import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addDays, format } from 'date-fns';

// ── Generate order number ────────────────────────────────────────────────
function generateOrderNumber(): string {
  const prefix = 'MS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// ── POST: Create order from cart ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      items,
      subtotal,
      shippingCost,
      discountAmount,
      totalAmount,
    } = body;

    // ── Validate required fields ───────────────────────────────────────
    if (!shippingAddress || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: shippingAddress, paymentMethod, and items are required' },
        { status: 400 }
      );
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Incomplete shipping address' },
        { status: 400 }
      );
    }

    // ── Validate coupon if provided ────────────────────────────────────
    let couponId: string | null = null;
    let couponDiscount = 0;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { error: 'Invalid or expired coupon code' },
          { status: 400 }
        );
      }

      // Check date range
      const now = new Date();
      if (coupon.startsAt && now < coupon.startsAt) {
        return NextResponse.json(
          { error: 'Coupon is not yet active' },
          { status: 400 }
        );
      }
      if (coupon.expiresAt && now > coupon.expiresAt) {
        return NextResponse.json(
          { error: 'Coupon has expired' },
          { status: 400 }
        );
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: 'Coupon usage limit reached' },
          { status: 400 }
        );
      }

      // Check min order value
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` },
          { status: 400 }
        );
      }

      // Calculate coupon discount
      if (coupon.discountType === 'percentage') {
        couponDiscount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
        }
      } else {
        couponDiscount = coupon.discountValue;
      }

      couponId = coupon.id;
    }

    // ── Verify products exist and get details ──────────────────────────
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // ── Create order ───────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = format(addDays(new Date(), 5), 'yyyy-MM-dd');

    // Use a default user ID for guest checkout or get from session
    // For now, we'll use the customer user from seed data
    const defaultUser = await db.user.findFirst({
      where: { role: 'customer' },
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'No customer account found. Please sign in.' },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: defaultUser.id,
        status: 'confirmed',
        shippingName: fullName,
        shippingPhone: phone,
        shippingAddress1: addressLine1,
        shippingAddress2: shippingAddress.addressLine2 || null,
        shippingCity: city,
        shippingState: state,
        shippingPincode: pincode,
        shippingCountry: 'India',
        subtotal,
        shippingCost,
        discountAmount: discountAmount + couponDiscount,
        taxAmount: 0,
        totalAmount: totalAmount - couponDiscount,
        couponId,
        couponCode: couponCode?.toUpperCase() || null,
        estimatedDelivery,
        items: {
          create: items.map((item: {
            productId: string;
            quantity: number;
            variantId?: string;
            variantName?: string;
            unitPrice: number;
            totalPrice: number;
          }) => {
            const product = productMap.get(item.productId);
            return {
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              productImage: product?.images[0]?.url || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              variantName: item.variantName || null,
              variantValue: null,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // ── Create payment record ──────────────────────────────────────────
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        method: paymentMethod,
      },
    });

    // ── Update coupon usage ────────────────────────────────────────────
    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // ── Update product stock and totalSold ─────────────────────────────
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          totalSold: { increment: item.quantity },
          stock: { decrement: item.quantity },
        },
      });
    }

    // ── Clear user's cart ──────────────────────────────────────────────
    await db.cartItem.deleteMany({
      where: { userId: defaultUser.id },
    });

    // ── Save address if requested ──────────────────────────────────────
    // (This would be handled by a separate flag in the request)

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          discountAmount: order.discountAmount,
          shippingName: order.shippingName,
          shippingPhone: order.shippingPhone,
          shippingAddress1: order.shippingAddress1,
          shippingAddress2: order.shippingAddress2,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingPincode: order.shippingPincode,
          estimatedDelivery: order.estimatedDelivery,
          items: order.items,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

// ── GET: Fetch order by orderNumber ───────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'orderNumber query parameter is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
