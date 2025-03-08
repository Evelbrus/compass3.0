import {
  CompanyProfile,
  DriverProfile,
  PartnerCompany,
  User,
  UserRole,
} from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';

const logError = debug('app:user-put:error');

// Интерфейс для обновления данных пользователя
interface UpdateUserData extends User {
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

// Полное обновление пользователя (PUT)
export async function updateUser(data: UpdateUserData): Promise<User> {
  const {
    uuid,
    role,
    availability,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    companyProfile,
    driverProfile,
    partnerCompany,
    individualSalaryRate,
    defaultSalaryId,
  } = data;

  const now = new Date();

  const userUpdates = {
    role: role as UserRole,
    availability,
    fullName,
    phone,
    gender,
    address,
    profilePhotoPath,
    partnerCompany: (partnerCompany as PartnerCompany) || 'NONE',
    individualSalaryRate: individualSalaryRate || null,
    defaultSalaryId: defaultSalaryId || null,
    updatedAt: now,
  };

  let updatedUser: User | null = null;

  try {
    await prisma.$transaction(async (prisma) => {
      updatedUser = await prisma.user.update({
        where: { uuid },
        data: userUpdates,
      });

      if (role === 'ClientCorp' || role === 'Operator') {
        if (!companyProfile) {
          logError('× Профиль компании обязателен для ролей ClientCorp и Operator (400)');
          throw new Error('Company profile is required for ClientCorp and Operator roles');
        }

        const companyUpdateData = {
          companyName: companyProfile.companyName,
          address: companyProfile.address || '',
          phone: companyProfile.phone,
          email: companyProfile.email || '',
          website: companyProfile.website || '',
          companyPin: companyProfile.companyPin || '',
          logoImagePath: companyProfile.logoImagePath,
          updatedAt: now,
        };

        await prisma.companyProfile.update({
          where: { userId: uuid },
          data: companyUpdateData,
        });
      } else if (role === 'Driver') {
        if (!driverProfile) {
          logError('× Профиль водителя обязателен для роли Driver (400)');
          throw new Error('Driver profile is required for Driver role');
        }

        const driverUpdateData = {
          passportId: driverProfile.passportId,
          passportIssueDate: driverProfile.passportIssueDate
            ? typeof driverProfile.passportIssueDate === 'string'
              ? new Date(driverProfile.passportIssueDate)
              : driverProfile.passportIssueDate
            : null,
          passportIssued: driverProfile.passportIssued,
          birthDate: driverProfile.birthDate
            ? typeof driverProfile.birthDate === 'string'
              ? new Date(driverProfile.birthDate)
              : driverProfile.birthDate
            : null,
          permanentAddress: driverProfile.permanentAddress,
          birthPlace: driverProfile.birthPlace,
          yearsOfDriving: driverProfile.yearsOfDriving,
          changingDriver: driverProfile.changingDriver,
          passportPhotoPath: driverProfile.passportPhotoPath,
          profilePhotoPath: driverProfile.profilePhotoPath,
          licensePhotoPath: driverProfile.licensePhotoPath,
          updatedAt: now,
        };

        await prisma.driverProfile.update({
          where: { userId: uuid },
          data: {
            ...driverUpdateData,
            driverExperience: {
              deleteMany: {},
              create:
                driverProfile.driverExperience?.map((experience) => ({
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
      } else if (role !== 'Client' && role !== 'Admin') {
        logError(`× Недопустимая роль ${role} (400)`);
        throw new Error('Invalid role');
      }

      if (partnerCompany && partnerCompany !== 'NONE') {
        const existingSalary = await prisma.partnerSalary.findFirst({
          where: { partnerCompany },
        });

        if (!existingSalary && !defaultSalaryId) {
          const newSalaryUuid = uuidv4();
          await prisma.partnerSalary.create({
            data: {
              uuid: newSalaryUuid,
              partnerCompany,
              salaryRate: individualSalaryRate || 0,
              currency: 'SOM',
              description: `Default salary for ${partnerCompany}`,
              createdAt: now,
              updatedAt: now,
            },
          });

          await prisma.user.update({
            where: { uuid },
            data: { defaultSalaryId: newSalaryUuid },
          });
        } else if (existingSalary && !defaultSalaryId) {
          await prisma.user.update({
            where: { uuid },
            data: { defaultSalaryId: existingSalary.uuid },
          });
        }

        if (individualSalaryRate !== undefined && individualSalaryRate !== null) {
          if (defaultSalaryId) {
            await prisma.partnerSalary.update({
              where: { uuid: defaultSalaryId },
              data: {
                salaryRate: individualSalaryRate,
                updatedAt: now,
              },
            });
          } else {
            const newIndividualSalaryUuid = uuidv4();
            await prisma.partnerSalary.create({
              data: {
                uuid: newIndividualSalaryUuid,
                partnerCompany,
                salaryRate: individualSalaryRate,
                currency: 'SOM',
                description: `Individual salary for user ${uuid}`,
                createdAt: now,
                updatedAt: now,
              },
            });

            await prisma.user.update({
              where: { uuid },
              data: { defaultSalaryId: newIndividualSalaryUuid },
            });
          }
        }
      }
    });

    return updatedUser!;
  } catch (error) {
    logError('× Ошибка при обновлении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
