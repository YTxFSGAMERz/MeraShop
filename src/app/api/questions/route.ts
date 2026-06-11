import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── GET: Fetch questions for a product ──────────────────────────────────────
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

    const questions = await db.productQuestion.findMany({
      where: { productId },
      orderBy: [
        { answered: 'asc' },   // Unanswered first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('[API /questions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// ── POST: Create a new question ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, question, userName } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    if (!question || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Question must be at least 5 characters long' },
        { status: 400 }
      );
    }

    if (question.trim().length > 500) {
      return NextResponse.json(
        { error: 'Question must be less than 500 characters' },
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

    const newQuestion = await db.productQuestion.create({
      data: {
        productId,
        question: question.trim(),
        askedBy: userName?.trim() || 'Anonymous',
      },
    });

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('[API /questions POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
