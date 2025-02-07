import { useForm } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface UseIntermediatePointsManagerResult {
  handleAddIntermediatePoint: () => void;
  handleRemoveIntermediatePoint: (index: number) => void;
  handleChangeIntermediatePoint: (index: number, value: string | undefined) => void;
}

export const useIntermediatePointsManager = (
  formMethods: ReturnType<typeof useForm<CreateOrderData>>,
): UseIntermediatePointsManagerResult => {
  const { watch, setValue } = formMethods;

  const handleAddIntermediatePoint = () => {
    const currentPoints = watch('intermediatePoints') || [];
    setValue('intermediatePoints', [...currentPoints, '']);
  };

  const handleRemoveIntermediatePoint = (index: number) => {
    const currentPoints = watch('intermediatePoints') || [];
    const updatedPoints = currentPoints.filter((_, i) => i !== index);
    //Фильтруем updatedPoints, чтобы убрать undefined
    setValue(
      'intermediatePoints',
      updatedPoints.filter((point): point is string => point !== undefined),
    );
  };

  const handleChangeIntermediatePoint = (index: number, value: string | undefined) => {
    const currentPoints = watch('intermediatePoints') || [];
    const updatedPoints = currentPoints.map((point, i) => (i === index ? value : point));
    //Фильтруем updatedPoints, чтобы убрать undefined
    setValue(
      'intermediatePoints',
      updatedPoints.filter((point): point is string => point !== undefined),
    );
  };

  return {
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
  };
};
