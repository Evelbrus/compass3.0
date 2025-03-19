import { DriverAcceptanceStatus, UserRole } from '@prisma/client';
import { Column, TableOrdersRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
import { driverAcceptanceStatusLabels } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';

export const ordersDriverColumns: Column<TableOrdersRow, keyof TableOrdersRow>[] = [
  {
    accessor: 'orderNumber',
    header: '№',
    sortable: false,
    className: 'w-[70px] text-center',
  },
  {
    accessor: 'clientBy',
    header: 'Телефон, заказчик',
    render: (row: TableOrdersRow) => {
      if (!row.clientBy) return 'Не указано';

      const isCorporate = row.clientBy.role === UserRole.ClientCorp;
      const companyProfile = row.clientBy.companyProfile;

      if (isCorporate) {
        if (companyProfile?.companyLogo) {
          return renderCustomerPhone(
            companyProfile.companyPhone || 'Не указано',
            companyProfile.companyName || 'Не указано',
            companyProfile.companyLogo,
          );
        }

        if (companyProfile?.companyName || companyProfile?.companyPhone) {
          return renderCustomerPhone(
            companyProfile.companyPhone || 'Не указано',
            companyProfile.companyName || 'Не указано',
          );
        }

        return renderCustomerPhone(
          row.clientBy.phone || 'Не указано',
          row.clientBy.fullName || 'Не указано',
        );
      }

      return renderCustomerPhone(
        row.clientBy.phone || 'Не указано',
        row.clientBy.fullName || 'Не указано',
      );
    },
    sortable: false,
    className: 'w-[250px]',
  },
  {
    accessor: 'tariff',
    header: 'Тариф',
    render: (row: TableOrdersRow) => {
      return (
        <section className="flex flex-col">
          <span>{row.tariff.name}</span>
          <div className="flex">
            <p className="text-gray-500 text-sm">
              {row.tariff.vehicleType} - {row.tariff.serviceLevel}
            </p>
          </div>
        </section>
      );
    },
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
    accessor: 'status',
    header: 'Статус',
    render: (row: TableOrdersRow) => (
      <section>
        <div className="flex items-center gap-1">
          <span
            className={`p-1 rounded-full ${
              row.status === 'COMPLETED' ? 'bg-green-200' : 'bg-yellow-200'
            }`}
          ></span>
          <p>{row.status}</p>
        </div>
        <p
          className={`text-sm ${row.driverAcceptanceStatus === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'}`}
        >
          {driverAcceptanceStatusLabels[row.driverAcceptanceStatus as DriverAcceptanceStatus] || ''}
        </p>
      </section>
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
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableOrdersRow) => row.actions,
    sortable: false,
    className: 'w-[100px]',
  },
];
