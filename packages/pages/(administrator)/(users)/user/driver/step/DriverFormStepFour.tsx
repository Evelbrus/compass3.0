import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { TextInput } from '@shared/components/ui/inputs';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface DriverFormStepFourProps {
  mode: 'create' | 'edit';
}

// Вспомогательная функция для вычисления разницы между датами (в миллисекундах)
const getDuration = (fromValue: Date, toValue: Date): number => {
  const from = new Date(fromValue);
  const to = new Date(toValue);
  if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && to > from) {
    return to.getTime() - from.getTime();
  }
  return 0;
};

// Функция для форматирования миллисекунд в годы, месяцы и дни
const formatDuration = (ms: number): string => {
  const totalDays = ms / (1000 * 60 * 60 * 24);
  const years = Math.floor(totalDays / 365);
  const daysAfterYears = totalDays % 365;
  const months = Math.floor(daysAfterYears / 30);
  const days = Math.floor(daysAfterYears % 30);

  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
  if (months) parts.push(`${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`);
  if (days) parts.push(`${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`);

  return parts.join(', ') || '0 дней';
};

const DriverFormStepFour: React.FC<DriverFormStepFourProps> = ({ mode }) => {
  const { control } = useFormContext<userFormData>();

  // Управление массивом driverExperience через useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'driverProfile.driverExperience',
  });

  // Рассчитываем общее время работы (суммарная длительность всех периодов)
  let totalDurationMs = 0;
  fields.forEach((field) => {
    totalDurationMs += getDuration(new Date(field.from), new Date(field.to));
  });
  const totalDurationText = formatDuration(totalDurationMs);

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            <div className="w-full">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                  <svg
                    className="w-6 h-6 text-gray-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Опыт работы
                </h3>
                <div className="p-6 space-y-4">
                  {/* Если режим редактирования, выводим сводную информацию */}
                  {mode === 'edit' && (
                    <AnimatedComponent duration={400} className="w-full">
                      <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <p className="text-md font-medium">
                          Всего записей об опыте работы:{' '}
                          <span className="font-bold">{fields.length}</span>
                        </p>
                        <p className="text-md font-medium">
                          Общее время работы: <span className="font-bold">{totalDurationText}</span>
                        </p>
                      </div>
                    </AnimatedComponent>
                  )}

                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <AnimatedComponent key={field.id} duration={500}>
                        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Название компании */}
                            <div className="col-span-1">
                              <Controller
                                name={`driverProfile.driverExperience.${index}.companyName`}
                                control={control}
                                defaultValue={field.companyName || ''}
                                rules={{ required: 'Название компании обязательно' }}
                                render={({ field: { value, onChange }, fieldState }) => (
                                  <TextInput
                                    label="Название компании"
                                    placeholder="Введите название компании"
                                    type="text"
                                    value={value as string}
                                    onChange={(newValue) => onChange(newValue)}
                                    required={true}
                                    error={!!fieldState.error}
                                    message={fieldState.error?.message || ''}
                                  />
                                )}
                              />
                            </div>

                            {/* Должность */}
                            <div className="col-span-1">
                              <Controller
                                name={`driverProfile.driverExperience.${index}.position`}
                                control={control}
                                defaultValue={field.position || ''}
                                rules={{ required: 'Должность обязательна' }}
                                render={({ field: { value, onChange }, fieldState }) => (
                                  <TextInput
                                    label="Должность"
                                    placeholder="Введите должность"
                                    type="text"
                                    value={value as string}
                                    onChange={(newValue) => onChange(newValue)}
                                    required={true}
                                    error={!!fieldState.error}
                                    message={fieldState.error?.message || ''}
                                  />
                                )}
                              />
                            </div>

                            {/* Дата начала работы */}
                            <div className="col-span-1">
                              <Controller
                                name={`driverProfile.driverExperience.${index}.from`}
                                control={control}
                                rules={{ required: 'Дата начала работы обязательна' }}
                                render={({ field: { value, onChange }, fieldState }) => {
                                  const dateValue =
                                    value instanceof Date
                                      ? value.toISOString().split('T')[0]
                                      : typeof value === 'string'
                                        ? (value as string).split('T')[0]
                                        : '';
                                  return (
                                    <TextInput
                                      label="Дата начала работы"
                                      type="date"
                                      value={dateValue || ''}
                                      onChange={(newValue) => {
                                        onChange(new Date(newValue as string));
                                      }}
                                      required={true}
                                      error={!!fieldState.error}
                                      message={fieldState.error?.message || ''}
                                    />
                                  );
                                }}
                              />
                            </div>

                            {/* Дата окончания работы */}
                            <div className="col-span-1">
                              <Controller
                                name={`driverProfile.driverExperience.${index}.to`}
                                control={control}
                                rules={{ required: 'Дата окончания работы обязательна' }}
                                render={({ field: { value, onChange }, fieldState }) => {
                                  const dateValue =
                                    value instanceof Date
                                      ? value.toISOString().split('T')[0]
                                      : typeof value === 'string'
                                        ? (value as string).split('T')[0]
                                        : '';
                                  return (
                                    <TextInput
                                      label="Дата окончания работы"
                                      type="date"
                                      value={dateValue || ''}
                                      onChange={(newValue) => {
                                        onChange(new Date(newValue as string));
                                      }}
                                      required={true}
                                      error={!!fieldState.error}
                                      message={fieldState.error?.message || ''}
                                    />
                                  );
                                }}
                              />
                            </div>
                          </div>

                          {/* Кнопка удаления записи */}
                          <div className="flex justify-end pt-4">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Удалить опыт
                            </button>
                          </div>
                        </div>
                      </AnimatedComponent>
                    ))}

                    {/* Кнопка добавления записи */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          append({
                            uuid: uuidv4(),
                            companyName: '',
                            position: '',
                            from: new Date(),
                            to: new Date(),
                            driverProfileId: '',
                          })
                        }
                        className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Добавить опыт работы
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepFour;
