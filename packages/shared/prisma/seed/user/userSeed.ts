import { PrismaClient, UserRole, Gender } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "driver_profile" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "company" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
}

async function main() {
  try {
    await down();

    const passwordHash = await bcrypt.hash('Sirena563119', 10);

    const user = {
      email: 'evelbrus1@gmail.com',
      password: passwordHash,
      role: UserRole.Admin,
      fullName: 'Evelbrus User',
      phone: '1234567890',
      gender: Gender.Male,
      address: '123 Admin St',
      uuid: uuidv4(),
      availability: false,
      driverProfileId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await prisma.user.create({
      data: user,
    });

    console.log('Пользователь успешно создан!');
  } catch (e) {
    console.error('Ошибка при создании пользователя:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
