import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { tariffUuid } = req.query as { tariffUuid: string };

  if (!tariffUuid) {
    return res.status(400).json({ error: 'Missing or invalid tariffUuid' });
  }

  try {
    const tariff = await prisma.tariff.findUnique({
      where: { uuid: tariffUuid },
      include: {
        tariffOnServiceLevels: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!tariff) {
      return res.status(404).json({ error: 'Tariff not found' });
    }

    //Получение типов автомобилей и уровней обслуживания из тарифа
    const vehicleTypes = tariff.vehicleTypes as VehicleType[];
    const serviceUuids = tariff.tariffOnServiceLevels.map((level) => level.service.uuid);

    //Поиск автомобилей, соответствующих типу и уровню обслуживания
    const vehicles = await prisma.vehicle.findMany({
      where: {
        vehicleType: { in: vehicleTypes },
        service_levels: {
          some: {
            serviceUuid: { in: serviceUuids },
          },
        },
      },
      include: {
        vehicleDrivers: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    //Извлечение водителей из автомобилей
    const drivers = vehicles
      .flatMap((vehicle) => vehicle.vehicleDrivers.map((driver) => driver.driver?.user))
      .filter(Boolean);

    return res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
