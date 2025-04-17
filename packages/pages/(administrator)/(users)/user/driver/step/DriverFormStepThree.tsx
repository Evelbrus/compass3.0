import React, { useState, useEffect, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import {
  vehicleTypeOptions,
  colorOptions,
  serviceLevelOptions,
  ownershipOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { Vehicle } from '@prisma/client';
import { SelectOption } from '@shared/lib/effector';

interface DriverFormStepThreeProps {
  licenseSrc?: string | null;
  setLicensePreview?: (url: string) => void;
  vehicleImageSrc?: string | null;
  setVehicleImagePreview?: (url: string) => void;
}

const DriverFormStepThree: React.FC<DriverFormStepThreeProps> = ({
  licenseSrc,
  setLicensePreview,
  vehicleImageSrc,
  setVehicleImagePreview,
}) => {
  const { control, clearErrors, setValue, watch, getValues } = useFormContext<userFormData>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [drivingExperienceYears, setDrivingExperienceYears] = useState<number | null>(null);
  const [drivingExperienceMonths, setDrivingExperienceMonths] = useState<number | null>(null);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState<boolean>(false);
  const [initialVehicleLoaded, setInitialVehicleLoaded] = useState<boolean>(false);
  const [previousVehicle, setPreviousVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleOption, setSelectedVehicleOption] = useState<SelectOption<string> | null>(
    null,
  );

  // Добавляем состояние для отслеживания успешно выбранного автомобиля
  const [confirmedVehicle, setConfirmedVehicle] = useState<SelectOption<string> | null>(null);
  // Используем useRef для хранения всех полученных автомобилей
  const allVehiclesRef = useRef<Vehicle[]>([]);

  // Добавляем состояние для отслеживания даты выдачи лицензии
  const [licenseIssueDate, setLicenseIssueDate] = useState<string>('');

  // Используем отдельную переменную watch для файла и для строки даты
  const licensePhotoFile = watch('driverProfile.licensePhotoPath');
  const createNewVehicle = watch('createNewVehicle');
  const initialAssignedVehicleId = watch('assignedVehicleId');
  const currentAssignedVehicleId = watch('assignedVehicleId');
  const existingYearsOfDriving = watch('driverProfile.yearsOfDriving');

  // Эффект для обработки существующего стажа вождения из данных пользователя
  useEffect(() => {
    if (existingYearsOfDriving !== undefined && existingYearsOfDriving !== null) {
      // Преобразуем десятичное значение в годы и месяцы
      const totalMonths = Math.round(existingYearsOfDriving * 12);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      // Устанавливаем значения для отображения
      setDrivingExperienceYears(years);
      setDrivingExperienceMonths(months);
    }
  }, [existingYearsOfDriving]);

  // Функция загрузки автомобилей
  const fetchVehicles = async (searchQuery: string = '') => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/vehicles?per_page=10&search=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      let availableVehicles = data.data.vehicles || [];

      // Добавляем загруженные автомобили в наш полный список (без дубликатов)
      const newVehiclesList = [...allVehiclesRef.current];
      availableVehicles.forEach((vehicle: Vehicle) => {
        if (!newVehiclesList.some((v: Vehicle) => v.uuid === vehicle.uuid)) {
          newVehiclesList.push(vehicle);
        }
      });
      allVehiclesRef.current = newVehiclesList;

      // Если есть текущий автомобиль и он еще не загружен
      if (initialAssignedVehicleId && !initialVehicleLoaded) {
        const isAlreadyIncluded = allVehiclesRef.current.some(
          (v: Vehicle) => v.uuid === initialAssignedVehicleId,
        );
        if (!isAlreadyIncluded) {
          const vehicleResponse = await fetch(`/api/admin/vehicles/${initialAssignedVehicleId}`);
          if (vehicleResponse.ok) {
            const vehicleData = await vehicleResponse.json();
            if (vehicleData.status === 'success') {
              const initialVehicle = vehicleData.data;
              setPreviousVehicle(initialVehicle);

              // Добавляем начальный автомобиль в список, если его еще нет
              if (!allVehiclesRef.current.some((v: Vehicle) => v.uuid === initialVehicle.uuid)) {
                allVehiclesRef.current = [initialVehicle, ...allVehiclesRef.current];
              }

              setInitialVehicleLoaded(true);
            }
          }
        } else {
          // Если автомобиль уже в списке, запомним его как предыдущий
          setPreviousVehicle(
            allVehiclesRef.current.find((v: Vehicle) => v.uuid === initialAssignedVehicleId) ||
              null,
          );
          setInitialVehicleLoaded(true);
        }
      }

      // Если у нас есть подтвержденный выбор, убедимся, что он в списке отображаемых автомобилей
      if (
        confirmedVehicle &&
        !availableVehicles.some((v: Vehicle) => v.uuid === confirmedVehicle.value)
      ) {
        const confirmedVehicleDetails = allVehiclesRef.current.find(
          (v: Vehicle) => v.uuid === confirmedVehicle.value,
        );
        if (confirmedVehicleDetails) {
          availableVehicles = [confirmedVehicleDetails, ...availableVehicles];
        }
      }

      // Фильтруем список автомобилей по поисковому запросу
      if (searchQuery) {
        const lowerSearchQuery = searchQuery.toLowerCase();
        availableVehicles = allVehiclesRef.current.filter(
          (vehicle: Vehicle) =>
            vehicle.brand?.toLowerCase().includes(lowerSearchQuery) ||
            vehicle.model?.toLowerCase().includes(lowerSearchQuery) ||
            vehicle.plateNumber?.toLowerCase().includes(lowerSearchQuery),
        );
      } else {
        // Если поиск не задан, показываем все автомобили из нашего полного списка (ограничиваем 10)
        availableVehicles = [...allVehiclesRef.current].slice(0, 10);
      }

      // Очищаем дубликаты
      const uniqueIds = new Set();
      const uniqueVehicles = availableVehicles.filter((vehicle: Vehicle) => {
        if (uniqueIds.has(vehicle.uuid)) {
          return false;
        }
        uniqueIds.add(vehicle.uuid);
        return true;
      });

      setVehicles(uniqueVehicles);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  // Изначальная загрузка без поиска
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Расчет стажа вождения с учетом месяцев
  useEffect(() => {
    // Проверяем, что licenseIssueDate это строка с датой, а не File
    if (licenseIssueDate && typeof licenseIssueDate === 'string') {
      try {
        const issueDate = new Date(licenseIssueDate);
        const currentDate = new Date();

        // Проверка валидности даты
        if (isNaN(issueDate.getTime())) {
          console.error('Некорректная дата выдачи лицензии');
          return;
        }

        // Расчет полных лет и месяцев
        const yearsDiff = currentDate.getFullYear() - issueDate.getFullYear();
        const monthsDiff = currentDate.getMonth() - issueDate.getMonth();
        const daysDiff = currentDate.getDate() - issueDate.getDate();

        // Корректировка если текущая дата раньше в месяце, чем дата выдачи
        let adjustedMonthsDiff = monthsDiff;
        if (daysDiff < 0) {
          adjustedMonthsDiff -= 1;
        }

        // Окончательный расчет лет и оставшихся месяцев
        let finalYears = yearsDiff;
        let finalMonths = adjustedMonthsDiff;

        if (adjustedMonthsDiff < 0) {
          finalYears -= 1;
          finalMonths = 12 + adjustedMonthsDiff;
        }

        // Убедимся, что стаж не отрицательный
        finalYears = Math.max(0, finalYears);
        finalMonths = Math.max(0, finalMonths);

        // Рассчитаем общий стаж в виде десятичного числа (годы + месяцы/12)
        const totalExperience = finalYears + finalMonths / 12;

        // Устанавливаем значения для отображения и для формы
        setDrivingExperienceYears(finalYears);
        setDrivingExperienceMonths(finalMonths);
        setValue('driverProfile.yearsOfDriving', totalExperience);
      } catch (error) {
        console.error('Ошибка при расчете стажа:', error);
      }
    }
  }, [licenseIssueDate]);

  // Отслеживание флага создания автомобиля
  useEffect(() => {
    if (createNewVehicle) {
      setShowNewVehicleForm(true);
      setValue('assignedVehicleId', null);
      setSelectedVehicleOption(null);
      setConfirmedVehicle(null);
    } else {
      setShowNewVehicleForm(false);
    }
  }, [createNewVehicle, setValue]);

  // Инициализация начальных данных
  useEffect(() => {
    if (initialAssignedVehicleId && !selectedVehicleOption && initialVehicleLoaded) {
      const vehicle = allVehiclesRef.current.find((v) => v.uuid === initialAssignedVehicleId);
      if (vehicle) {
        const option = {
          value: vehicle.uuid,
          label: `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNumber} (текущий)`,
        };
        setSelectedVehicleOption(option);
        setConfirmedVehicle(option);
      }
    }
  }, [initialAssignedVehicleId, selectedVehicleOption, initialVehicleLoaded]);

  // Опции для выбора автомобиля
  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.uuid,
    label: `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNumber}${
      vehicle.uuid === initialAssignedVehicleId ? ' (текущий)' : ''
    }`,
  }));

  const toggleVehicleForm = (showForm: boolean) => {
    setShowNewVehicleForm(showForm);
    setValue('createNewVehicle', showForm);
    if (!showForm) setValue('newVehicle', undefined);
  };

  interface InputChangeValue {
    target?: {
      value: string;
    };
    value?: string;
  }

  // Обработчик изменения текста в поиске
  const handleInputChange = (inputValue: string | InputChangeValue) => {
    const searchText =
      typeof inputValue === 'string'
        ? inputValue
        : inputValue.target instanceof HTMLInputElement
          ? inputValue.target.value
          : inputValue.value || '';

    // Выполняем поиск
    fetchVehicles(searchText);
  };

  // Обработчик выбора автомобиля
  const handleVehicleChange = (option: SelectOption<string> | null) => {
    clearErrors('assignedVehicleId');
    setValue('assignedVehicleId', option?.value || null);
    setSelectedVehicleOption(option);
    setConfirmedVehicle(option); // Запоминаем подтвержденный выбор
  };

  // Обработчик фокуса селектора
  const handleFocus = () => {
    // При фокусе загружаем все автомобили, но сохраняем наш выбор в списке
    fetchVehicles('');
  };

  // Форматирование стажа вождения для отображения
  const formatDrivingExperience = () => {
    if (drivingExperienceYears === null || drivingExperienceMonths === null) {
      return '0 месяцев';
    }
    
    // Если оба значения нулевые
    if (drivingExperienceYears === 0 && drivingExperienceMonths === 0) {
      return '0 месяцев';
    }
    
    const years =
    drivingExperienceYears > 0
    ? `${drivingExperienceYears} ${getYearsText(drivingExperienceYears)}`
    : '';
    
    const months =
    drivingExperienceMonths > 0
    ? `${drivingExperienceMonths} ${getMonthsText(drivingExperienceMonths)}`
    : '';
    
    if (years && months) {
      return `${years} ${months}`;
    } else if (years) {
      return years;
    } else if (months) {
      return months;
    } else {
      return '0 месяцев';
    }
  };

  // Функция для склонения слова "год/года/лет"
  const getYearsText = (years: number) => {
    if (years % 10 === 1 && years % 100 !== 11) {
      return 'год';
    } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
      return 'года';
    } else {
      return 'лет';
    }
  };

  // Функция для склонения слова "месяц/месяца/месяцев"
  const getMonthsText = (months: number) => {
    if (months % 10 === 1 && months % 100 !== 11) {
      return 'месяц';
    } else if ([2, 3, 4].includes(months % 10) && ![12, 13, 14].includes(months % 100)) {
      return 'месяца';
    } else {
      return 'месяцев';
    }
  };

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            <div className="w-2/3 border-r">
              <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                Водительские права и стаж
              </h3>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="driverProfile.licenseIssueDate"
                    control={control}
                    rules={{ required: 'Дата обязательна' }}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label="Дата первого получения прав"
                        placeholder="Выберите дату"
                        type="date"
                        value={field.value ?? ''}
                        onChange={(newValue) => {
                          clearErrors('driverProfile.licenseIssueDate');
                          setLicenseIssueDate(String(newValue));
                          field.onChange(newValue);

                        }}
                        error={!!fieldState.error}
                        message={fieldState.error?.message || ''}
                      />
                    )}
                  />
                  <Controller
                    name="driverProfile.yearsOfDriving"
                    control={control}
                    render={({ fieldState }) => (
                      <TextInput
                        label="Стаж вождения"
                        placeholder="Рассчитывается автоматически"
                        type="text"
                        value={formatDrivingExperience()}
                        onChange={() => {}} // Только чтение
                        disabled={true}
                        error={!!fieldState.error}
                        message={fieldState.error?.message || ''}
                      />
                    )}
                  />
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Назначение автомобиля</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Выберите существующий автомобиль или создайте новый.
                  </p>

                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center">
                      <input
                        id="select-existing"
                        type="radio"
                        className="h-4 w-4 text-blue-600"
                        checked={!showNewVehicleForm}
                        onChange={() => toggleVehicleForm(false)}
                      />
                      <label htmlFor="select-existing" className="ml-2 text-sm text-gray-900">
                        Выбрать существующий
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="create-new"
                        type="radio"
                        className="h-4 w-4 text-blue-600"
                        checked={showNewVehicleForm}
                        onChange={() => toggleVehicleForm(true)}
                      />
                      <label htmlFor="create-new" className="ml-2 text-sm text-gray-900">
                        Создать новый
                      </label>
                    </div>
                  </div>

                  {!showNewVehicleForm && (
                    <>
                      <Controller
                        name="assignedVehicleId"
                        control={control}
                        render={({ fieldState }) => (
                          <SelectSingle
                            label="Выберите автомобиль"
                            placeholder={loading ? 'Загрузка...' : 'Выберите из списка'}
                            options={vehicleOptions}
                            value={selectedVehicleOption}
                            onChange={handleVehicleChange}
                            onInputChange={handleInputChange}
                            onFocus={handleFocus}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            isSearchable={true}
                            searchPlaceholder="Поиск по марке, модели или номеру"
                          />
                        )}
                      />

                      {/* Отображение информации о выбранном автомобиле */}
                      {confirmedVehicle && (
                        <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm font-medium text-gray-700">Выбранный автомобиль:</p>
                          {(() => {
                            // Находим детали выбранного автомобиля из полного списка
                            const vehicleDetails = allVehiclesRef.current.find(
                              (v) => v.uuid === confirmedVehicle.value,
                            );
                            return vehicleDetails ? (
                              <p className="text-sm text-gray-600">
                                {vehicleDetails.brand} {vehicleDetails.model} -{' '}
                                {vehicleDetails.plateNumber}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600">{confirmedVehicle.label}</p>
                            );
                          })()}
                        </div>
                      )}

                      {/* Отображение информации о предыдущем автомобиле (если выбран другой) */}
                      {previousVehicle &&
                        initialAssignedVehicleId &&
                        confirmedVehicle &&
                        initialAssignedVehicleId !== confirmedVehicle.value && (
                          <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-blue-50">
                            <p className="text-sm font-medium text-gray-700">
                              Предыдущий автомобиль:
                            </p>
                            <p className="text-sm text-gray-600">
                              {previousVehicle.brand} {previousVehicle.model} -{' '}
                              {previousVehicle.plateNumber}
                            </p>
                          </div>
                        )}
                    </>
                  )}

                  {showNewVehicleForm && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="font-medium text-gray-900 mb-4">Данные нового автомобиля</h5>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Controller
                          name="newVehicle.vehicleType"
                          control={control}
                          rules={{ required: 'Тип обязателен' }}
                          render={({ field, fieldState }) => (
                            <SelectSingle
                              label="Тип автомобиля"
                              options={vehicleTypeOptions}
                              value={
                                vehicleTypeOptions.find((option) => option.value === field.value) ||
                                null
                              }
                              onChange={(selected) => {
                                clearErrors('newVehicle.vehicleType');
                                field.onChange(selected?.value);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                        <Controller
                          name="newVehicle.serviceLevels"
                          control={control}
                          rules={{ required: 'Класс обязателен' }}
                          render={({ field, fieldState }) => (
                            <SelectSingle
                              label="Класс обслуживания"
                              options={serviceLevelOptions}
                              value={
                                serviceLevelOptions.find(
                                  (option) => option.value === field.value,
                                ) || null
                              }
                              onChange={(selected) => {
                                clearErrors('newVehicle.serviceLevels');
                                field.onChange(selected?.value);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Controller
                          name="newVehicle.brand"
                          control={control}
                          rules={{ required: 'Марка обязательна' }}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Марка автомобиля"
                              placeholder="Например: Toyota"
                              type="text"
                              value={field.value || ''}
                              onChange={(newValue) => {
                                clearErrors('newVehicle.brand');
                                field.onChange(newValue);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                        <Controller
                          name="newVehicle.model"
                          control={control}
                          rules={{ required: 'Модель обязательна' }}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Модель автомобиля"
                              placeholder="Например: Camry"
                              type="text"
                              value={field.value || ''}
                              onChange={(newValue) => {
                                clearErrors('newVehicle.model');
                                field.onChange(newValue);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Controller
                          name="newVehicle.year"
                          control={control}
                          rules={{ required: 'Год обязателен' }}
                          render={({ field, fieldState }) => {
                            const [inputValue, setInputValue] = React.useState(
                              field.value ? new Date(field.value).getFullYear().toString() : '',
                            );
                            return (
                              <TextInput
                                label="Год выпуска"
                                type="text"
                                placeholder="Например: 2023"
                                value={inputValue}
                                onChange={(value) => {
                                  const sanitized = value
                                    ? value.toString().replace(/\D/g, '').slice(0, 4)
                                    : '';
                                  setInputValue(sanitized);
                                  if (sanitized.length === 4) {
                                    field.onChange(`${sanitized}-01-01T00:00:00.000Z`);
                                    clearErrors('newVehicle.year');
                                  } else {
                                    field.onChange(null);
                                  }
                                }}
                                required
                                error={!!fieldState.error}
                                message={fieldState.error?.message || ''}
                              />
                            );
                          }}
                        />
                        <Controller
                          name="newVehicle.color"
                          control={control}
                          rules={{ required: 'Цвет обязателен' }}
                          render={({ field, fieldState }) => (
                            <SelectSingle
                              label="Цвет автомобиля"
                              options={colorOptions}
                              value={
                                colorOptions.find((option) => option.value === field.value) || null
                              }
                              onChange={(selected) => {
                                clearErrors('newVehicle.color');
                                field.onChange(selected?.value);
                              }}
                              isSearchable={true}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="newVehicle.plateNumber"
                          control={control}
                          rules={{ required: 'Номер обязателен' }}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Регистрационный номер"
                              placeholder="Например: А123ВС777"
                              type="text"
                              value={field.value || ''}
                              onChange={(newValue) => {
                                clearErrors('newVehicle.plateNumber');
                                field.onChange(newValue);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                        <Controller
                          name="newVehicle.ownership"
                          control={control}
                          rules={{ required: 'Владение обязательно' }}
                          render={({ field, fieldState }) => (
                            <SelectSingle
                              label="Тип владения"
                              options={ownershipOptions}
                              value={
                                ownershipOptions.find((option) => option.value === field.value) ||
                                null
                              }
                              onChange={(selected) => {
                                clearErrors('newVehicle.ownership');
                                field.onChange(selected?.value);
                              }}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/3 bg-gray-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Фото водительских прав</h3>
              <div className="flex flex-col items-center">
                <AnimatedComponent duration={500} className="w-full">
                  <Controller
                    name="driverProfile.licensePhotoPath"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[300px]">
                        <ImageUploadWithCrop
                          initialImage={licenseSrc || undefined}
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message || ''}
                          onChange={(file) => {
                            clearErrors('driverProfile.licensePhotoPath');
                            field.onChange(file);
                            if (setLicensePreview && file) {
                              const url = URL.createObjectURL(file);
                              setLicensePreview(url);
                            }
                          }}
                          aspect={4 / 3}
                        />
                      </div>
                    )}
                  />
                </AnimatedComponent>
                <p className="text-xs text-gray-500 mt-3">
                  Рекомендуемый размер: 800x600 пикселей. Форматы: JPG, PNG.
                </p>
              </div>

              {showNewVehicleForm && (
                <div className="flex flex-col items-center mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Фото автомобиля</h3>
                  <div className="flex flex-col items-center">
                    <AnimatedComponent duration={500} className="w-full">
                      <Controller
                        name="newVehicle.photoImage"
                        control={control}
                        render={({ field, fieldState }) => (
                          <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[300px]">
                            <ImageUploadWithCrop
                              initialImage={vehicleImageSrc || undefined}
                              error={!!fieldState.error}
                              errorMessage={fieldState.error?.message || ''}
                              onChange={(file) => {
                                clearErrors('newVehicle.photoImage');
                                field.onChange(file);
                                if (setVehicleImagePreview && file) {
                                  const url = URL.createObjectURL(file);
                                  setVehicleImagePreview(url);
                                }
                              }}
                              aspect={4 / 3}
                            />
                          </div>
                        )}
                      />
                    </AnimatedComponent>
                    <p className="text-xs text-gray-500 mt-3">
                      Рекомендуемый размер: 800x600 пикселей. Форматы: JPG, PNG.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepThree;
