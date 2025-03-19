import {
  User,
  UserRole,
  PartnerCompany,
  VehicleType,
  ServiceLevels,
  Prisma,
  ChangingDriver,
} from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';

const logError = debug('app:user-put-admin:error');

export interface UpdateUserDTO extends Omit<User, 'password'> {
  companyProfile?: {
    companyName: string;
    address?: string;
    companyPin?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoImagePath?: string;
  };
  driverProfile?: {
    passportId: string | number;
    passportIssueDate: string | Date;
    passportIssued: string;
    birthDate: string | Date;
    permanentAddress: string;
    birthPlace: string;
    yearsOfDriving?: number;
    changingDriver?: string;
    passportPhotoPath?: string;
    profilePhotoPath?: string;
    licensePhotoPath?: string;
    driverExperience?: Array<{
      companyName: string;
      position: string;
      from: string | Date;
      to: string | Date;
    }>;
  };
  assignedVehicleId?: string;
  createNewVehicle?: boolean;
  newVehicle?: {
    vehicleType: VehicleType;
    brand: string;
    model: string;
    year: string | number;
    color: string;
    plateNumber: string;
    serviceLevels: ServiceLevels;
    ownership: string;
    isAvailable?: boolean;
  };
  newVehiclePhotoPath?: string;
  removeVehicleAssignments?: boolean;
}

export async function updateUser(data: UpdateUserDTO): Promise<User> {
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
    assignedVehicleId,
    createNewVehicle,
    newVehicle,
    newVehiclePhotoPath,
    removeVehicleAssignments,
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
      // Обновляем пользователя
      updatedUser = await prisma.user.update({
        where: { uuid },
        data: userUpdates,
      });

      if (role === UserRole.ClientCorp || role === UserRole.Operator) {
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
      } else if (role === UserRole.Driver) {
        if (!driverProfile) {
          logError('× Профиль водителя обязателен для роли Driver (400)');
          throw new Error('Driver profile is required for Driver role');
        }

        const driverUpdateInput: Prisma.DriverProfileUpdateInput = {
          passportId:
            typeof driverProfile.passportId === 'string'
              ? Number(driverProfile.passportId)
              : driverProfile.passportId,
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
          changingDriver: driverProfile.changingDriver
            ? { set: driverProfile.changingDriver as ChangingDriver }
            : undefined,
          passportPhotoPath: driverProfile.passportPhotoPath,
          profilePhotoPath: driverProfile.profilePhotoPath,
          licensePhotoPath: driverProfile.licensePhotoPath,
          updatedAt: now,
          driverExperience: {
            deleteMany: {},
            create:
              driverProfile.driverExperience?.map((experience) => ({
                companyName: experience.companyName,
                position: experience.position,
                from:
                  typeof experience.from === 'string' ? new Date(experience.from) : experience.from,
                to: typeof experience.to === 'string' ? new Date(experience.to) : experience.to,
              })) || [],
          },
        };

        await prisma.driverProfile.update({
          where: { userId: uuid },
          data: driverUpdateInput,
        });

        // Обработка связей с автомобилями
        if (removeVehicleAssignments) {
          await prisma.vehicleDriver.deleteMany({
            where: { driverId: uuid },
          });
        }

        if (assignedVehicleId && !createNewVehicle) {
          const vehicleExists = await prisma.vehicle.findUnique({
            where: { uuid: assignedVehicleId },
          });
          if (!vehicleExists) {
            logError(`× Автомобиль с ID ${assignedVehicleId} не существует`);
            throw new Error(`Vehicle with ID ${assignedVehicleId} does not exist`);
          }

          await prisma.vehicleDriver.deleteMany({
            where: { driverId: uuid },
          });

          await prisma.vehicleDriver.create({
            data: {
              vehicleId: assignedVehicleId,
              driverId: uuid,
              assignmentDate: now,
            },
          });
        } else if (createNewVehicle && newVehicle) {
          const existingVehicle = await prisma.vehicle.findUnique({
            where: { plateNumber: newVehicle.plateNumber },
          });

          if (existingVehicle) {
            logError(`× Автомобиль с номером ${newVehicle.plateNumber} уже существует`);
            throw new Error(`Vehicle with license plate ${newVehicle.plateNumber} already exists`);
          }

          const newVehicleUuid = uuidv4();
          const yearDate = newVehicle.year ? new Date(newVehicle.year.toString()) : undefined;

          // Создаём новый автомобиль
          const createdVehicle = await prisma.vehicle.create({
            data: {
              uuid: newVehicleUuid,
              vehicleType: newVehicle.vehicleType,
              brand: newVehicle.brand,
              model: newVehicle.model,
              year: yearDate,
              color: newVehicle.color,
              plateNumber: newVehicle.plateNumber,
              serviceLevels: newVehicle.serviceLevels,
              photoPath: newVehiclePhotoPath,
              isAvailable: newVehicle.isAvailable || true,
              createdAt: now,
              updatedAt: now,
            },
          });

          // Удаляем старые привязки
          await prisma.vehicleDriver.deleteMany({
            where: { driverId: uuid },
          });

          // Привязываем водителя к новому автомобилю
          await prisma.vehicleDriver.create({
            data: {
              vehicleId: createdVehicle.uuid,
              driverId: uuid,
              assignmentDate: now,
            },
          });
        }
      } else if (role !== UserRole.Client && role !== UserRole.Admin) {
        logError(`× Недопустимая роль ${role} (400)`);
        throw new Error('Invalid role');
      }

      if (partnerCompany && partnerCompany !== PartnerCompany.NONE) {
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
