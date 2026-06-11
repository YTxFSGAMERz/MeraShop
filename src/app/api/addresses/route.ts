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

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred fetching addresses' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, label, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = body;

    if (!userId || !name || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId,
        label: label || null,
        name: name.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json(
      { error: 'An error occurred creating address' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, userId, label, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = body;

    if (!addressId || !userId) {
      return NextResponse.json(
        { error: 'Address ID and User ID are required' },
        { status: 400 },
      );
    }

    // Verify ownership
    const existing = await db.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 },
      );
    }

    // If setting as default, unset others
    if (isDefault && !existing.isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: { id: addressId },
      data: {
        ...(label !== undefined && { label: label || null }),
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(addressLine1 !== undefined && { addressLine1: addressLine1.trim() }),
        ...(addressLine2 !== undefined && { addressLine2: addressLine2?.trim() || null }),
        ...(city !== undefined && { city: city.trim() }),
        ...(state !== undefined && { state: state.trim() }),
        ...(pincode !== undefined && { pincode: pincode.trim() }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: 'An error occurred updating address' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, userId } = body;

    if (!addressId || !userId) {
      return NextResponse.json(
        { error: 'Address ID and User ID are required' },
        { status: 400 },
      );
    }

    const existing = await db.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 },
      );
    }

    await db.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred deleting address' },
      { status: 500 },
    );
  }
}
