'use client';

import React from 'react';
import { useOrderCreateLogic } from '@features/orders/create/OrderCreate.logic';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import OrderStartEndSelector from '@widgets/orders/order-route/OrderRouteSelector';
import FilterTariff from '@widgets/filter-tariff/FilterTariff';
import OrderCreateWidget from '@widgets/order-create-widget/OrderCreateWidget';
import { FormProvider } from 'react-hook-form';
import ClientSelector from '@widgets/clients-orders/ClientSelector';
import IntermediatePoints from '@widgets/intermediate-points/IntermediatePoints';
import AdditionalServices from '@widgets/orders/additional-services/AdditionalServices';
import WaitingTimeControl from '@widgets/orders/waiting-time-control/WaitingTimeControl';
import HeaderOrder from '@widgets/orders/header-order/HeaderOrder';
import CalendarOrder from '@widgets/orders/calendar-order/CalendarOrder';

interface OrderCreateViewProps {
  uuid?: string;
}

const OrderCreateView: React.FC<OrderCreateViewProps> = ({ uuid }) => {
  const formMethods = useOrderCreateLogic(uuid);

  return (
    <FormProvider {...formMethods}>
      <div className={'flex flex-col gap-4'}>
        <HeaderOrder uuid={uuid} />
        <div className={'flex flex-col gap-8'}>
          <div className="w-full h-[660px] flex flex-row gap-4">
            <div className="hidden lg:flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto bg-white rounded-xl border">
              <MapDriver {...formMethods} />
            </div>
            <div className="flex-1 flex-shrink-0 basis-[calc(35%-1.5rem)] h-auto flex flex-col justify-between gap-4">
              <DriversNearby {...formMethods} />
            </div>
          </div>
          <div className={'flex flex-row gap-4'}>
            <div className={'w-full flex bg-white flex-col gap-8 p-4 rounded-md'}>
              <div className={'w-full flex flex-col rounded-md'}>
                <OrderStartEndSelector {...formMethods} />
              </div>
              <div className={'w-full flex flex-1 flex-col rounded-md'}>
                <ClientSelector {...formMethods} />
              </div>
            </div>
            <div className={'w-full flex flex-col bg-white rounded-md'}>
              <CalendarOrder />
            </div>
          </div>
          <div className={'w-full flex flex-row gap-4'}>
            <div className="w-full flex bg-white flex-col gap-8 p-4 rounded-md">
              <div className={'flex flex-row gap-4 bg-white rounded-xl'}>
                <div className={'w-full flex flex-col gap-4'}>
                  <AdditionalServices {...formMethods} />
                  <WaitingTimeControl {...formMethods} />
                </div>
                <IntermediatePoints {...formMethods} />
              </div>
            </div>
            <FilterTariff {...formMethods} />
          </div>
          <OrderCreateWidget {...formMethods} />
        </div>
      </div>
    </FormProvider>
  );
};

export default OrderCreateView;
