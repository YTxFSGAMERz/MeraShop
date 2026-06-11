import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 },
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    // Check phone uniqueness if provided
    if (phone && phone.trim()) {
      const existingPhone = await db.user.findFirst({
        where: { phone: phone.trim() },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists' },
          { status: 409 },
        );
      }
    }

    // Create user (demo: password not stored since we don't have a password field in schema)
    // In production, you would hash the password and store it
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        phone: phone?.trim() || null,
        role: 'customer',
      },
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      role: user.role as 'customer' | 'admin' | 'seller',
    };

    return NextResponse.json({
      user: userData,
      message: 'Account created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 },
    );
  }
}
