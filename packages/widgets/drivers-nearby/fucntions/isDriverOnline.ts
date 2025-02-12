export const isDriverOnline = (
  lastActive: Date | string | null,
  serverTime: string | null,
): boolean => {
  if (!lastActive || !serverTime) {
    return false;
  }

  try {
    const lastActiveDate =
      typeof lastActive === 'string'
        ? new Date(lastActive)
        : lastActive instanceof Date
          ? lastActive
          : new Date(lastActive);
    const serverDate = new Date(serverTime);

    if (isNaN(lastActiveDate.getTime())) {
      return false;
    }

    const differenceInMinutes = (serverDate.getTime() - lastActiveDate.getTime()) / (1000 * 60);

    if (differenceInMinutes <= 6) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Ошибка в isDriverOnline:', error);
    return false;
  }
};
