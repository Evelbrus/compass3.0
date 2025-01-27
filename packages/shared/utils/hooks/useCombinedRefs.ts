import { Ref, useCallback } from 'react';

export function useCombinedRefs<T>(...refs: Ref<T>[]) {
  return useCallback((node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as any).current = node;
      }
    });
  }, refs);
}
