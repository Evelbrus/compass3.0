// app/api/admin/users/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';

import { getUser } from '@next-app/src/services/users/getUser';
import { updateUser } from '@next-app/src/services/users/updateUser';
import { patchUser } from '@next-app/src/services/users/patchUser';
import { deleteUser } from '@next-app/src/services/users/deleteUser';
import { UpdateUserDTO, UserDetailResponseDTO } from '@next-app/src/dto/users/user.dto';
import { ErrorResponseDTO } from '@next-app/src/dto/error/error.dto';
import { SuccessResponseDTO } from '@next-app/src/dto/succes/succes.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:user-routes:error');

// GET запрос для получения данных пользователя по UUID
export async function GET(
  req: NextRequest,
  { params }: { params: Params },
): Promise<NextResponse<UserDetailResponseDTO | ErrorResponseDTO>> {
  try {
    const { uuid } = params;

    if (!uuid) {
      return NextResponse.json({ status: 'error', message: 'UUID is required' }, { status: 400 });
    }

    const user = await getUser(uuid);

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user as UserDetailResponseDTO);
  } catch (error) {
    logError('× Ошибка при получении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ status: 'error', message: 'Unable to fetch user' }, { status: 500 });
  }
}

// PUT запрос для обновления данных пользователя по UUID
export async function PUT(
  req: NextRequest,
  { params }: { params: Params },
): Promise<NextResponse<SuccessResponseDTO | ErrorResponseDTO>> {
  try {
    const { uuid } = params;
    const data: UpdateUserDTO = await req.json();

    // Убедимся, что UUID из пути соответствует UUID в теле запроса
    if (!data.uuid) {
      data.uuid = uuid;
    } else if (data.uuid !== uuid) {
      return NextResponse.json(
        { status: 'error', message: 'UUID in path and body do not match' },
        { status: 400 },
      );
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
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Params },
): Promise<NextResponse<SuccessResponseDTO | ErrorResponseDTO>> {
  try {
    const { uuid } = params;
    const data = await req.json();

    const updatedUser = await patchUser(data);

    return NextResponse.json({
      status: 'success',
      message: 'User paths updated successfully',
      uuid: updatedUser.uuid,
    });
  } catch (error) {
    logError('× Ошибка при частичном обновлении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ status: 'error', message: 'Unable to patch user' }, { status: 500 });
  }
}

// DELETE запрос для удаления пользователя
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params },
): Promise<NextResponse<SuccessResponseDTO | ErrorResponseDTO>> {
  try {
    const { uuid } = params;

    if (!uuid) {
      return NextResponse.json({ status: 'error', message: 'UUID is required' }, { status: 400 });
    }

    await deleteUser(uuid);

    return NextResponse.json(
      { status: 'success', message: 'User deleted successfully', uuid },
      { status: 200 },
    );
  } catch (error) {
    logError('× Ошибка при удалении пользователя:', error);

    if (
      error instanceof Error &&
      error.message === 'Foreign key constraint violation. Check related records.'
    ) {
      return NextResponse.json(
        { status: 'error', message: 'Foreign key constraint violation. Check related records.' },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }

    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
