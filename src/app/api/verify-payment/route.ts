import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ── POST: Verify Razorpay payment signature ─────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields.' },
        { status: 400 }
      );
    }

    // Validate field formats (basic sanity check)
    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid payment verification data format.' },
        { status: 400 }
      );
    }

    // Generate expected signature using HMAC-SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json(
        { error: 'Payment verification is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures using timing-safe comparison to prevent timing attacks
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpay_signature, 'hex')
      );
    } catch {
      // Length mismatch or invalid hex in signature — verification fails
      isValid = false;
    }

    if (!isValid) {
      console.warn('Payment signature mismatch', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { error: 'Payment verification failed. Signature mismatch. Please contact support.' },
        { status: 400 }
      );
    }

    // Signature is valid — payment verified
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
