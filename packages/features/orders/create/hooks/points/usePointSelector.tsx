// usePointSelector.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PointWithoutTimestamps } from '@features/orders/create/hooks/points/useAllPoints';

export interface UsePointSelectorProps {
  allPoints?: PointWithoutTimestamps[];
  mode?: 'single' | 'multiple';
  initialSelectedPoints?: (PointWithoutTimestamps | null)[];
  initialSelectedPoint?: PointWithoutTimestamps | null;
}

const usePointSelector = ({
  allPoints = [],
  mode = 'single',
  initialSelectedPoints = [],
  initialSelectedPoint = null,
}: UsePointSelectorProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(
    initialSelectedPoint ? initialSelectedPoint.address : '',
  );
  const [search, setSearch] = useState('');
  const [_points, setPoints] = useState<PointWithoutTimestamps[]>(allPoints);
  const [filteredPoints, setFilteredPoints] = useState<PointWithoutTimestamps[]>(allPoints);
  const [selectedPoint, setSelectedPoint] = useState<PointWithoutTimestamps | null>(
    initialSelectedPoint,
  );
  const [selectedPoints, setSelectedPoints] =
    useState<(PointWithoutTimestamps | null)[]>(initialSelectedPoints);

  useEffect(() => {
    if (initialSelectedPoint) {
      setSelectedPoint(initialSelectedPoint);
      setSearchValue(initialSelectedPoint.address);
    }
  }, [initialSelectedPoint]);

  useEffect(() => {
    setPoints(allPoints);
    setFilteredPoints(allPoints);
  }, [allPoints]);

  const selectorRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const onOpenSelect = useCallback(() => {
    setSearch('');
    setSearchValue('');
    setIsOpen(true);
    setFilteredPoints(allPoints);
  }, [allPoints]);

  const onSearchValueChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearch = e.target.value;
      setSearch(newSearch);
      if (allPoints.length) {
        const filtered = allPoints.filter((point) =>
          point.address.toLowerCase().includes(newSearch.toLowerCase()),
        );
        setFilteredPoints(filtered);
      }
    },
    [allPoints],
  );

  const onSelectPoint = useCallback(
    (point: PointWithoutTimestamps | null, index?: number) => {
      // Изменён тип
      console.log('usePointSelector onSelectPoint called:', { point: point?.address, index });
      if (mode === 'single') {
        setSelectedPoint(point);
        setSearchValue(point ? point.address : '');
        setIsOpen(false);
      } else if (typeof index === 'number') {
        setSelectedPoints((prev) => {
          const newPoints = [...prev];
          newPoints[index] = point;
          console.log('Updated selectedPoints in usePointSelector:', newPoints);
          return newPoints;
        });
        setIsOpen(false);
      }
    },
    [mode],
  );

  const onRemovePoint = useCallback(
    (index: number) => {
      if (mode === 'multiple') {
        setSelectedPoints((prev) => {
          const newPoints = [...prev];
          newPoints[index] = null;
          return newPoints;
        });
      }
    },
    [mode],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const onChangeOrder = useCallback((currentIndex: number, newIndex: number) => {
    setSelectedPoints((prev) => {
      const newPoints = [...prev];
      const currentPoint = newPoints[currentIndex] ?? null;
      newPoints.splice(currentIndex, 1);
      newPoints.splice(newIndex, 0, currentPoint);
      return newPoints;
    });
  }, []);

  return {
    isOpen,
    searchValue,
    search,
    filteredPoints,
    loading: false,
    onOpenSelect,
    onSearchValueChange,
    handleSearchChange,
    onSelectPoint,
    selectorRef,
    observerRef,
    onChangeOrder,
    selectedPoint: mode === 'single' ? selectedPoint : null,
    selectedPoints: mode === 'multiple' ? selectedPoints : undefined,
    onRemovePoint: mode === 'multiple' ? onRemovePoint : undefined,
  };
};

export default usePointSelector;
