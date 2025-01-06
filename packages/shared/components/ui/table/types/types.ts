import React from 'react';
import { UserRole, OrderStatus } from '@prisma/client';

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
  createdBy: { fullName: string; phone: string };
  tariff: { name: string };
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  basePrice: number;
  actions: React.ReactNode;
}

export interface TableVehicleRow {
  number: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  isAvailable: string;
  createdAt: string;
  updatedAt: string;
  actions: React.ReactNode;
}

export interface TableUsersRow {
  number: number;
  email: string;
  role: UserRole;
  additionalInfo: { phone: string | null; fullName: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
  availability: boolean;
  actions: React.ReactNode;
}

export interface TableDriversRow {
  number: number;
  additionalInfo: { phone: string | null; fullName: string | null } | null;
  passportId: string | null;
  passportPhotoPath: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalOrders: number | null;
  totalFines: number | null;
  totalFineAmount: number | null;
  actions: React.ReactNode;
}
