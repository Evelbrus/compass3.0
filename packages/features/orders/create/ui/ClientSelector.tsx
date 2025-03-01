import React, { FC, useState, useEffect, useRef } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PhoneInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
import { Client } from '@features/orders/create/types/types';

// Тип для стилей полей
type FieldStyle = {
  bgColor: string;
  textGradient: string;
  borderColor: string;
  shadowColor: string;
  textColor: string;
  icon: string;
  name: string;
};

interface ClientSelectorProps {
  control: Control<FormOrderValues>;
  clients: Client[] | null;
  selectedClientInfo: Client | null;
  savedClientInfo: Client | null;
  searchClient: string;
  handleSearchChange: (valueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => void;
  handleClientSelection: (client: Client | null) => void;
  loadMore: () => void;
  total: number;
  initialClient: Client | undefined;
}

const FIELD_STYLES = {
  client: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-700 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'C',
    name: 'Клиент (выбор из базы)',
  },
  phone: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Т',
    name: 'Телефон клиента',
  },
  fullName: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Ф',
    name: 'ФИО клиента',
  },
  flight: {
    bgColor: '',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: '✈️',
    name: 'Номер рейса',
  },
  description: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'О',
    name: 'Описание',
  },
  hours: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Ч',
    name: 'Часы',
  },
  minutes: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'М',
    name: 'Минуты',
  },
} as const; // Используем `as const`, чтобы ключи были строго типизированы

// Указываем, что FieldHeader принимает только существующие ключи из FIELD_STYLES
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

// Аналогично для TimeSlider
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

