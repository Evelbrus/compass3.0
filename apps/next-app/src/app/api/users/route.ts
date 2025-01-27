import { NextResponse } from 'next/server';
import { User, UserRole } from '@prisma/client';
import debug from 'debug';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:users');

export async function POST(req: Request) {
  try {
    const data: CreateUserData = await req.json();

    const {
      email,
      password,
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

    log('Received data:', data);

    //Валидация данных
    if (!email || !password || !role || !fullName) {
      throw new Error('Missing required fields');
    }

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
      availability,
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

      if (role === 'ClientCorp' || role === 'Operator') {
        if (!companyProfile) {
          throw new Error('Company profile is required for ClientCorp and Operator roles');
        }

        await prisma.companyProfile.create({
          data: {
            ...companyProfile,
            userId: createdUser.uuid,
          },
        });
      } else if (role === 'Driver') {
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
      } else if (role !== 'Client' && role !== 'Admin') {
        throw new Error('Invalid role');
      }
    });

    log('Created user:', createdUser);

    return NextResponse.json({
      status: 'success',
      message: 'User created successfully',
      uuid: createdUser!.uuid,
    });
  } catch (error) {
    log('Error creating user:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    role: (searchParams.get('role') as UserRole | 'all' | null) || null,
    availability: searchParams.get('availability') as 'true' | 'false' | null,
    sort_by:
      (searchParams.get('sort_by') as
        | 'email'
        | 'createdAt'
        | 'updatedAt'
        | 'role'
        | 'availability') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    const where: { role?: UserRole; availability?: boolean } = {};
    if (parsedParams.role && parsedParams.role !== 'all') {
      where.role = parsedParams.role;
    }
    if (parsedParams.availability) {
      where.availability = parsedParams.availability === 'true';
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

    //Получение количества пользователей по ролям
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    log('Fetched users:', users);

    return NextResponse.json({
      status: 'success',
      message: 'Fetched users successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllRoles,
        roleCounts,
        users,
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
