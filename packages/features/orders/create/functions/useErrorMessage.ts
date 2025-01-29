import { useState, useCallback } from 'react';

export const useErrorMessage = () => {
  const [message, setMessage] = useState<string>('');

  const setErrorMessage = useCallback(
    (error: Error | null | undefined, customMessage: string) => {
      if (error instanceof Error) {
        console.error(error);
      } else if (error) {
        console.error('Error is not an Error object:', error);
      }
      setMessage(customMessage);
    },
    [setMessage],
  );

  return { message, setErrorMessage };
};
