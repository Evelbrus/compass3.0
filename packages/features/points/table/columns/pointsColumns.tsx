import { Column, TablePointsRow } from '@shared/components/ui/table';
import { renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const pointsColumns: Column<TablePointsRow, keyof TablePointsRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'address',
    header: 'адрес',
    render: (row: TablePointsRow) => <span className="text-gray-800">{row.address}</span>,
    sortable: true,
    className: 'w-[250px]',
  },
  {
    accessor: 'basePrice',
    header: 'Базовая цена от Аэропорта',
    sortable: true,
    className: 'w-[400px] text-center',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TablePointsRow) => renderDateTime(row.createdAt),
    sortable: true,
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TablePointsRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TablePointsRow) => row.actions,
    sortable: false,
    className: 'w-[200px] text-center',
  },
];
