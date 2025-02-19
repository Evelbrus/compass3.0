import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
export const usersColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'email',
        header: 'Email',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.email }),
        sortable: true,
        className: 'w-[250px]',
    },
    {
        accessor: 'role',
        header: 'Роль',
        render: (row) => (_jsx("span", { className: "px-2 py-1 rounded bg-blue-200 text-blue-800", children: row.role })),
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'fullName',
        header: 'Телефон и ФИО',
        render: (row) => {
            if (row.fullName === null) {
                return 'Не указано';
            }
            return (_jsx(_Fragment, { children: renderCustomerPhone(row.fullName.phone || 'Не указано', row.fullName.fullName || 'Не указано') }));
        },
        sortable: true,
        className: 'w-[350px]',
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
        accessor: 'availability',
        header: 'Доступность',
        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded ${row.availability ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`, children: row.availability ? 'Доступен' : 'Недоступен' })),
        sortable: true,
        className: 'flex-grow text-center',
    },
    {
        accessor: 'actions',
        header: 'Действия',
        render: (row) => row.actions,
        sortable: false,
        className: 'w-[200px]',
    },
];
