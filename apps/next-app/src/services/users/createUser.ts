// app/api/admin/users/createUser.ts
import { Prisma, User, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { CreateUserDTO } from '@next-app/src/dto/users/users.dto';

const logError = debug('app:users:error');

export async function createUser(data: CreateUserDTO, hashedPassword: string): Promise<User> {
  const {
    email,
    role,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    partnerCompany = 'NONE',
    individualSalaryRate,
    defaultSalaryId,
    availability = true,
  } = data;

  const userUuid = uuidv4();

  const userData = {
    uuid: userUuid,
    email,
    password: hashedPassword,
    role,
    availability,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    partnerCompany,
    defaultSalaryId: defaultSalaryId || null,
    individualSalaryRate: individualSalaryRate || null,
  };

  let createdUser: User | null = null;

  try {
    await prisma.$transaction(async (prisma) => {
      createdUser = await prisma.user.create({ data: userData });
      if (!createdUser) {
        logError('× Не удалось создать пользователя (500)');
        throw new Error('User creation failed');
      }

      if (role === UserRole.ClientCorp || role === UserRole.Operator) {
        if (!data.companyProfile) {
          logError('× Профиль компании обязателен для ролей ClientCorp и Operator (400)');
          throw new Error('Company profile is required for ClientCorp and Operator roles');
        }
        await prisma.companyProfile.create({
          data: { ...data.companyProfile, userId: createdUser.uuid },
        });
      } else if (role === UserRole.Driver) {
        if (!data.driverProfile) {
          logError('× Профиль водителя обязателен для роли Driver (400)');
          throw new Error('Driver profile is required for Driver role');
        }

        // Очистка полей с путями к файлам, если они пришли как пустые объекты
        const driverProfileData = { ...data.driverProfile };

        // Проверяем и исправляем поля с путями к файлам
        if (
          driverProfileData.passportPhotoPath &&
          typeof driverProfileData.passportPhotoPath === 'object'
        ) {
          driverProfileData.passportPhotoPath = null;
        }

        if (
          driverProfileData.profilePhotoPath &&
          typeof driverProfileData.profilePhotoPath === 'object'
        ) {
          driverProfileData.profilePhotoPath = null;
        }

        if (
          driverProfileData.licensePhotoPath &&
          typeof driverProfileData.licensePhotoPath === 'object'
        ) {
          driverProfileData.licensePhotoPath = null;
        }

        await prisma.driverProfile.create({
          data: {
            ...driverProfileData,
            userId: createdUser.uuid,
            driverExperience: {
              create:
                data.driverProfile.driverExperience?.map((experience) => ({
                  companyName: experience.companyName,
                  position: experience.position,
                  from:
                    typeof experience.from === 'string'
                      ? new Date(experience.from)
                      : experience.from,
                  to: typeof experience.to === 'string' ? new Date(experience.to) : experience.to,
                })) || [],
            },
          },
        });
      } else if (role !== UserRole.Client && role !== UserRole.Admin) {
        logError(`× Недопустимая роль ${role} (400)`);
        throw new Error('Invalid role');
      }

      if (!defaultSalaryId && partnerCompany !== 'NONE') {
        const existingSalary = await prisma.partnerSalary.findFirst({ where: { partnerCompany } });
        if (!existingSalary) {
          const newSalaryUuid = uuidv4();
          await prisma.partnerSalary.create({
            data: {
              uuid: newSalaryUuid,
              partnerCompany,
              salaryRate: 0,
              currency: 'SOM',
              description: `Default salary for ${partnerCompany}`,
            },
          });
          await prisma.user.update({
            where: { uuid: createdUser.uuid },
            data: { defaultSalaryId: newSalaryUuid },
          });
        } else {
          await prisma.user.update({
            where: { uuid: createdUser.uuid },
            data: { defaultSalaryId: existingSalary.uuid },
          });
        }
      }

      if (individualSalaryRate !== null && individualSalaryRate !== undefined && !defaultSalaryId) {
        const newIndividualSalaryUuid = uuidv4();
        await prisma.partnerSalary.create({
          data: {
            uuid: newIndividualSalaryUuid,
            partnerCompany,
            salaryRate: individualSalaryRate,
            currency: 'SOM',
            description: `Individual salary for user ${createdUser.uuid}`,
          },
        });
        await prisma.user.update({
          where: { uuid: createdUser.uuid },
          data: { defaultSalaryId: newIndividualSalaryUuid },
        });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      logError(`× Пользователь с email ${email} уже существует в транзакции (409)`);
      throw new Error('User with this email already exists');
    }
    throw error;
  }

  return createdUser!;
}
