import { NextResponse } from 'next/server';
import { User, DriverProfile, DriverExperience, CompanyProfile } from '@prisma/client';
import debug from 'debug';
import { getUser } from '@next-app/src/app/api/users/[uuid]/getUser';
import { updateUser } from '@next-app/src/app/api/users/[uuid]/updateUser';
import { patchUser } from '@next-app/src/app/api/users/[uuid]/patchUser';
import { deleteUser } from '@next-app/src/app/api/users/[uuid]/deleteUser';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:user-routes:error');

// GET запрос для получения данных пользователя по UUID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    const user = await getUser(uuid);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    logError('× Ошибка при получении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch user' }, { status: 500 });
  }
}

// PUT запрос для обновления данных пользователя по UUID
export async function PUT(req: Request) {
  try {
    const data: User & {
      companyProfile?: CompanyProfile;
      driverProfile?: DriverProfile & { driverExperience?: DriverExperience[] };
    } = await req.json();

    const { uuid } = data as Params;

    if (!uuid) {
      return NextResponse.json({ status: 'error', message: 'UUID is required' }, { status: 400 });
    }

    const updatedUser = await updateUser(data);

    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully',
      uuid: updatedUser.uuid,
    });
  } catch (error) {
    logError('× Ошибка при обновлении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);

      if (
        error.message === 'Company profile is required for ClientCorp and Operator roles' ||
        error.message === 'Driver profile is required for Driver role' ||
        error.message === 'Invalid role'
      ) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// PATCH запрос для частичного обновления пользователя
export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { uuid } = data;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    const updatedUser = await patchUser(data);

    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully',
      uuid: updatedUser.uuid,
      updatedData: updatedUser,
    });
  } catch (error) {
    logError('× Ошибка при частичном обновлении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update user' }, { status: 500 });
  }
}

// DELETE запрос для удаления пользователя
export async function DELETE(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    await deleteUser(uuid);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    logError('× Ошибка при удалении пользователя:', error);

    if (
      error instanceof Error &&
      error.message === 'Foreign key constraint violation. Check related records.'
    ) {
      return NextResponse.json(
        { error: 'Foreign key constraint violation. Check related records.' },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
