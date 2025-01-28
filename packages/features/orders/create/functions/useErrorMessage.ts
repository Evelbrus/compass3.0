import { useState, useCallback } from 'react';

export const useErrorMessage = () => {
  const [message, setMessage] = useState<string>('');

  const setErrorMessage = useCallback(
    (error: any, customMessage: string) => {
      console.error(error);
      setMessage(customMessage);
    },
    [setMessage],
  );

  return { message, setErrorMessage };
};
