import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
export const vehicleColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'brand',
        header: 'Brand',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.brand }),
        sortable: true,
        className: 'w-[150px]',
    },
    {
        accessor: 'model',
        header: 'Model',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.model }),
        sortable: true,
        className: 'w-[150px]',
    },
    {
        accessor: 'year',
        header: 'Year',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.year }),
        sortable: true,
        className: 'w-[150px]',
    },
    {
        accessor: 'color',
        header: 'Color',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.color }),
        sortable: true,
        className: 'w-[150px]',
    },
    {
        accessor: 'plateNumber',
        header: 'Plate Number',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.plateNumber }),
        sortable: true,
        className: 'w-[150px]',
    },
    {
        accessor: 'isAvailable',
        header: 'Available',
        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded ${row.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`, children: row.isAvailable })),
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'vehicleInfo',
        header: 'Vehicle Info',
        render: (row) => (_jsxs("span", { className: "text-gray-800", children: [row.vehicleInfo?.vehicleType, " - ", row.vehicleInfo?.serviceLevels] })),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'driverInfo',
        header: 'Телефон и ФИО',
        render: (row) => {
            if (row.driverInfo === null) {
                return 'Не указано';
            }
            return (_jsx(_Fragment, { children: renderCustomerPhone(row.driverInfo.phone || 'Не указано', row.driverInfo.fullName || 'Не указано') }));
        },
        sortable: false,
        className: 'w-[350px]',
    },
    {
        accessor: 'createdAt',
        header: 'Created At',
        render: (row) => renderDateTime(row.createdAt),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'updatedAt',
        header: 'Updated At',
        render: (row) => renderDateTime(row.updatedAt),
        sortable: true,
        className: 'flex-grow text-center',
    },
    {
        accessor: 'actions',
        header: 'Actions',
        render: (row) => row.actions,
        sortable: false,
        className: 'w-[200px]',
    },
];
