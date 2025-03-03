import { PrismaClient, VehicleType, ServiceLevels, Ownership } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function down() {
  // Очищаем только таблицу с автомобилями
  await prisma.$executeRaw`TRUNCATE TABLE "vehicles" CASCADE`;
}

async function main() {
  try {
    await down();

    const vehiclesData = [
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'BMW',
        model: 'i550',
        year: new Date('2024-10-17'),
        color: 'White',
        plateNumber: '123',
        isAvailable: true,
        serviceLevels: ServiceLevels.Basic,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-19T06:00:00'),
        updatedAt: new Date('2025-02-19T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-25'),
        color: 'Black',
        plateNumber: '01KG870AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-23'),
        color: 'Black',
        plateNumber: '01KG873AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-25'),
        color: 'Black',
        plateNumber: '01KG874AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-25'),
        color: 'Black',
        plateNumber: '01KG875AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-25'),
        color: 'Black',
        plateNumber: '01KG877AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2023-11-25'),
        color: 'Black',
        plateNumber: '01KG871AX',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2024-11-25'),
        color: 'White',
        plateNumber: '01KG252BE',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2024-11-25'),
        color: 'Black',
        plateNumber: '01KG254BE',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2024-11-25'),
        color: 'Black',
        plateNumber: '01KG255BE',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      },
      {
        uuid: uuidv4(),
        vehicleType: VehicleType.Sedan,
        brand: 'Hongqi',
        model: 'E-QM5',
        year: new Date('2024-11-25'),
        color: 'Black',
        plateNumber: '01KG369BE',
        isAvailable: true,
        serviceLevels: ServiceLevels.Vip,
        ownership: Ownership.Personal,
        createdAt: new Date('2025-02-25T06:00:00'),
        updatedAt: new Date('2025-02-25T06:00:00')
      }
    ];

    for (const vehicle of vehiclesData) {
      await prisma.vehicle.create({
        data: vehicle,
      });
    }

    console.log('Автомобили успешно созданы!');
  } catch (e) {
    console.error('Ошибка при создании автомобилей:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });