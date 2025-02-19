import { useState, useCallback } from 'react';
export const useErrorMessage = () => {
    const [message, setMessage] = useState('');
    const setErrorMessage = useCallback((error, customMessage) => {
        if (error instanceof Error) {
            console.error(error);
        }
        else if (error) {
            console.error('Error is not an Error object:', error);
        }
        setMessage(customMessage);
    }, [setMessage]);
    return { message, setErrorMessage };
};
