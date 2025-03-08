import { CompanyProfile, DriverProfile, Prisma, User, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:users:error');

interface CreateUserData extends User {
  password: string;
  companyProfile?: CompanyProfile;
  driverProfile?: DriverProfile & {
    driverExperience?: Array<{
      companyName: string;
      position: string;
      from: string | Date;
      to: string | Date;
    }>;
  };
}

export async function createUser(data: CreateUserData, hashedPassword: string): Promise<User> {
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

  const now = new Date();
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
    createdAt: now,
    updatedAt: now,
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
        await prisma.driverProfile.create({
          data: {
            ...data.driverProfile,
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
