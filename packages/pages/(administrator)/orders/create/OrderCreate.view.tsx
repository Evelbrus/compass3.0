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
} from '@prisma/client';
import useTariffs from '@shared/components/modal/create-client-corp-order/hooks/tariff/useTariffs';
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
  tariff: Pick<Tariff, 'uuid' | 'name' | 'serviceLevel' | 'vehicleType'> & {
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
  assignedDriver?: Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;
  departureTime: string;
  selectedServices: string[];
  intermediatePoints: Array<
    Pick<Point, 'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'> & {
      pricePerKm: number;
    }
  >;
  description: string | null;
  flightNumber: string | null;
};

interface OrderProps {
  mode: 'create' | 'edit';
  orderData?: OrderData | null;
}

const OrderCreateView: FC<OrderProps> = ({ mode, orderData }) => {
  const router = useRouter();

  const tariffAndServices = useTariffs();
  const { allPoints } = useAllPoints();
  const { allServices } = useAllAdditionalServices();

  const tariffs = tariffAndServices.tariffs as TariffWithServices[];
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);

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
    searchClient,
    handleSearchChange,
    loadMore,
    handleClientSelection,
  } = useOrderCreateClients({
    assignedClientId: orderData?.createdBy?.uuid ?? null,
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
    searchValue: additionalSearchValue,
    search: additionalSearch,
    filteredPoints: additionalFilteredPoints,
    onOpenSelect: onAdditionalOpenSelect,
    onSearchValueChange: onAdditionalSearchValueChange,
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

  const totalPrice = useTotalPrice({
    tariffPrice: selectedTariff?.price ? new Decimal(selectedTariff.price) : null,
    additionalServicesPrice: totalAdditionalServicesPrice
      ? new Decimal(totalAdditionalServicesPrice)
      : null,
    waitTimeCost: additionalWaitTimeCost ? new Decimal(additionalWaitTimeCost) : null,
    routeCost: routeCost ? new Decimal(routeCost) : null,
  });

  const handleDistanceUpdate = useCallback((distance: number) => {
    setRouteDistance(distance);
  }, []);

  const handlePointSelect = useCallback(
    (point: Point, isSelected: boolean) => {
      if (isSelected) {
        // Удаление точки
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
        // Добавление точки
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
    };

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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
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

            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 rounded-xl overflow-hidden h-[500px] border border-gray-200">
                  <MapDriver
                    selectedDriverInfo={selectedDriverInfo}
                    serverTime={serverTime || new Date()}
                  />
                </div>
                <div className="h-full overflow-y-auto rounded-xl border-gray-200 shadow-sm">
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
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </span>
                Выбор клиента
              </h2>
            </div>
            <div className="p-4">
              <ClientSelector
                control={control}
                clients={clients}
                selectedClientInfo={selectedClientInfo}
                searchClient={searchClient}
                handleSearchChange={handleSearchChange}
                handleClientSelection={handleClientSelection}
                loadMore={loadMore}
                total={total}
                initialClient={orderData?.createdBy}
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
            <div className={'flex flex-row gap-4'}>
              <div className="flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto rounded-xl p-8 flex-col">
                <TariffCheckbox
                  tariffs={tariffs}
                  selectedServiceLevel={selectedServiceLevel}
                  selectedVehicleType={selectedVehicleType}
                  selectedTariffUuid={selectedTariff?.uuid || null}
                  handleServiceLevelChange={handleServiceLevelChange}
                  handleVehicleTypeChange={handleVehicleTypeChange}
                  {...formMethods}
                />
                <WaitTimeSelector
                  waitTime={waitTime}
                  additionalWaitTimeCost={additionalWaitTimeCost}
                  adjustWaitTime={adjustWaitTime}
                  minWaitTime={minWaitTime}
                  maxWaitTime={maxWaitTime}
                  departurePoint={departurePoint}
                  freeWaitTime={selectedTariff?.freeWaitTimeAirport ?? 0}
                />
              </div>
              <div className={'w-full flex flex-col gap-4 p-8'}>
                <AdditionalServicesList
                  label="Дополнительные опции"
                  availableServices={availableServices}
                  handleServiceSelection={handleServiceSelection}
                  selectedServices={selectedServices}
                  totalAdditionalServicesPrice={totalAdditionalServicesPrice}
                />
              </div>
            </div>
          </section>

          {/* Секция с маршрутом */}
          <section className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  4
                </span>
                Настройка маршрута
              </h2>
            </div>

            <div className="flex flex-row gap-4 p-4">
              <div className="w-full flex flex-row gap-4 rounded-md">
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
                <div className={'w-full flex flex-row gap-4'}>
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
                      onSelectPoint={(point) => handleSelectPoint(point, 'departure')} // Обновлено
                      selectorRef={fromSelectorRef}
                      observerRef={fromObserverRef}
                      selectedPoint={departurePoint}
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
                      onSelectPoint={(point) => handleSelectPoint(point, 'arrival')} // Обновлено
                      selectorRef={toSelectorRef}
                      observerRef={toObserverRef}
                      selectedPoint={arrivalPoint}
                      arrivalPointPrice={
                        arrivalPoint?.pricePerKm ? Number(arrivalPoint.pricePerKm) : undefined
                      }
                    />
                    <AdditionalPoints
                      control={control}
                      name="intermediatePoints"
                      label="Дополнительные остановки"
                      isOpen={isAdditionalOpen}
                      searchValue={additionalSearchValue}
                      onOpenSelect={onAdditionalOpenSelect}
                      onSearchValueChange={onAdditionalSearchValueChange}
                      search={additionalSearch}
                      handleSearchChange={handleAdditionalHandleSearchChange}
                      filteredPoints={additionalFilteredPoints}
                      onSelectPoint={(point, index) =>
                        handleSelectPoint(point, 'additional', index)
                      } // Обновлено
                      selectorRef={additionalSelectorRef}
                      selectedPoints={additionalPoints ?? []}
                      onRemovePoint={onRemovePoint || (() => {})}
                      onChangeOrder={onChangeOrder}
                    />
                  </div>
                  <RouteInfo
                    departurePoint={departurePoint}
                    additionalPoints={additionalPoints ?? []}
                    arrivalPoint={arrivalPoint}
                    routeDuration={routeDuration}
                    routeDistance={routeDistance}
                  />
                </div>
              </div>
            </div>
          </section>
          <h2 className="text-2xl font-semibold">Общая цена</h2>
          <div>
            <h3>
              Общая сумма заказа: <span className={'font-bold'}>{totalPrice.toNumber()} сом</span>
            </h3>
          </div>
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
