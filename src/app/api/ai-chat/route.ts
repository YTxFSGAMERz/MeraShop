import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a helpful, friendly shopping assistant for MeraShop, an Indian e-commerce store. You help customers find products, answer questions about orders, returns, shipping, and provide product recommendations. Be warm, conversational, and helpful. Keep responses concise (under 150 words). Use Indian English. Mention prices in INR (₹). Use relevant emojis sparingly.

Key information about MeraShop:
- Free delivery on orders above ₹499, otherwise ₹49 delivery charge
- 7-15 days easy return policy
- Payment methods: UPI, Credit/Debit Card, Net Banking, Cash on Delivery
- Active coupon codes: WELCOME10 (10% off for new users), SUMMER20 (20% off up to ₹1000), FLAT500 (₹500 off on ₹2000+), DIWALI25 (25% off during festive season)
- Categories: Electronics, Fashion, Home & Kitchen, Beauty & Personal Care, Sports & Fitness
- Customer support: 1800-123-4567 (9 AM - 9 PM IST)
- Order tracking available at /track-order
- Returns initiated from account dashboard within 7-15 days of delivery
- Popular brands: Samsung, Apple, Sony, Lenovo, Nike, Adidas, Lakme, Himalaya, Boat, Noise
- Festive sales during Diwali, Holi, Eid, and Christmas with extra discounts`;

// Fallback responses when API fails
const FALLBACK_RESPONSES: Record<string, string> = {
  deals: "We have great deals right now! Use code WELCOME10 for 10% off your first order, or SUMMER20 for 20% off up to ₹1000. Check our homepage for the Deal of the Day with countdown offers! 🎉",
  track: "To track your order, visit our Order Tracking page at /track-order and enter your order number. You can also check order status from your account dashboard under 'My Orders'. 📦",
  recommend: "I'd love to help you find something! Our top categories are Electronics, Fashion, Home & Kitchen, and Beauty. What are you looking for today? I can suggest products based on your interests! 🛍️",
  return: "MeraShop offers easy returns within 7-15 days of delivery. Simply go to your account dashboard, find the order, and click 'Return'. Refunds are processed within 5-7 business days. Items must be unused with original packaging. 🔄",
  shipping: "We offer free delivery on orders above ₹499! For orders below that, it's just ₹49. Standard delivery takes 3-7 business days across India. You can check estimated delivery by entering your pincode on any product page. 🚚",
  payment: "We accept multiple payment methods: UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking (SBI, HDFC, ICICI, Axis, etc.), and Cash on Delivery. All payments are secured with 256-bit encryption. 💳",
  coupon: "Great coupons available right now! 🎊\n• WELCOME10 - 10% off for new users\n• SUMMER20 - 20% off up to ₹1000\n• FLAT500 - ₹500 off on ₹2000+\n• DIWALI25 - 25% off during festive season",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('deal') || lower.includes('offer') || lower.includes('discount') || lower.includes('sale')) {
    return FALLBACK_RESPONSES.deals;
  }
  if (lower.includes('track') || lower.includes('order status') || lower.includes('where is my order')) {
    return FALLBACK_RESPONSES.track;
  }
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('looking for') || lower.includes('find')) {
    return FALLBACK_RESPONSES.recommend;
  }
  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return FALLBACK_RESPONSES.return;
  }
  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('deliver') || lower.includes('ship')) {
    return FALLBACK_RESPONSES.shipping;
  }
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('upi') || lower.includes('card')) {
    return FALLBACK_RESPONSES.payment;
  }
  if (lower.includes('coupon') || lower.includes('code') || lower.includes('promo')) {
    return FALLBACK_RESPONSES.coupon;
  }
  return "Thanks for reaching out! I'm here to help with product recommendations, order tracking, returns, shipping info, and more. What would you like to know? 😊";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: Array<{ role: string; content: string }>;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to use z-ai-web-dev-sdk for real AI responses
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      // Add conversation history (last 10 messages to keep context manageable)
      const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: 'user', content: message });

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });

      const response = completion.choices?.[0]?.message?.content;

      if (response && response.trim().length > 0) {
        return NextResponse.json({ response: response.trim() });
      }
    } catch (sdkError) {
      console.error('AI SDK error, using fallback:', sdkError instanceof Error ? sdkError.message : 'Unknown error');
    }

    // Fallback to predefined responses
    const fallbackResponse = getFallbackResponse(message);
    return NextResponse.json({ response: fallbackResponse });
  } catch (error) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
