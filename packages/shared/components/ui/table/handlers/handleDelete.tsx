import { openModal, setEntityToDelete } from '@shared/lib/effector';

export const handleDelete = (
  entity?: 'users' | 'orders' | 'vehicles' | 'additional-services' | 'points',
  uuid?: string,
) => {
  setEntityToDelete({ entity, uuid });
  openModal('deleteModal');
};
