import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { User, UserRole } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { ValidationError } from '@next-app/src/dto/error/ValidationError';

const log = debug('app:users');

export async function POST(req: Request) {
  const data: CreateUserData = await req.json();

  //Валидация данных
  if (!data.email || !data.password || !data.role || !data.fullName) {
    throw new ValidationError('Отсутствуют обязательные поля');
  }

  const {
    email,
    password,
    role,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    companyProfile,
    driverProfile,
  } = data;

  log('Received data:', data);

  //Хеширование пароля
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const now = new Date();
  const uuid = uuidv4();

  const user = {
    uuid,
    email,
    password: hashedPassword,
    role,
    availability: data.availability !== undefined ? data.availability : true,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    createdAt: now,
    updatedAt: now,
  };

  let createdUser: User | null = null;

  await prisma.$transaction(async (prisma) => {
    createdUser = await prisma.user.create({
      data: user,
    });

    if (!createdUser) {
      throw new Error('User creation failed');
    }

    if (role === UserRole.ClientCorp || role === UserRole.Operator) {
      if (!companyProfile) {
        throw new Error('Company profile is required for ClientCorp and Operator roles');
      }

      await prisma.companyProfile.create({
        data: {
          ...companyProfile,
          userId: createdUser.uuid,
        },
      });
    } else if (role === UserRole.Driver) {
      if (!driverProfile) {
        throw new Error('Driver profile is required for Driver role');
      }

      await prisma.driverProfile.create({
        data: {
          ...driverProfile,
          userId: createdUser.uuid,
          driverExperience: {
            create:
              driverProfile.driverExperience?.map((experience) => ({
                companyName: experience.companyName,
                position: experience.position,
                from: new Date(experience.from),
                to: new Date(experience.to),
              })) || [],
          },
        },
      });
    } else if (role !== UserRole.Client && role !== UserRole.Admin) {
      throw new Error('Invalid role');
    }
  });

  log('Created user:', createdUser);

  return NextResponse.json({
    status: 'success',
    message: 'User created successfully',
    uuid: createdUser!.uuid,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    role: (searchParams.get('role') as UserRole | 'all' | null) || null,
    roles: searchParams.getAll('role'),
    availability: searchParams.get('availability') as 'true' | 'false' | null,
    sort_by:
      (searchParams.get('sort_by') as
        | 'email'
        | 'createdAt'
        | 'updatedAt'
        | 'role'
        | 'availability') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    search: searchParams.get('search') || null,
  };

  log('Parsed parameters:', parsedParams);

  try {
    const where: {
      role?: UserRole | { in: UserRole[] };
      availability?: boolean;
      OR?: { fullName: { contains: string; mode: 'insensitive' } }[];
    } = {};

    if (parsedParams.roles.length > 0) {
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

    const users = await prisma.user.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
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
          },
        },
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

    log('Fetched users:', users);

    const searchTerm = parsedParams.search ? parsedParams.search.toLowerCase() : '';
    const filteredUsers = parsedParams.search
      ? users.filter((user) => {
          const nameParts = user.fullName.toLowerCase().split(' ');
          return nameParts.some((part) => part.startsWith(searchTerm));
        })
      : users;

    return NextResponse.json({
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
    });
  } catch (error) {
    log('Error fetching users:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch users' }, { status: 500 });
  }
}
