import { PrismaClient, UserRole, Gender } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function down() {
    //Очищаем таблицы с учетом новых связей.
    //Если таблица "driver_profile" существует, удаляем её данные.
    await prisma.$executeRaw `TRUNCATE TABLE "driver_profile" CASCADE`;
    //Если в вашей схеме нет таблицы "company_profile", а используется "company",
    //то очищаем таблицу "company". Если же в будущем появится "company_profile",
    //замените следующую строку на:
    //await prisma.$executeRaw`TRUNCATE TABLE "company_profile" CASCADE`;
    await prisma.$executeRaw `TRUNCATE TABLE "company" CASCADE`;
    //Очищаем таблицу пользователей.
    await prisma.$executeRaw `TRUNCATE TABLE "users" CASCADE`;
}
async function main() {
    try {
        await down();
        const passwordHash = await bcrypt.hash('Qwerty56', 10);
        const usersData = [
            {
                uuid: uuidv4(),
                email: 'admin@gmail.com',
                password: passwordHash,
                role: UserRole.Admin,
                //driverAcceptanceStatus не передаём, используется значение по умолчанию (PENDING)
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
                password: passwordHash,
                role: UserRole.Client,
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
                password: passwordHash,
                role: UserRole.Driver,
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
                password: passwordHash,
                role: UserRole.Operator,
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
                password: passwordHash,
                role: UserRole.ClientCorp,
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
                password: passwordHash,
                role: UserRole.None,
                driverProfileId: null,
                companyProfileId: null,
                fullName: 'No Role User',
                phone: '4445556677',
                gender: Gender.None,
                address: '333 Unknown Path',
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
    }
    catch (e) {
        console.error('Ошибка при создании пользователей:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
