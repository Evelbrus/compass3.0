// app/src/dto/tariffs/tariff.dto.ts
import { VehicleType, ServiceLevels, Tariff, TariffOnService, AdditionalService } from '@prisma/client';

export interface CreateTariffDTO extends Tariff { tariffAdditionalServices: TariffOnService } {}

export interface UpdateTariffDTO extends Tariff { tariffIds: string, tariffAdditionalServices: TariffOnService } {}

export interface GetTariffsRequestDTO {
  page: number;
  per_page: number;
  vehicleType?: VehicleType | null;
  serviceLevel?: ServiceLevels | null;
  sort_by: 'name' | 'createdAt' | 'updatedAt';
  sort_order: 'asc' | 'desc';
}

export interface TariffResponseDTO extends Tariff {
  tariffAdditionalServices: TariffOnService & { service: AdditionalService }[];
}
