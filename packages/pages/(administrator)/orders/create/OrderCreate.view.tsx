'use client';

import React, { FC, useState, useCallback, useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { Decimal } from 'decimal.js';
import { Point, UserRole } from '@prisma/client';
import { OrderData, PointWithoutTimestamps } from '@features/orders/create/types/types';
import {
  useAdditionalServices,
  useAllAdditionalServices,
  useAllPoints,
  useCreateAdminOrderLogic,
  useOrderCreateDrivers,
  usePointSelectionHandlers,
  usePointSelector,
  useTariffs,
  useTotalPrice,
  useWaitTime,
  useOrderCreateClients,
  useOrderSubmit,
} from '@features/orders/create/hooks';
import { getOrderStepsConfig, OrderStepType } from '@features/orders/create/config/steps';
import { OrderStepSection } from '@features/orders/create/ui/OrderStepSection';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import { AdditionalPoints, PointSelector } from '@features/orders/create/inputs';
import {
  AdditionalServicesList,
  ClientSelector,
  RouteInfo,
  RouteMap,
  WaitTimeSelector,
  TariffCheckbox,
} from '@features/orders/create/ui';

// Пропсы компонента
interface OrderProps {
  role: UserRole;
  mode: 'create' | 'edit';
  orderData?: OrderData | null;
  customStepsConfig?: Record<OrderStepType, any>;
  customStepsOrder?: OrderStepType[];
}

const OrderCreateView: FC<OrderProps> = ({
  role,
  mode,
  orderData,
  customStepsConfig,
  customStepsOrder,
}) => {
  // Конфигурация шагов
  const steps = useMemo(() => {
    return getOrderStepsConfig(customStepsConfig, customStepsOrder);
  }, [customStepsConfig, customStepsOrder]);

  // Хуки для данных
  const tariffAndServices = useTariffs();
  const { allPoints } = useAllPoints();
  const { allServices } = useAllAdditionalServices();
  const tariffs = tariffAndServices.tariffs;

  // Состояние маршрута
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const handleDistanceUpdate = useCallback((distance: number) => {
    setRouteDistance(distance);
  }, []);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const handleDurationUpdate = useCallback((duration: string | null) => {
    setRouteDuration(duration);
  }, []);

  // Логика создания заказа
  const {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  } = useCreateAdminOrderLogic(tariffs, orderData);

  const { handleSubmit, control, setValue } = formMethods;

  // Клиенты
  const {
    clients,
    selectedClientInfo,
    savedClientInfo,
    searchClient,
    handleSearchChange,
    handleClientSelection,
    loadMore,
    total: clientsTotal,
  } = useOrderCreateClients({
    assignedClientId: orderData?.createdBy?.uuid || null,
    setValue,
  });

  // Водители
  const {
    drivers,
    searchDriver,
    isDriversLoading,
    selectedDriverInfo,
    page,
    perPage,
    total,
    serverTime,
    handleSearchDriverChange,
    handleDriverClick,
    handlePageChange,
  } = useOrderCreateDrivers({
    assignedDriverId: orderData?.assignedDriver?.uuid ?? null,
    setValue,
    selectedVehicleType,
    selectedServiceLevel,
    setSelectedVehicleType: handleVehicleTypeChange,
    setSelectedServiceLevel: handleServiceLevelChange,
  });

  // Селекторы точек
  const {
    isOpen: isFromOpen,
    searchValue: fromSearchValue,
    search: fromSearch,
    filteredPoints: fromFilteredPoints,
    loading: fromLoading,
    onOpenSelect: onFromOpenSelect,
    onSearchValueChange: onFromSearchValueChange,
    handleSearchChange: handleFromSearchChange,
    onSelectPoint: onFromSelectPoint,
    selectorRef: fromSelectorRef,
    observerRef: fromObserverRef,
    selectedPoint: departurePoint,
  } = usePointSelector({
    mode: 'single',
    allPoints,
    initialSelectedPoint: orderData?.departurePoint,
  });

  const {
    isOpen: isToOpen,
    searchValue: toSearchValue,
    search: toSearch,
    filteredPoints: toFilteredPoints,
    loading: toLoading,
    onOpenSelect: onToOpenSelect,
    onSearchValueChange: onToSearchValueChange,
    handleSearchChange: handleToSearchChange,
    onSelectPoint: onToSelectPoint,
    selectorRef: toSelectorRef,
    observerRef: toObserverRef,
    selectedPoint: arrivalPoint,
  } = usePointSelector({
    mode: 'single',
    allPoints,
    initialSelectedPoint: orderData?.arrivalPoint,
  });

  const {
    isOpen: isAdditionalOpen,
    search: additionalSearch,
    filteredPoints: additionalFilteredPoints,
    onOpenSelect: onAdditionalOpenSelect,
    handleSearchChange: handleAdditionalHandleSearchChange,
    onSelectPoint: onAdditionalSelectPoint,
    selectorRef: additionalSelectorRef,
    selectedPoints: additionalPoints,
    onRemovePoint,
    onChangeOrder,
  } = usePointSelector({
    mode: 'multiple',
    allPoints,
    initialSelectedPoints: orderData?.intermediatePoints
      ? [
          ...orderData.intermediatePoints,
          ...Array(5 - orderData.intermediatePoints.length).fill(null),
        ]
      : Array(5).fill(null),
  });

  // Дополнительные услуги
  const {
    availableServices,
    handleServiceSelection,
    selectedServices,
    totalAdditionalServicesPrice,
  } = useAdditionalServices(selectedTariff, allServices, orderData);

  // Время ожидания
  const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } =
    useWaitTime({
      selectedTariff,
      departurePoint,
      initialWaitTime: orderData?.waitingTimeMinutes || 0,
    });

  // Обработка выбора точек
  const { routeCost, handleSelectPoint } = usePointSelectionHandlers({
    departurePoint: departurePoint ?? undefined,
    arrivalPoint: arrivalPoint ?? undefined,
    additionalPoints: additionalPoints ?? [],
    routeDistance,
    onSelectDeparture: onFromSelectPoint,
    onSelectArrival: onToSelectPoint,
    onSelectAdditional: onAdditionalSelectPoint,
    setFormValue: setValue,
  });

  // Итоговая цена
  const { totalPrice, handleEditPrice, resetPrice, priceComponents, priceMode, isPriceEdited } =
    useTotalPrice({
      tariffPrice: selectedTariff?.price ? new Decimal(selectedTariff.price) : null,
      additionalServicesPrice: totalAdditionalServicesPrice
        ? new Decimal(totalAdditionalServicesPrice)
        : null,
      waitTimeCost: additionalWaitTimeCost ? new Decimal(additionalWaitTimeCost) : null,
      routeCost: routeCost ? new Decimal(routeCost) : null,
      initialBasePrice: orderData?.basePrice ? new Decimal(orderData.basePrice) : null,
    });

  // Обработчик выбора точек для карты
  const handlePointSelect = useCallback(
    (point: PointWithoutTimestamps, isSelected: boolean) => {
      if (isSelected) {
        if (departurePoint?.uuid === point.uuid) {
          handleSelectPoint(null, 'departure');
        } else if (arrivalPoint?.uuid === point.uuid) {
          handleSelectPoint(null, 'arrival');
        } else if (additionalPoints) {
          const index = additionalPoints.findIndex((p) => p?.uuid === point.uuid);
          if (index !== -1) {
            handleSelectPoint(null, 'additional', index);
          }
        }
      } else {
        if (!departurePoint) {
          handleSelectPoint(point, 'departure');
        } else if (!arrivalPoint) {
          handleSelectPoint(point, 'arrival');
        } else if (additionalPoints) {
          const freeIndex = additionalPoints.findIndex((p) => p === null);
          if (freeIndex !== -1) {
            handleSelectPoint(point, 'additional', freeIndex);
          }
        }
      }
    },
    [departurePoint, arrivalPoint, additionalPoints, handleSelectPoint],
  );

  // Хук для отправки данных
  const onSubmit = useOrderSubmit(
    role,
    mode,
    orderData,
    selectedTariff,
    departurePoint,
    arrivalPoint,
    selectedServices,
    totalPrice,
    waitTime,
    selectedDriverInfo,
  );

  // Компоненты шагов
  const stepDriverSelection = (
    <div className="p-4 bg-gradient-to-bl from-cyan-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
        <MapDriver selectedDriverInfo={selectedDriverInfo} serverTime={serverTime || new Date()} />
        <DriversNearby
          drivers={drivers || []}
          isDriversLoading={isDriversLoading}
          searchDriver={searchDriver}
          handleSearchDriverChange={handleSearchDriverChange}
          selectedDriverInfo={selectedDriverInfo}
          handleDriverClick={handleDriverClick}
          page={parseInt(page)}
          perPage={parseInt(perPage)}
          currentTotal={total}
          handlePageChange={(newPage) => handlePageChange(String(newPage))}
          serverTime={serverTime || new Date()}
        />
      </div>
    </div>
  );

  const stepClientSelection = (
    <div className="p-4 bg-gradient-to-tl from-cyan-50 to-white">
      <ClientSelector
        control={control}
        clients={clients}
        selectedClientInfo={selectedClientInfo}
        savedClientInfo={savedClientInfo}
        searchClient={searchClient}
        handleSearchChange={handleSearchChange}
        handleClientSelection={handleClientSelection}
        loadMore={loadMore}
        total={clientsTotal}
        initialClient={orderData?.createdBy as any}
      />
    </div>
  );

  const stepTariffServices = (
    <div className="p-4 bg-gradient-to-br from-cyan-50 to-white shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
        <div className="relative w-full flex flex-col justify-between rounded-lg p-6">
          <TariffCheckbox
            tariffs={tariffs}
            selectedServiceLevel={selectedServiceLevel}
            selectedVehicleType={selectedVehicleType}
            selectedTariffUuid={selectedTariff?.uuid || null}
            handleServiceLevelChange={handleServiceLevelChange}
            handleVehicleTypeChange={handleVehicleTypeChange}
            {...formMethods}
          />
          <div className="mt-6">
            <label className="block text-gray-700 text-[20px] font-bold">Описание тарифа</label>
            <p>{selectedTariff?.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <WaitTimeSelector
            waitTime={waitTime}
            additionalWaitTimeCost={additionalWaitTimeCost}
            adjustWaitTime={adjustWaitTime}
            minWaitTime={minWaitTime}
            maxWaitTime={maxWaitTime}
            departurePoint={departurePoint}
            freeWaitTime={selectedTariff?.freeWaitTimeAirport ?? 0}
          />
          <AdditionalServicesList
            label="Дополнительные опции"
            availableServices={availableServices}
            handleServiceSelection={handleServiceSelection}
            selectedServices={selectedServices}
            totalAdditionalServicesPrice={totalAdditionalServicesPrice}
          />
        </div>
      </div>
    </div>
  );

  const stepRouteConfig = (
    <div className="flex flex-row gap-4 p-4 bg-gradient-to-br from-cyan-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
        <RouteMap
          allPoints={allPoints}
          selectedPoints={[
            departurePoint,
            ...(additionalPoints?.filter((p): p is Point => p !== null) ?? []),
            arrivalPoint,
          ].filter((p): p is Point => p !== null)}
          onPointSelect={handlePointSelect}
          onDistanceUpdate={handleDistanceUpdate}
          onDurationUpdate={handleDurationUpdate}
        />
        <div className="w-full flex flex-col gap-4">
          <PointSelector
            control={control}
            name="departurePoint"
            label="Адрес подачи (A)"
            isOpen={isFromOpen}
            searchValue={fromSearchValue}
            onOpenSelect={onFromOpenSelect}
            onSearchValueChange={onFromSearchValueChange}
            search={fromSearch}
            handleSearchChange={handleFromSearchChange}
            filteredPoints={fromFilteredPoints}
            loading={fromLoading}
            onSelectPoint={(point) => handleSelectPoint(point, 'departure')}
            selectorRef={fromSelectorRef}
            observerRef={fromObserverRef}
            selectedPoint={departurePoint}
            departurePoint={departurePoint}
            arrivalPoint={arrivalPoint}
            additionalPoints={additionalPoints || []}
            currentSelectorType="departurePoint"
            selectedServices={selectedServices}
            availableServices={availableServices}
          />
          <PointSelector
            control={control}
            name="arrivalPoint"
            label="Адрес прибытия (B)"
            isOpen={isToOpen}
            searchValue={toSearchValue}
            onOpenSelect={onToOpenSelect}
            onSearchValueChange={onToSearchValueChange}
            search={toSearch}
            handleSearchChange={handleToSearchChange}
            filteredPoints={toFilteredPoints}
            loading={toLoading}
            onSelectPoint={(point) => handleSelectPoint(point, 'arrival')}
            selectorRef={toSelectorRef}
            observerRef={toObserverRef}
            selectedPoint={arrivalPoint}
            departurePoint={departurePoint}
            arrivalPoint={arrivalPoint}
            additionalPoints={additionalPoints || []}
            currentSelectorType="arrivalPoint"
            selectedServices={selectedServices}
            availableServices={availableServices}
          />
          <AdditionalPoints
            control={control}
            name="intermediatePoints"
            label="Дополнительные остановки"
            isOpen={isAdditionalOpen}
            onOpenSelect={onAdditionalOpenSelect}
            search={additionalSearch}
            handleSearchChange={handleAdditionalHandleSearchChange}
            filteredPoints={additionalFilteredPoints}
            onSelectPoint={(point, index) => handleSelectPoint(point, 'additional', index)}
            selectorRef={additionalSelectorRef}
            selectedPoints={additionalPoints ?? []}
            onRemovePoint={onRemovePoint || (() => {})}
            onChangeOrder={onChangeOrder}
            departurePoint={departurePoint}
            arrivalPoint={arrivalPoint}
            additionalPoints={additionalPoints || []}
            currentSelectorType="additionalPoints"
            selectedServices={selectedServices}
            availableServices={availableServices}
          />
        </div>
      </div>
    </div>
  );

  const stepRouteInfo = (
    <div className="bg-gradient-to-tr from-cyan-50 to-white">
      <RouteInfo
        control={formMethods.control}
        departurePoint={departurePoint}
        additionalPoints={additionalPoints ?? []}
        arrivalPoint={arrivalPoint}
        routeDuration={routeDuration}
        routeDistance={routeDistance}
        totalPrice={totalPrice}
        mode={mode}
        onStatusChange={(status) => setValue('status', status)}
        selectedDriverInfo={selectedDriverInfo}
        handleEditPrice={handleEditPrice}
        resetPrice={resetPrice}
        tariffPrice={priceComponents.tariffPrice}
        additionalServicesPrice={priceComponents.additionalServicesPrice}
        waitTimeCost={priceComponents.waitTimeCost}
        routeCost={priceComponents.routeCost}
        priceMode={priceMode}
        isPriceEdited={isPriceEdited}
      />
    </div>
  );

  const stepComponentsMap: Record<OrderStepType, React.ReactNode> = {
    'driver-selection': stepDriverSelection,
    'client-selection': stepClientSelection,
    'tariff-services': stepTariffServices,
    'route-config': stepRouteConfig,
    'route-info': stepRouteInfo,
  };

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col">
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-blue-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold">
              {mode === 'create' ? 'Создание нового заказа' : 'Редактирование заказа'}
            </h1>
            <p className="text-blue-100 mt-2">
              Заполните информацию о маршруте, выберите услуги и водителя
            </p>
          </div>

          {steps.map((step, index) => (
            <OrderStepSection
              key={step.id}
              step={step}
              stepIndex={index}
              className={
                index % 2 === 0
                  ? 'bg-gradient-to-bl from-cyan-50 to-white'
                  : 'bg-gradient-to-br from-cyan-50 to-white'
              }
            >
              {stepComponentsMap[step.id as OrderStepType]}
            </OrderStepSection>
          ))}

          <div className="flex justify-end p-8 bg-gradient-to-tr from-cyan-50 to-white">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {mode === 'create' ? 'Создать заказ' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default OrderCreateView;
