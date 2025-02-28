import { Column, TableOrdersRow } from '@shared/components/ui/table';
import {
  renderCustomerPhone,
  renderDateTime,
  renderLogoCompany,
} from '@shared/components/ui/table/ui/TableRenders';

export const ordersColumns: Column<TableOrdersRow, keyof TableOrdersRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[70px] text-center',
  },
  {
    accessor: 'companyProfile',
    header: 'Контрагент',
    render: (row: TableOrdersRow) => {
      if (row.createdBy.companyProfile === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderLogoCompany(
            row.createdBy.companyProfile.companyName || 'Не указано',
            row.createdBy.companyProfile.companyLogo || undefined,
          )}
        </>
      );
    },
    sortable: false,
    className: 'w-[200px]',
  },
  {
    accessor: 'createdBy',
    header: 'Телефон, заказчик',
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
    className: 'w-[250px]',
  },
  {
    accessor: 'assignedDriver',
    header: 'Водитель',
    render: (row: TableOrdersRow) => {
      if (row.assignedDriver === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.assignedDriver.phone || 'Не указано',
            row.assignedDriver.fullname || 'Не указано',
          )}
        </>
      );
    },
    sortable: false,
    className: 'w-[250px]',
  },
  {
    accessor: 'plateNumber',
    header: 'Номер машины',
    render: (row: TableOrdersRow) => <span>{row.plateNumber}</span>,
    sortable: false,
    className: 'w-[150px]',
  },
  {
    accessor: 'departurePoint',
    header: 'Адрес подачи',
    render: (row: TableOrdersRow) => <span>{row.departurePoint.address}</span>,
    sortable: false,
    className: 'w-[200px]',
  },
  {
    accessor: 'arrivalPoint',
    header: 'Адрес назначения',
    render: (row: TableOrdersRow) => <span>{row.arrivalPoint.address}</span>,
    sortable: false,
    className: 'w-[200px]',
  },
  {
    accessor: 'tariff',
    header: 'Тариф',
    render: (row: TableOrdersRow) => <span>{row.tariff.name}</span>,
    sortable: false,
    className: 'w-[150px]',
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
