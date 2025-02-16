import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Params {
  filename: string | string[];
}

interface SearchParamsInterface {
  type: 'client' | 'client-corp' | 'logos' | 'drivers' | 'avatar' | 'logo' | 'vehicle';
}

export async function GET(request: Request, context: { params: Promise<Params> }) {
  try {
    const params = await context.params;
    const { filename } = params;
    const fileName = Array.isArray(filename) ? filename[filename.length - 1] : filename;

    const outerUrl = new URL(request.url);
    const outerSearchParams = outerUrl.searchParams;

    let typeParam = outerSearchParams.get('type');

    if (!typeParam) {
      const innerUrlStr = outerSearchParams.get('url');
      if (innerUrlStr) {
        try {
          const innerUrl = new URL(innerUrlStr, outerUrl.origin);
          typeParam = innerUrl.searchParams.get('type');
        } catch (err) {
          const decodedUrlStr = decodeURIComponent(innerUrlStr);
          const innerUrl = new URL(decodedUrlStr, outerUrl.origin);
          typeParam = innerUrl.searchParams.get('type');
        }
      }
    }

    if (!typeParam) {
      return new NextResponse('Не указан тип изображения', { status: 400 });
    }

    const [mainType] = typeParam.split('/');
    const validTypes: SearchParamsInterface['type'][] = [
      'client',
      'client-corp',
      'logos',
      'drivers',
      'avatar',
      'logo',
      'vehicle',
    ];

    if (!validTypes.includes(mainType as SearchParamsInterface['type'])) {
      return new NextResponse(
        'Не указан корректный тип изображения (client, client-corp, logos или drivers)',
        { status: 400 },
      );
    }

    const imagePath = path.join(process.cwd(), 'uploads', typeParam, fileName);
    console.log('imagePath', imagePath);

    try {
      await fs.access(imagePath);
      const imageBuffer = await fs.readFile(imagePath);

      let contentType = 'image/webp';
      if (fileName.endsWith('.svg')) {
        contentType = 'image/svg+xml';
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      }

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
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
