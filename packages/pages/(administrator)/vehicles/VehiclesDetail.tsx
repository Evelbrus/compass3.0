'use client';

import React from 'react';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';

interface VehiclesDetailProps {
  data: DetailVehicleData;
}

const VehiclesDetail: React.FC<VehiclesDetailProps> = ({ data }) => {
  return (
    <div className="vehicle-detail-container">
      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <DetailItem label="UUID" value={data.uuid} />
        <DetailItem label="Type" value={data.vehicleType} />
        <DetailItem label="Brand" value={data.brand} />
        <DetailItem label="Model" value={data.model} />
        <DetailItem label="Year" value={data.year ? new Date(data.year).getFullYear() : 'N/A'} />
        <DetailItem label="Color" value={data.color} />
        <DetailItem label="Plate Number" value={data.plateNumber} />
        <DetailItem label="Availability" value={data.isAvailable ? 'Available' : 'Not Available'} />
      </div>

      {data.photoPath && (
        <img
          src={data.photoPath}
          alt={`${data.brand} ${data.model}`}
          className="mb-6 max-w-md rounded-lg shadow-md"
        />
      )}

      <DriverSection drivers={data.vehicleDrivers} />

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Service Level</h2>
        <p className="text-gray-700">{data.serviceLevels}</p>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <span className="font-medium">{label}:</span>
    <span className="ml-2 text-gray-700">{value}</span>
  </div>
);

const DriverSection: React.FC<{ drivers: DetailVehicleData['vehicleDrivers'] }> = ({ drivers }) => (
  <div className="mt-6">
    <h2 className="text-xl font-semibold mb-4">Assigned Drivers</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {drivers.map((driver) => (
        <div key={driver.uuid} className="bg-white p-4 rounded-lg shadow">
          <DetailItem label="Assignment UUID" value={driver.uuid} />
          <DetailItem label="Assignment Date" value={driver.assignmentDate.toLocaleDateString()} />
          <DetailItem label="Driver UUID" value={driver.driver.uuid} />
          <DetailItem label="Full Name" value={driver.driver.fullName} />
          <DetailItem label="Phone" value={driver.driver.phone} />
          {driver.driver.status && <DetailItem label="Status" value={driver.driver.status} />}
        </div>
      ))}
    </div>
  </div>
);

export default VehiclesDetail;
