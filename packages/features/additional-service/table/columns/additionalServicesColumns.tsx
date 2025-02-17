import { Column, TableAdditionalServicesRow } from '@shared/components/ui/table';
import { renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const additionalServicesColumns: Column<
  TableAdditionalServicesRow,
  keyof TableAdditionalServicesRow
>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'name',
    header: 'Название услуги',
    render: (row: TableAdditionalServicesRow) => <span className="text-gray-800">{row.name}</span>,
    sortable: true,
    className: 'w-[250px]',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableAdditionalServicesRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableAdditionalServicesRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableAdditionalServicesRow) => row.actions,
    sortable: false,
    className: 'w-[200px] text-center',
  },
];
