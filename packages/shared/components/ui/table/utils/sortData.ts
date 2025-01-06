export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortBy: keyof T | null,
  sortDirection: 'asc' | 'desc',
): T[] => {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    if (a[sortBy] === null || a[sortBy] === undefined) return 1;
    if (b[sortBy] === null || b[sortBy] === undefined) return -1;
    if (a[sortBy] === b[sortBy]) return 0;

    let comparison = 0;

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      const dateA = new Date(a[sortBy]).getTime();
      const dateB = new Date(b[sortBy]).getTime();
      comparison = dateA - dateB;
    } else if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
      comparison = a[sortBy] - b[sortBy];
    } else if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
      comparison = a[sortBy].localeCompare(b[sortBy]);
    } else {
      comparison = String(a[sortBy]).localeCompare(String(b[sortBy]));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
};
