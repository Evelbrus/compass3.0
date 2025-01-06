import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Gender, PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { email, password, fullName, phone, gender, address, profilePhotoPath, availability } =
    await request.json();

  //Проверка обязательных полей
  if (!email || !password || !fullName || !phone || !gender) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    type UserCreateInput = Omit<User, 'uuid' | 'createdAt' | 'updatedAt'>;

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: fullName,
        phone: phone,
        gender: gender || Gender.None,
        address: address || null,
        profilePhotoPath: profilePhotoPath || null,
        role: UserRole.Admin,
        availability: availability || false,
      } as UserCreateInput,
    });

    return NextResponse.json(
      { message: 'User registered successfully', user: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
