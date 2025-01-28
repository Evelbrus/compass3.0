'use client';

import React from 'react';
import { useOrderCreateLogic } from '@pages/(administrator)/orders/create/OrderCreate.logic';

const OrderCreateView = () => {
  const {
    clients,
    drivers,
    tariffs,
    message,
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    formData,
    vehicleTypes,
    serviceLevels,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffChange,
    handleChange,
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
    handleAdditionalServiceChange,
    handleSubmit,
    getAvailablePoints,
  } = useOrderCreateLogic();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1>Create Order</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <label>
          Client:
          <select name="createdBy" onChange={handleChange} value={formData.createdBy || ''}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.uuid} value={c.uuid}>
                {c.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tariff:
          <select name="tariffUuid" onChange={handleTariffChange} value={formData.tariffUuid || ''}>
            <option value="">Select a tariff</option>
            {tariffs.map((t) => (
              <option key={t.uuid} value={t.uuid}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {selectedTariff && selectedTariff.tariffAdditionalServices?.length > 0 && (
          <div>
            {selectedTariff.tariffAdditionalServices.map((s) => (
              <label key={s.uuid} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedAdditionalServices.includes(s.uuid)}
                  onChange={(e) => handleAdditionalServiceChange(e, s.uuid)}
                />
                {s.name} ({s.price})
              </label>
            ))}
          </div>
        )}
        <label>
          Vehicle Type:
          <select name="vehicleType" onChange={handleVehicleTypeChange} value={selectedVehicleType}>
            <option value="">Select a vehicle type</option>
            {vehicleTypes.map((vt) => (
              <option key={vt} value={vt}>
                {vt}
              </option>
            ))}
          </select>
        </label>
        <label>
          Service Level:
          <select
            name="serviceLevel"
            onChange={handleServiceLevelChange}
            value={selectedServiceLevel}
          >
            <option value="">Select a service level</option>
            {serviceLevels.map((sl) => (
              <option key={sl} value={sl}>
                {sl}
              </option>
            ))}
          </select>
        </label>
        <label>
          Departure Time:
          <input
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Departure Point:
          <select
            name="departurePoint"
            onChange={handleChange}
            value={formData.departurePoint || ''}
          >
            <option value="">Select a departure point</option>
            {getAvailablePoints([
              formData.arrivalPoint || '',
              ...(formData.intermediatePoints || []),
            ]).map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.address}
              </option>
            ))}
          </select>
        </label>

        <label>
          Arrival Point:
          <select name="arrivalPoint" onChange={handleChange} value={formData.arrivalPoint || ''}>
            <option value="">Select an arrival point</option>
            {getAvailablePoints([
              formData.departurePoint || '',
              ...(formData.intermediatePoints || []),
            ]).map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.address}
              </option>
            ))}
          </select>
        </label>
        <label>
          Intermediate Points:
          {(formData.intermediatePoints || []).map((point, index) => (
            <div key={index}>
              <select
                value={point}
                onChange={(e) => handleChangeIntermediatePoint(index, e.target.value)}
              >
                <option value="">Select an intermediate point</option>
                {getAvailablePoints([
                  formData.departurePoint || '',
                  formData.arrivalPoint || '',
                  ...(formData.intermediatePoints || []).filter((_, i) => i !== index),
                ]).map((po) => (
                  <option key={po.uuid} value={po.uuid}>
                    {po.address}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => handleRemoveIntermediatePoint(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIntermediatePoint}>
            Add Intermediate Point
          </button>
        </label>
        <label>
          Base Price:
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice ?? 0}
            onChange={handleChange}
          />
        </label>
        <label>
          Assigned Driver:
          <select
            name="assignedDriverId"
            onChange={handleChange}
            value={formData.assignedDriverId || ''}
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.uuid} value={driver.uuid}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderCreateView;
