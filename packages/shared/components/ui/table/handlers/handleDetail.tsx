export const handleDetail = (
  entity?: 'users' | 'orders' | 'vehicles',
  uuid?: string,
  navigate?: (path: string) => void,
) => {
  if (!uuid || !navigate) return;

  let path = '';

  if (entity === 'vehicles') {
    path = `/transfer-services/detail/${uuid}`;
  } else if (entity === 'users') {
    path = `/user/detail/${uuid}`;
  } else if (entity === 'orders') {
    path = `/order/detail/${uuid}`;
  } else {
    path = `/login`;
  }

  navigate(path);
};
