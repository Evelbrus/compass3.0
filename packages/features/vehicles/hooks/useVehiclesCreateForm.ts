'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { VehicleType, Color, ServiceLevels, Ownership, Vehicle } from '@prisma/client';
import { fetchDrivers, DriversResponse } from '../api/vehicles.api';

//Типизация формы с добавлением ownership
export interface VehicleData extends Omit<Vehicle, 'driverIds' | 'year'> {
  driverIds: string[];
  year: Date | null;
  photoRegistrationCertificate: string | null;
  ownership: Ownership | undefined;
}

interface PayloadVehicle extends Vehicle {}

/**Пропсы для инициализации хука */
interface UseClientsAdminFormProps {
  mode: 'create' | 'edit';
  vehicleData?: VehicleData;
}

export const useVehiclesForm = (mode, userData) => {
  const formMethods: UseFormReturn<VehicleData> = useForm<VehicleData>({
    mode: 'onSubmit',
    defaultValues: userData || {},
  });

  const { control, handleSubmit } = formMethods;
  const router = useRouter();

  const [drivers, setDrivers] = useState<DriversResponse['data']['users']>([]);
  const [message] = useState('');

  //Получаем список водителей через функцию из файла API
  useEffect(() => {
    fetchDrivers()
      .then((data) => setDrivers(data.data.users))
      .catch((error) => {
        console.error('Error fetching drivers:', error);
        showToast.error('Failed to fetch drivers.');
      });
  }, []);

  //Функция сабмита формы
  const onSubmit = useCallback(
    async (data: VehicleData): Promise<void> => {
      const { ...rest } = data;

      const payload: PayloadVehicle = {
        ...rest,
      };

      try {
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...payload }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error?.message && errorData.error?.fullName) {
            showToast.error(`${errorData.error.message} ${errorData.error.fullName}`);
          } else if (errorData.error?.message) {
            showToast.error(errorData.error.message);
          } else if (errorData.message) {
            showToast.error(errorData.message);
          } else {
            showToast.error(`Error creating vehicle: ${response.statusText}`);
          }
          return;
        }

        const result = await response.json();
        if (result && result.uuid) {
          showToast.success('Vehicle created successfully');
          router.push(`/transfer-services/detail/${result.uuid}`);
        } else {
          showToast.error('Failed to redirect to vehicle details page');
        }
      } catch (error: any) {
        showToast.error(`Error creating vehicle: ${error.message}`);
        console.error('Submission error:', error);
      }
    },
    [router],
  );

  return {
    formMethods,
    control,
    handleSubmit,
    drivers,
    onSubmit,
    message,
  };
};
