import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function down() {
    await prisma.$executeRaw `TRUNCATE TABLE "additional_services" CASCADE`;
}
async function main() {
    try {
        await down();
        const additionalServicesData = [
            { name: 'Детское кресло' },
            { name: 'Встреча с табличкой' },
            { name: 'Wi-Fi в салоне' },
            { name: 'Вода' },
            { name: 'Кондиционер' },
            { name: 'Перевозка животных' },
            { name: 'Некурящий салон' },
            { name: 'Зарядка для телефона' },
            { name: 'Большой багажник' },
            { name: 'Универсал' },
        ];
        await prisma.additionalService.createMany({
            data: additionalServicesData.map((service) => ({
                ...service,
                createdAt: new Date(),
                updatedAt: new Date(),
            })),
        });
        console.log('Дополнительные услуги успешно добавлены!');
    }
    catch (error) {
        console.error('Ошибка при добавлении дополнительных услуг:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
