import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase() || 'guest@pixio.ai';

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email === 'guest@pixio.ai' ? 'Guest User' : email.split('@')[0],
          credits: 10,
        },
        include: { images: true },
      });
    }

    return NextResponse.json({
      success: true,
      history: user.images,
      credits: user.credits,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    console.error('Database fetch error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    const email = body.email?.trim().toLowerCase() || 'guest@pixio.ai';

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email === 'guest@pixio.ai' ? 'Guest User' : email.split('@')[0],
          credits: 10,
        },
      });
    }

    if (user.credits <= 0 && type !== 'collage') {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    let originalUrl = imageBase64;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: 'pixio-originals',
      });
      originalUrl = uploadRes.secure_url;
    }

    let processedUrl = originalUrl;

    if (process.env.CLIPDROP_API_KEY && type !== 'collage') {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });

      const formData = new FormData();
      formData.append('image_file', blob, 'upload.png');

      let endpoint = 'https://clipdrop-api.co/remove-background/v1';
      if (type === 'hd-upscale') {
        endpoint = 'https://clipdrop-api.co/image-upscaling/v1/upscale';
        formData.append('target_width', '2048');
        formData.append('target_height', '2048');
      }

      const aiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
        body: formData,
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        throw new Error(`AI API Error (${aiRes.status}): ${errText}`);
      }

      const resultBuffer = Buffer.from(await aiRes.arrayBuffer());
      const resultBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const processedUpload = await cloudinary.uploader.upload(resultBase64, {
          folder: 'pixio-processed',
        });
        processedUrl = processedUpload.secure_url;
      } else {
        processedUrl = resultBase64;
      }
    }

    if (type === 'collage') {
      const newItem = await prisma.image.create({
        data: { userId: user.id, originalUrl, processedUrl, type },
      });
      return NextResponse.json({
        success: true,
        newItem,
        creditsRemaining: user.credits,
      });
    }

    const [newItem, updatedUser] = await prisma.$transaction([
      prisma.image.create({
        data: { userId: user.id, originalUrl, processedUrl, type },
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Processing failed';
    console.error('Backend processing error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}