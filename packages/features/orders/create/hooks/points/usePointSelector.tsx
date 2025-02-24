import React from 'react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Point } from '@prisma/client';

export interface UsePointSelectorProps {
  initialPoints?: Point[];
  allPoints?: Point[];
  selectedPoint?: Point | null;
  mode?: 'single' | 'multiple';
  initialSelectedPoints?: (Point | null)[];
}

const usePointSelector = ({
  initialPoints = [],
  allPoints = [],
  selectedPoint: initialSelectedPoint = null,
  mode = 'single',
  initialSelectedPoints = [],
}: UsePointSelectorProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');
  const [_points, setPoints] = useState<Point[]>(initialPoints);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(initialPoints);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(initialSelectedPoint);
  const [selectedPoints, setSelectedPoints] = useState<(Point | null)[]>(initialSelectedPoints);

  const selectorRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const onOpenSelect = useCallback(() => {
    setSearch('');
    setSearchValue('');
    setIsOpen(true);
  }, []);

  const onSearchValueChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const onSelectPoint = useCallback(
    (point: Point | null, index?: number) => {
      if (mode === 'single') {
        setSelectedPoint(point);
        setSearchValue(point ? point.address : '');
        setIsOpen(false);
      } else if (typeof index === 'number') {
        setSelectedPoints((prev) => {
          const newPoints = [...prev];
          newPoints[index] = point;
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
    if (!isOpen || !allPoints.length) return;

    const filtered = allPoints.filter((point) =>
      point.address.toLowerCase().includes(search.toLowerCase()),
    );
    setPoints(allPoints); // обновляем общий список точек
    setFilteredPoints(filtered);
  }, [allPoints, search, isOpen]);

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

  const totalAdditionalPrice = useMemo(() => 0, []);

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
    selectedPoint: mode === 'single' ? selectedPoint : undefined,
    selectedPoints: mode === 'multiple' ? selectedPoints : undefined,
    onRemovePoint: mode === 'multiple' ? onRemovePoint : undefined,
    totalAdditionalPrice,
  };
};

export default usePointSelector;
