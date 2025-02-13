import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();
const prismaClientSingleton = () => {
    let databaseUrl;
    let usedVariable;
    if (process.env.NODE_ENV === 'production') {
        databaseUrl = process.env.POSTGRES_URL;
        usedVariable = 'POSTGRES_URL';
    }
    else {
        databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        usedVariable = process.env.DATABASE_URL ? 'DATABASE_URL' : 'POSTGRES_URL';
    }
    if (!databaseUrl) {
        throw new Error('Необходимо установить переменную окружения DATABASE_URL или POSTGRES_URL.');
    }
    console.log(`ℹ️ Prisma Client использует переменную окружения ${usedVariable} для подключения к базе данных.`);
    console.log(`ℹ️ URL подключения: ${databaseUrl}`);
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['warn', 'error'],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
export { prisma };
//# sourceMappingURL=prisma-client.js.map