export const ClientSelector: FC<ClientSelectorProps> = ({
  control,
  clients,
  selectedClientInfo,
  savedClientInfo,
  searchClient,
  handleSearchChange,
  handleClientSelection,
  loadMore,
  total,
  initialClient,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleClientMode = () => {
    const newMode = !isNewClientMode;

    if (newMode) {
      handleClientSelection(null);
    } else {
      if (savedClientInfo) {
        handleClientSelection(savedClientInfo);
      }
    }

    setIsNewClientMode(newMode);
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
      <div className="relative w-full rounded-lg p-6 bg-white-1 border ">
        <div className="flex flex-row justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
            Данные клиента
            <div className="h-1 w-[500px] bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
          </h3>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 ${
              isNewClientMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
            onClick={handleToggleClientMode}
          >
            {isNewClientMode ? 'Выбрать существующего' : 'Указать нового клиента'}
          </button>
        </div>

        <div className="space-y-6">
          {isNewClientMode ? (
            <div className="flex flex-row gap-6">
              <Controller
                name="fullName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="flex-1">
                    <FieldHeader style={FIELD_STYLES.fullName} />
                    <input
                      type="text"
                      {...field}
                      placeholder="Введите ФИО клиента"
                      className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                    />
                  </div>
                )}
              />
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="flex-1">
                    <FieldHeader style={FIELD_STYLES.phone} />
                    <PhoneInput
                      value={field.value || ''}
                      onChange={(value) => field.onChange(value)}
                      label=""
                      required={false}
                      error={false}
                      disabled={false}
                      readOnly={false}
                    />
                  </div>
                )}
              />
            </div>
          ) : (
            <Controller
              name="createdBy"
              control={control}
              rules={{ required: !isNewClientMode ? 'Выберите клиента' : undefined }}
              render={({ field, fieldState }) => {
                return (
                  <div className="relative space-y-6" ref={selectorRef}>
                    <div className={'flex flex-row justify-between gap-6'}>
                      <div className="relative w-full">
                        <FieldHeader style={FIELD_STYLES.client} />
                        <div className={'relative'}>
                          <input
                            value={selectedClientInfo?.fullName || initialClient?.fullName || ''}
                            onClick={() => {
                              setIsOpen(true);
                              handleSearchChange('');
                            }}
                            onChange={handleSearchChange}
                            readOnly={!isOpen}
                            placeholder="Выберите клиента..."
                            className={cn(
                              'w-full p-3 border-2 rounded-md cursor-pointer shadow-sm bg-white',
                              FIELD_STYLES.client.borderColor,
                              FIELD_STYLES.client.shadowColor,
                              fieldState.error ? 'border-red-500' : '',
                            )}
                          />
                          {selectedClientInfo && (
                            <button
                              type="button"
                              onClick={() => handleClientSelection(null)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition duration-200 hover:shadow-md"
                              aria-label="Очистить"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}

                        {isOpen && (
                          <div
                            className={cn(
                              'absolute left-0 right-0 mt-4 bg-white border-2 rounded-lg shadow-lg max-h-[250px] overflow-y-auto',
                              FIELD_STYLES.client.borderColor,
                            )}
                          >
                            <div className="sticky top-0 bg-white p-3 border-b">
                              <input
                                type="text"
                                autoFocus
                                value={searchClient}
                                onChange={handleSearchChange}
                                placeholder="Поиск клиента..."
                                className="p-2 w-full border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div>
                              {clients && clients.length > 0 ? (
                                <>
                                  {clients.map((client) => (
                                    <div
                                      key={client.uuid}
                                      onClick={() => {
                                        handleClientSelection(client);
                                        setIsOpen(false);
                                      }}
                                      className={cn(
                                        'p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition duration-150',
                                      )}
                                    >
                                      <span>
                                        {client.fullName} ({client.phone})
                                      </span>
                                    </div>
                                  ))}
                                  {clients.length < total && (
                                    <div
                                      onClick={loadMore}
                                      className="p-3 text-center text-cyan-600 cursor-pointer hover:bg-cyan-50 transition-all"
                                    >
                                      Загрузить ещё
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  <svg
                                    className="w-6 h-6 text-gray-400 mx-auto mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Клиенты не найдены
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Controller
                        name="phone"
                        control={control}
                        key={`phone-${selectedClientInfo?.uuid || savedClientInfo?.uuid || 'default'}`}
                        defaultValue={(selectedClientInfo || savedClientInfo)?.phone || ''}
                        render={({ field }) => {
                          return (
                            <div className="relative w-full">
                              <FieldHeader style={FIELD_STYLES.phone} />
                              <PhoneInput
                                value={field.value || ''}
                                onChange={(value) => {
                                  field.onChange(value);
                                }}
                                label=""
                                required={false}
                                error={false}
                                disabled={false}
                                readOnly={!!selectedClientInfo}
                                classNameLabel={'p-4'}
                              />
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            />
          )}

          <div className={'w-1/2 flex flex-col gap-4'}>
            <div className="w-full flex flex-row gap-6 items-stretch">
              <Controller
                name="flightNumber"
                control={control}
                render={({ field }) => {
                  const value =
                    typeof field.value === 'object' && field.value !== null
                      ? field.value.flightNumber || ''
                      : field.value || '';
                  return (
                    <div className="w-full">
                      <FieldHeader style={FIELD_STYLES.flight} />
                      <input
                        type="text"
                        placeholder="Введите номер рейса"
                        className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                        value={value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </div>
                  );
                }}
              />
            </div>

            <div className="w-full flex flex-row gap-6 items-stretch">
              <Controller
                name="description"
                control={control}
                render={({ field }) => {
                  const value =
                    typeof field.value === 'object' && field.value !== null
                      ? field.value.description || ''
                      : field.value || '';
                  return (
                    <div className="w-full">
                      <FieldHeader style={FIELD_STYLES.description} />
                      <textarea
                        placeholder="Введите описание заказа"
                        className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 resize-none h-24"
                        value={value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full flex flex-col justify-around rounded-lg p-6 bg-white border">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700 mb-6 pb-3 border-b border-gray-200">
          Дата и время отправления
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>

        <Controller
          name="departureTime"
          control={control}
          render={({ field }) => {
            const [selectedDate, setSelectedDate] = useState<Date | null>(
              field.value instanceof Date ? field.value : null,
            );
            const [currentMonth, setCurrentMonth] = useState(new Date());
            const [selectedHours, setSelectedHours] = useState(
              selectedDate ? selectedDate.getHours() : new Date().getHours(),
            );
            const [selectedMinutes, setSelectedMinutes] = useState(
              selectedDate ? selectedDate.getMinutes() : 0,
            );

            const daysInMonth = (date: Date) => {
              return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            };

            const firstDayOfMonth = (date: Date) => {
              return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
            };

            const handleDayClick = (day: number) => {
              const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              newDate.setHours(selectedHours);
              newDate.setMinutes(selectedMinutes);
              setSelectedDate(newDate);
              field.onChange(newDate);
            };

            const handleHoursChange = (hours: number) => {
              setSelectedHours(hours);
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                newDate.setHours(hours);
                setSelectedDate(newDate);
                field.onChange(newDate);
              }
            };

            const handleMinutesChange = (minutes: number) => {
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
                  {Array(
                    firstDayOfMonth(currentMonth) === 0 ? 6 : firstDayOfMonth(currentMonth) - 1,
                  )
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                  {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer mx-auto transition-all ${
                        selectedDate &&
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
                        min={0}
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
                        min={0}
                        max={59}
                        label="Минуты"
                        unit="мин"
                        style={FIELD_STYLES.minutes}
                      />
                    </div>

                    <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                      <div className="text-center text-gray-700 font-medium">
                        {formatFullSelectedDate(selectedDate instanceof Date ? selectedDate : null)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
