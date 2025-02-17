export const formatByPattern = (digits, pattern) => {
    const parts = [];
    let currentIndex = 0;
    for (const length of pattern) {
        const part = digits.slice(currentIndex, currentIndex + length);
        if (!part)
            break;
        parts.push(part);
        currentIndex += length;
    }
    return parts.join('-');
};
