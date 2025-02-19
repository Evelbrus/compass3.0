import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, '../../../../apps/next-app/.env.production')
    : path.resolve(__dirname, '../../../../.env.development');
console.log(`Загружаем переменные окружения из файла: ${envFilePath}`);
dotenv.config({ path: envFilePath });
const prismaClientSingleton = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('Необходимо установить переменную окружения DATABASE_URL.');
    }
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
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