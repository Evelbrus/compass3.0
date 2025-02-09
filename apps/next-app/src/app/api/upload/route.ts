//app/api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('profileImage') as File | null;
    const profilePhotoPath = formData.get('profilePhotoPath') as string | null;

    if (!imageFile || !profilePhotoPath) {
      return NextResponse.json({ message: 'Файл или путь к файлу не найдены' }, { status: 400 });
    }

    //Читаем данные файла как ArrayBuffer
    const buffer = await imageFile.arrayBuffer();

    //Определяем путь для сохранения файла (ВНЕ public)
    const uploadDir = path.join(process.cwd(), 'uploads', profilePhotoPath);

    //Убедимся, что директория существует
    const dir = path.dirname(uploadDir);
    await fs.mkdir(dir, { recursive: true });

    //Записываем файл на диск
    await fs.writeFile(uploadDir, Buffer.from(buffer));

    //Формируем публичный URL (относительно public)
    const publicPath = profilePhotoPath;

    return NextResponse.json({ message: 'Изображение успешно загружено', path: publicPath });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return NextResponse.json({ message: 'Ошибка при загрузке изображения' }, { status: 500 });
  }
}
