import { NextResponse } from 'next/server';
import { Prisma, PrismaClient, User, UserRole } from '@prisma/client';
import debug from 'debug';

const log = debug('app:update-user');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

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
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

//PUT запрос для обновления данных пользователя по UUID
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { uuid } = data as Params;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
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

    try {
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
        if (role === UserRole.ClientCorp || role === UserRole.Operator) {
          if (!companyProfile) {
            throw new Error('Company profile is required for ClientCorp and Operator roles');
          }

          await prisma.companyProfile.update({
            where: { userId: uuid },
            data: companyProfile,
          });
        } else if (role === UserRole.Driver) {
          if (!driverProfile) {
            throw new Error('Driver profile is required for Driver role');
          }

          await prisma.driverProfile.update({
            where: { userId: uuid },
            data: driverProfile,
          });
        } else if (role !== UserRole.Client && role !== UserRole.Admin) {
          throw new Error('Invalid role');
        }
      });

      log('Updated user:', updatedUser);

      return NextResponse.json(updatedUser);
    } catch (error) {
      log('Error updating user:', error);
      if (error instanceof Error) {
        log('Error message:', error.message);
        log('Error stack:', error.stack);
      }
      return NextResponse.json({ error: 'Unable to update user' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
      log('Disconnected from database');
    }
  } catch (error) {
    log('Error parsing request:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}

//DELETE запрос для удаления пользователя по UUID
export async function DELETE(request: Request, { params }: { params: { uuid: string } }) {
  const { uuid } = await params;

  try {
    //Выполняем удаление пользователя по его uuid
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
  } finally {
    await prisma.$disconnect();
  }
}
