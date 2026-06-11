import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SYSTEM_PROMPT = `You are a helpful product expert for MeraShop, an Indian e-commerce store. Answer customer questions about products accurately and concisely (under 80 words). Use Indian English. If you don't know the specific answer, give a helpful general response. Be factual and friendly. Mention prices in INR (₹) when relevant.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, productName, productId } = body as {
      question: string;
      productName: string;
      productId: string;
    };

    if (!question || !productId) {
      return NextResponse.json(
        { error: 'Question and productId are required' },
        { status: 400 }
      );
    }

    // Try to get product details for context
    let productContext = '';
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      });
      if (product) {
        productContext = `\nProduct details: ${product.name}${product.brand ? ` by ${product.brand.name}` : ''}${product.category ? ` in ${product.category.name}` : ''}. MRP: ₹${product.basePrice}${product.salePrice ? `, Sale Price: ₹${product.salePrice}` : ''}. Stock: ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}. ${product.shortDescription || ''}`;
      }
    } catch {
      // Product lookup failed, continue without context
    }

    // Try AI-generated answer
    let aiAnswer: string | null = null;
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + productContext },
          { role: 'user', content: `Question about "${productName}": ${question}` },
        ],
        thinking: { type: 'disabled' },
      });

      aiAnswer = completion.choices?.[0]?.message?.content?.trim() || null;
    } catch (sdkError) {
      console.error('AI answer SDK error:', sdkError instanceof Error ? sdkError.message : 'Unknown error');
    }

    // Fallback answer patterns
    if (!aiAnswer) {
      const lower = question.toLowerCase();
      if (lower.includes('colour') || lower.includes('color')) {
        aiAnswer = 'This product is available in multiple colour options. Please check the variant selector above to see all available colours.';
      } else if (lower.includes('warranty')) {
        aiAnswer = 'This product comes with a standard manufacturer warranty. Please check the product specifications section for the exact warranty period.';
      } else if (lower.includes('return') || lower.includes('refund')) {
        aiAnswer = 'MeraShop offers easy returns within 7-15 days of delivery. The item must be unused with original packaging. Refunds are processed within 5-7 business days.';
      } else if (lower.includes('cod') || lower.includes('cash on delivery')) {
        aiAnswer = 'Yes, Cash on Delivery (COD) is available for most pin codes. You can check COD availability by entering your pincode on the product page.';
      } else if (lower.includes('size') || lower.includes('dimension')) {
        aiAnswer = 'Please check the specifications section on this page for detailed size and dimension information.';
      } else if (lower.includes('delivery') || lower.includes('shipping')) {
        aiAnswer = 'Delivery typically takes 3-7 business days across India. Enter your pincode on the product page to get an estimated delivery date. Free delivery on orders above ₹499!';
      } else {
        aiAnswer = 'Thank you for your question! Our team will review and provide a detailed answer soon. In the meantime, you can check the product specifications or contact our support at 1800-123-4567.';
      }
    }

    // Try to save the AI answer to the database
    try {
      const existing = await db.productQuestion.findFirst({
        where: { productId, question: { contains: question.substring(0, 50), mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
      });

      if (existing && !existing.answered) {
        await db.productQuestion.update({
          where: { id: existing.id },
          data: {
            answer: aiAnswer,
            answered: true,
            updatedAt: new Date(),
          },
        });
      }
    } catch {
      // DB update failed, still return the answer
    }

    return NextResponse.json({ answer: aiAnswer });
  } catch (error) {
    console.error('AI answer API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
