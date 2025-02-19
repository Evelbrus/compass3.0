import { jsx as _jsx } from "react/jsx-runtime";
import { renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
export const additionalServicesColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'name',
        header: 'Название услуги',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.name }),
        sortable: true,
        className: 'w-[250px]',
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
        className: 'flex-grow text-center',
    },
    {
        accessor: 'actions',
        header: 'Действия',
        render: (row) => row.actions,
        sortable: false,
        className: 'w-[200px] text-center',
    },
];
