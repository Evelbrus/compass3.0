'use client';

import React from 'react';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';

interface VehiclesDetailProps {
  data: DetailVehicleData;
}

const VehiclesDetail: React.FC<VehiclesDetailProps> = ({ data }) => {
  return (
    <div>
      <h1>Vehicle Details</h1>
      <p>
        <strong>UUID:</strong> {data.uuid}
      </p>
      <p>
        <strong>Type:</strong> {data.vehicleType}
      </p>
      <p>
        <strong>Brand:</strong> {data.brand}
      </p>
      <p>
        <strong>Model:</strong> {data.model}
      </p>
      <p>
        <strong>Year:</strong> {data.year ? data.year.toLocaleDateString() : 'N/A'}
      </p>
      <p>
        <strong>Color:</strong> {data.color}
      </p>
      <p>
        <strong>Plate Number:</strong> {data.plateNumber}
      </p>
      <p>
        <strong>Availability:</strong> {data.isAvailable ? 'Available' : 'Not Available'}
      </p>
      {data.photoPath && <img src={data.photoPath} alt={`${data.brand} ${data.model}`} />}

      <h2>Drivers</h2>
      <ul>
        {data.vehicleDrivers.map((driver) => (
          <li key={driver.uuid}>
            <p>
              <strong>Driver UUID:</strong> {driver.uuid}
            </p>
            <p>
              <strong>Driver Full Name:</strong> {driver.driver.user.fullName}
            </p>
            <p>
              <strong>Phone driver:</strong> {driver.driver.user.phone}
            </p>
          </li>
        ))}
      </ul>

      <h2>Service Levels</h2>
      <ul>
        {data.service_levels.map((level) => (
          <li key={level.uuid}>
            <p>
              <strong>Service UUID:</strong> {level.service.uuid}
            </p>
            <p>
              <strong>Service Name:</strong> {level.service.name}
            </p>
            <p>
              <strong>Service Type:</strong> {level.service.serviceType}
            </p>
            <p>
              <strong>Price:</strong> {level.service.price}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VehiclesDetail;
