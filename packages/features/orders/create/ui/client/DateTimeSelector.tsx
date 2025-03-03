import React, { FC, useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { FIELD_STYLES, FieldStyle } from '@features/orders/create/ui/client/field-styles';

interface DateTimeSelectorProps {
  control: Control<FormOrderValues>;
}

// Заголовок поля
const FieldHeader: FC<{ style: FieldStyle }> = ({ style }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${style.bgColor} ${style.textColor} font-bold shadow-md`}
    >
      {style.icon}
    </div>
    <div className={`font-semibold text-transparent bg-clip-text ${style.textGradient}`}>
      {style.name}
    </div>
  </div>
);

// Компонент слайдера времени
const TimeSlider: FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  unit: string;
  style: FieldStyle;
}> = ({ value, onChange, min, max, label, unit }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="font-medium text-cyan-600">
          {value} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #3b82f6 ${((value - min) * 100) / (max - min)}%, #e5e7eb ${((value - min) * 100) / (max - min)}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const tickValue = Math.round(min + (i * (max - min)) / 4);
            return <span key={i}>{tickValue}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export const DateTimeSelector: FC<DateTimeSelectorProps> = ({ control }) => {
  const formatFullSelectedDate = (date: Date | null) => {
    if (!date) return 'Не выбрано';
    return date.toLocaleString('ru', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative w-full flex flex-col justify-around rounded-lg p-6 bg-white border">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700 mb-6 pb-3 border-b border-gray-200">
        Дата и время отправления
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
      </h3>

      <Controller
        name="departureTime"
        control={control}
        render={({ field }) => {
          const currentDate = new Date();
          const [selectedDate, setSelectedDate] = useState<Date | null>(
            field.value instanceof Date ? field.value : currentDate,
          );
          const [currentMonth, setCurrentMonth] = useState(
            field.value instanceof Date ? field.value : currentDate,
          );
          const [selectedHours, setSelectedHours] = useState(
            selectedDate ? selectedDate.getHours() : currentDate.getHours(),
          );
          const [selectedMinutes, setSelectedMinutes] = useState(
            selectedDate ? selectedDate.getMinutes() : currentDate.getMinutes(),
          );

          // Устанавливаем начальное значение только при монтировании
          useEffect(() => {
            if (!(field.value instanceof Date)) {
              field.onChange(currentDate);
            }
          }, []); // Пустой массив зависимостей

          // Проверка, является ли день в прошлом
          const isPastDay = (day: number) => {
            const today = new Date();
            const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            return checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          };

          // Проверка, является ли выбранный день текущим
          const isToday = selectedDate && selectedDate.toDateString() === new Date().toDateString();

          // Установка минимальных значений для часов и минут
          const minHours = isToday ? new Date().getHours() : 0;
          const minMinutes =
            isToday && selectedHours <= new Date().getHours() ? new Date().getMinutes() : 0;

          const daysInMonth = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          };

          const firstDayOfMonth = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
          };

          const handleDayClick = (day: number) => {
            if (isPastDay(day)) return; // Запрещаем выбор прошедших дней

            const today = new Date();
            const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            newDate.setHours(selectedHours);
            newDate.setMinutes(selectedMinutes);

            // Корректируем время, если оно в прошлом для текущего дня
            if (newDate < today) {
              newDate.setHours(today.getHours());
              newDate.setMinutes(today.getMinutes());
              setSelectedHours(today.getHours());
              setSelectedMinutes(today.getMinutes());
            }

            setSelectedDate(newDate);
            field.onChange(newDate);
          };

          const handleHoursChange = (hours: number) => {
            if (isToday && hours < minHours) {
              hours = minHours; // Запрещаем выбор часов раньше текущих
            }
            setSelectedHours(hours);
            if (selectedDate) {
              const newDate = new Date(selectedDate);
              newDate.setHours(hours);
              setSelectedDate(newDate);
              field.onChange(newDate);
            }
          };

          const handleMinutesChange = (minutes: number) => {
            if (isToday && selectedHours === minHours && minutes < minMinutes) {
              minutes = minMinutes; // Запрещаем выбор минут раньше текущих
            }
            setSelectedMinutes(minutes);
            if (selectedDate) {
              const newDate = new Date(selectedDate);
              newDate.setMinutes(minutes);
              setSelectedDate(newDate);
              field.onChange(newDate);
            }
          };

          const prevMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
          };

          const nextMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
          };

          return (
            <div className="shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-full transition-transform transform hover:scale-110"
                  onClick={prevMonth}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-lg font-semibold text-cyan-700">
                  {currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-full transition-transform transform hover:scale-110"
                  onClick={nextMonth}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-cyan-700 font-medium">
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                <div>Вс</div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {Array(firstDayOfMonth(currentMonth) === 0 ? 6 : firstDayOfMonth(currentMonth) - 1)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer mx-auto transition-all ${
                      isPastDay(day)
                        ? 'text-gray-300 cursor-not-allowed'
                        : selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === currentMonth.getMonth() &&
                            selectedDate.getFullYear() === currentMonth.getFullYear()
                          ? 'bg-cyan-500 text-white'
                          : 'hover:bg-cyan-100 text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <FieldHeader style={FIELD_STYLES.hours} />
                    <TimeSlider
                      value={selectedHours}
                      onChange={handleHoursChange}
                      min={isToday ? minHours : 0}
                      max={23}
                      label="Часы"
                      unit="ч"
                      style={FIELD_STYLES.hours}
                    />
                  </div>

                  <div className="flex-1 mt-2">
                    <FieldHeader style={FIELD_STYLES.minutes} />
                    <TimeSlider
                      value={selectedMinutes}
                      onChange={handleMinutesChange}
                      min={isToday && selectedHours === minHours ? minMinutes : 0}
                      max={59}
                      label="Минуты"
                      unit="мин"
                      style={FIELD_STYLES.minutes}
                    />
                  </div>

                  <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                    <div className="text-center text-gray-700 font-medium">
                      {formatFullSelectedDate(selectedDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default DateTimeSelector;
