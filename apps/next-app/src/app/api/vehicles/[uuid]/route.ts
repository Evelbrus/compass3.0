import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { EditVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:vehicles:uuid');

//Интерфейс для параметров запроса
interface Params {
  uuid: string;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    //Await params to resolve the Promise
    const { uuid } = await params;
    const data = await req.json();
    const updateData: EditVehicleData = data;

    if (!uuid) {
      return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          plateNumber: updateData.plateNumber,
          NOT: {
            uuid: uuid,
          },
        },
      });

      if (existingVehicle) {
        throw new Error(`Автомобиль с номером ${updateData.plateNumber} уже существует`);
      }

      //Обновляем данные автомобиля
      const updatedVehicle = await prisma.vehicle.update({
        where: { uuid },
        data: {
          vehicleType: updateData.vehicleType,
          brand: updateData.brand,
          model: updateData.model,
          year: updateData.year ? new Date(updateData.year) : undefined,
          color: updateData.color,
          plateNumber: updateData.plateNumber,
          isAvailable: updateData.isAvailable,
          photoPath: updateData.photoPath,
          serviceLevels: updateData.serviceLevels,
        },
      });

      log('Updated vehicle:', updatedVehicle);

      if (updateData.driverIds) {
        await prisma.vehicleDriver.deleteMany({ where: { vehicleId: uuid } });

        if (updateData.driverIds.length > 0) {
          for (const driverId of updateData.driverIds) {
            const existingAssignment = await prisma.vehicleDriver.findFirst({
              where: {
                driverId: driverId,
                NOT: {
                  vehicleId: uuid,
                },
              },
              include: {
                driver: true,
              },
            });

            if (existingAssignment) {
              const driver = await prisma.user.findUnique({
                where: {
                  uuid: driverId,
                },
              });
              if (driver) {
                throw new Error(`Водитель уже привязан к другому автомобилю.`, {
                  cause: { fullName: driver.fullName },
                });
              }
            }
          }

          await prisma.vehicleDriver.createMany({
            data: updateData.driverIds.map((driverId) => ({
              vehicleId: uuid,
              driverId: driverId,
              assignmentDate: new Date(),
            })),
          });
        }
      } else {
        await prisma.vehicleDriver.deleteMany({ where: { vehicleId: uuid } });
      }

      return { uuid: updatedVehicle.uuid };
    });

    log('Updated vehicle with details:', result);
    return NextResponse.json({ status: 'success', uuid: result.uuid }, { status: 200 });
  } catch (error) {
    log('Error updating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
      if (error.message.startsWith('Водитель уже привязан')) {
        const cause = error.cause as { fullName?: string } | undefined;
        return NextResponse.json(
          {
            error: {
              message: error.message,
              fullName: cause?.fullName,
            },
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error: {
            message: error.message,
          },
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Unable to update vehicle' }, { status: 500 });
  }
}
