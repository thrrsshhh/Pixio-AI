import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amountInInr = 199, credits = 100 } = await request.json();

    const order = await razorpay.orders.create({
      amount: amountInInr * 100, // Razorpay expects paise (₹199 = 19900)
      currency: 'INR',
      receipt: `pixio_${Date.now()}`,
      notes: { credits: String(credits) },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}