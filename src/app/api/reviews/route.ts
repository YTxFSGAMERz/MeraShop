import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── GET: Fetch reviews for a product ──────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter is required' },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
      where: {
        productId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('[API /reviews GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// ── POST: Create a new review ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, rating, title, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find or create a user for the review
    let reviewUserId = userId;
    if (!reviewUserId || reviewUserId === 'guest') {
      // Find an existing customer or create a guest
      let guestUser = await db.user.findFirst({
        where: { email: 'guest@merashop.in' },
      });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            email: 'guest@merashop.in',
            name: 'Guest User',
            role: 'customer',
          },
        });
      }
      reviewUserId = guestUser.id;
    }

    // Check if user already reviewed this product (skip for guest)
    if (userId && userId !== 'guest') {
      const existingReview = await db.review.findUnique({
        where: {
          userId_productId: {
            userId: reviewUserId,
            productId,
          },
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: reviewUserId,
        productId,
        rating,
        title: title || null,
        comment: comment || null,
        isVerified: false,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update product avgRating and reviewCount
    const allReviews = await db.review.findMany({
      where: { productId, isActive: true },
      select: { rating: true },
    });

    const reviewCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    await db.product.update({
      where: { id: productId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('[API /reviews POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
