import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

//Определяем __filename и __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Проверяем, скомпилирован ли код (находится ли в worker-dist)
const isCompiled = __dirname.includes('worker-dist');

let envFilePath: string;

if (isCompiled) {
  //Из директории .../apps/next-app/worker-dist/packages/shared/prisma поднимаемся на 4 уровня,
  //чтобы оказаться в .../apps/next-app, где находятся файлы .env.
  envFilePath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, '../../../../.env.production')
      : path.resolve(__dirname, '../../../../.env.development');
} else {
  //Если код запускается из исходников, считаем, что рабочая директория — корень проекта
  envFilePath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), 'apps/next-app/.env.production')
      : path.resolve(process.cwd(), 'apps/next-app/.env.development');
}

console.log(`Загружаем переменные окружения из файла: ${envFilePath}`);
dotenv.config({ path: envFilePath });

const prismaClientSingleton = () => {
  let databaseUrl: string | undefined;
  let usedVariable: string | undefined;

  if (process.env.NODE_ENV === 'production') {
    databaseUrl = process.env.POSTGRES_URL;
    usedVariable = 'POSTGRES_URL';
  } else {
    databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    usedVariable = process.env.DATABASE_URL ? 'DATABASE_URL' : 'POSTGRES_URL';
  }

  if (!databaseUrl) {
    throw new Error('Необходимо установить переменную окружения DATABASE_URL или POSTGRES_URL.');
  }

  console.log(
    `ℹ️ Prisma Client использует переменную окружения ${usedVariable} для подключения к базе данных.`,
  );
  console.log(`ℹ️ URL подключения: ${databaseUrl}`);

  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export { prisma };
