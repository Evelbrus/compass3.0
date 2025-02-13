import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prismaClientSingleton = () => {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  let usedVariable = '';

  if (process.env.POSTGRES_URL) {
    //Изменено: проверяем сначала POSTGRES_URL
    usedVariable = 'POSTGRES_URL';
  } else if (process.env.DATABASE_URL) {
    usedVariable = 'DATABASE_URL';
  }

  if (!databaseUrl) {
    throw new Error('Необходимо установить переменную окружения DATABASE_URL или POSTGRES_URL.');
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
