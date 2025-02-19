import { Column, TableUsersRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const usersColumns: Column<TableUsersRow, keyof TableUsersRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'email',
    header: 'Email',
    render: (row: TableUsersRow) => <span className="text-gray-800">{row.email}</span>,
    sortable: true,
    className: 'w-[250px]',
  },
  {
    accessor: 'role',
    header: 'Роль',
    render: (row: TableUsersRow) => (
      <span className="px-2 py-1 rounded bg-blue-200 text-blue-800">{row.role}</span>
    ),
    sortable: true,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'fullName',
    header: 'Телефон и ФИО',
    render: (row: TableUsersRow) => {
      if (row.fullName === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.fullName.phone || 'Не указано',
            row.fullName.fullName || 'Не указано',
          )}
        </>
      );
    },
    sortable: true,
    className: 'w-[350px]',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableUsersRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableUsersRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'availability',
    header: 'Доступность',
    render: (row: TableUsersRow) => (
      <span
        className={`px-2 py-1 rounded ${
          row.availability ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}
      >
        {row.availability ? 'Доступен' : 'Недоступен'}
      </span>
    ),
    sortable: true,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableUsersRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
