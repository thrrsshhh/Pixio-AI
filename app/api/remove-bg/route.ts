import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, history: [], credits: 0 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    return NextResponse.json({
      success: true,
      history: user?.images || [],
      credits: user?.credits ?? 10,
    });
  } catch (error: any) {
    console.error('Database fetch error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      imageBase64?: string;
      type?: string;
      email?: string;
    };
    const { imageBase64, type = 'bg-remove' } = body;
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to process and save images' },
        { status: 401 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found. Please log in again.' },
        { status: 404 }
      );
    }

    if (user.credits <= 0 && type !== 'collage') {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    if (type === 'collage') {
      const newItem = await prisma.image.create({
        data: {
          userId: user.id,
          originalUrl: imageBase64,
          processedUrl: imageBase64,
          type,
        },
      });
      return NextResponse.json({
        success: true,
        newItem,
        creditsRemaining: user.credits,
      });
    }

    const [newItem, updatedUser] = await prisma.$transaction([
      prisma.image.create({
        data: {
          userId: user.id,
          originalUrl: imageBase64,
          processedUrl: imageBase64,
          type,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newItem,
      creditsRemaining: updatedUser.credits,
    });
  } catch (error: any) {
    console.error('Backend save error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save image' },
      { status: 500 }
    );
  }
}