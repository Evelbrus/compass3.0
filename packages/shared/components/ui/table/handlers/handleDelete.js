import { openModal, setEntityToDelete } from '@shared/lib/effector';
export const handleDelete = (entity, uuid) => {
    setEntityToDelete({ entity, uuid });
    openModal('deleteModal');
};
