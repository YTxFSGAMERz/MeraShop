import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        _count: {
          select: {
            orders: true,
            wishlistItems: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        phone: user.phone || undefined,
        avatar: user.avatar || undefined,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
      stats: {
        orders: user._count.orders,
        wishlist: user._count.wishlistItems,
        reviews: user._count.reviews,
        addresses: user.addresses.length,
      },
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred fetching profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, phone, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Check phone uniqueness if being updated
    if (phone && phone.trim() && phone !== user.phone) {
      const existingPhone = await db.user.findFirst({
        where: { phone: phone.trim(), NOT: { id: userId } },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'This phone number is already in use' },
          { status: 409 },
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name || '',
        phone: updatedUser.phone || undefined,
        avatar: updatedUser.avatar || undefined,
        role: updatedUser.role as 'customer' | 'admin' | 'seller',
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred updating profile' },
      { status: 500 },
    );
  }
}
