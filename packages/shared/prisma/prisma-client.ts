import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

//Определяем __filename и __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let envFilePath: string;

envFilePath =
  process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, '../../../../apps/next-app/.env.production')
    : path.resolve(__dirname, '../../../../.env.development');
console.log(`Загружаем переменные окружения из файла: ${envFilePath}`);
dotenv.config({ path: envFilePath });

const prismaClientSingleton = () => {
  const databaseUrl: string | undefined = process.env.POSTGRES_URL;
  const usedVariable = 'POSTGRES_URL';

  if (!databaseUrl) {
    throw new Error('Необходимо установить переменную окружения POSTGRES_URL.');
  }

  console.log(
    `ℹ️ Prisma Client использует переменную окружения ${usedVariable} для подключения к базе данных.`,
  );
  console.log(`ℹ️ URL подключения: ${databaseUrl}`);

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
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
