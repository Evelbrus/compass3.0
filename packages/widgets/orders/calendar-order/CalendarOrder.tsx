import React from 'react';
import DatePicker from 'react-datepicker';
import { useFormContext, Controller } from 'react-hook-form';
import { format } from 'date-fns';

const CalendarOrder: React.FC = () => {
  const { control, trigger, formState } = useFormContext();

  return (
    <div className="p-4">
      <Controller
        name="departureTime"
        control={control}
        rules={{ required: 'Выберите время отправления' }}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="block text-5 leading-5 font-bold">
                Когда?
                {fieldState.error && (
                  <span className="text-red-500 text-sm ml-2"> (Заполните дату!)</span>
                )}
              </h1>
              <span>
                {field.value ? format(new Date(field.value), 'dd MMMM yyyy HH:mm') : 'Не выбрано'}
              </span>
            </div>
            <div
              className={`rounded-md overflow-hidden ${fieldState.error ? 'border border-red-500' : ''}`}
            >
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  field.onChange(date?.toISOString() || null);
                  trigger('departureTime');
                }}
                dateFormat={'yyyy-MM-dd HH:mm'}
                timeIntervals={5}
                timeCaption="Время"
                inline
                showTimeSelect={true}
                timeFormat="HH:mm"
                className="w-full" //Ensure the datepicker takes up the full width
              />
            </div>
            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default CalendarOrder;
