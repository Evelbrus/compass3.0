import { NextResponse } from 'next/server';
import { DriverAcceptanceStatus, User } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { Prisma } from '@prisma/client';

const log = debug('app:update-user');

interface Params {
  uuid: string;
}

//GET запрос для получения данных пользователя по UUID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    log('Received UUID:', uuid);

    const user = await prisma.user.findUnique({
      where: { uuid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    log('Fetched user:', user);

    return NextResponse.json(user);
  } catch (error) {
    log('Error fetching user:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch user' }, { status: 500 });
  }
}

//PUT запрос для обновления данных пользователя по UUID
export async function PUT(req: Request) {
  //try {
  const data = await req.json();
  const { uuid } = data as Params;

  if (!uuid) {
    return NextResponse.json({ status: 'error', message: 'UUID is required' }, { status: 400 });
  }

  const {
    role,
    availability,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    companyProfile,
    driverProfile,
  } = data;

  log('Received UUID:', uuid);
  log('Received data:', data);

  //try {
  const now = new Date();

  const user = {
    role,
    availability,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    updatedAt: now,
  };

  let updatedUser: User | null = null;

  await prisma.$transaction(async (prisma) => {
    //Обновление данных пользователя
    updatedUser = await prisma.user.update({
      where: { uuid },
      data: user,
    });

    //Обновление профиля компании или водителя в зависимости от роли
    if (role === 'ClientCorp' || role === 'Operator') {
      if (!companyProfile) {
        throw new Error('Company profile is required for ClientCorp and Operator roles');
      }

      await prisma.companyProfile.update({
        where: { userId: uuid },
        data: companyProfile,
      });
    } else if (role === 'Driver') {
      if (!driverProfile) {
        throw new Error('Driver profile is required for Driver role');
      }

      const { driverExperience, ...restDriverProfile } = driverProfile;

      //Обновление профиля водителя
      await prisma.driverProfile.update({
        where: { userId: uuid },
        data: {
          ...restDriverProfile,
          driverExperience: {
            deleteMany: {},
            create:
              driverExperience?.map(
                (experience: {
                  companyName: string;
                  position: string;
                  from: string;
                  to: string;
                }) => ({
                  companyName: experience.companyName,
                  position: experience.position,
                  from: new Date(experience.from),
                  to: new Date(experience.to),
                }),
              ) || [],
          },
        },
      });
    } else if (role !== 'Client' && role !== 'Admin') {
      throw new Error('Invalid role');
    }
  });

  log('Updated user:', updatedUser);

  return NextResponse.json({
    status: 'success',
    message: 'User updated successfully',
    uuid: updatedUser!.uuid,
  });
  //} catch (error) {
  //log('Error updating user:', error);
  //if (error instanceof Error) {
  //log('Error message:', error.message);
  //log('Error stack:', error.stack);
  //}
  //return NextResponse.json(
  //{
  //status: 'error',
  //message: 'Unable to update user',
  //error: error instanceof Error ? error.message : 'Unknown error',
  //},
  //{ status: 500 },
  //);
  //}
  //} catch (error) {
  //log('Error parsing request:', error);
  //if (error instanceof Error) {
  //log('Error message:', error.message);
  //log('Error stack:', error.stack);
  //}
  //return NextResponse.json({ status: 'error', message: 'Invalid request data' }, { status: 400 });
  //}
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { uuid, role, ...fields } = data;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    log('Received data:', data);

    const now = new Date();

    //Формируем объект обновления. Если роль "Driver", обновляем driverAcceptanceStatus на TAKEN
    const updateData: Record<string, any> = {
      ...fields,
      updatedAt: now,
    };

    if (role === 'Driver') {
      updateData.driverAcceptanceStatus = DriverAcceptanceStatus.TAKEN;
    }

    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: updateData,
    });

    log('Updated user:', updatedUser);
    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully',
      uuid: updatedUser.uuid,
      updatedData: updatedUser,
    });
  } catch (error) {
    log('Error updating user:', error);
    return NextResponse.json({ error: 'Unable to update user' }, { status: 500 });
  }
}

//DELETE запрос для удаления пользователя по UUID
export async function DELETE(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    log('Received UUID for deletion:', uuid);

    //Удаление пользователя по UUID
    await prisma.user.delete({
      where: { uuid },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      //Проверяем код ошибки, возникающей из-за нарушения ограничения внешнего ключа
      if (error.code === 'P2003') {
        //Печатаем информацию о поле, из-за которого возникает конфликт
        console.error('Foreign key constraint failed on the field:', error.meta?.field_name);
        return NextResponse.json(
          { error: 'Foreign key constraint violation. Check related records.' },
          { status: 400 },
        );
      }
    }

    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
