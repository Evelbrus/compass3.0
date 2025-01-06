import { openModal, setEntityToDelete } from '@shared/lib/effector';

export const handleDelete = (entity?: 'users' | 'orders' | 'vehicles', uuid?: string) => {
  setEntityToDelete({ entity, uuid });
  openModal('deleteModal');
};
