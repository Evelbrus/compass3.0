export const cleanIntermediatePoints = (intermediatePoints = []) => {
    return intermediatePoints.filter((point) => point.trim() !== '');
};
