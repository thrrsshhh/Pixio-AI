import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      credits = 100,
    } = await request.json();

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ success: false, error: 'User email missing' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { credits: { increment: Number(credits) } },
    });

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}