import {
  openModal,
  setAdditionalServiceUuid,
  setPointUuid,
} from '@shared/lib/effector/state/state';
import { ModalType } from '@shared/lib/effector/state/state';

export const handleEdit = (
  entity?: 'users' | 'orders' | 'vehicles' | 'additional-services' | 'points',
  uuid?: string,
  modalType?: ModalType,
  navigate?: (path: string) => void,
) => {
  if (!uuid) return;

  if (entity === 'additional-services') {
    setAdditionalServiceUuid(uuid);
    if (modalType) openModal(modalType);
  } else if (entity === 'points') {
    setPointUuid(uuid);
    if (modalType) openModal(modalType);
  } else if (navigate) {
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
  }
};
