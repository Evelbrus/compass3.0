import { useCallback } from 'react';
export function useCombinedRefs(...refs) {
    return useCallback((node) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(node);
            }
            else if (ref) {
                ref.current = node;
            }
        });
    }, refs);
}
