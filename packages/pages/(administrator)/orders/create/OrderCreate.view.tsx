'use client';

import React, { FC, useState, useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { Decimal } from 'decimal.js';
import {
  Point,
  Tariff,
  User,
  TariffOnService,
  OrderOnTariffAdditionalService,
  OrderStatus,
} from '@prisma/client';
import useTariffs from '@features/orders/create/hooks/tariffs/useTariffs';
import useCreateAdminOrderLogic from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { useRouter } from 'next/navigation';
import { useOrderCreateDrivers } from '@features/orders/create/hooks/driver/useOrderCreateDrivers';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import PointSelector from '@features/orders/create/inputs/PointSelector';
import AdditionalPoints from '@features/orders/create/inputs/AdditionalPoints';
import usePointSelector from '@features/orders/create/hooks/points/usePointSelector';
import useAdditionalServices from '@features/orders/create/hooks/additional-services/useAdditionalServices';
import { showToast } from '@shared/components/toast/ToastManager';
import useWaitTime from '@features/orders/create/hooks/wait/useWaitTime';
import usePointSelectionHandlers from '@features/orders/create/hooks/points/usePointSelectionHandlers';
import useTotalPrice from '@features/orders/create/hooks/price/useTotalPrice';
import TariffCheckbox from '@features/orders/create/ui/TariffCheckbox';
import AdditionalServicesList from '@features/orders/create/ui/AdditionalServicesList';
import RouteMap from '@features/orders/create/ui/RouteMap';
import WaitTimeSelector from '@features/orders/create/ui/WaitTimeSelector';
import RouteInfo from '@features/orders/create/ui/RouteInfo';
import ClientSelector from '@features/orders/create/ui/ClientSelector';
import { useOrderCreateClients } from '@features/orders/create/hooks/clients/useOrderCreateClients';
import useAllPoints from '@features/orders/create/hooks/points/useAllPoints';
import useAllAdditionalServices from '@features/orders/create/hooks/points/useAllAdditionalServices';

export type TariffWithServices = Tariff & {
  tariffAdditionalServices: (TariffOnService & {
    orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
  })[];
};

export type OrderData = {
  uuid: string;
  createdBy: Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;
  tariff: Pick<Tariff, 'uuid' | 'name' | 'serviceLevel' | 'vehicleType' | 'description'> & {
    tariffAdditionalServices: (TariffOnService & {
      orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
    })[];
  };
  departurePoint: Pick<
    Point,
    'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > | null;
  arrivalPoint: Pick<
    Point,
    'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > | null;
  assignedDriver?: Pick<
    User,
    'uuid' | 'fullName' | 'email' | 'phone' | 'role' | 'profilePhotoPath'
  >;
  departureTime: string;
  selectedServices: string[];
  intermediatePoints: Array<
    Pick<Point, 'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'> & {
      pricePerKm: number;
    }
  >;
  description: string | null;
  flightNumber: string | null;
  status: OrderStatus;
  basePrice: number;
};

interface OrderProps {
  mode: 'create' | 'edit';
  orderData?: OrderData | null;
}

const OrderCreateView: FC<OrderProps> = ({ mode, orderData }) => {
  const router = useRouter();

  console.log('orderData', orderData);

  const tariffAndServices = useTariffs();
  const { allPoints } = useAllPoints();
  const { allServices } = useAllAdditionalServices();

  const tariffs = tariffAndServices.tariffs as TariffWithServices[];

  const [routeDistance, setRouteDistance] = useState<number>(0);
  const handleDistanceUpdate = useCallback((distance: number) => {
    setRouteDistance(distance);
  }, []);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);

  const [_orderStatus, setOrderStatus] = useState<OrderStatus>(orderData?.status || 'PENDING');
  const handleStatusChange = useCallback((newStatus: OrderStatus) => {
    setOrderStatus(newStatus);
  }, []);

  const {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  } = useCreateAdminOrderLogic(tariffs, orderData);

  const { handleSubmit, control, setValue } = formMethods;

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

  const handleDurationUpdate = useCallback((duration: string | null) => {
    setRouteDuration(duration);
  }, []);

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

  const {
    availableServices,
    handleServiceSelection,
    selectedServices,
    totalAdditionalServicesPrice,
  } = useAdditionalServices(selectedTariff, allServices, orderData);

  const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } =
    useWaitTime({
      selectedTariff,
      departurePoint,
    });

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

  const { totalPrice, handleEditPrice, resetPrice, priceComponents } = useTotalPrice({
    tariffPrice: selectedTariff?.price ? new Decimal(selectedTariff.price) : null,
    additionalServicesPrice: totalAdditionalServicesPrice
      ? new Decimal(totalAdditionalServicesPrice)
      : null,
    waitTimeCost: additionalWaitTimeCost ? new Decimal(additionalWaitTimeCost) : null,
    routeCost: routeCost ? new Decimal(routeCost) : null,
  });

  const handlePointSelect = useCallback(
    (point: Point, isSelected: boolean) => {
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
          } else {
            showToast.error('Достигнут лимит точек маршрута');
          }
        }
      }
    },
    [departurePoint, arrivalPoint, additionalPoints, handleSelectPoint],
  );

  const onSubmit = async (data: any) => {
    const isNewClientMode = !!data.fullName && !!data.phone;

    const payload = {
      createdBy: isNewClientMode ? undefined : orderData?.createdBy?.uuid || data.createdBy?.uuid,
      tariffUuid: selectedTariff?.uuid || orderData?.tariff?.uuid,
      departureTime: data.departureTime?.departureTime || new Date(),
      departurePoint: departurePoint?.uuid || data.departurePoint?.uuid,
      arrivalPoint: arrivalPoint?.uuid || data.arrivalPoint?.uuid,
      intermediatePoints:
        data.intermediatePoints
          ?.map((point) => point?.uuid)
          .filter((uuid): uuid is string => Boolean(uuid)) || [],
      basePrice: data.basePrice ? Number(data.basePrice) : totalPrice.toNumber(),
      selectedServices: selectedServices || orderData?.selectedServices || [],
      assignedDriverId: selectedDriverInfo?.uuid || data.assignedDriverId?.assignedDriverId || null,
      description: data.description?.description || data.description || '',
      flightNumber: data.flightNumber?.flightNumber || data.flightNumber || '',
      waitingTimeMinutes: waitTime || 0,
      fullName: data.fullName || undefined,
      phone: data.phone || undefined,
      status: data.status as OrderStatus,
    };

    console.log('payload', payload);

    try {
      const response =
        mode === 'create'
          ? await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/orders/${orderData?.uuid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      const responseData = await response.json();
      console.log('Server response:', responseData); // Отладка

      if (response.ok) {
        showToast.success(mode === 'create' ? 'Заказ создан успешно!' : 'Заказ обновлен успешно!');
        router.push('/orders');
      } else {
        showToast.error('Ошибка при сохранении заказа: ' + JSON.stringify(responseData));
      }
    } catch (error) {
      showToast.error(
        'Ошибка запроса: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'),
      );
    }
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
          {/* Секция с водителями */}
          <section className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  1
                </span>
                Выбор водителя
              </h2>
            </div>

            <div className="p-4 bg-gradient-to-bl from-cyan-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
                <div className="bg-gray-50 rounded-xl overflow-hidden h-full border border-gray-200 shadow-lg">
                  <MapDriver
                    selectedDriverInfo={selectedDriverInfo}
                    serverTime={serverTime || new Date()}
                  />
                </div>
                <div className="h-[646px]  overflow-y-auto rounded-xl">
                  <DriversNearby
                    drivers={drivers}
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
            </div>
          </section>

          {/* Секция с клиентами */}
          <section className="overflow-hidden">
            <div className="bg-gradient-to-bl from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </span>
                Выбор клиента
              </h2>
            </div>
            <div className="p-4 bg-gradient-to-tl from-cyan-50 to-white">
              <ClientSelector
                control={formMethods.control}
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
          </section>

          {/* Секция с тарифом и доп. услугами */}
          <section className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  3
                </span>
                Тариф и дополнительные услуги
              </h2>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-white shadow-lg'">
              <div className={'grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6'}>
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
                  <div className={'flex flex-col gap-2'}>
                    <label className="block text-gray-700 text-[20px] font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
                      Описание тарифа
                      <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
                    </label>
                    <div className="flex flex-col gap-2">
                      <h2 className="font-helvetica-neue text-4 leading-4 font-light truncate">
                        <strong>{selectedTariff?.description}</strong>
                      </h2>
                    </div>
                  </div>
                  {/* Добавленный блок с дополнительной информацией о тарифах */}
                  <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">Важная информация о тарифах</span>
                    </div>
                    <p>
                      При выборе тарифа учитывайте особенности вашей поездки. Некоторые тарифы могут
                      включать дополнительные услуги или предлагать специальные условия.
                    </p>
                  </div>
                </div>
                <div className={'flex flex-col gap-4'}>
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
          </section>

          {/* Секция с маршрутом */}
          <section className="overflow-hidden bg-gradient-to-tr from-cyan-50 to-white">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  4
                </span>
                Настройка маршрута
              </h2>
            </div>

            <div className="flex flex-row gap-4 p-4">
              <div className={'grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6'}>
                <div className={'w-full flex'}>
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
                </div>
                <div className={'w-full flex flex-row gap-4 '}>
                  <div className={'w-full flex flex-col gap-4'}>
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
                      arrivalPointPrice={
                        arrivalPoint?.pricePerKm ? Number(arrivalPoint.pricePerKm) : undefined
                      }
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
                      onSelectPoint={(point, index) =>
                        handleSelectPoint(point, 'additional', index)
                      }
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
            </div>
          </section>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                5
              </span>
              Информация о маршруте
            </h2>
          </div>
          <RouteInfo
            control={formMethods.control}
            departurePoint={departurePoint}
            additionalPoints={additionalPoints ?? []}
            arrivalPoint={arrivalPoint}
            routeDuration={routeDuration}
            routeDistance={routeDistance}
            totalPrice={totalPrice}
            mode={mode}
            onStatusChange={handleStatusChange}
            selectedDriverInfo={selectedDriverInfo}
            handleEditPrice={handleEditPrice}
            resetPrice={resetPrice}
            tariffPrice={priceComponents.tariffPrice}
            additionalServicesPrice={priceComponents.additionalServicesPrice}
            basePrice={orderData?.basePrice ? new Decimal(orderData.basePrice) : null}
            waitTimeCost={priceComponents.waitTimeCost}
            routeCost={priceComponents.routeCost}
          />
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {mode === 'create' ? 'Создать заказ' : 'Сохранить изменения'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default OrderCreateView;
