import { PrismaClient, UserRole, Gender, DriverStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function down() {
  //Очищаем только таблицы, связанные с пользователями
  await prisma.$executeRaw`TRUNCATE TABLE "driver_profile" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "company" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
}

async function main() {
  try {
    await down();

    const regularPasswordHash = await bcrypt.hash('Qwerty56', 10);
    const adminPasswordHash = await bcrypt.hash('String3!', 10);

    const usersData = [
      {
        uuid: uuidv4(),
        email: 'admin@gmail.com',
        password: regularPasswordHash,
        role: UserRole.Admin,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Elvis Admin',
        phone: '1234567890',
        gender: Gender.Male,
        address: '123 Admin St',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'client@example.com',
        password: regularPasswordHash,
        role: UserRole.Client,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'John Client',
        phone: '9876543210',
        gender: Gender.Male,
        address: '456 Client Ave',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'driver@example.com',
        password: regularPasswordHash,
        role: UserRole.Driver,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Alice Driver',
        phone: '5551234567',
        gender: Gender.Female,
        address: '789 Driver Rd',
        profilePhotoPath: null,
        availability: true,
      },
      {
        uuid: uuidv4(),
        email: 'operator@example.com',
        password: regularPasswordHash,
        role: UserRole.Operator,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Bob Operator',
        phone: '1112223344',
        gender: Gender.Male,
        address: '101 Operator Lane',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'clientcorp@example.com',
        password: regularPasswordHash,
        role: UserRole.ClientCorp,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Eve CorpClient',
        phone: '9998887766',
        gender: Gender.Female,
        address: '222 Corp Blvd',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'none@example.com',
        password: regularPasswordHash,
        role: UserRole.None,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'No Role User',
        phone: '4445556677',
        gender: Gender.None,
        address: '333 Unknown Path',
        profilePhotoPath: null,
        availability: false,
      },
      // Новые админы с паролем String3!
      {
        uuid: uuidv4(),
        email: 'admincompass@gmail.com',
        password: adminPasswordHash,
        role: UserRole.Admin,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Compass Admin',
        phone: '1001002000',
        gender: Gender.Male,
        address: 'Compass Main Office',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'admincompass1@gmail.com',
        password: adminPasswordHash,
        role: UserRole.Admin,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Compass Admin 1',
        phone: '1001002001',
        gender: Gender.Male,
        address: 'Compass Office 1',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'admincompass2@gmail.com',
        password: adminPasswordHash,
        role: UserRole.Admin,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Compass Admin 2',
        phone: '1001002002',
        gender: Gender.Male,
        address: 'Compass Office 2',
        profilePhotoPath: null,
        availability: false,
      },
      {
        uuid: uuidv4(),
        email: 'admincompass3@gmail.com',
        password: adminPasswordHash,
        role: UserRole.Admin,
        driverStatus: DriverStatus.FREE,
        driverProfileId: null,
        companyProfileId: null,
        fullName: 'Compass Admin 3',
        phone: '1001002003',
        gender: Gender.Male,
        address: 'Compass Office 3',
        profilePhotoPath: null,
        availability: false,
      },
    ];

    await prisma.user.createMany({
      data: usersData.map((user) => ({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    console.log('Пользователи успешно созданы!');
  } catch (e) {
    console.error('Ошибка при создании пользователей:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
