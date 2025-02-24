import React from 'react';
import { Point } from '@prisma/client';

interface AdditionalPointsProps {
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: Point[];
  onSelectPoint: (point: Point, index?: number) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  selectedPoints: (Point | null)[];
  onRemovePoint: (index: number) => void;
  onChangeOrder: (currentIndex: number, newIndex: number) => void;
  onMaxLimitReached: () => void;
  totalAdditionalPrice: number;
}

const MAX_POINTS = 5;

const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
  label,
  isOpen,
  searchValue,
  onOpenSelect,
  onSearchValueChange,
  search,
  handleSearchChange,
  filteredPoints,
  onSelectPoint,
  selectorRef,
  selectedPoints,
  onRemovePoint,
  onChangeOrder,
  onMaxLimitReached,
  totalAdditionalPrice,
}) => {
  const selectedCount = selectedPoints.filter(Boolean).length;

  return (
    <div className="w-full relative">
      <label className="flex p-2 border rounded-md bg-[#989898] text-white">{label}</label>
      <div className="my-4">
        <input
          type="text"
          value={searchValue}
          onClick={() => {
            if (selectedCount < MAX_POINTS) {
              onOpenSelect();
            } else {
              onMaxLimitReached();
            }
          }}
          onChange={(e) => onSearchValueChange(e.target.value)}
          placeholder="Добавить остановку..."
          className="w-full p-2 border rounded cursor-pointer"
          readOnly
        />
        {isOpen && selectedCount < MAX_POINTS && (
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
                  const emptyIndex = selectedPoints.findIndex((p) => p === null);
                  if (emptyIndex !== -1) {
                    onSelectPoint(point, emptyIndex);
                  }
                  console.log('нажал на город', point);
                }}
              >
                {point.address}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {Array.from({ length: MAX_POINTS }).map((_, index) => {
          const point = selectedPoints[index];
          const letter = String.fromCharCode(67 + index); // C, D, E и т.д.
          return (
            <div key={index} className="flex flex-row gap-2">
              <select
                value={index + 1}
                onChange={(e) => {
                  const newIndex = Number(e.target.value) - 1;
                  if (newIndex !== index) {
                    onChangeOrder(index, newIndex);
                  }
                }}
                className="p-2 border-2 rounded-md"
              >
                {Array.from({ length: MAX_POINTS }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <div className="w-full flex items-center justify-between p-2 border border-gray-300 rounded">
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-semibold text-green-500">{letter}</span>
                  {point ? (
                    <span>{point.address}</span>
                  ) : (
                    <span className="text-gray-400">Пусто</span>
                  )}
                </div>
                {point && (
                  <button
                    type="button"
                    onClick={() => onRemovePoint(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label="Удалить остановку"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Вы можете через селектор изменить порядок остановок.
      </div>
    </div>
  );
};

export default AdditionalPoints;
