import { Column, TableVehicleRow } from '@shared/components/ui/table';
import { renderDateTime } from '@shared/components/ui/table/ui/TableRenders';

export const vehicleColumns: Column<TableVehicleRow, keyof TableVehicleRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'brand',
    header: 'Brand',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.brand}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'model',
    header: 'Model',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.model}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'year',
    header: 'Year',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.year}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'color',
    header: 'Color',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.color}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'plateNumber',
    header: 'Plate Number',
    render: (row: TableVehicleRow) => <span className="text-gray-800">{row.plateNumber}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'isAvailable',
    header: 'Available',
    render: (row: TableVehicleRow) => (
      <span
        className={`px-2 py-1 rounded ${
          row.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}
      >
        {row.isAvailable ? 'Yes' : 'No'}
      </span>
    ),
    sortable: true,
    className: 'w-[150px] text-center',
  },
  {
    accessor: 'createdAt',
    header: 'Created At',
    render: (row: TableVehicleRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Updated At',
    render: (row: TableVehicleRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'actions',
    header: 'Actions',
    render: (row: TableVehicleRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
