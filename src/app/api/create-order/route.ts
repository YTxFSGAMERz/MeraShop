import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// ── Initialize Razorpay instance ────────────────────────────────────────────
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ── POST: Create Razorpay order ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a number' },
        { status: 400 }
      );
    }

    // Minimum amount: 100 paise (₹1)
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Minimum amount is ₹1 (100 paise)' },
        { status: 400 }
      );
    }

    // Maximum amount: ₹5,00,000 (50 lakh paise) — Razorpay limit for standard checkout
    if (amount > 50000000) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum allowed limit' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation failed:', error);

    // Handle Razorpay authentication errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const razorpayError = error as { statusCode: number; error?: { description?: string; code?: string } };
      if (razorpayError.statusCode === 401) {
        return NextResponse.json(
          { error: 'Payment gateway authentication failed. Please contact support.' },
          { status: 401 }
        );
      }
      if (razorpayError.statusCode === 400) {
        const desc = razorpayError.error?.description || 'Invalid order parameters';
        return NextResponse.json(
          { error: desc },
          { status: 400 }
        );
      }
      if (razorpayError.statusCode === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
