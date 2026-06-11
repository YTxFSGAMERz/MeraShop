import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Already subscribed',
        subscribed: true,
      });
    }

    await db.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Successfully subscribed',
      subscribed: true,
    });
  } catch (error) {
    console.error('[API /newsletter] Error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
