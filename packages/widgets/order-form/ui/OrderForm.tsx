'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useUnit } from 'effector-react';
import { Select } from '@shared/components/ui/inputs/select';
import { locationOptions, ExtendedShortOrderFormProps } from '@widgets/short-order-form';
import { DateInput } from '@shared/components/ui/inputs';
import { IButton } from '@shared/components/ui/buttons';
import { filterLocationOptions } from '@shared/components/filter';

// Типизация состояния формы
type InputsState = {
  fromWhere: string | null;
  toWhere: string | null;
  date: Date | null;
  tariff: string | null;
  driver: string | null;
  individual: boolean | null;
};

const OrderForm: React.FC<ExtendedShortOrderFormProps> = ({
  lang,
  isAuthenticated,
  enableFromWhere = true,
  enableToWhere = true,
  enableDate = true,
  enableTariff = true,
  enableDriver = true,
  enableIndividual = true,
  showButton = false,
  drivers = [],
}) => {
  const {
    formState: { errors },
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    clearErrors,
    watch,
  } = useForm<InputsState>({
    defaultValues: {
      fromWhere: null,
      toWhere: null,
      date: null,
      tariff: null,
      driver: null,
      individual: null,
    },
  });

  // Наблюдаем за изменениями значений
  const fromWhereValue = watch('fromWhere');
  const toWhereValue = watch('toWhere');

  // Фильтрация опций для Select
  const filteredLocationOptionsForFromWhere = useMemo(
    () => filterLocationOptions(locationOptions, toWhereValue),
    [locationOptions, toWhereValue],
  );
  const filteredLocationOptionsForToWhere = useMemo(
    () => filterLocationOptions(locationOptions, fromWhereValue),
    [locationOptions, fromWhereValue],
  );

  const driversOptions = useMemo(
    () =>
      drivers.map((driver) => ({
        value: driver.id?.toString() || '',
        label: `${driver.firstName} ${driver.lastName}`,
      })),
    [drivers],
  );

  const individualOptions = useMemo(
    () => [
      { value: 'true', label: 'Физическое лицо' },
      { value: 'false', label: 'Юридическое лицо' },
    ],
    [],
  );

  // Сброс отключенных полей
  useEffect(() => {
    const updatedValues: Partial<InputsState> = {};

    if (!enableFromWhere) updatedValues.fromWhere = null;
    if (!enableToWhere) updatedValues.toWhere = null;
    if (!enableDate) updatedValues.date = null;
    if (!enableTariff) updatedValues.tariff = null;
    if (!enableDriver) updatedValues.driver = null;
    if (!enableIndividual) updatedValues.individual = null;

    if (Object.keys(updatedValues).length > 0) {
      reset(updatedValues, { keepErrors: true, keepDirty: false });
    }
  }, [
    enableFromWhere,
    enableToWhere,
    enableDate,
    enableTariff,
    enableDriver,
    enableIndividual,
    reset,
  ]);

  // Обработчик отправки формы
  const onSubmit = (data: InputsState) => {
    // Дополнительная логика отправки данных
  };

  // Обработчик кликов вне формы для сброса ошибок
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        clearErrors();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearErrors]);

  return (
    <form
      ref={formRef}
      onSubmit={rhfHandleSubmit(onSubmit)}
      className="flex flex-wrap items-center w-full bg-white rounded-lg shadow-md mt-12"
    >
      {enableFromWhere && (
        <div className="flex-1 h-16 flex items-center relative">
          <Controller
            name="fromWhere"
            control={control}
            rules={{ required: enableFromWhere }}
            render={({ field }) => (
              <Select
                {...field}
                label="Откуда?"
                placeholder="Откуда"
                options={filteredLocationOptionsForFromWhere}
                value={
                  filteredLocationOptionsForFromWhere.find((opt) => opt.value === field.value) ||
                  null
                }
                onChange={(val) => field.onChange(val?.value || null)}
                className="flex flex-1 h-16 text-gray-900 text-center cursor-pointer"
                errorBorder={!!errors.fromWhere}
              />
            )}
          />
        </div>
      )}

      {enableToWhere && (
        <div className="flex-1 h-16 flex items-center relative">
          <Controller
            name="toWhere"
            control={control}
            rules={{ required: enableToWhere }}
            render={({ field }) => (
              <Select
                {...field}
                label="Куда?"
                placeholder="Куда"
                options={filteredLocationOptionsForToWhere}
                value={
                  filteredLocationOptionsForToWhere.find((opt) => opt.value === field.value) || null
                }
                onChange={(val) => field.onChange(val?.value || null)}
                className="flex flex-1 h-16 text-gray-900 text-center cursor-pointer"
                errorBorder={!!errors.toWhere}
              />
            )}
          />
        </div>
      )}

      {enableDate && (
        <div className="flex-1 h-16 flex items-center relative">
          <Controller
            name="date"
            control={control}
            rules={{ required: enableDate }}
            render={({ field }) => (
              <DateInput
                selectedDate={field.value}
                onChange={(date) => field.onChange(date)}
                label="Когда?"
                placeholder="Когда"
                className="flex flex-1 items-center justify-center h-16 text-center cursor-pointer"
                lang={lang}
                minDate={new Date()}
                errorBorder={!!errors.date}
              />
            )}
          />
        </div>
      )}

      {enableDriver && (
        <div className="flex-1 h-16 flex items-center relative">
          <Controller
            name="driver"
            control={control}
            rules={{ required: enableDriver }}
            render={({ field }) => (
              <Select
                {...field}
                label="Водитель"
                placeholder="Водитель"
                options={driversOptions}
                value={driversOptions.find((opt) => opt.value === field.value) || null}
                onChange={(val) => field.onChange(val?.value || null)}
                className="flex flex-1 h-16 text-gray-900 text-center cursor-pointer"
                errorBorder={!!errors.driver}
              />
            )}
          />
        </div>
      )}

      {enableIndividual && (
        <div className="flex-1 h-16 flex items-center relative">
          <Controller
            name="individual"
            control={control}
            rules={{ required: enableIndividual }}
            render={({ field }) => (
              <Select
                {...field}
                label="Тип клиента"
                placeholder="Тип клиента"
                options={individualOptions}
                value={individualOptions.find((opt) => opt.value === String(field.value)) || null}
                onChange={(val) => field.onChange(val?.value === 'true')}
                className="flex flex-1 h-16 text-gray-900 text-center cursor-pointer"
                errorBorder={!!errors.individual}
              />
            )}
          />
        </div>
      )}

      {showButton && (
        <IButton
          type="submit"
          className="flex-1 h-16 p-4 rounded-lg bg-[color:var(--button-secondary)] text-white font-semibold hover:bg-[color:var(--button-secondary-hover)]"
        >
          Создать заказ
        </IButton>
      )}
    </form>
  );
};

export default OrderForm;
