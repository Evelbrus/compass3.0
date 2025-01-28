import { useState, useCallback } from 'react';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

const initialFormData: Partial<CreateOrderData> = {
  intermediatePoints: [],
  basePrice: 0,
  assignedDriverId: undefined,
  createdBy: '',
  tariffUuid: '',
  departurePoint: '',
  arrivalPoint: '',
  departureTime: '',
};

export const useFormState = () => {
  const [formData, setFormData] = useState<Partial<CreateOrderData>>(initialFormData);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : value }));
  }, []);

  const handleDriverSelect = useCallback(
    (driverId: string) => {
      setFormData((prev) => ({ ...prev, assignedDriverId: driverId }));
    },
    [setFormData],
  );

  const setInitialFormData = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleAddIntermediatePoint = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      intermediatePoints: [...(prev.intermediatePoints || []), ''],
    }));
  }, []);

  const handleRemoveIntermediatePoint = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      intermediatePoints: (prev.intermediatePoints || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleChangeIntermediatePoint = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newPoints = [...(prev.intermediatePoints || [])];
      newPoints[index] = value;
      return { ...prev, intermediatePoints: newPoints };
    });
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleDriverSelect,
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
    setInitialFormData,
  };
};
