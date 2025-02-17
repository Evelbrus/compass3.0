import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useURLParams = ({
  optimisticPage,
  roleFilter,
  sortBy,
  sortOrder,
  statusFilter,
  reset,
  activeTab,
}: {
  optimisticPage?: number;
  roleFilter?: string;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string | null;
  reset?: boolean;
  activeTab?: string;
}) => {
  const router = useRouter();

  useEffect(() => {
    const updateURL = () => {
      const currentParams = new URLSearchParams(window.location.search);

      if (reset) {
        currentParams.set('page', '1');
      } else {
        currentParams.set('page', optimisticPage?.toString() ?? '');
      }

      currentParams.set('tab', activeTab ?? '');
      currentParams.set('role', roleFilter ?? '');
      currentParams.set('sort_by', sortBy ?? '');
      currentParams.set('sort_order', sortOrder ?? '');

      if (statusFilter) {
        currentParams.set('status', statusFilter);
      }

      router.push(`?${currentParams.toString()}`, { scroll: false });
    };

    updateURL();
  }, [optimisticPage, roleFilter, sortBy, sortOrder, statusFilter, reset, activeTab]);
};

export default useURLParams;
