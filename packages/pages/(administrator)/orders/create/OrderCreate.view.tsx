'use client';

import React from 'react';
import { useOrderCreateLogic } from '@features/orders/create/OrderCreate.logic';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import OrderStartEndSelector from '@widgets/order-route/OrderRouteSelector';
import ClientWidget from '@widgets/client-widget/ClientWidget';
import FilterTariff from '@widgets/filter-tariff/FilterTariff';
import OrderCreateWidget from '@widgets/order-create-widget/OrderCreateWidget';
import { FormProvider } from 'react-hook-form';

const OrderCreateView = () => {
  const formMethods = useOrderCreateLogic();

  return (
    <FormProvider {...formMethods}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 className="text-2xl font-extrabold">Заказ № 234</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="w-full h-[660px] flex flex-row gap-4 overflow-x-auto">
            <div className="hidden lg:flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto bg-white rounded-xl border">
              <MapDriver />
            </div>
            <div className="flex-1 flex-shrink-0 basis-[calc(35%-1.5rem)] h-auto overflow-auto flex flex-col justify-between gap-4">
              <DriversNearby {...formMethods} />
            </div>
          </div>
          <OrderStartEndSelector {...formMethods} />
          <ClientWidget {...formMethods} formData={formMethods.watch()} />
          <FilterTariff {...formMethods} formData={formMethods.watch()} />
          <OrderCreateWidget {...formMethods} />
        </div>
        {formMethods.message && <p>{formMethods.message}</p>}
      </div>
    </FormProvider>
  );
};

export default OrderCreateView;
