import { useState, useEffect, useCallback } from 'react';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { useRouter, useSearchParams } from 'next/navigation';
const useDrivers = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [optimisticPage, setOptimisticPage] = useState(1);
    const [perPage] = useState(Number(searchParams.get('per_page')) || 10);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || null);
    const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL('/api/users', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());
            if (sortBy !== null) {
                url.searchParams.append('sort_by', sortBy);
            }
            if (sortOrder) {
                url.searchParams.append('sort_order', sortOrder);
            }
            url.searchParams.append('role', 'Driver');
            const response = await fetch(url.toString());
            if (!response.ok)
                throw new Error('Network response was not ok');
            const { status, message, data } = await response.json();
            if (status !== 'success')
                throw new Error(message || 'Error fetching drivers');
            setUsers(data.users);
            setTotal(data.total);
        }
        catch (error) {
            console.error('Error fetching drivers:', error);
            setError('Error fetching drivers');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, sortBy, sortOrder]);
    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);
    const handlePageChange = (newPage) => {
        setOptimisticPage(newPage);
        setPage(newPage);
    };
    const handleSort = (sortByKey, sortDirection) => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
    };
    const tableData = users.map((user, index) => ({
        number: (optimisticPage - 1) * perPage + index + 1,
        fullName: {
            phone: user.phone,
            fullName: user.fullName,
        },
        passportId: user.driverProfile?.passportId ? user.driverProfile.passportId.toString() : null,
        passportPhotoPath: user.driverProfile?.passportPhotoPath || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        actions: renderActions({
            entity: 'users',
            uuid: user.uuid,
            navigate: router.push,
        }),
    }));
    return {
        users: tableData,
        loading,
        error,
        total,
        optimisticPage,
        perPage,
        sortBy,
        sortOrder,
        handlePageChange,
        handleSort,
    };
};
export default useDrivers;
