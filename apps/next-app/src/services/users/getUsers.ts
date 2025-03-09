// app/api/admin/users/getUsers.ts
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { GetUsersRequestDTO, UserResponseDTO } from '@next-app/src/dto/users/users.dto';

type GetUsersResult = {
  users: UserResponseDTO[];
  total: number;
  totalAllRoles: number;
  roleCounts: Array<{
    role: UserRole;
    _count: {
      role: number;
    };
  }>;
};

export async function getUsers(
  parsedParams: ReturnType<typeof parseParams<GetUsersRequestDTO>>,
): Promise<GetUsersResult> {
  const where: {
    role?: UserRole | { in: UserRole[] };
    availability?: boolean;
    OR?: { fullName: { contains: string; mode: 'insensitive' } }[];
  } = {};

  if (parsedParams.roles?.length > 0) {
    where.role =
      parsedParams.roles.length === 1
        ? (parsedParams.roles[0] as UserRole)
        : { in: parsedParams.roles as UserRole[] };
  } else if (parsedParams.role && parsedParams.role !== 'all') {
    where.role = parsedParams.role;
  }

  if (parsedParams.availability) {
    where.availability = parsedParams.availability === 'true';
  }

  if (parsedParams.search) {
    where.OR = [{ fullName: { contains: parsedParams.search, mode: 'insensitive' } }];
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = {};
  if (parsedParams.sort_by === 'passportId') {
    orderBy = { driverProfile: { passportId: parsedParams.sort_order } };
  } else {
    orderBy = { [parsedParams.sort_by]: parsedParams.sort_order };
  }

  const users = await prisma.user.findMany({
    skip: (parsedParams.page - 1) * parsedParams.per_page,
    take: parsedParams.per_page,
    where,
    orderBy,
    select: {
      uuid: true,
      email: true,
      role: true,
      phone: true,
      availability: true,
      fullName: true,
      driverProfile: {
        select: {
          uuid: true,
          passportId: true,
          passportPhotoPath: true,
          yearsOfDriving: true,
          driverExperience: true,
          driverHistory: true,
        },
      },
      partnerCompany: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({ where });
  const totalAllRoles = await prisma.user.count();
  const roleCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });

  return { users: users as UserResponseDTO[], total, totalAllRoles, roleCounts };
}
