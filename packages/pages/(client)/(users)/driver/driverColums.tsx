import { Column, TableDriversRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const driversColumns: Column<TableDriversRow, keyof TableDriversRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'additionalInfo',
    header: 'Телефон и ФИО',
    render: (row: TableDriversRow) => {
      if (row.additionalInfo === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.additionalInfo.phone || 'Не указано',
            row.additionalInfo.fullName || 'Не указано',
          )}
        </>
      );
    },
    sortable: false,
    className: 'w-[350px]',
  },
  {
    accessor: 'passportId',
    header: 'ID паспорта',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.passportId}</span>,
    sortable: false,
    className: 'w-[200px]',
  },
  {
    accessor: 'passportPhotoPath',
    header: 'Фото паспорта',
    render: (row: TableDriversRow) =>
      row.passportPhotoPath ? (
        <img src={row.passportPhotoPath} alt="Фото паспорта" className="w-[50px] h-[50px]" />
      ) : (
        'Не указано'
      ),
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableDriversRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableDriversRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'totalOrders',
    header: 'Всего заказов',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.totalOrders}</span>,
    sortable: false,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'totalFines',
    header: 'Всего штрафов',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.totalFines}</span>,
    sortable: false,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'totalFineAmount',
    header: 'Сумма штрафов',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.totalFineAmount}</span>,
    sortable: false,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableDriversRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
