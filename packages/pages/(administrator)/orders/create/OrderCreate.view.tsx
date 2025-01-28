'use client';

import React from 'react';
import { useOrderCreateLogic } from '@features/orders/create/OrderCreate.logic';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import OrderStartEndSelector from '@widgets/order-route/OrderRouteSelector';

const OrderCreateView = () => {
  const {
    clients,
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
    handleDriverSelect,
    drivers,
    page,
    perPage,
    total,
    changePage,
    isLoading,
    handleSearchDriver,
    searchDriver,
  } = useOrderCreateLogic();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 className="text-2xl font-extrabold">Заказ № 234</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div className="w-full h-[660px] flex flex-row gap-4 overflow-x-auto">
          <div className="hidden lg:flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto bg-white rounded-xl border">
            <MapDriver />
          </div>
          <div className="flex-1 flex-shrink-0 basis-[calc(35%-1.5rem)] h-auto overflow-auto flex flex-col justify-between gap-4">
            <DriversNearby
              formData={formData}
              drivers={drivers}
              page={page}
              perPage={perPage}
              total={total}
              changePage={changePage}
              isLoading={isLoading}
              handleSearchDriver={handleSearchDriver}
              searchDriver={searchDriver}
              handleDriverSelect={handleDriverSelect}
            />
          </div>
        </div>
        <OrderStartEndSelector
          formData={formData}
          handleChange={handleChange}
          getAvailablePoints={getAvailablePoints}
        />
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
        <button type="submit">Create Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderCreateView;
