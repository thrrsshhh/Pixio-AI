import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const history = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error('Database fetch error:', error);
    return NextResponse.json({ success: true, history: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { originalUrl, processedUrl, type } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { success: false, error: 'Original image URL is required' },
        { status: 400 }
      );
    }

    // Ensure a default user exists to satisfy the foreign key constraint
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'guest@pixio.ai',
          name: 'Guest User',
        },
      });
    }

    // Save record to SQLite via Prisma using the Image model
    const newItem = await prisma.image.create({
      data: {
        userId: defaultUser.id,
        originalUrl,
        processedUrl: processedUrl || originalUrl,
        type: type || 'bg-remove',
      },
    });

    return NextResponse.json({ success: true, newItem });
  } catch (error: any) {
    console.error('Database save error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save to database' },
      { status: 500 }
    );
  }
}