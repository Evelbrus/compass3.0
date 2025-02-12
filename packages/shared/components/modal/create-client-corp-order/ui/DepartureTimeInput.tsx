import React, { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';

interface DepartureTimeInputProps {
  control: Control<CreateClientCorpOrderData>;
}

const DepartureTimeInput: React.FC<DepartureTimeInputProps> = ({ control }) => {
  const name = 'departureTime';
  const [value, setValue] = useState<string>('');
  const [minDateTime, setMinDateTime] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const updateMinDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      let minutes = now.getMinutes();

      //Находим ближайшую "разрешенную" минуту
      if (minutes % 5 !== 0) {
        minutes = minutes + (5 - (minutes % 5));
      }

      //Если ближайшая разрешенная минута уже в следующем часе, переходим к следующему часу
      if (minutes >= 60) {
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        minutes = 0;

        const nextHourYear = now.getFullYear();
        const nextHourMonth = String(now.getMonth() + 1).padStart(2, '0');
        const nextHourDay = String(now.getDate()).padStart(2, '0');
        const nextHour = String(now.getHours()).padStart(2, '0');

        setMinDateTime(
          `${nextHourYear}-${nextHourMonth}-${nextHourDay}T${nextHour}:${String(minutes).padStart(2, '0')}`,
        );
        return;
      }

      setMinDateTime(`${year}-${month}-${day}T${hours}:${String(minutes).padStart(2, '0')}`);
    };

    updateMinDateTime();

    const intervalId = setInterval(updateMinDateTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value);

      //Форматирование даты
      setFormattedDate(
        `${date.getDate()} ${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)} (${new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date)}) ${date.getFullYear()} г.`,
      );

      //Форматирование времени с обновленной логикой определения периода
      const hours = date.getHours();
      const minutes = date.getMinutes();
      let period = '';

      if (hours < 6) {
        period = 'ночь';
      } else if (hours < 12) {
        period = 'утро';
      } else if (hours < 18) {
        period = 'день';
      } else {
        period = 'вечер';
      }

      const formattedTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} (${period})`;
      setFormattedTime(formattedTimeStr);
    } else {
      setFormattedDate('');
      setFormattedTime('');
    }
  }, [value]);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        Выберите дату и время отъезда
      </label>
      <div className="mt-1">
        <Controller
          name={name}
          control={control}
          rules={{ required: 'Выберите дату' }}
          render={({ field, fieldState }) => (
            <>
              <input
                type="datetime-local"
                id={name}
                className="w-full p-2 border-2 rounded-md"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  field.onChange(e.target.value);
                }}
                min={minDateTime}
              />
              {fieldState.error && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>
      <div>
        <p className="mt-2 text-sm">
          <span className="font-bold">Отправление: </span>
          {formattedDate}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-bold">Время: </span>
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default DepartureTimeInput;
