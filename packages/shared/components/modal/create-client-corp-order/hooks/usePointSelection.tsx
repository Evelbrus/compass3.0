import { useState, useCallback, useRef, useEffect } from 'react';
import { Point } from '@prisma/client';
import { useApi } from '@shared/components/modal/create-client-corp-order/api/useApi';

interface UsePointSelectionProps {
  type: 'departure' | 'arrival';
}

interface UsePointSelectionReturn {
  points: Point[];
  search: string;
  setSearch: (search: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentPage: number;
  totalPoints: number;
  observerRef: React.RefObject<HTMLDivElement>;
  ref: React.RefObject<HTMLDivElement>;
  loading: boolean;
  selectedPoint: string;
  handleSelectPoint: (point: Point) => void;
  loadPoints: (searchQuery: string, nextPage?: number) => Promise<void>;
}

const usePointSelection = ({ type }: UsePointSelectionProps): UsePointSelectionReturn => {
  const [points, setPoints] = useState<Point[]>([]);
  const [search, setSearch] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const loadingRef = useRef<boolean>(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null); //Добавлено состояние для ошибок

  const { fetchPoints } = useApi();

  const loadPoints = useCallback(
    async (searchQuery: string, nextPage: number = 1) => {
      try {
        loadingRef.current = true;
        const pointsData = await fetchPoints(
          searchQuery,
          nextPage.toString(),
          '10',
          'createdAt',
          'asc',
        );

        if (pointsData && pointsData.data && pointsData.data.points) {
          const newPoints = pointsData.data.points;
          setPoints((prev) => (nextPage === 1 ? newPoints : [...prev, ...newPoints]));
          setTotalPoints(pointsData.data.total);
          setCurrentPage(nextPage);
          setError(null); //Очищаем ошибку при успешной загрузке
        } else {
          console.warn(`Unexpected data structure (${type}):`, pointsData);
          setError(`Failed to load ${type} points. Check the API response structure.`); //Устанавливаем ошибку
          setPoints([]);
          setTotalPoints(0);
        }
      } catch (error) {
        console.error(`Error fetching ${type} points:`, error);
        setError(
          `Failed to load ${type} points: ${error instanceof Error ? error.message : error}`,
        ); //Устанавливаем ошибку
        setPoints([]);
        setTotalPoints(0);
      } finally {
        loadingRef.current = false;
      }
    },
    [fetchPoints, type],
  );

  useEffect(() => {
    console.log(`${type} useEffect triggered`, isOpen, search);

    if (isOpen && !prevOpenRef.current) {
      setPoints([]);
      setSearch('');
      loadPoints('', 1);
    } else if (isOpen) {
      setPoints([]);
      loadPoints(search, 1);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, loadPoints, search, type]);

  const handleSelectPoint = (point: Point) => {
    setSelectedPoint(point.uuid);
    setSearchValue(point.address);
    setSearch(point.address);
    setIsOpen(false);
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (!loadingRef.current && points.length < totalPoints) {
          loadingRef.current = true;
          console.log(`Loading next ${type} page`);
          loadPoints(search, currentPage + 1);
        }
      }
    },
    [points, totalPoints, search, currentPage, loadPoints, type],
  );

  useEffect(() => {
    const options = { root: null, rootMargin: '20px', threshold: 0.5 };
    const observer = new IntersectionObserver(handleObserver, options);

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return {
    points,
    search,
    setSearch,
    searchValue,
    setSearchValue,
    isOpen,
    setIsOpen,
    currentPage,
    totalPoints,
    observerRef,
    ref,
    loading: loadingRef.current,
    selectedPoint,
    handleSelectPoint,
    loadPoints,
  };
};

export default usePointSelection;
