import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const filePairs = [
      { fileKey: 'profileImage', pathPrefix: '/avatar', pathKey: 'profilePhotoPath' },
      { fileKey: 'logoImage', pathPrefix: '/logo', pathKey: 'logoImagePath' },
      { fileKey: 'passportImage', pathPrefix: '/drivers/passport', pathKey: 'passportPhotoPath' },
      {
        fileKey: 'driverProfileImage',
        pathPrefix: '/drivers/profile',
        pathKey: 'driverProfilePhotoPath',
      },
      { fileKey: 'licenseImage', pathPrefix: '/drivers/license', pathKey: 'licensePhotoPath' },
      // Добавляем поддержку обоих ключей (vehicleImage и photoImage) с одинаковым результатом
      { fileKey: 'vehicleImage', pathPrefix: '/vehicle', pathKey: 'vehiclePhotoPath' },
      { fileKey: 'photoImage', pathPrefix: '/vehicle', pathKey: 'vehiclePhotoPath' },
    ];

    const filePaths: { [key: string]: string } = {};
    let processed = false;

    for (const pair of filePairs) {
      const files = formData.getAll(pair.fileKey);

      if (!files.length) continue;

      for (const file of files) {
        const typedFile = file as File;
        const filePath = `${pair.pathPrefix}/${uuidv4()}-${typedFile.name}`; // Генерируем путь
        const uploadFilePath = path.join(process.cwd(), 'uploads', filePath);
        const dir = path.dirname(uploadFilePath);

        const buffer = await typedFile.arrayBuffer();
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(uploadFilePath, Buffer.from(buffer));

        filePaths[pair.pathKey] = filePath; // Возвращаем сгенерированный путь
        processed = true;
      }
    }

    if (!processed) {
      return NextResponse.json(
        { message: 'Ни один файл не был найден в запросе' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: 'Изображения успешно загружены',
      filePaths,
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return NextResponse.json({ message: 'Ошибка при загрузке изображения' }, { status: 500 });
  }
}
