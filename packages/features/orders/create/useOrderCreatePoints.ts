import { usePoints } from '@features/orders/create/hooks';

interface UseOrderCreatePointsProps {
  setErrorMessage: (error: any, message: string) => void;
}

export const useOrderCreatePoints = ({ setErrorMessage }: UseOrderCreatePointsProps) => {
  const { points, getAvailablePoints } = usePoints({ setErrorMessage });

  return {
    points,
    getAvailablePoints,
  };
};
