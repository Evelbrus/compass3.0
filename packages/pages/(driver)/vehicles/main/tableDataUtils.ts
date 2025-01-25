import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';
import { VehicleOverview } from '@shared/prisma/interface/vehicles/interface';
import { TableVehicleRow } from '@shared/components/ui/table';
import { renderDriverActions } from '@shared/components/ui/table/ui/TableRenders';

export const mapVehiclesToTableData = (
  vehicles: VehicleOverview[],
  page: number,
  perPage: number,
  routerPush: (path: string) => void,
): TableVehicleRow[] => {
  return vehicles.map((vehicle, index) => ({
    number: (page - 1) * perPage + index + 1,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year ? formatDate(vehicle.year) : 'N/A',
    color: vehicle.color,
    plateNumber: vehicle.plateNumber,
    isAvailable: vehicle.isAvailable ? 'Yes' : 'No',
    vehicleInfo: {
      vehicleType: vehicle.vehicleType,
      serviceLevels: vehicle.serviceLevels || 'N/A',
    },
    driverInfo: vehicle.drivers[0]
      ? {
          phone: vehicle.drivers[0].phone || 'Не указано',
          fullName: vehicle.drivers[0].fullName || 'Не указано',
        }
      : null,
    createdAt: formatDate(vehicle.createdAt),
    updatedAt: formatDate(vehicle.updatedAt),
    actions: renderDriverActions('vehicles', vehicle.uuid, routerPush),
  }));
};
