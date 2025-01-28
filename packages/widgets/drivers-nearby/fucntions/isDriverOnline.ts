export const isDriverOnline = (lastActive: Date | string | null): boolean => {
  if (!lastActive) return false;

  const lastActiveDate = typeof lastActive === 'string' ? new Date(lastActive) : lastActive;

  if (isNaN(lastActiveDate.getTime())) {
    return false;
  }

  const currentDate = new Date();
  const differenceInMinutes = (currentDate.getTime() - lastActiveDate.getTime()) / (1000 * 60);
  return differenceInMinutes <= 6;
};
