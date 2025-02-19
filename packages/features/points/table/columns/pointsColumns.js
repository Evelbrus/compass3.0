import { jsx as _jsx } from "react/jsx-runtime";
import { renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
export const pointsColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'address',
        header: 'Адрес',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.address }),
        sortable: true,
        className: 'w-[250px]',
    },
    {
        accessor: 'pricePerKm',
        header: 'Цена за км',
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'terrainDifficulty',
        header: 'Коэффициент сложности',
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'latitude',
        header: 'Широта',
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'longitude',
        header: 'Долгота',
        sortable: true,
        className: 'w-[150px] text-center',
    },
    {
        accessor: 'createdAt',
        header: 'Дата создания',
        render: (row) => renderDateTime(row.createdAt),
        sortable: true,
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
