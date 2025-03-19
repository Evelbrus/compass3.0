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
    assignedVehicleId,
    createNewVehicle,
    newVehicle,
    newVehiclePhotoPath,
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

        // Добавляем поле даты выдачи прав и расчет стажа на основе этой даты
        let yearsOfDriving = driverProfileData.yearsOfDriving;

        // Если есть дата выдачи прав, рассчитываем стаж
        if (driverProfileData.licensePhotoPath && (!yearsOfDriving || yearsOfDriving === 0)) {
          const issueDate = new Date(driverProfileData.licensePhotoPath);
          const currentDate = new Date();
          yearsOfDriving = Math.floor(
            (currentDate.getTime() - issueDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          );

          // Убеждаемся, что стаж не меньше 0
          if (yearsOfDriving < 0) yearsOfDriving = 0;
        }

        await prisma.driverProfile.create({
          data: {
            ...driverProfileData,
            userId: createdUser.uuid,
            yearsOfDriving: yearsOfDriving || 0,
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

        // Вариант 1: Если выбран существующий автомобиль
        if (assignedVehicleId && !createNewVehicle) {
          try {
            // Проверяем, чтобы водитель не был привязан к другому автомобилю
            const existingAssignment = await prisma.vehicleDriver.findFirst({
              where: { driverId: createdUser.uuid },
            });
            if (existingAssignment) {
              logError(`× Водитель уже привязан к другому автомобилю`);
              throw new Error('Driver is already assigned to another vehicle');
            }

            await prisma.vehicleDriver.create({
              data: {
                vehicleId: assignedVehicleId,
                driverId: createdUser.uuid,
                assignmentDate: new Date(),
              },
            });
          } catch (vehicleError) {
            logError('× Ошибка при назначении автомобиля водителю:', vehicleError);
            throw vehicleError; // Выбрасываем ошибку, чтобы сломать транзакцию
          }
        }

        // Вариант 2: Если создается новый автомобиль
        else if (createNewVehicle && newVehicle) {
          try {
            // Проверяем, существует ли автомобиль с таким номером
            const existingVehicle = await prisma.vehicle.findUnique({
              where: { plateNumber: newVehicle.plateNumber },
            });
            if (existingVehicle) {
              logError(`× Автомобиль с номером ${newVehicle.plateNumber} уже существует`);
              throw new Error(
                `Vehicle with license plate ${newVehicle.plateNumber} already exists`,
              );
            }

            // Создаем новый автомобиль
            const newVehicleUuid = uuidv4();
            const yearDate = newVehicle.year ? new Date(newVehicle.year.toString()) : undefined;

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
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            // Привязываем водителя к новому автомобилю
            await prisma.vehicleDriver.create({
              data: {
                vehicleId: createdVehicle.uuid,
                driverId: createdUser.uuid,
                assignmentDate: new Date(),
              },
            });
          } catch (vehicleError) {
            logError('× Ошибка при создании автомобиля:', vehicleError);
            throw vehicleError; // Выбрасываем ошибку, чтобы сломать транзакцию
          }
        }
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
