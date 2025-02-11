import React from 'react';
import { Point } from '@prisma/client';

interface PointSelectorProps {
  label: string;
  points: Point[];
  selectedValue: string;
  searchValue: string;
  search: string;
  isOpen: boolean;
  loading: boolean;
  totalPoints: number;
  currentPage: number;
  observerRef: React.RefObject<HTMLDivElement>;
  selectorRef: React.RefObject<HTMLDivElement>;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSelectPoint: (point: Point) => void;
  onLoadPoints: (searchQuery: string, nextPage?: number) => Promise<void>;
  type: 'departure' | 'arrival';
}

const PointSelector: React.FC<PointSelectorProps> = ({
  label,
  points,
  searchValue,
  search,
  isOpen,
  loading,
  observerRef,
  selectorRef,
  onOpenSelect,
  onSearchValueChange,
  onSearchChange,
  onSelectPoint,
}) => {
  const filteredPoints = points.filter((point) =>
    point.address.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="w-full relative" ref={selectorRef}>
      <label className="block mb-2">{label}</label>
      <input
        type="text"
        value={searchValue}
        onClick={onOpenSelect}
        onChange={(e) => onSearchValueChange(e.target.value)}
        placeholder="Начните вводить адрес..."
        className="w-full p-2 border rounded"
      />
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
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
              onClick={() => onSelectPoint(point)}
            >
              {point.address}
            </div>
          ))}
          <div ref={observerRef} className="p-2 text-center">
            {loading ? 'Загрузка...' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointSelector;
