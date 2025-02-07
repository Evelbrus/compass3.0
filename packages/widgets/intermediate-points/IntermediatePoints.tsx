import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form';
import { Point } from '@prisma/client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface IntermediatePointsProps {
  selectedIntermediatePoints: (Point | null)[];
  intermediatePointOptions: Array<Array<{ label: string; value: string; key: string }>>;
  handleIntermediatePointSelect: (index: number, point: Point | null) => void;
  handleClearIntermediatePoint: (index: number) => void;
  handleIntermediateSearchChange: (value: string, index: number) => void;
  handleOpenSelect: (index: number) => void;
  intermediateSearches: string[];
  formMethods: UseFormReturn<CreateOrderData>;
  points: Point[] | null;
  total: number;
  loadMore: (listType: 'intermediate', index: number) => void;
  totalIntermediatePointsPrice: string | number;
}

const IntermediatePoints: React.FC<IntermediatePointsProps> = ({
  selectedIntermediatePoints,
  intermediatePointOptions,
  handleIntermediatePointSelect,
  handleClearIntermediatePoint,
  handleIntermediateSearchChange,
  handleOpenSelect,
  intermediateSearches,
  formMethods,
  points,
  total,
  loadMore,
  totalIntermediatePointsPrice,
}) => {
  const { control } = useFormContext<CreateOrderData>();
  const [openSelectIndex, setOpenSelectIndex] = useState<number | null>(null);

  const isLoadingIntermediate = useRef<boolean[]>(Array.from({ length: 5 }, () => false));
  const lastPageLoadedIntermediate = useRef<number[]>(Array.from({ length: 5 }, () => 1));
  const loaderRefIntermediate = useRef<Array<HTMLDivElement | null>>(
    Array.from({ length: 5 }, () => null),
  );

  const isAtLastPageIntermediate = useMemo(
    () =>
      intermediatePointOptions.map(
        (options, index) => points && total > 0 && points.length >= total,
      ),
    [points, total, intermediatePointOptions],
  );

  useEffect(() => {
    const observerCallbacks = [0, 1, 2, 3, 4].map((index) => {
      return (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !isLoadingIntermediate.current[index] &&
          !isAtLastPageIntermediate[index]
        ) {
          isLoadingIntermediate.current[index] = true;
          lastPageLoadedIntermediate.current[index] += 1;
          loadMore('intermediate', index);
        }
      };
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observers = observerCallbacks.map((callback) => {
      return new IntersectionObserver(callback, observerOptions);
    });

    [0, 1, 2, 3, 4].forEach((index) => {
      if (loaderRefIntermediate.current[index]) {
        observers[index].observe(loaderRefIntermediate.current[index]);
      }
    });

    return () => {
      [0, 1, 2, 3, 4].forEach((index) => {
        if (loaderRefIntermediate.current[index]) {
          observers[index].unobserve(loaderRefIntermediate.current[index]);
        }
      });
    };
  }, [loadMore, isAtLastPageIntermediate]);

  useEffect(() => {
    [0, 1, 2, 3, 4].forEach((index) => {
      isLoadingIntermediate.current[index] = false;
    });
  }, [points]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.intermediate-selector')) setOpenSelectIndex(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={'w-full flex flex-col gap-4'}>
      <div>
        <label htmlFor="description" className="block text-5 leading-5 mb-2 font-bold">
          Описание:
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              id="description"
              {...field}
              rows={5}
              className="shadow-sm block w-full sm:text-sm border border-gray-300 p-4 rounded-md resize-none"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <label className="block text-5 leading-5 font-bold">Промежуточные точки</label>
        <span className="block text-3 leading-3 font-medium text-gray-500">
          Общая стоимость {totalIntermediatePointsPrice}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 border p-4 rounded-md">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="relative intermediate-selector flex items-center">
            <div className="flex-grow">
              <Controller
                name={`intermediatePoints.${index}`}
                control={formMethods.control}
                defaultValue=""
                render={({ field }) => (
                  <>
                    <input
                      type="text"
                      value={selectedIntermediatePoints[index]?.address || ''}
                      onClick={() => {
                        setOpenSelectIndex(openSelectIndex === index ? null : index);
                        handleOpenSelect(index);
                      }}
                      placeholder={`Промежуточная точка ${index + 1}`}
                      readOnly
                      className={`text-4 leading-4 p-3 w-full border-b border-gray-300`}
                    />

                    {openSelectIndex === index && (
                      <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
                        <input
                          type="text"
                          autoFocus
                          value={intermediateSearches[index]}
                          onChange={(e) => handleIntermediateSearchChange(e.target.value, index)}
                          placeholder="Поиск..."
                          className="text-4 leading-4 p-3 w-full border-b"
                        />
                        {intermediatePointOptions[index].map((option, optionIndex) => (
                          <div
                            key={`${index}-${optionIndex}-${option.value}`}
                            onClick={() => {
                              const point = points?.find((p) => p.uuid === option.value) || null;
                              handleIntermediatePointSelect(index, point);
                              field.onChange(option.value);
                              setOpenSelectIndex(null);
                            }}
                            className="p-3 cursor-pointer hover:bg-gray-100"
                          >
                            {option.label}
                          </div>
                        ))}

                        {!isAtLastPageIntermediate[index] && (
                          <div
                            ref={(el) => {
                              loaderRefIntermediate.current[index] = el;
                            }}
                            className="p-2 text-center text-gray-500"
                          >
                            {isLoadingIntermediate.current[index] ? 'Загрузка...' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            {selectedIntermediatePoints[index] && (
              <button
                type="button"
                className="ml-3 w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-md"
                onClick={() => {
                  handleClearIntermediatePoint(index);
                  setOpenSelectIndex(null);
                }}
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntermediatePoints;
