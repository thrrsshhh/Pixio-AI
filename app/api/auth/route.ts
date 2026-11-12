import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; name?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: body.name || undefined,
      },
      create: {
        email,
        name: body.name || email.split('@')[0],
        credits: 10,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Auth failed';
    console.error('POST /api/auth error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}