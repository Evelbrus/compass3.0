import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

const DriverFormStepFive: React.FC = () => {
  const { control, clearErrors } = useFormContext<userFormData>();

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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Банковские данные
                </h3>
                <div className="p-6 space-y-4">
                  <AnimatedComponent duration={500}>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Название банка */}
                      <div className="col-span-1">
                        <Controller
                          name="driverProfile.bankName"
                          control={control}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Название банка"
                              placeholder="Введите название банка"
                              type="text"
                              value={field.value ?? ''}
                              onChange={(newValue) => {
                                clearErrors('driverProfile.bankName');
                                field.onChange(newValue);
                              }}
                              onFocus={() => clearErrors('driverProfile.bankName')}
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>

                      {/* Номер счёта */}
                      <div className="col-span-1">
                        <Controller
                          name="driverProfile.bankAccountNumber"
                          control={control}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Номер счёта"
                              placeholder="Введите номер счёта"
                              type="number"
                              value={field.value ?? ''}
                              onChange={(newValue) => {
                                clearErrors('driverProfile.bankAccountNumber');
                                field.onChange(newValue);
                              }}
                              onFocus={() => clearErrors('driverProfile.bankAccountNumber')}
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AnimatedComponent>

                  <AnimatedComponent duration={600}>
                    <div className="grid grid-cols-2 gap-4">
                      {/* BIC банка */}
                      <div className="col-span-1">
                        <Controller
                          name="driverProfile.bankBic"
                          control={control}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="BIC банка"
                              placeholder="Введите BIC банка"
                              type="text"
                              value={field.value ?? ''}
                              onChange={(newValue) => {
                                clearErrors('driverProfile.bankBic');
                                field.onChange(newValue);
                              }}
                              onFocus={() => clearErrors('driverProfile.bankBic')}
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>

                      {/* Номер карты */}
                      <div className="col-span-1">
                        <Controller
                          name="driverProfile.cardNumber"
                          control={control}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Номер карты"
                              placeholder="Введите номер карты"
                              type="number"
                              value={field.value ?? ''}
                              onChange={(newValue) => {
                                clearErrors('driverProfile.cardNumber');
                                field.onChange(newValue);
                              }}
                              onFocus={() => clearErrors('driverProfile.cardNumber')}
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AnimatedComponent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepFive;