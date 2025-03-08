import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface TariffParametersProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFreeWaitTimeChange: (value: string | number | null) => number;
}

const TariffParameters: React.FC<TariffParametersProps> = ({
  handleInputChange,
  handleFreeWaitTimeChange,
}) => {
  const { control, clearErrors } = useFormContext();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
              Тарифные параметры
            </h3>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Поле "Бесплатное время вне аэропорта" */}
                <Controller
                  name="freeWaitTimeBishkek"
                  control={control}
                  rules={{ required: 'Поле обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      type="number"
                      label="Бесплатное время вне аэропорта (мин)"
                      placeholder="Введите время в минутах"
                      value={field.value}
                      onChange={(e) => {
                        // Проверяем, что e не null
                        if (e !== null) {
                          const value = handleFreeWaitTimeChange(e);
                          field.onChange(value);

                          // Создаем синтетическое событие React
                          const syntheticEvent = {
                            target: {
                              id: 'freeWaitTimeBishkek',
                              value: value.toString(),
                              type: 'number',
                            },
                          } as React.ChangeEvent<HTMLInputElement>;

                          handleInputChange(syntheticEvent);
                          clearErrors('freeWaitTimeBishkek');
                        }
                      }}
                      onFocus={() => clearErrors('freeWaitTimeBishkek')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Цена за минуту вне аэропорта" */}
                <Controller
                  name="pricePerMinuteAfterBishkek"
                  control={control}
                  rules={{ required: 'Поле обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      type="number"
                      label="Цена за минуту вне аэропорта"
                      placeholder="Введите стоимость за минуту"
                      value={field.value}
                      onChange={(e) => {
                        // Проверяем, что e не null
                        if (e !== null) {
                          field.onChange(e);

                          // Создаем синтетическое событие React
                          const syntheticEvent = {
                            target: {
                              id: 'pricePerMinuteAfterBishkek',
                              value: e.toString(),
                              type: 'number',
                            },
                          } as React.ChangeEvent<HTMLInputElement>;

                          handleInputChange(syntheticEvent);
                          clearErrors('pricePerMinuteAfterBishkek');
                        }
                      }}
                      onFocus={() => clearErrors('pricePerMinuteAfterBishkek')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Бесплатное время в аэропорту" */}
                <Controller
                  name="freeWaitTimeAirport"
                  control={control}
                  rules={{ required: 'Поле обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      type="number"
                      label="Бесплатное время в аэропорту (мин)"
                      placeholder="Введите время в минутах"
                      value={field.value}
                      onChange={(e) => {
                        // Проверяем, что e не null
                        if (e !== null) {
                          const value = handleFreeWaitTimeChange(e);
                          field.onChange(value);

                          // Создаем синтетическое событие React
                          const syntheticEvent = {
                            target: {
                              id: 'freeWaitTimeAirport',
                              value: value.toString(),
                              type: 'number',
                            },
                          } as React.ChangeEvent<HTMLInputElement>;

                          handleInputChange(syntheticEvent);
                          clearErrors('freeWaitTimeAirport');
                        }
                      }}
                      onFocus={() => clearErrors('freeWaitTimeAirport')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Цена за минуту в аэропорту" */}
                <Controller
                  name="pricePerMinuteAfterAirport"
                  control={control}
                  rules={{ required: 'Поле обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      type="number"
                      label="Цена за минуту в аэропорту"
                      placeholder="Введите стоимость за минуту"
                      value={field.value}
                      onChange={(e) => {
                        // Проверяем, что e не null
                        if (e !== null) {
                          field.onChange(e);

                          // Создаем синтетическое событие React
                          const syntheticEvent = {
                            target: {
                              id: 'pricePerMinuteAfterAirport',
                              value: e.toString(),
                              type: 'number',
                            },
                          } as React.ChangeEvent<HTMLInputElement>;

                          handleInputChange(syntheticEvent);
                          clearErrors('pricePerMinuteAfterAirport');
                        }
                      }}
                      onFocus={() => clearErrors('pricePerMinuteAfterAirport')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default TariffParameters;
