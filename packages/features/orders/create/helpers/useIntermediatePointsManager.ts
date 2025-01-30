import { useForm } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface UseIntermediatePointsManagerResult {
  handleAddIntermediatePoint: () => void;
  handleRemoveIntermediatePoint: (index: number) => void;
  handleChangeIntermediatePoint: (index: number, value: string) => void;
}

export const useIntermediatePointsManager = (
  formMethods: ReturnType<typeof useForm<CreateOrderData>>,
): UseIntermediatePointsManagerResult => {
  const { watch, setValue } = formMethods;

  const handleAddIntermediatePoint = () => {
    const currentPoints = watch().intermediatePoints || [];
    setValue('intermediatePoints', [...currentPoints, '']);
  };

  const handleRemoveIntermediatePoint = (index: number) => {
    const currentPoints = watch().intermediatePoints || [];
    const updatedPoints = currentPoints.filter((_, i) => i !== index);
    setValue('intermediatePoints', updatedPoints);
  };

  const handleChangeIntermediatePoint = (index: number, value: string) => {
    const currentPoints = watch().intermediatePoints || [];
    const updatedPoints = currentPoints.map((point, i) => (i === index ? value : point));
    setValue('intermediatePoints', updatedPoints);
  };

  return {
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
  };
};
