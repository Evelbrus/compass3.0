// app/src/dto/services/additional-service.dto.ts
import { AdditionalService } from '@prisma/client';

export interface GetAdditionalServicesRequestDTO {
  page: number;
  per_page: number;
  search: string | null;
  sort_by: 'name' | 'createdAt' | 'updatedAt';
  sort_order: 'asc' | 'desc';
}

export interface AdditionalServicesListResponseDTO {
  status: string;
  message: string;
  data: {
    page: number;
    per_page: number;
    total: number;
    additionalServices: AdditionalService[];
  };
}

export interface CreateAdditionalServiceDTO {
  name: string;
}

export interface UpdateAdditionalServiceDTO {
  name: string;
}
