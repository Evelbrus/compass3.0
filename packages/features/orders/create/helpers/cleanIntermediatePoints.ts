export const cleanIntermediatePoints = (intermediatePoints: string[] = []): string[] => {
  return intermediatePoints.filter((point) => point.trim() !== '');
};
