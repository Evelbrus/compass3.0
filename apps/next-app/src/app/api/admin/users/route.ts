// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import debug from 'debug';
import bcrypt from 'bcrypt';

import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { checkExistingUser } from '@next-app/src/services/users/checkExistingUser';
import { createUser } from '@next-app/src/services/users/createUser';
import { getUsers } from '@next-app/src/services/users/getUsers';
import convertPrismaData from '@shared/prisma/utils/converterBigIntToString';
import {
  CreateUserDTO,
  GetUsersRequestDTO,
  UsersListResponseDTO,
} from '@next-app/src/dto/users/users.dto';
import { ErrorResponseDTO } from '@next-app/src/dto/error/error.dto';
import { SuccessResponseDTO } from '@next-app/src/dto/succes/succes.dto';

const logError = debug('app:users:error');
const allowedRoles = [UserRole.Operator, UserRole.Admin];

export async function POST(
  req: NextRequest,
): Promise<NextResponse<SuccessResponseDTO | ErrorResponseDTO>> {
  await authenticateRequest(req, allowedRoles);

  const data: CreateUserDTO = await req.json();

  if (!data.email || !data.password || !data.role || !data.fullName) {
    logError('× Отсутствуют обязательные поля (400)');
    return NextResponse.json(
      { status: 'error', message: 'Отсутствуют обязательные поля' },
      { status: 400 },
    );
  }

  const { email, password } = data;

  const existingUser = await checkExistingUser(email);
  if (existingUser) {
    logError(`× Пользователь с email ${email} уже существует (409)`);
    return NextResponse.json(
      { status: 'error', message: 'Пользователь с таким email уже существует' },
      { status: 409 },
    );
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let createdUser;
  try {
    createdUser = await createUser(data, hashedPassword);
  } catch (error) {
    logError('× Ошибка при создании пользователя');
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
      if (error.message === 'User with this email already exists') {
        return NextResponse.json(
          { status: 'error', message: 'Пользователь с таким email уже существует' },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка создания пользователя' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: 'success',
    message: 'User created successfully',
    uuid: createdUser.uuid,
  });
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<UsersListResponseDTO | ErrorResponseDTO>> {
  await authenticateRequest(req, allowedRoles);

  const parsedParams = parseParams<GetUsersRequestDTO>({
    searchParams: new URL(req.url).searchParams,
    defaults: { sort_by: 'createdAt', sort_order: 'desc' },
    allowedSortFields: [
      'email',
      'fullName',
      'createdAt',
      'updatedAt',
      'role',
      'availability',
      'passportId',
    ],
  });

  const { users, total, totalAllRoles, roleCounts } = await getUsers(parsedParams);

  const searchTerm = parsedParams.search ? parsedParams.search.toLowerCase() : '';
  const filteredUsers = parsedParams.search
    ? users.filter((user) => {
        const nameParts = user.fullName.toLowerCase().split(' ');
        return nameParts.some((part) => part.startsWith(searchTerm));
      })
    : users;

  return NextResponse.json(
    convertPrismaData({
      status: 'success',
      message: 'Fetched users successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllRoles,
        roleCounts,
        users: filteredUsers,
      },
    }),
    { status: 200 },
  );
}
