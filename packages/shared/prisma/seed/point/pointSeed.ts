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
      {
        address: 'Бишкек',
        pricePerKm: new Decimal(10),
        latitude: 42.8746,
        longitude: 74.5698,
        terrainDifficulty: 1.0,
        airport: false,
      },
      {
        address: 'Ош',
        pricePerKm: new Decimal(12),
        latitude: 40.5177,
        longitude: 72.7973,
        terrainDifficulty: 1.1,
        airport: false,
      },
      {
        address: 'Джалал-Абад',
        pricePerKm: new Decimal(11),
        latitude: 40.9331,
        longitude: 73.0053,
        terrainDifficulty: 1.1,
        airport: false,
      },
      {
        address: 'Каракол',
        pricePerKm: new Decimal(13),
        latitude: 42.4905,
        longitude: 78.3942,
        terrainDifficulty: 1.2,
        airport: false,
      },
      {
        address: 'Токмок',
        pricePerKm: new Decimal(9),
        latitude: 42.8419,
        longitude: 75.3015,
        terrainDifficulty: 1.0,
        airport: false,
      },
      {
        address: 'Нарын',
        pricePerKm: new Decimal(11.5),
        latitude: 41.4307,
        longitude: 76.0093,
        terrainDifficulty: 1.3,
        airport: false,
      },
      {
        address: 'Баткен',
        pricePerKm: new Decimal(12.5),
        latitude: 40.0481,
        longitude: 70.8324,
        terrainDifficulty: 1.2,
        airport: false,
      },
      {
        address: 'Кызыл-Кия',
        pricePerKm: new Decimal(9.5),
        latitude: 40.2636,
        longitude: 72.1131,
        terrainDifficulty: 1.1,
        airport: false,
      },
      {
        address: 'Талас',
        pricePerKm: new Decimal(10.5),
        latitude: 42.528,
        longitude: 72.243,
        terrainDifficulty: 1.1,
        airport: false,
      },
      {
        address: 'Кант',
        pricePerKm: new Decimal(8.5),
        latitude: 42.8911,
        longitude: 74.8494,
        terrainDifficulty: 1.0,
        airport: false,
      },
      {
        address: 'Аэропорт Манас',
        pricePerKm: new Decimal(15),
        latitude: 43.0614,
        longitude: 74.4778,
        terrainDifficulty: 1.0,
        airport: true,
      },
    ];

    await prisma.point.createMany({
      data: pointsData.map((point) => ({
        ...point,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    console.log('Точки (города Кыргызстана) успешно добавлены с обновленными данными!');
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
