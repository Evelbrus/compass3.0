export const handleSort = (accessor, sortBy, sortDirection, setSortBy, setSortDirection) => {
    if (sortBy === accessor) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    }
    else {
        setSortBy(accessor);
        setSortDirection('asc');
    }
};
