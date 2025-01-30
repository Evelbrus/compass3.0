import { useAdditionalServices } from '@features/orders/create/hooks';

interface UseOrderCreateAdditionalServicesProps {
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useOrderCreateAdditionalServices = ({
  setErrorMessage,
}: UseOrderCreateAdditionalServicesProps) => {
  const { additionalServices } = useAdditionalServices({ setErrorMessage });

  return {
    additionalServices,
  };
};
