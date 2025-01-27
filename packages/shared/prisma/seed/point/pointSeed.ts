import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "points" CASCADE`;
}

async function main() {
  try {
    await down();

    const pointsData = [
      { address: 'Бишкек', basePrice: new Decimal(1000) },
      { address: 'Ош', basePrice: new Decimal(1200) },
      { address: 'Джалал-Абад', basePrice: new Decimal(1100) },
      { address: 'Каракол', basePrice: new Decimal(1300) },
      { address: 'Токмок', basePrice: new Decimal(900) },
      { address: 'Нарын', basePrice: new Decimal(1150) },
      { address: 'Баткен', basePrice: new Decimal(1250) },
      { address: 'Кызыл-Кия', basePrice: new Decimal(950) },
      { address: 'Талас', basePrice: new Decimal(1050) },
      { address: 'Кант', basePrice: new Decimal(850) },
    ];

    await prisma.point.createMany({
      data: pointsData.map((point) => ({
        ...point,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    console.log('Точки (города Кыргызстана) успешно добавлены!');
  } catch (error) {
    console.error('Ошибка при добавлении точек:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
