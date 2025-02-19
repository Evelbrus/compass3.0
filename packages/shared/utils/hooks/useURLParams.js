import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
const useURLParams = ({ optimisticPage, roleFilter, sortBy, sortOrder, statusFilter, }) => {
    const router = useRouter();
    useEffect(() => {
        const updateURL = () => {
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.set('page', optimisticPage?.toString() ?? '1');
            currentParams.set('role', roleFilter ?? '');
            currentParams.set('sort_by', sortBy ?? '');
            currentParams.set('sort_order', sortOrder ?? '');
            if (statusFilter) {
                currentParams.set('status', statusFilter);
            }
            router.push(`?${currentParams.toString()}`, { scroll: false });
        };
        updateURL();
    }, [optimisticPage, roleFilter, sortBy, sortOrder, statusFilter]);
};
export default useURLParams;
