import { PrismaClient, UserRole, Gender } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function down() {
    await prisma.$executeRaw `TRUNCATE TABLE "driver_profile" CASCADE`;
    await prisma.$executeRaw `TRUNCATE TABLE "company" CASCADE`;
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
                fullName: 'Elvis Admin',
                phone: '1234567890',
                gender: Gender.Male,
                address: '123 Admin St',
                availability: false,
                driverProfileId: null,
            },
            {
                uuid: uuidv4(),
                email: 'client@example.com',
                password: passwordHash,
                role: UserRole.Client,
                fullName: 'John Client',
                phone: '9876543210',
                gender: Gender.Male,
                address: '456 Client Ave',
                availability: false,
                driverProfileId: null,
            },
            {
                uuid: uuidv4(),
                email: 'driver@example.com',
                password: passwordHash,
                role: UserRole.Driver,
                fullName: 'Alice Driver',
                phone: '5551234567',
                gender: Gender.Female,
                address: '789 Driver Rd',
                availability: true,
                driverProfileId: null,
            },
            {
                uuid: uuidv4(),
                email: 'operator@example.com',
                password: passwordHash,
                role: UserRole.Operator,
                fullName: 'Bob Operator',
                phone: '1112223344',
                gender: Gender.Male,
                address: '101 Operator Lane',
                availability: false,
                driverProfileId: null,
            },
            {
                uuid: uuidv4(),
                email: 'clientcorp@example.com',
                password: passwordHash,
                role: UserRole.ClientCorp,
                fullName: 'Eve CorpClient',
                phone: '9998887766',
                gender: Gender.Female,
                address: '222 Corp Blvd',
                availability: false,
                driverProfileId: null,
            },
            {
                uuid: uuidv4(),
                email: 'none@example.com',
                password: passwordHash,
                role: UserRole.None,
                fullName: 'No Role User',
                phone: '4445556677',
                gender: Gender.None,
                address: '333 Unknown Path',
                availability: false,
                driverProfileId: null,
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
