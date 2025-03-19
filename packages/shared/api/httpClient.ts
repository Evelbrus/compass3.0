// utils/api.ts
export const checkAndHandleRedirect = (data: any): boolean => {
  if (data && data.redirectTo) {
    console.log('Редирект на:', data.redirectTo);
    window.location.href = data.redirectTo;
    return true;
  }
  return false;
};
