import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface URLParams {
  optimisticPage?: number;
  roleFilter?: string;
  vehicleTypeFilter?: string;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string | null;
}

const useURLParams = ({
  optimisticPage,
  roleFilter,
  vehicleTypeFilter,
  sortBy,
  sortOrder,
  statusFilter,
}: URLParams) => {
  const router = useRouter();

  useEffect(() => {
    const updateURL = () => {
      const currentParams = new URLSearchParams(window.location.search);

      currentParams.set('page', optimisticPage?.toString() ?? '1');

      // Устанавливаем фильтр в зависимости от того, что передано
      if (roleFilter !== undefined) {
        currentParams.set('role', roleFilter ?? '');
      }
      if (vehicleTypeFilter !== undefined) {
        currentParams.set('vehicleType', vehicleTypeFilter ?? '');
      }
      currentParams.set('sort_by', sortBy ?? '');
      currentParams.set('sort_order', sortOrder ?? '');

      if (statusFilter) {
        currentParams.set('status', statusFilter);
      }

      router.push(`?${currentParams.toString()}`, { scroll: false });
    };

    updateURL();
  }, [optimisticPage, roleFilter, vehicleTypeFilter, sortBy, sortOrder, statusFilter, router]);
};

export default useURLParams;
