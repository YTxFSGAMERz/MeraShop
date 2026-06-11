import { NextRequest, NextResponse } from 'next/server'

// Demo stock alert storage (uses in-memory Map for demo purposes)
// In production, this would store in the database
const stockAlerts = new Map<string, Array<{ productId: string; email: string; createdAt: string }>>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, email } = body

    if (!productId || !email) {
      return NextResponse.json(
        { error: 'Product ID and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Store alert (demo: in-memory)
    const key = `${productId}-${email}`
    const existing = stockAlerts.get(key)
    if (existing) {
      return NextResponse.json(
        { message: 'Already subscribed to stock alert' },
        { status: 200 }
      )
    }

    stockAlerts.set(key, [{
      productId,
      email,
      createdAt: new Date().toISOString(),
    }])

    return NextResponse.json(
      { message: 'Stock alert created successfully' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to create stock alert' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return count of alerts (for admin purposes)
  return NextResponse.json({
    totalAlerts: stockAlerts.size,
  })
}
