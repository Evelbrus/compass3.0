import { Column, TableDriversRow, TableOrdersRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const ordersColumns: Column<TableOrdersRow, keyof TableOrdersRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'createdBy',
    header: 'Телефон и ФИО',
    render: (row: TableOrdersRow) => {
      if (row.createdBy === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.createdBy.phone || 'Не указано',
            row.createdBy.fullName || 'Не указано',
          )}
        </>
      );
    },
    sortable: false,
    className: 'w-[350px]',
  },
  {
    accessor: 'tariff',
    header: 'Тариф',
    render: (row: TableOrdersRow) => <span>{row.tariff.name}</span>,
    sortable: false,
    className: 'w-[150px]',
  },
  {
    accessor: 'departurePoint',
    header: 'Точка отправления',
    render: (row: TableOrdersRow) => <span>{row.departurePoint.address}</span>,
    sortable: false,
    className: 'w-[250px]',
  },
  {
    accessor: 'arrivalPoint',
    header: 'Точка прибытия',
    render: (row: TableOrdersRow) => <span>{row.arrivalPoint.address}</span>,
    sortable: false,
    className: 'w-[250px]',
  },
  {
    accessor: 'status',
    header: 'Статус',
    render: (row: TableOrdersRow) => (
      <span
        className={`px-2 py-1 rounded ${
          row.status === 'COMPLETED'
            ? 'bg-green-200 text-green-800'
            : 'bg-yellow-200 text-yellow-800'
        }`}
      >
        {row.status}
      </span>
    ),
    sortable: true,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableOrdersRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableOrdersRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'basePrice',
    header: 'Цена',
    render: (row: TableOrdersRow) => <span>{row.basePrice} сом</span>,
    sortable: true,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableOrdersRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
