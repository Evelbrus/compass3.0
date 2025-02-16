///app/api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    //Задаем список пар ключей, которые ожидаем получить в FormData
    const filePairs = [
      { fileKey: 'profileImage', pathKey: 'profilePhotoPath' },
      { fileKey: 'logoImage', pathKey: 'logoImagePath' },
      { fileKey: 'passportImage', pathKey: 'passportPhotoPath' },
      { fileKey: 'driverProfileImage', pathKey: 'driverProfilePhotoPath' },
      { fileKey: 'licenseImage', pathKey: 'licensePhotoPath' },
      { fileKey: 'photoImage', pathKey: 'photoPath' },
    ];

    let processed = false;

    for (const pair of filePairs) {
      const files = formData.getAll(pair.fileKey);
      const pathsArr = formData.getAll(pair.pathKey);

      //Если по данной паре ни один файл не был отправлен – пропускаем
      if (!files.length && !pathsArr.length) continue;

      //Если количество файлов не совпадает с количеством путей – ошибка
      if (files.length !== pathsArr.length) {
        return NextResponse.json(
          { message: `Количество файлов для ${pair.fileKey} не совпадает с количеством путей` },
          { status: 400 },
        );
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        const filePath = pathsArr[i] as string;

        if (!file || !filePath) {
          return NextResponse.json(
            { message: 'Файл или путь к файлу не найдены' },
            { status: 400 },
          );
        }

        //Читаем файл как ArrayBuffer и записываем его на диск
        const buffer = await file.arrayBuffer();
        const uploadFilePath = path.join(process.cwd(), 'uploads', filePath);
        const dir = path.dirname(uploadFilePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(uploadFilePath, Buffer.from(buffer));
        processed = true;
      }
    }

    if (!processed) {
      return NextResponse.json(
        { message: 'Ни один файл не был найден в запросе' },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Изображения успешно загружены' });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return NextResponse.json({ message: 'Ошибка при загрузке изображения' }, { status: 500 });
  }
}
