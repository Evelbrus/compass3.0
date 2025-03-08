import { openModal, setOrderUuid } from '@shared/lib/effector';

export const handleOrderDriverDetail = (entity?: 'orders' | 'vehicles', uuid?: string) => {
  if (entity === 'orders' && uuid) {
    setOrderUuid(uuid);
    openModal('orderDetailDriver');
  } else {
    console.warn('Invalid parameters for handleOrderDriverDetail');
  }
};
