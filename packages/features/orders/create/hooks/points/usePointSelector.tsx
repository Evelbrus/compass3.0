import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

export interface UsePointSelectorProps {
  allPoints?: PointWithoutTimestamps[];
  mode?: 'single' | 'multiple';
  initialSelectedPoints?: (PointWithoutTimestamps | null)[];
  initialSelectedPoint?: PointWithoutTimestamps | null;
  selectedServices?: string[];
}

export const usePointSelector = ({
  allPoints = [],
  mode = 'single',
  initialSelectedPoints = [],
  initialSelectedPoint = null,
  selectedServices = [],
}: UsePointSelectorProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [_searchValue, setSearchValue] = useState(
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

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');

  const dropdownPositionStyles = {
    position: 'absolute',
    top: 0,
    right: '370px',
    width: '373px',
    height: '670px',
    maxHeight: '670px',
  } as const;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(null);
  }, []);

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
      console.log('usePointSelector onSelectPoint called:', { point: point?.address, index });
      if (mode === 'single') {
        setSelectedPoint(point);
        setSearchValue(point ? point.address : '');
        closeDropdown();
      } else if (typeof index === 'number') {
        setSelectedPoints((prev) => {
          const newPoints = [...prev];
          newPoints[index] = point;
          console.log('Updated selectedPoints in usePointSelector:', newPoints);
          return newPoints;
        });
        closeDropdown();
      }
    },
    [mode, closeDropdown],
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
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeDropdown]);

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
    selectedServices,
    closeDropdown,
    activeIndex,
    setActiveIndex,
    dropDirection,
    setDropDirection,
    dropdownPositionStyles,
  };
};
