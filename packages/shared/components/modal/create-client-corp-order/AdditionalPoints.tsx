import React, { useEffect } from 'react';
import { Point } from '@prisma/client';

interface AdditionalPointsProps {
  selectedAdditionalPoints: (Point | null)[];
  handleSetAdditionalPoints: (index: number, point: Point | null) => void;
  getAvailablePoints: () => Point[];

  additionalPointStates: {
    points: Point[];
    search: string;
    searchValue: string;
    isOpen: boolean;
    currentPage: number;
    totalPoints: number;
    observerRef: React.RefObject<HTMLDivElement>;
    ref: React.RefObject<HTMLDivElement>;
    loading: boolean;
  }[];
  setAdditionalPointSearch: (index: number, search: string) => void;
  setAdditionalPointSearchValue: (index: number, searchValue: string) => void;
  setAdditionalPointIsOpen: (index: number, isOpen: boolean) => void;
  loadAdditionalPoints: (index: number, searchQuery: string, nextPage?: number) => Promise<void>;
  additionalPointObservers: React.RefObject<HTMLDivElement>[];
  additionalPointRefs: React.RefObject<HTMLDivElement>[];
  handleSelectAdditionalPoint: (index: number, point: Point) => void;
}

const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
  selectedAdditionalPoints,
  handleSetAdditionalPoints,
  getAvailablePoints,
  additionalPointStates,
  setAdditionalPointSearch,
  setAdditionalPointSearchValue,
  setAdditionalPointIsOpen,
  loadAdditionalPoints,
  additionalPointObservers,
  additionalPointRefs,
  handleSelectAdditionalPoint,
}) => {
  const handleOpenSelect = (index: number) => {
    setAdditionalPointIsOpen(index, true);
    loadAdditionalPoints(index, '', 1);
  };

  const handleCloseSelect = (index: number) => {
    setAdditionalPointIsOpen(index, false);
  };

  const handleSearchValueChange = (index: number, value: string) => {
    setAdditionalPointSearchValue(index, value);
  };

  const handleSearchChange = (index: number, value: string) => {
    setAdditionalPointSearch(index, value);
  };

  const handlePointSelect = (index: number, point: Point) => {
    handleSelectAdditionalPoint(index, point);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      additionalPointRefs.current.forEach((ref, index) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          handleCloseSelect(index);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [additionalPointRefs, handleCloseSelect]);

  return (
    <div>
      {selectedAdditionalPoints.map((point, index) => (
        <div key={index} className="mb-4">
          <label className="block mb-2">{`Дополнительная точка ${index + 1}`}</label>
          <div className="w-full relative">
            <input
              type="text"
              value={additionalPointStates[index].searchValue}
              onClick={() => handleOpenSelect(index)}
              onChange={(e) => handleSearchValueChange(index, e.target.value)}
              placeholder="Начните вводить адрес..."
              className="w-full p-2 border rounded"
            />
            {additionalPointStates[index].isOpen && (
              <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
                <input
                  type="text"
                  autoFocus
                  value={additionalPointStates[index].search}
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                  placeholder="Поиск..."
                  className="p-2 w-full border-b"
                />
                {additionalPointStates[index].points.map((filteredPoint) => (
                  <div
                    key={filteredPoint.uuid}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handlePointSelect(index, filteredPoint)}
                  >
                    {filteredPoint.address}
                  </div>
                ))}
                <div ref={additionalPointObservers[index]} className="p-2 text-center">
                  {additionalPointStates[index].loading ? 'Загрузка...' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdditionalPoints;
