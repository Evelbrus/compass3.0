import React from 'react';
import { UserRole } from '@prisma/client';

export interface Column<T, K extends keyof T> {
  header: string;
  accessor: K;
  render?: (row: T) => React.ReactNode;
  sortable: boolean;
  className?: string;
}

export interface ITableProps<T> {
  data: T[];
  columns: Column<T, keyof T>[];
}

export interface TableOrdersRow {
  number: number;
  createdBy: {
    fullName: string;
    phone: string;
    companyProfile: {
      companyName: string;
      companyPhone: string;
      companyLogo?: string | null;
    };
  };
  assignedDriver: { fullname: string; phone: string };
  plateNumber: number;
  tariff: { name: string };
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  basePrice: number;
  actions: React.ReactNode;
  departureTime: Date;
}

export interface TableVehicleRow {
  number: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  isAvailable: string;
  vehicleInfo: { vehicleType: string; serviceLevels: string } | null;
  driverInfo: { phone: string; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
  actions: React.ReactNode;
}

export interface TableUsersRow {
  number: number;
  email: string;
  role: UserRole;
  fullName: { phone: string | null; fullName: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
  availability: boolean;
  actions: React.ReactNode;
}

export interface TableDriversRow {
  number: number;
  fullName: { phone: string | null; fullName: string | null } | null;
  passportId: string | null;
  passportPhotoPath: string | null;
  createdAt: Date;
  updatedAt: Date;
  actions: React.ReactNode;
}

export interface TableAdditionalServicesRow {
  number: number;
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  actions: React.ReactNode;
}

export interface TablePointsRow {
  number: number;
  uuid: string;
  address: string;
  pricePerKm: number;
  terrainDifficulty: number;
  latitude: number;
  longitude: number;
  airport: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  actions: React.ReactNode;
}
