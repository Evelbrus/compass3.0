import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

import useTariffAndServices from '@shared/components/modal/create-client-corp-order/hooks/useTariffAndServices';
import usePointSelection from '@shared/components/modal/create-client-corp-order/hooks/usePointSelection';
import useAdditionalPoints from '@shared/components/modal/create-client-corp-order/hooks/useAdditionalPoints';
import useCreateClientCorpOrder from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';

import TariffSelector from '@shared/components/modal/create-client-corp-order/TariffSelector';
import DepartureTimeInput from '@shared/components/modal/create-client-corp-order/DepartureTimeInput';
import PointSelector from '@shared/components/modal/create-client-corp-order/PointSelector';
import AdditionalPoints from '@shared/components/modal/create-client-corp-order/AdditionalPoints';
import OrderDetailsInput from '@shared/components/modal/create-client-corp-order/OrderDetailsInput';
import AdditionalServiceItem from '@shared/components/modal/create-client-corp-order/AdditionalServiceItem';
import useAdditionalServices from '@shared/components/modal/create-client-corp-order/hooks/useAdditionalServicesSelection';

interface CreateClientCorpOrderProps {
  onClose: () => void;
}

const CreateClientCorpOrder: React.FC<CreateClientCorpOrderProps> = ({ onClose }) => {
  const additionalServicesData = useAdditionalServices();
  const tariffAndServices = useTariffAndServices('');
  const departurePointSelection = usePointSelection({ type: 'departure' });
  const arrivalPointSelection = usePointSelection({ type: 'arrival' });
  const additionalPoints = useAdditionalPoints(
    departurePointSelection.selectedPoint,
    arrivalPointSelection.selectedPoint,
    departurePointSelection.points,
  );

  const formMethods = useCreateClientCorpOrder({
    onClose,
    tariffs: tariffAndServices.tariffs,
    additionalServices: additionalServicesData.additionalServices,
    isServiceAvailableForTariff: tariffAndServices.isServiceAvailableForTariff,
  });

  if (tariffAndServices.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-3xl">
          <div>Загрузка...</div>
        </AnimatedComponent>
      </div>
    );
  }

  if (tariffAndServices.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-3xl">
          <div>Ошибка: {tariffAndServices.error}</div>
          <IButton onClick={formMethods.closeModalHandler}>Закрыть</IButton>
        </AnimatedComponent>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 overflow-y-auto">
      <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-3xl">
        <IButton
          variant="close"
          onClick={formMethods.closeModalHandler}
          aria-label="Закрыть модальное окно"
          className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
        >
          <CloseIcon />
        </IButton>
        <h2 className="text-2xl font-semibold mb-4">Создать новый заказ</h2>

        <TariffSelector
          tariffs={tariffAndServices.tariffs}
          selectedTariff={formMethods.selectedTariff}
          onTariffChange={formMethods.setSelectedTariff}
        />

        <DepartureTimeInput
          {...formMethods.formMethods.register('departureTime')}
          onTimeChange={(value) => formMethods.formMethods.setValue('departureTime', value)}
          departureTime={formMethods.formMethods.watch('departureTime')}
        />

        <PointSelector
          label="Откуда?"
          points={departurePointSelection.points}
          selectedValue={formMethods.departurePoint}
          searchValue={departurePointSelection.searchValue}
          search={departurePointSelection.search}
          isOpen={departurePointSelection.isOpen}
          loading={departurePointSelection.loading}
          totalPoints={departurePointSelection.totalPoints}
          currentPage={departurePointSelection.currentPage}
          observerRef={departurePointSelection.observerRef}
          selectorRef={departurePointSelection.ref}
          onOpenSelect={() => departurePointSelection.setIsOpen(true)}
          onSearchValueChange={departurePointSelection.setSearchValue}
          onSearchChange={departurePointSelection.setSearch}
          onSelectPoint={departurePointSelection.handleSelectPoint}
          onLoadPoints={departurePointSelection.loadPoints}
          type="departure"
        />

        <PointSelector
          label="Куда?"
          points={arrivalPointSelection.points}
          selectedValue={formMethods.arrivalPoint}
          searchValue={arrivalPointSelection.searchValue}
          search={arrivalPointSelection.search}
          isOpen={arrivalPointSelection.isOpen}
          loading={arrivalPointSelection.loading}
          totalPoints={arrivalPointSelection.totalPoints}
          currentPage={arrivalPointSelection.currentPage}
          observerRef={arrivalPointSelection.observerRef}
          selectorRef={arrivalPointSelection.ref}
          onOpenSelect={() => arrivalPointSelection.setIsOpen(true)}
          onSearchValueChange={arrivalPointSelection.setSearchValue}
          onSearchChange={arrivalPointSelection.setSearch}
          onSelectPoint={arrivalPointSelection.handleSelectPoint}
          onLoadPoints={arrivalPointSelection.loadPoints}
          type="arrival"
        />

        {/*Дополнительные услуги */}
        <div>
          <label className="block text-5 leading-5 font-bold mb-2">Дополнительные услуги</label>
          <ul className="space-y-2">
            {tariffAndServices.additionalServices.map((service) => {
              const tas = formMethods.isServiceAvailableForTariff(service.uuid);
              const isAvailable = tas ? tas.isAvailable : false;
              const price = tas ? tas.price : 0;
              const isChecked = formMethods.selectedAdditionalServices.some(
                (s) => s.uuid === service.uuid,
              );
              return (
                <AdditionalServiceItem
                  key={service.uuid}
                  serviceUuid={service.uuid}
                  name={service.name}
                  isAvailable={isAvailable}
                  price={price}
                  isChecked={isChecked}
                  onAdditionalServiceChange={formMethods.handleAdditionalServiceChangeCallback}
                />
              );
            })}
          </ul>
        </div>

        {/*Компонент для дополнительных точек */}
        <AdditionalPoints
          selectedAdditionalPoints={formMethods.additionalPointsSelected}
          handleSetAdditionalPoints={formMethods.handleSetAdditionalPoints}
          getAvailablePoints={formMethods.getAvailablePoints}
          additionalPointStates={additionalPoints.additionalPointStates}
          setAdditionalPointSearch={additionalPoints.setAdditionalPointSearch}
          setAdditionalPointSearchValue={additionalPoints.setAdditionalPointSearchValue}
          setAdditionalPointIsOpen={additionalPoints.setAdditionalPointIsOpen}
          loadAdditionalPoints={additionalPoints.loadAdditionalPoints}
          additionalPointObservers={additionalPoints.additionalPointObservers}
          additionalPointRefs={additionalPoints.additionalPointRefs}
          handleSelectAdditionalPoint={formMethods.handleSetAdditionalPoints}
        />

        <form onSubmit={formMethods.handleCreateOrder}>
          <OrderDetailsInput
            flightNumber={formMethods.formMethods.watch('flightNumber')}
            description={formMethods.formMethods.watch('description')}
            onFlightNumberChange={(value) =>
              formMethods.formMethods.setValue('flightNumber', value)
            }
            onDescriptionChange={(value) => formMethods.formMethods.setValue('description', value)}
            {...formMethods.formMethods.register('flightNumber')}
            {...formMethods.formMethods.register('description')}
          />

          <div className="flex justify-end gap-2">
            <IButton onClick={formMethods.closeModalHandler}>Отменить</IButton>
            <IButton
              type="submit"
              disabled={
                !formMethods.selectedTariff ||
                !formMethods.departurePoint ||
                !formMethods.arrivalPoint
              }
            >
              Создать заказ
            </IButton>
          </div>
        </form>
      </AnimatedComponent>
    </div>
  );
};

export default CreateClientCorpOrder;
