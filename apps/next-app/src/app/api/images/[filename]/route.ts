import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Params {
  filename: string;
}

interface SearchParams {
  type: 'client' | 'client-corp' | 'logos';
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SearchParams['type'] | null;

    if (!type || (type !== 'client' && type !== 'client-corp' && type !== 'logos')) {
      return new NextResponse('Не указан тип изображения (client, client-corp или logos)', {
        status: 400,
      });
    }

    const imagePath = path.join(process.cwd(), 'uploads', type, filename);

    console.log('imagePath', imagePath);

    try {
      await fs.access(imagePath);
      const imageBuffer = await fs.readFile(imagePath);

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
        },
      });
    } catch (e) {
      return new NextResponse('Изображение не найдено', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при отдаче изображения:', error);
    return new NextResponse('Ошибка при отдаче изображения', { status: 500 });
  }
}
