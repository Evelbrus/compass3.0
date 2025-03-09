// app/src/dto/points/point.dto.ts
import { Point } from '@prisma/client';

export interface GetPointsRequestDTO {
  page: number;
  per_page: number;
  search?: string;
  sort_by?: 'address' | 'pricePerKm' | 'createdAt' | 'updatedAt' | 'terrainDifficulty';
  sort_order?: 'asc' | 'desc';
}

export interface PointsListResponseDTO {
  status: string;
  message: string;
  data: {
    points: Point[];
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CreatePointDTO {
  address: string;
  pricePerKm: number;
  terrainDifficulty: number;
  latitude: number;
  longitude: number;
  airport?: boolean;
}

export interface UpdatePointDTO {
  address: string;
  pricePerKm: number;
  terrainDifficulty: number;
  latitude: number;
  longitude: number;
}
