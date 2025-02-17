export function formatDateToLocal(value) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru').split('.').join('/');
    }
    return '';
}
export function formatDateToISO(value) {
    const parts = value.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts.map((part) => parseInt(part, 10));
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day).toISOString();
        }
    }
    return null;
}
export function handleInputChange(e, onChange, setLocalValue) {
    const inputValue = e.target.value;
    const isoDate = formatDateToISO(inputValue);
    if (isoDate) {
        onChange(isoDate);
    }
    setLocalValue(inputValue);
}
