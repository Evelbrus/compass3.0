import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { TextInput } from '@shared/components/ui/inputs';

interface DriverFormStepFourProps {
  mode: 'create' | 'edit';
}

//Вспомогательная функция для вычисления разницы между датами (в миллисекундах)
const getDuration = (fromValue: Date, toValue: Date): number => {
  const from = new Date(fromValue);
  const to = new Date(toValue);
  if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && to > from) {
    return to.getTime() - from.getTime();
  }
  return 0;
};

//Функция для форматирования миллисекунд в годы, месяцы и дни
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
  const { control } = useFormContext<UserCard>();

  //Управление массивом driverExperience через useFieldArray
  const { fields, append, remove } = useFieldArray<UserCard, 'driverProfile.driverExperience'>({
    control,
    name: 'driverProfile.driverExperience',
  });

  //Рассчитываем общее время работы (суммарная длительность всех периодов)
  let totalDurationMs = 0;
  fields.forEach((field) => {
    totalDurationMs += getDuration(new Date(field.from), new Date(field.to));
  });
  const totalDurationText = formatDuration(totalDurationMs);

  return (
    <div className="flex flex-col p-6">
      <h3 className="text-lg font-semibold mb-4">Опыт работы</h3>

      {/*Если режим редактирования, выводим сводную информацию */}
      {mode === 'edit' && (
        <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
          <p className="text-md font-medium">
            Всего записей об опыте работы: <span className="font-bold">{fields.length}</span>
          </p>
          <p className="text-md font-medium">
            Общее время работы: <span className="font-bold">{totalDurationText}</span>
          </p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-4">
            {/*Название компании */}
            <Controller
              name={`driverProfile.driverExperience.${index}.companyName`}
              control={control}
              defaultValue={field.companyName || ''}
              rules={{ required: 'Название компании обязательно' }}
              render={({ field: { value, onChange }, fieldState }) => (
                <TextInput
                  label="Название компании:"
                  type="text"
                  value={value as string}
                  onChange={(newValue) => onChange(newValue)}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  placeholder="Введите название компании"
                />
              )}
            />

            {/*Должность */}
            <Controller
              name={`driverProfile.driverExperience.${index}.position`}
              control={control}
              defaultValue={field.position || ''}
              rules={{ required: 'Должность обязательна' }}
              render={({ field: { value, onChange }, fieldState }) => (
                <TextInput
                  label="Должность:"
                  type="text"
                  value={value as string}
                  onChange={(newValue) => onChange(newValue)}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  placeholder="Введите должность"
                />
              )}
            />

            {/*Дата начала работы */}
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
                    label="Дата начала работы:"
                    type="date"
                    value={dateValue}
                    onChange={(newValue) => {
                      onChange(new Date(newValue as string));
                    }}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                    placeholder="Выберите дату начала работы"
                  />
                );
              }}
            />

            {/*Дата окончания работы */}
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
                    label="Дата окончания работы:"
                    type="date"
                    value={dateValue}
                    onChange={(newValue) => {
                      onChange(new Date(newValue as string));
                    }}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                    placeholder="Выберите дату окончания работы"
                  />
                );
              }}
            />

            {/*Кнопка удаления записи */}
            <div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Удалить опыт
              </button>
            </div>
          </div>
        ))}
      </div>

      {/*Кнопка добавления записи */}
      <div className="mt-6">
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Добавить опыт
        </button>
      </div>
    </div>
  );
};

export default DriverFormStepFour;
