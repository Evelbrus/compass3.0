import { RefObject, useEffect } from 'react';

export const useOnClickOutside = <T extends HTMLElement>(
<<<<<<< HEAD
  ref: RefObject<T>,
=======
  ref: RefObject<T | null>,
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
  handler: (event: Event) => void,
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
