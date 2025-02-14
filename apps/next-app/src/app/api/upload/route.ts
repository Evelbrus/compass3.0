//app/api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    //Получаем все файлы и пути из FormData
    const imageFiles = formData.getAll('profileImage');
    const profilePhotoPaths = formData.getAll('profilePhotoPath');

    if (!imageFiles.length || !profilePhotoPaths.length) {
      return NextResponse.json({ message: 'Файл или путь к файлу не найдены' }, { status: 400 });
    }

    //Если количество файлов не совпадает с количеством путей, возвращаем ошибку
    if (imageFiles.length !== profilePhotoPaths.length) {
      return NextResponse.json(
        { message: 'Количество файлов не совпадает с количеством путей' },
        { status: 400 },
      );
    }

    //Обрабатываем каждый файл
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i] as File;
      const profilePhotoPath = profilePhotoPaths[i] as string;

      //Читаем данные файла как ArrayBuffer
      const buffer = await imageFile.arrayBuffer();

      //Определяем путь для сохранения файла (например, внутри папки "uploads")
      const uploadFilePath = path.join(process.cwd(), 'uploads', profilePhotoPath);
      const dir = path.dirname(uploadFilePath);

      //Убедимся, что директория существует
      await fs.mkdir(dir, { recursive: true });

      //Записываем файл на диск
      await fs.writeFile(uploadFilePath, Buffer.from(buffer));
    }

    return NextResponse.json({ message: 'Изображения успешно загружены' });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return NextResponse.json({ message: 'Ошибка при загрузке изображения' }, { status: 500 });
  }
}
