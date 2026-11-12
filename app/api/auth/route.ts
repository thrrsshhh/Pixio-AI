import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { action, email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (action === 'signup') {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          credits: 10,
        },
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
      });
    }

    // Login flow
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}