export const handleEdit = (
  entity?: 'users' | 'orders' | 'vehicles',
  uuid?: string,
  navigate?: (path: string) => void,
) => {
  if (!uuid || !navigate) return;

  let path = '';

  if (entity === 'vehicles') {
    path = `/transfer-services/edit/${uuid}`;
  } else if (entity === 'users') {
    path = `/user/edit/${uuid}`;
  } else if (entity === 'orders') {
    path = `/order/edit/${uuid}`;
  } else {
    path = `/login`;
  }

  navigate(path);
};
