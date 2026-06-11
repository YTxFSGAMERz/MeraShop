import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface ValidateCouponBody {
  code: string
  cartTotal: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateCouponBody
    const { code, cartTotal } = body

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Coupon code is required' },
        { status: 400 }
      )
    }

    if (cartTotal === undefined || cartTotal === null || cartTotal < 0) {
      return NextResponse.json(
        { valid: false, message: 'Valid cart total is required' },
        { status: 400 }
      )
    }

    // Find the coupon (case-insensitive)
    const coupon = await db.coupon.findFirst({
      where: {
        code: {
          equals: code.trim().toUpperCase(),
        },
      },
    })

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid coupon code. Please check and try again.',
      })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is no longer active.',
      })
    }

    const now = new Date()

    // Check start date
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is not yet active. Please wait until the start date.',
      })
    }

    // Check expiry date
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has expired.',
      })
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has reached its usage limit.',
      })
    }

    // Check minimum order value
    if (cartTotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.`,
      })
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100
      // Apply max discount cap if set
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
    }

    // Ensure discount doesn't exceed cart total
    discount = Math.min(discount, cartTotal)

    // Round to 2 decimal places
    discount = Math.round(discount * 100) / 100

    return NextResponse.json({
      valid: true,
      discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
      },
    })
  } catch (error) {
    console.error('[API /coupons/validate] Error:', error)
    return NextResponse.json(
      { valid: false, message: 'Failed to validate coupon. Please try again.' },
      { status: 500 }
    )
  }
}
