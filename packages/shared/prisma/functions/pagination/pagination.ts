export type PaginationParams = {
  page?: number;
  per_page?: number;
};

export type PaginationResult = {
  skip: number;
  take: number;
};

export function getPagination({ page = 1, per_page = 10 }: PaginationParams): PaginationResult {
  const skip = (page - 1) * per_page;
  const take = per_page;

  return { skip, take };
}
