import { Column, TableVehicleRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
import {
  colorOptions,
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

export const vehicleDriverColumns: Column<TableVehicleRow, keyof TableVehicleRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'brand',
    header: 'Марка',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.brand}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'model',
    header: 'Модель',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.model}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'year',
    header: 'Год',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.year}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'color',
    header: 'Цвет',
    render: (row: TableVehicleRow) => {
      const colorLabel =
        colorOptions.find((option) => option.value === row.color)?.label || 'Не указано';
      return <span className="text-gray-800">{colorLabel}</span>;
    },
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'plateNumber',
    header: 'Номерной знак',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.plateNumber}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'isAvailable',
    header: 'Доступность',
    render: (row: TableVehicleRow) => (
      <span
        className={`px-2 py-1 rounded ${
          row.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}
      >
        {row.isAvailable ? 'Доступен' : 'Недоступен'}
      </span>
    ),
    sortable: true,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'vehicleInfo',
    header: 'Информация о ТС',
    render: (row: TableVehicleRow) => {
      const vehicleTypeLabel =
        vehicleTypeOptions.find((option) => option.value === row.vehicleInfo?.vehicleType)?.label ||
        'Не указано';
      const serviceLevelLabel =
        serviceLevelOptions.find((option) => option.value === row.vehicleInfo?.serviceLevels)
          ?.label || 'Не указано';
      return (
        <span className="text-gray-800">
          {vehicleTypeLabel} - {serviceLevelLabel}
        </span>
      );
    },
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'driverInfo',
    header: 'Телефон и ФИО',
    render: (row: TableVehicleRow) => {
      if (row.driverInfo === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.driverInfo.phone || 'Не указано',
            row.driverInfo.fullName || 'Не указано',
          )}
        </>
      );
    },
    sortable: false,
    className: 'w-[350px]',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableVehicleRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableVehicleRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableVehicleRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
