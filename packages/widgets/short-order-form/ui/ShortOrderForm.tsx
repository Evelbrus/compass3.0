'use client';

import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DateInput } from '@shared/components/ui/inputs';
import { Select } from '@shared/components/ui/inputs/select';
import { IButton } from '@shared/components/ui/buttons';
import {
  ExtendedShortOrderFormProps,
  locationOptions,
  tariffs,
  useHandlers,
} from '@widgets/short-order-form';
import { getTariffIcon } from '@widgets/short-order-form/utils/getTariffIcon';
import { useRouter } from 'next/navigation';
import { privateRoutes } from '@shared/utils/routing';
import { showToast } from '@shared/components/toast/ToastManager';
import { filterLocationOptions } from '@shared/components/filter';
import { InputsState } from '@shared/lib/effector/order';
import { OptionTariff, isOptionTariff, SelectOption } from '@shared/lib/effector';

const ShortOrderForm: React.FC<ExtendedShortOrderFormProps> = ({
  lang,
  isAuthenticated,
  enableFromWhere = false,
  enableToWhere = false,
  enableDate = false,
  enableTariff = false,
  showButton = false,
}) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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
    },
  });

  const { handleSubmit: customHandleSubmit } = useHandlers();

  // Наблюдаем за значениями fromWhere и toWhere для фильтрации опций
  const fromWhereValue = watch('fromWhere');
  const toWhereValue = watch('toWhere');

  // Фильтрация опций на основе других полей
  const filteredLocationOptionsForFromWhere = filterLocationOptions(locationOptions, toWhereValue);
  const filteredLocationOptionsForToWhere = filterLocationOptions(locationOptions, fromWhereValue);

  const onSubmit = async (data: InputsState) => {
    try {
      customHandleSubmit(data);
      showToast.info('Подготавливаем заказ');
      router.push(privateRoutes.ORDERCREATE);
    } catch (error) {
      console.error('Ошибка при подготовке заказа:', error);
      showToast.error('Не удалось подготовить заказ. Пожалуйста, попробуйте снова.');
    }
  };

  // Сброс значений полей, которые отключены
  useEffect(() => {
    const updatedValues: Partial<InputsState> = {};

    if (!enableFromWhere) {
      updatedValues.fromWhere = null;
    }
    if (!enableToWhere) {
      updatedValues.toWhere = null;
    }
    if (!enableDate) {
      updatedValues.date = null;
    }
    if (!enableTariff) {
      updatedValues.tariff = null;
    }

    if (Object.keys(updatedValues).length > 0) {
      reset(updatedValues, { keepErrors: true, keepDirty: false });
    }
  }, [enableFromWhere, enableToWhere, enableDate, enableTariff, reset]);

  // Обработчик кликов вне формы для сброса ошибок валидации
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        clearErrors(); // Сбрасываем ошибки валидации
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearErrors]);

  return (
    <form
      ref={formRef} // Присваиваем ссылку форме
      onSubmit={rhfHandleSubmit(onSubmit)}
      className="flex flex-row flex-nowrap items-center w-full bg-white rounded-lg shadow-md"
    >
      {enableFromWhere && (
        <>
          <div className="flex-1 h-16 flex items-center">
            <Controller
              name="fromWhere"
              control={control}
              rules={{ required: enableFromWhere }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Откуда"
                  options={filteredLocationOptionsForFromWhere}
                  value={
                    field.value
                      ? locationOptions.find((option) => option.value === field.value) || null
                      : null
                  }
                  onChange={(val) => {
                    const value = val?.value ?? null;
                    field.onChange(value);
                  }}
                  className="flex flex-1 h-16 text-gray-900 text-center cursor-pointer rounded-l-lg"
                  classNameBorderRadius="rounded-l-lg"
                  classNamePlaceholder="w-full text-center"
                  classNameTagUl="top-20 text-start"
                  classNameTagLi="pl-6 grid text-[14px] font-medium"
                  hideArrow={true}
                  errorBorder={!!errors.fromWhere}
                />
              )}
            />
          </div>

          <div className="h-16 w-px bg-gray-300" />
        </>
      )}

      {enableToWhere && (
        <>
          <div className="flex-1 h-16 flex items-center">
            <Controller
              name="toWhere"
              control={control}
              rules={{ required: enableToWhere }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Куда"
                  options={filteredLocationOptionsForToWhere}
                  value={
                    field.value
                      ? locationOptions.find((option) => option.value === field.value) || null
                      : null
                  }
                  onChange={(val) => {
                    const value = val?.value ?? null;
                    field.onChange(value);
                  }}
                  className={`flex flex-1 h-16 text-gray-900 text-center cursor-pointer ${
                    enableFromWhere ? '' : 'rounded-l-lg'
                  }`}
                  classNamePlaceholder="w-full text-center"
                  classNameTagUl="top-20 text-start"
                  classNameTagLi="pl-6 text-[14px] font-medium"
                  hideArrow={true}
                  errorBorder={!!errors.toWhere}
                />
              )}
            />
          </div>

          <div className="h-16 w-px bg-gray-300" />
        </>
      )}

      {enableDate && (
        <>
          <Controller
            name="date"
            control={control}
            rules={{ required: enableDate }}
            render={({ field }) => (
              <DateInput
                selectedDate={field.value}
                onChange={field.onChange}
                placeholder="Когда"
                className="flex flex-1 items-center justify-center h-16 text-center cursor-pointer"
                lang={lang}
                minDate={new Date()}
                errorBorder={!!errors.date}
              />
            )}
          />

          <div className="h-16 w-px bg-gray-300" />
        </>
      )}

      {enableTariff && (
        <>
          <div className="flex-[2] h-16 flex items-center">
            <Controller
              name="tariff"
              control={control}
              rules={{ required: enableTariff }}
              render={({ field }) => {
                const selectedTariff = field.value
                  ? tariffs.find((t) => t.value === field.value?.value) || null
                  : null;

                return (
                  <Select
                    {...field}
                    placeholder="Выберите класс"
                    options={tariffs} // tariffs должен быть массивом OptionTariff<string>
                    value={selectedTariff}
                    onChange={(val: SelectOption<string> | null) => {
                      if (val && isOptionTariff(val)) {
                        const transformed: OptionTariff<string> = {
                          value: val.value,
                          label: val.label,
                          maxPeople: val.maxPeople, // Сохраняем поле maxPeople
                          price: val.price, // Если требуется
                        };
                        field.onChange(transformed);
                      } else {
                        field.onChange(null);
                      }
                    }}
                    counter={true}
                    className="flex flex-[2] h-16 text-gray-900 text-center cursor-pointer"
                    classNamePlaceholder="w-full text-center"
                    classNameTagUl="top-20 text-start"
                    classNameTagLi="pl-6 grid grid-cols-[auto,1fr,auto]"
                    hideArrow={true}
                    getIcon={getTariffIcon}
                    errorBorder={!!errors.tariff}
                  />
                );
              }}
            />
          </div>
        </>
      )}
      {showButton && (
        <>
          <IButton
            type="submit"
            className="flex-1 h-16 p-4 rounded-lg border-none bg-[color:var(--button-secondary)]
                  text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="justify-center"
          >
            Создать заказ
          </IButton>
        </>
      )}
    </form>
  );
};

export default ShortOrderForm;
