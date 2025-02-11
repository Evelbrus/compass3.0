import React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Point } from '@prisma/client';
import { useApi } from '@shared/components/modal/create-client-corp-order/api/useApi';

interface AdditionalPointState {
  points: Point[];
  search: string;
  searchValue: string;
  isOpen: boolean;
  currentPage: number;
  totalPoints: number;
  observerRef: React.RefObject<HTMLDivElement>;
  ref: React.RefObject<HTMLDivElement>;
  loading: boolean;
}

interface UseAdditionalPointsReturn {
  additionalPointStates: AdditionalPointState[];
  selectedAdditionalPoints: (Point | null)[];
  additionalPointObservers: React.RefObject<HTMLDivElement>[];
  additionalPointRefs: React.RefObject<HTMLDivElement>[];
  setAdditionalPointSearch: (index: number, search: string) => void;
  setAdditionalPointSearchValue: (index: number, searchValue: string) => void;
  setAdditionalPointIsOpen: (index: number, isOpen: boolean) => void;
  loadAdditionalPoints: (index: number, searchQuery: string, nextPage?: number) => Promise<void>;
  handleSetAdditionalPoints: (index: number, point: Point | null) => void;
  getAvailablePoints: () => Point[];
}
const useAdditionalPoints = (
  departurePoint: string,
  arrivalPoint: string,
  departurePoints: Point[],
): UseAdditionalPointsReturn => {
  //Инициализируем состояние для 5 дополнительных точек, создавая refs через React.createRef
  const [additionalPointStates, setAdditionalPointStates] = useState<AdditionalPointState[]>(() => {
    return Array.from({ length: 5 }, () => ({
      points: [],
      search: '',
      searchValue: '',
      isOpen: false,
      currentPage: 1,
      totalPoints: 0,
      observerRef: React.createRef<HTMLDivElement>(),
      ref: React.createRef<HTMLDivElement>(),
      loading: false,
    }));
  });

  const [selectedAdditionalPoints, setSelectedAdditionalPoints] = useState<(Point | null)[]>(() =>
    Array(5).fill(null),
  );

  //Создаем массивы для refs дополнительных наблюдателей и селекторов
  const additionalPointObservers = useRef<React.RefObject<HTMLDivElement>[]>(
    Array.from({ length: 5 }, () => React.createRef<HTMLDivElement>()),
  );
  const additionalPointRefs = useRef<React.RefObject<HTMLDivElement>[]>(
    Array.from({ length: 5 }, () => React.createRef<HTMLDivElement>()),
  );

  const { fetchPoints } = useApi();

  const loadAdditionalPoints = useCallback(
    async (index: number, searchQuery: string, nextPage: number = 1) => {
      try {
        setAdditionalPointStates((prevStates) =>
          prevStates.map((state, i) => (i === index ? { ...state, loading: true } : state)),
        );

        const pointsData = await fetchPoints(
          searchQuery,
          nextPage.toString(),
          '10',
          'createdAt',
          'asc',
        );

        if (pointsData && pointsData.data && pointsData.data.points) {
          const points = pointsData.data.points;
          setAdditionalPointStates((prevStates) =>
            prevStates.map((state, i) => {
              if (i === index) {
                return {
                  ...state,
                  points: nextPage === 1 ? points : [...state.points, ...points],
                  totalPoints: pointsData.data.total,
                  currentPage: nextPage,
                };
              }
              return state;
            }),
          );
        } else {
          console.warn('Unexpected data structure for additional point:', pointsData);
          setAdditionalPointStates((prevStates) =>
            prevStates.map((state, i) =>
              i === index ? { ...state, points: [], totalPoints: 0 } : state,
            ),
          );
        }
      } catch (error) {
        console.error('Error fetching additional points:', error);
        setAdditionalPointStates((prevStates) =>
          prevStates.map((state, i) =>
            i === index ? { ...state, points: [], totalPoints: 0 } : state,
          ),
        );
      } finally {
        setAdditionalPointStates((prevStates) =>
          prevStates.map((state, i) => (i === index ? { ...state, loading: false } : state)),
        );
      }
    },
    [fetchPoints],
  );

  const handleSetAdditionalPoints = (index: number, point: Point | null) => {
    setSelectedAdditionalPoints((prevPoints) => {
      const newPoints = [...prevPoints];
      newPoints[index] = point;
      return newPoints;
    });
  };

  const getAvailablePoints = () => {
    return departurePoints.filter(
      (point) =>
        point.uuid !== departurePoint &&
        point.uuid !== arrivalPoint &&
        !selectedAdditionalPoints.some((p) => p?.uuid === point.uuid),
    );
  };

  const setAdditionalPointSearch = (index: number, search: string) => {
    setAdditionalPointStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? { ...state, search } : state)),
    );
  };

  const setAdditionalPointSearchValue = (index: number, searchValue: string) => {
    setAdditionalPointStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? { ...state, searchValue } : state)),
    );
  };

  const setAdditionalPointIsOpen = (index: number, isOpen: boolean) => {
    setAdditionalPointStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? { ...state, isOpen } : state)),
    );
  };

  return {
    additionalPointStates,
    selectedAdditionalPoints,
    additionalPointObservers: additionalPointObservers.current,
    additionalPointRefs: additionalPointRefs.current,
    setAdditionalPointSearch,
    setAdditionalPointSearchValue,
    setAdditionalPointIsOpen,
    loadAdditionalPoints,
    handleSetAdditionalPoints,
    getAvailablePoints,
  };
};

export default useAdditionalPoints;
