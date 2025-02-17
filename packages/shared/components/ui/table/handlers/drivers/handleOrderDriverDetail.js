import { openModal, setOrderUuid } from '@shared/lib/effector';
export const handleOrderDriverDetail = (entity, uuid) => {
    if (entity === 'orders' && uuid) {
        setOrderUuid(uuid);
        openModal('orderDetailDriver');
        console.log(`Opening modal for order with UUID: ${uuid}`);
    }
    else {
        console.warn('Invalid parameters for handleOrderDriverDetail');
    }
};
