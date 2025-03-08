// @next-app/src/utils/parseParams.ts
import { URLSearchParams } from 'url';

type SortOrder = 'asc' | 'desc';

interface ParseParamsOptions<T> {
  searchParams: URLSearchParams;
  defaults?: Partial<T>;
  allowedSortFields?: string[];
  maxPerPage?: number;
}

export function parseParams<T extends Record<string, any>>({
  searchParams,
  defaults = {},
  allowedSortFields = [],
  maxPerPage = 100,
}: ParseParamsOptions<T>): T {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.max(
    1,
    Math.min(maxPerPage, parseInt(searchParams.get('per_page') || '10', 10)),
  );
  const sortBy = searchParams.get('sort_by') || defaults.sort_by || 'createdAt';
  const sortOrder = (searchParams.get('sort_order') as SortOrder) || defaults.sort_order || 'desc';

  const params: Record<string, any> = {
    page,
    per_page: perPage,
    sort_by:
      allowedSortFields.length > 0 && allowedSortFields.includes(sortBy)
        ? sortBy
        : defaults.sort_by || 'createdAt',
    sort_order: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc',
  };

  // Добавляем остальные параметры из searchParams
  searchParams.forEach((value, key) => {
    if (key !== 'page' && key !== 'per_page' && key !== 'sort_by' && key !== 'sort_order') {
      if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      } else if (!isNaN(parseInt(value, 10))) {
        params[key] = parseInt(value, 10);
      } else {
        params[key] = value;
      }
    }
  });

  return { ...defaults, ...params } as T;
}
