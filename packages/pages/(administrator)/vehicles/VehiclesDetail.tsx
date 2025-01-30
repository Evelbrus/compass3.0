'use client';

import React from 'react';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';

interface VehiclesDetailProps {
  data: DetailVehicleData;
}

const VehiclesDetail: React.FC<VehiclesDetailProps> = ({ data }) => {
  const vehiclesDetails = [
    { label: 'UUID', value: data.uuid },
    { label: 'Type', value: data.vehicleType },
    { label: 'Brand', value: data.brand },
    { label: 'Model', value: data.model },
    { label: 'Year', value: data.year ? new Date(data.year).getFullYear() : 'N/A' },
    { label: 'Color', value: data.color },
    { label: 'Plate Number', value: data.plateNumber },
    { label: 'Availability', value: data.isAvailable ? 'Available' : 'Not Available' },
  ];
  return (
    <div className="vehicle-detail-container">
      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-6 bg-white shadow-md rounded-lg border border-gray-200">
        {vehiclesDetails.map((item) => (
          <DetailItem key={item.label} label={item.label} value={item.value} />
        ))}
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
        <p className="text-gray-700 p-6 bg-white shadow-md rounded-lg border border-gray-200">
          <span className="bg-white px-3 py-2 p-3 rounded-md border border-gray-300 text-xl font-semibold text-gray-700">
            {data.serviceLevels}
          </span>
        </p>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-white px-3 py-2 p-3 rounded-md border border-gray-300">
    <span className="text-4 text-[#2A3037] font-extrabold mr-2">{label}:</span>
    <span className="text-4 font-medium text-gray-500 mb-2">{value}</span>
  </div>
);

const DriverSection: React.FC<{ drivers: DetailVehicleData['vehicleDrivers'] }> = ({ drivers }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Assigned Drivers</h2>
      {drivers.map((driver) => {
        const driverDetails: { label: string; value: React.ReactNode }[] = [
          { label: 'Assignment UUID', value: driver.uuid },
          { label: 'Assignment Date', value: driver.assignmentDate.toLocaleDateString() },
          { label: 'Driver UUID', value: driver.driver.uuid },
          { label: 'Full Name', value: driver.driver.fullName },
          { label: 'Phone', value: driver.driver.phone },
        ];

        if (driver.driver.status) {
          driverDetails.push({ label: 'Status', value: driver.driver.status });
        }

        return (
          <div
            key={driver.uuid}
            className="bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 rounded-lg shadow-md border border-gray-200"
          >
            {driverDetails.map(({ label, value }) => (
              <DetailItem key={label} label={label} value={value} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default VehiclesDetail;
