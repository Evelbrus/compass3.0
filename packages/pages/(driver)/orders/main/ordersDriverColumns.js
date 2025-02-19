import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
export const ordersDriverColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'createdBy',
        header: 'Телефон и ФИО',
        render: (row) => {
            if (row.createdBy === null) {
                return 'Не указано';
            }
            return (_jsx(_Fragment, { children: renderCustomerPhone(row.createdBy.phone || 'Не указано', row.createdBy.fullName || 'Не указано') }));
        },
        sortable: false,
        className: 'w-[350px]',
    },
    {
        accessor: 'tariff',
        header: 'Тариф',
        render: (row) => _jsx("span", { children: row.tariff.name }),
        sortable: false,
        className: 'w-[150px]',
    },
    {
        accessor: 'departurePoint',
        header: 'Точка отправления',
        render: (row) => _jsx("span", { children: row.departurePoint.address }),
        sortable: false,
        className: 'w-[250px]',
    },
    {
        accessor: 'arrivalPoint',
        header: 'Точка прибытия',
        render: (row) => _jsx("span", { children: row.arrivalPoint.address }),
        sortable: false,
        className: 'w-[250px]',
    },
    {
        accessor: 'status',
        header: 'Статус',
        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded ${row.status === 'COMPLETED'
                ? 'bg-green-200 text-green-800'
                : 'bg-yellow-200 text-yellow-800'}`, children: row.status })),
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'createdAt',
        header: 'Дата создания',
        render: (row) => renderDateTime(row.createdAt),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'updatedAt',
        header: 'Дата обновления',
        render: (row) => renderDateTime(row.updatedAt),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'basePrice',
        header: 'Цена',
        render: (row) => _jsxs("span", { children: [row.basePrice, " \u0441\u043E\u043C"] }),
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'actions',
        header: 'Действия',
        render: (row) => row.actions,
        sortable: false,
        className: 'w-[200px]',
    },
];
