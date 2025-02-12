import React from 'react';
import { Point } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Control, Controller } from 'react-hook-form';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';

interface PointSelectorProps {
  control: Control<CreateClientCorpOrderData>;
  name: keyof Pick<CreateClientCorpOrderData, 'departurePoint' | 'arrivalPoint'>;
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: Point[];
  loading: boolean;
  onSelectPoint: (point: Point) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  observerRef: React.RefObject<HTMLDivElement | null>;
  selectedPoint?: Point | null;
  arrivalPointPrice?: Decimal | null;
}

const PointSelector: React.FC<PointSelectorProps> = ({
  control,
  name,
  label,
  isOpen,
  searchValue,
  onOpenSelect,
  onSearchValueChange,
  search,
  handleSearchChange,
  filteredPoints,
  loading,
  onSelectPoint,
  selectorRef,
  observerRef,
  selectedPoint,
  arrivalPointPrice,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={
        name === 'departurePoint'
          ? { required: 'Выберите адрес подачи' }
          : name === 'arrivalPoint'
            ? { required: 'Выберите адрес прибытия' }
            : {}
      }
      render={({ field, fieldState }) => {
        //Значение в форме хранится как строка (UUID выбранной точки).
        //Если передан полный объект в selectedPoint, то используем его,
        //иначе пытаемся найти объект по UUID среди filteredPoints.
        const selectedPointObj: Point | null =
          selectedPoint ||
          (field.value ? filteredPoints.find((point) => point.uuid === field.value) || null : null);
        const displayValue = selectedPointObj ? selectedPointObj.address : searchValue;

        return (
          <div className="w-full relative">
            <label className="block mb-2">{label}</label>
            <input
              type="text"
              value={displayValue}
              onClick={onOpenSelect}
              onChange={(e) => onSearchValueChange(e.target.value)}
              placeholder="Начните вводить адрес..."
              className="w-full p-2 border rounded"
            />
            {/*Отображение цены под инпутом */}
            {arrivalPointPrice !== undefined && (
              <div className="mt-1 text-sm text-gray-500">
                Сумма до точки прибытия: {arrivalPointPrice ? arrivalPointPrice.toNumber() : 0}с
              </div>
            )}
            {isOpen && (
              <div
                className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto"
                ref={selectorRef}
              >
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Поиск..."
                  className="p-2 w-full border-b"
                />
                {filteredPoints.map((point) => (
                  <div
                    key={point.uuid}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      //Выполняем дополнительные действия (если нужны)
                      onSelectPoint(point);
                      //Обновляем значение поля формы: сохраняем UUID выбранной точки
                      field.onChange(point.uuid);
                    }}
                  >
                    {point.address}
                  </div>
                ))}
                <div ref={observerRef} className="p-2 text-center">
                  {loading ? 'Загрузка...' : ''}
                </div>
              </div>
            )}
            {fieldState.error && (
              <p className="mt-2 text-sm text-red-600">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default PointSelector;
